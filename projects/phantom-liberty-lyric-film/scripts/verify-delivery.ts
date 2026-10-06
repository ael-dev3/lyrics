import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync, mkdirSync, statSync, existsSync} from 'node:fs';
import {spawn, spawnSync, type ChildProcessWithoutNullStreams} from 'node:child_process';
import {basename, resolve, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas, GlobalFonts} from '@napi-rs/canvas';
import {COMPOSITION, PALETTE, cueOpacity, initScene, layoutCue, paintScene} from '../src/scene.ts';
import {sourceActive, vocalTrack, type Timeline, type FeatureData, type Format, type Cue, type Word} from '../src/model.ts';
import {checkCurrentProductionGate} from './render-gate.ts';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = <T>(name: string): T => JSON.parse(readFileSync(join(root, name), 'utf8')) as T;
const hash = (path: string): string => createHash('sha256').update(readFileSync(path)).digest('hex');
const assert = (condition: unknown, message: string): void => {if (!condition) throw Error(message);};
const rate = {numerator: 60000, denominator: 1001};
const sourceRate = {numerator: 30000, denominator: 1001};
const names = {landscape: 'Phantom-Liberty-YouTube-1920x816-59.94fps.mp4', portrait: 'Phantom-Liberty-TikTok-1080x1920-59.94fps.mp4'};
const verificationDirectory = join(root, 'evidence');
const outputDirectory = resolve(root, process.env.PHANTOM_RENDER_DIRECTORY ?? 'renders');
const gate = checkCurrentProductionGate(root);
const timeline = read<Timeline>('public/timeline.json');
const features = read<FeatureData>('public/audio-features.json');
const recording = read<{sourceSha256: string; decodedStereoS16Sha256: string; decodedSampleCount: number; sampleRate: number; picture: {frameCount: number}}>('source/recording.json');
const frameCount = Math.ceil(recording.decodedSampleCount * rate.numerator / (recording.sampleRate * rate.denominator));
const sourcePath = join(root, 'public/source.mp4');
assert(hash(sourcePath) === recording.sourceSha256, 'Source recording bytes differ from approved recording.');
assert(GlobalFonts.registerFromPath(join(root, 'public/fonts/SpaceGrotesk.ttf'), 'PhantomGrotesk'), 'Pinned font registration failed.');
initScene(timeline, features);
mkdirSync(verificationDirectory, {recursive: true});

function startDecode(args: string[]): {child: ChildProcessWithoutNullStreams; completed: Promise<void>} {
  const child = spawn('ffmpeg', ['-v', 'error', '-threads', '2', '-filter_threads', '1', ...args], {stdio: ['pipe', 'pipe', 'pipe']});
  child.stdin.end(); let stderr = '';
  child.stderr.on('data', (chunk: Buffer) => {stderr = (stderr + chunk.toString()).slice(-16000);});
  const completed = new Promise<void>((success, reject) => {
    child.once('error', reject);
    child.once('close', code => code === 0 && !stderr.trim() ? success() : reject(Error(`Decode failed (${code}): ${stderr}`)));
  });
  // A rejection is consumed after the stream; attach immediately to avoid a
  // transient unhandled rejection while native canvas processes one frame.
  completed.catch(() => undefined);
  return {child, completed};
}
async function decodeBytes(args: string[]): Promise<Buffer> {
  const process = startDecode(args), pieces: Buffer[] = [];
  for await (const chunk of process.child.stdout) pieces.push(Buffer.from(chunk as Buffer));
  await process.completed; return Buffer.concat(pieces);
}
async function* frames(args: string[], bytesPerFrame: number): AsyncGenerator<Buffer> {
  const process = startDecode(args); let pending = Buffer.allocUnsafe(bytesPerFrame), used = 0;
  try {
    for await (const chunk of process.child.stdout) {
      const data = chunk as Buffer;
      for (let offset = 0; offset < data.length;) {
        const count = Math.min(bytesPerFrame - used, data.length - offset);
        data.copy(pending, used, offset, offset + count); used += count; offset += count;
        if (used === bytesPerFrame) {yield pending; pending = Buffer.allocUnsafe(bytesPerFrame); used = 0;}
      }
    }
    await process.completed; assert(used === 0, 'Partial decoded RGBA frame.');
  } finally {if (process.child.exitCode === null) process.child.kill('SIGTERM');}
}
async function audioIdentity(path: string): Promise<{sha256: string; sampleCount: number; bytes: number}> {
  const process = startDecode(['-i', path, '-map', '0:a:0', '-vn', '-c:a', 'pcm_s16le', '-f', 's16le', 'pipe:1']);
  const digest = createHash('sha256'); let bytes = 0;
  for await (const chunk of process.child.stdout) {const data = chunk as Buffer; digest.update(data); bytes += data.length;}
  await process.completed; assert(bytes % 4 === 0, 'Decoded stereo S16 audio has partial samples.');
  return {sha256: digest.digest('hex'), sampleCount: bytes / 4, bytes};
}
function probe(path: string): Record<string, unknown> {
  const result = spawnSync('ffprobe', ['-v', 'error', '-count_frames', '-show_streams', '-show_format', '-of', 'json', path], {encoding: 'utf8', maxBuffer: 200000});
  assert(result.status === 0, `ffprobe failed for ${basename(path)}: ${result.stderr}`);
  return JSON.parse(result.stdout) as Record<string, unknown>;
}
type AudioPacket = {pts?: number; dts?: number; duration?: number; size?: string; data_hash?: string; side_data_list?: object[]};
function audioPackets(path: string): AudioPacket[] {
  const result = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_packets', '-show_data_hash', 'sha256',
    '-show_entries', 'packet=pts,dts,duration,size,data_hash:packet_side_data=side_data_type,skip_samples,discard_padding', '-of', 'json', path], {encoding: 'utf8', maxBuffer: 12000000});
  assert(result.status === 0, `AAC packet inspection failed for ${basename(path)}: ${result.stderr}`);
  const packets = (JSON.parse(result.stdout) as {packets: AudioPacket[]}).packets;
  assert(packets.length > 0 && packets.every(packet => typeof packet.data_hash === 'string' && /^SHA256:[a-f0-9]{64}$/u.test(packet.data_hash)), 'AAC packet hashes are missing.');
  return packets;
}
function videoPresentationTimes(path: string): {frames: number; firstPts: number; lastPts: number; packetDuration: number; ptsSequenceSha256: string} {
  const result = spawnSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_frames', '-show_entries', 'frame=pts,duration', '-of', 'json', path], {encoding: 'utf8', maxBuffer: 4000000});
  assert(result.status === 0, `Video PTS inspection failed for ${basename(path)}: ${result.stderr}`);
  const decoded = (JSON.parse(result.stdout) as {frames: Array<{pts: number; duration: number}>}).frames;
  assert(decoded.length === frameCount && decoded.every((frame, index) => frame.pts === index * rate.denominator && frame.duration === rate.denominator), 'An encoded picture PTS or duration departed from the rational output clock.');
  return {frames: decoded.length, firstPts: decoded[0]!.pts, lastPts: decoded.at(-1)!.pts, packetDuration: rate.denominator,
    ptsSequenceSha256: createHash('sha256').update(JSON.stringify(decoded.map(frame => [frame.pts, frame.duration]))).digest('hex')};
}
function select(indices: number[]): string {
  const terms = indices.map(frame => `eq(n\\,${frame})`);
  // A flat ~900-term addition exceeds FFmpeg's recursive expression parser.
  // A balanced tree keeps parser and evaluator depth logarithmic without
  // changing which exact native/output frame indices are selected.
  const sum = (start: number, end: number): string => {
    if (end - start === 1) return terms[start]!;
    const middle = start + Math.floor((end - start) / 2); return `(${sum(start, middle)})+(${sum(middle, end)})`;
  };
  assert(terms.length > 0, 'Empty sample selector.'); return `select=${sum(0, terms.length)}`;
}
function outputTime(index: number): number {return index * rate.denominator / rate.numerator;}
function sourceIndex(index: number): number {return Math.min(recording.picture.frameCount - 1, Math.floor(index / 2));}
function firstActive(word: Word): number {return Math.ceil(word.startSample * rate.numerator / (timeline.sampleRate * rate.denominator));}
function lastActive(word: Word): number {return Math.ceil(word.endSample * rate.numerator / (timeline.sampleRate * rate.denominator)) - 1;}
type State = {cue: Cue; word: Word; state: 'first-active-frame' | 'middle-frame' | 'last-active-frame'; frameIndex: number};
const states: State[] = [];
for (const cue of timeline.cues) for (const word of cue.words) {
  const first = firstActive(word), last = lastActive(word);
  assert(first <= last, `No output frame contains ${word.id}; requested highlight cannot be represented.`);
  const middle = Math.max(first, Math.min(last, Math.floor((word.startSample + word.endSample) * rate.numerator / (2 * timeline.sampleRate * rate.denominator))));
  for (const [state, frameIndex] of [['first-active-frame', first], ['middle-frame', middle], ['last-active-frame', last]] as const) {
    assert(sourceActive(word, outputTime(frameIndex), timeline.sampleRate), `Clock rounding made ${word.id}/${state} inactive.`);
    assert(cueOpacity(cue, outputTime(frameIndex)) === 1, `Glyph opacity lost on ${word.id}/${state}.`);
    states.push({cue, word, state, frameIndex});
  }
}
const requestedTimes = [0, 14, 78.061317, 78.07, 85.4, 128.5, 162, 178.38, 217, 234.9, 246.81, 292, 334, 345, 348];
const overviewIndices = requestedTimes.map(time => Math.min(frameCount - 1, Math.round(time * rate.numerator / rate.denominator)));

type CoreMask = {indices: number[]; tokenId: string; tokenText: string};
function masks(format: Format): Map<string, CoreMask> {
  const p = COMPOSITION[format], canvas = createCanvas(p.width, p.height), context = canvas.getContext('2d');
  const result = new Map<string, CoreMask>();
  for (const cue of timeline.cues) {
    const layout = layoutCue(context as unknown as CanvasRenderingContext2D, cue, format);
    for (const slot of layout.slots) {
      const originX = Math.floor(slot.x) - 3, originY = Math.floor(slot.y - layout.size) - 4;
      const width = Math.ceil(slot.width) + 7, height = Math.ceil(layout.size * 1.28) + 9;
      const mask = createCanvas(width, height), ctx = mask.getContext('2d');
      ctx.font = `600 ${layout.size}px PhantomGrotesk`; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#fff';
      ctx.fillText(slot.token.text, slot.x - originX, slot.y - originY);
      const pixels = ctx.getImageData(0, 0, width, height).data, indices: number[] = [];
      // Erode the opaque core by one pixel to exclude antialiased edges and
      // 4:2:0 chroma fringes. These are actual glyph interiors, not boxes.
      for (let y = 1; y < height - 1; y++) for (let x = 1; x < width - 1; x++) {
        let solid = true;
        for (let dy = -1; dy <= 1 && solid; dy++) for (let dx = -1; dx <= 1; dx++) if ((pixels[((y + dy) * width + x + dx) * 4 + 3] ?? 0) < 250) {solid = false; break;}
        if (solid) indices.push(((y + originY) * p.width + x + originX) * 4);
      }
      assert(indices.length > 20, `No usable opaque glyph interior ${slot.token.id}/${format}`);
      result.set(slot.token.id, {indices, tokenId: slot.token.id, tokenText: slot.token.text});
    }
  }
  return result;
}
function color(hex: string): number[] {return [1, 3, 5].map(offset => parseInt(hex.slice(offset, offset + 2), 16));}
const focus = color(PALETTE.focus), rest = color(PALETTE.rest);
function glyphMetric(encoded: Buffer, expected: Uint8ClampedArray, mask: CoreMask): {pixelCount: number; meanAbsoluteError: number; focusPreferredFraction: number} {
  let difference = 0, preferred = 0;
  for (const index of mask.indices) {
    let focusDistance = 0, restDistance = 0;
    for (let channel = 0; channel < 3; channel++) {const pixel = encoded[index + channel] ?? 0;
      difference += Math.abs(pixel - (expected[index + channel] ?? 0)); focusDistance += Math.abs(pixel - (focus[channel] ?? 0)); restDistance += Math.abs(pixel - (rest[channel] ?? 0));}
    if (focusDistance < restDistance) preferred++;
  }
  return {pixelCount: mask.indices.length, meanAbsoluteError: difference / (mask.indices.length * 3), focusPreferredFraction: preferred / mask.indices.length};
}
function sceneMetric(encoded: Buffer, expected: Uint8ClampedArray, width: number, height: number): number {
  let total = 0, count = 0;
  for (let y = 8; y < height; y += 16) for (let x = 8; x < width; x += 16) {const index = (y * width + x) * 4;
    for (let channel = 0; channel < 3; channel++) {total += Math.abs((encoded[index + channel] ?? 0) - (expected[index + channel] ?? 0)); count++;}}
  return total / count;
}
function percentile(values: number[], quantile: number): number {const sorted = [...values].sort((a, b) => a - b); return sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * quantile))] ?? 0;}

if (process.env.PHANTOM_CALIBRATION_ONLY === '1') {
  const firstOutputFrame = 4678, localIndices = [1, 13, 40, 80, 119], results: object[] = [];
  for (const format of ['landscape', 'portrait'] as const) {
    const diagnostic = join(outputDirectory, 'diagnostic', names[format].replace('.mp4', '-04678-120.mp4'));
    const p = COMPOSITION[format], maskMap = masks(format);
    const sourceFrames = [...new Set(localIndices.map(index => sourceIndex(firstOutputFrame + index)))].sort((a, b) => a - b);
    const original = frames(['-i', sourcePath, '-an', '-vf', select(sourceFrames), '-fps_mode', 'passthrough', '-pix_fmt', 'rgba', '-f', 'rawvideo', 'pipe:1'], 1920 * 1080 * 4);
    const encoded = frames(['-i', diagnostic, '-an', '-vf', select(localIndices), '-fps_mode', 'passthrough', '-pix_fmt', 'rgba', '-f', 'rawvideo', 'pipe:1'], p.width * p.height * 4);
    const sourceCanvas = createCanvas(1920, 1080), sourceContext = sourceCanvas.getContext('2d'), sourceImage = sourceContext.createImageData(1920, 1080);
    const canvas = createCanvas(p.width, p.height), context = canvas.getContext('2d');
    for (const localIndex of localIndices) {
      const a = await original.next(), b = await encoded.next(); assert(!a.done && !b.done, 'Calibration decode is incomplete.');
      sourceImage.data.set(a.value!); sourceContext.putImageData(sourceImage, 0, 0);
      const absoluteIndex = firstOutputFrame + localIndex, time = outputTime(absoluteIndex);
      paintScene(context as unknown as CanvasRenderingContext2D, time, format, sourceCanvas as unknown as CanvasImageSource);
      const expected = context.getImageData(0, 0, p.width, p.height).data, sceneError = sceneMetric(b.value!, expected, p.width, p.height);
      assert(sceneError < 12, `Calibration scene parity failed: ${format}/${time}: ${sceneError}`);
      const focused: object[] = [], wrongTargets: object[] = [];
      for (const cue of timeline.cues) for (const word of cue.words) if (sourceActive(word, time, timeline.sampleRate)) {
        const token = cue.lanes[0]!.tokens.find(token => token.sourceIndices.includes(word.sourceIndex))!;
        const metric = glyphMetric(b.value!, expected, maskMap.get(token.id)!);
        assert(metric.meanAbsoluteError < 18 && metric.focusPreferredFraction > .9, `Calibration glyph focus failed ${word.id}: ${JSON.stringify(metric)}`);
        focused.push({wordId: word.id, text: word.text, ...metric});
        if (cue.words.length > 1) {const wrong = cue.words[(word.sourceIndex + 1) % cue.words.length]!;
          if (!sourceActive(wrong, time, timeline.sampleRate)) {
            const wrongToken = cue.lanes[0]!.tokens.find(token => token.sourceIndices.includes(wrong.sourceIndex))!;
            const wrongMetric = glyphMetric(b.value!, expected, maskMap.get(wrongToken.id)!);
            assert(wrongMetric.focusPreferredFraction < .1, `Calibration failed to reject wrong word ${wrong.id}`);
            wrongTargets.push({deliberatelyWrongWordId: wrong.id, incorrectFocusPreferredFraction: wrongMetric.focusPreferredFraction, falseHypothesisRejected: true});
          }
        }
      }
      results.push({format, diagnosticFile: basename(diagnostic), diagnosticSha256: hash(diagnostic), localFrame: localIndex,
        outputFrame: absoluteIndex, outputPtsSeconds: time, sourceFrame: sourceIndex(absoluteIndex), sceneGridMeanAbsoluteError: sceneError, focused, wrongTargets});
    }
    assert((await encoded.next()).done && (await original.next()).done, 'Calibration decode returned unexpected extra frames.');
  }
  const calibration = {schemaVersion: 1, status: 'passed', revision: gate.revision, approvedInputHashes: gate.inputs,
    scope: 'Bounded 120-frame encoded clips; shared scene parity and actual glyph focus plus intentionally wrong adjacent-word hypotheses. No full-film acceptance.',
    results, thresholds: {sceneGridMeanAbsoluteErrorExclusive: 12, activeGlyphMeanAbsoluteErrorExclusive: 18, activeFocusFractionExclusive: .9, inactiveFalseFocusFractionExclusive: .1},
    recordedAt: new Date().toISOString(), verifierSha256: hash(fileURLToPath(import.meta.url)), rendererSha256: hash(join(root, 'scripts/render-production.ts'))};
  writeFileSync(join(verificationDirectory, 'encoded-calibration.json'), JSON.stringify(calibration, null, 2) + '\n');
  console.log(JSON.stringify({status: 'passed', sampledFrames: results.length, scope: 'Bounded encoded calibration only'})); process.exit(0);
}

// Entire-duration, unobstructed picture-region correspondence catches omitted
// footage, frozen posters, displaced cuts and substitute black frames. No
// lyric or spectrum pixels occupy this top portion of the sharp source image.
const tinyWidth = 32, tinyHeight = 6, tinyBytes = tinyWidth * tinyHeight;
console.log('Verifying original decoded audio and continuous source picture…');
const originalAudio = await audioIdentity(sourcePath);
assert(originalAudio.sha256 === recording.decodedStereoS16Sha256 && originalAudio.sampleCount === recording.decodedSampleCount, 'Original PCM manifest mismatch.');
const originalAudioPackets = audioPackets(sourcePath), originalAudioPacketSequence = JSON.stringify(originalAudioPackets);
const originalAudioPacketSequenceSha256 = createHash('sha256').update(originalAudioPacketSequence).digest('hex');
const originalTiny = await decodeBytes(['-i', sourcePath, '-an', '-vf', `crop=1920:360:0:132,scale=${tinyWidth}:${tinyHeight}:flags=area,format=gray`, '-fps_mode', 'passthrough', '-f', 'rawvideo', 'pipe:1']);
assert(originalTiny.length === recording.picture.frameCount * tinyBytes, 'Original picture count mismatch.');

const rendererSha256 = hash(join(root, 'scripts/render-production.ts')), verifierSha256 = hash(fileURLToPath(import.meta.url));
const requestedFormat = process.env.PHANTOM_VERIFY_FORMAT;
assert(requestedFormat === undefined || requestedFormat === 'landscape' || requestedFormat === 'portrait', 'PHANTOM_VERIFY_FORMAT must be landscape or portrait.');
const selectedFormats = requestedFormat ? [requestedFormat] as Format[] : ['landscape', 'portrait'] as const;
const formats: Record<string, object> = {}, encodedStates: object[] = [], negativeControls: object[] = [], overviewStills: object[] = [];
for (const priorFormat of ['landscape', 'portrait'] as const) if (!selectedFormats.includes(priorFormat)) {
  const priorPath = join(verificationDirectory, `verification-${priorFormat}.json`);
  if (existsSync(priorPath)) {
    const prior = JSON.parse(readFileSync(priorPath, 'utf8')) as {status: string; revision: string; approvedInputHashes: Record<string, string>; rendererSha256: string; verifierSha256: string;
      formatResult: {sha256: string}; encodedStates: object[]; negativeControls: object[]; overviewStills: object[]};
    assert(prior.status === 'format-passed' && prior.revision === gate.revision && prior.rendererSha256 === rendererSha256 && prior.verifierSha256 === verifierSha256 &&
      JSON.stringify(prior.approvedInputHashes) === JSON.stringify(gate.inputs), `Earlier ${priorFormat} verification is stale.`);
    assert(hash(join(outputDirectory, names[priorFormat])) === prior.formatResult.sha256, `Earlier ${priorFormat} master changed.`);
    formats[priorFormat] = prior.formatResult; encodedStates.push(...prior.encodedStates); negativeControls.push(...prior.negativeControls); overviewStills.push(...prior.overviewStills);
  }
}
for (const format of selectedFormats) {
  const path = join(outputDirectory, names[format]), p = COMPOSITION[format];
  console.log(`${format}: probing full encoded master and comparing complete audio…`);
  const fileSha256 = hash(path), receipt = JSON.parse(readFileSync(`${path}.json`, 'utf8')) as Record<string, unknown>;
  assert(receipt.schema === 'phantom-liberty/production-render/v1' && receipt.revision === gate.revision && receipt.sourceSha256 === recording.sourceSha256 &&
    JSON.stringify(receipt.approvedInputHashes) === JSON.stringify(gate.inputs) && receipt.rendererSha256 === rendererSha256 && receipt.sha256 === fileSha256 &&
    receipt.firstOutputFrame === 0 && receipt.encodedFrames === frameCount && receipt.decodedSourceFrames === recording.picture.frameCount && receipt.width === p.width && receipt.height === p.height,
  `${format}: renderer receipt differs from frozen production identity.`);
  const producerScript = typeof receipt.producerScript === 'string' ? receipt.producerScript : 'scripts/render-production.ts';
  assert(producerScript === 'scripts/render-production.ts' || (format === 'portrait' && producerScript === 'scripts/render-portrait-cached.ts'), `${format}: unrecognized producer script.`);
  const producerSha256 = producerScript === 'scripts/render-production.ts' ? rendererSha256 : receipt.producerSha256;
  assert(typeof producerSha256 === 'string' && hash(join(root, producerScript)) === producerSha256, `${format}: producer identity changed.`);
  const dependencyHashes = producerScript === 'scripts/render-production.ts' ? {'scripts/render-production.ts': rendererSha256} : receipt.dependencyHashes as Record<string, string>;
  assert(dependencyHashes && Object.keys(dependencyHashes).length === (producerScript === 'scripts/render-production.ts' ? 1 : 2) &&
    dependencyHashes['scripts/render-production.ts'] === rendererSha256 && Object.entries(dependencyHashes).every(([file, digest]) =>
      ['scripts/render-production.ts', 'scripts/cached-painter.ts'].includes(file) && hash(join(root, file)) === digest), `${format}: producer dependency binding changed.`);
  const metadata = probe(path), streams = metadata.streams as Array<Record<string, unknown>>;
  const video = streams.find(stream => stream.codec_type === 'video'), audio = streams.find(stream => stream.codec_type === 'audio');
  assert(video?.codec_name === 'h264' && video.width === p.width && video.height === p.height && video.pix_fmt === 'yuv420p', `${format}: codec or dimensions differ.`);
  assert(video?.r_frame_rate === '60000/1001' && video.avg_frame_rate === '60000/1001' && Number(video.nb_read_frames) === frameCount, `${format}: rational frame clock or count differs.`);
  assert(Number(video?.start_time) === 0 && video?.time_base === '1/60000' && Number(audio?.start_time) === 0, `${format}: picture/audio presentation starts were changed.`);
  assert(audio?.codec_name === 'aac' && Number(audio.sample_rate) === recording.sampleRate && audio.channels === 2, `${format}: original AAC layout differs.`);
  assert(audio?.time_base === '1/44100', `${format}: AAC packet time base changed.`);
  const packetSequence = audioPackets(path);
  assert(JSON.stringify(packetSequence) === originalAudioPacketSequence, `${format}: original AAC packet payload hashes, PTS/DTS/durations or priming metadata changed.`);
  const presentationTimes = videoPresentationTimes(path);
  const decodedAudio = await audioIdentity(path);
  assert(decodedAudio.sha256 === originalAudio.sha256 && decodedAudio.sampleCount === originalAudio.sampleCount, `${format}: audio was cut, processed or delayed.`);
  const cleanCrop = format === 'landscape' ? 'crop=1920:360:0:0' : 'crop=1080:202:0:280';
  const tiny = await decodeBytes(['-i', path, '-an', '-vf', `${cleanCrop},scale=${tinyWidth}:${tinyHeight}:flags=area,format=gray`, '-fps_mode', 'passthrough', '-f', 'rawvideo', 'pipe:1']);
  assert(tiny.length === frameCount * tinyBytes, `${format}: full picture decode has missing or extra frames.`);
  const errors: number[] = [], suspectBlackFrames: number[] = []; let maximumFrame = 0;
  for (let frame = 0; frame < frameCount; frame++) {
    let error = 0, sourceMean = 0, encodedMean = 0; const originalOffset = sourceIndex(frame) * tinyBytes, offset = frame * tinyBytes;
    for (let pixel = 0; pixel < tinyBytes; pixel++) {const a = originalTiny[originalOffset + pixel] ?? 0, b = tiny[offset + pixel] ?? 0; error += Math.abs(a - b); sourceMean += a; encodedMean += b;}
    error /= tinyBytes; sourceMean /= tinyBytes; encodedMean /= tinyBytes; errors.push(error);
    if (error > (errors[maximumFrame] ?? 0)) maximumFrame = frame;
    if (sourceMean > 8 && encodedMean < 2) suspectBlackFrames.push(frame);
  }
  // 32×6 area-resampled grayscale supports shot/content continuity, not fine
  // semantic object identity. Lossy codec and portrait scaler remain bounded.
  assert(suspectBlackFrames.length === 0, `${format}: authored picture was replaced by black.`);
  assert((errors[maximumFrame] ?? 0) < 12 && percentile(errors, .99) < 5, `${format}: source-picture correspondence failed; inspect cut/clock alignment.`);

  console.log(`${format}: decoding all word-state and overview frames…`);
  const byIndex = new Map<number, State[]>();
  for (const state of states) byIndex.set(state.frameIndex, [...(byIndex.get(state.frameIndex) ?? []), state]);
  const indices = [...new Set([...byIndex.keys(), ...overviewIndices])].sort((a, b) => a - b);
  const sourceIndices = [...new Set(indices.map(sourceIndex))].sort((a, b) => a - b);
  const original = frames(['-i', sourcePath, '-an', '-vf', select(sourceIndices), '-fps_mode', 'passthrough', '-pix_fmt', 'rgba', '-f', 'rawvideo', 'pipe:1'], 1920 * 1080 * 4);
  const encoded = frames(['-i', path, '-an', '-vf', select(indices), '-fps_mode', 'passthrough', '-pix_fmt', 'rgba', '-f', 'rawvideo', 'pipe:1'], p.width * p.height * 4);
  const sourceCanvas = createCanvas(1920, 1080), sourceContext = sourceCanvas.getContext('2d'), sourceImage = sourceContext.createImageData(1920, 1080);
  const canvas = createCanvas(p.width, p.height), context = canvas.getContext('2d');
  const maskMap = masks(format), sceneErrors: number[] = [], glyphErrors: number[] = [], focusFractions: number[] = [];
  const contactWidth = format === 'landscape' ? 480 : 180, contactHeight = format === 'landscape' ? 204 : 320;
  const contact = createCanvas(contactWidth * 4, (contactHeight + 30) * 4), contactContext = contact.getContext('2d');
  contactContext.fillStyle = '#10080e'; contactContext.fillRect(0, 0, contact.width, contact.height); let contactIndex = 0;
  let decodedCount = 0, currentSourceIndex = -1, negativesForFormat = 0; const negativeCueIds = new Set<string>();
  try {
    for (const index of indices) {
      const expectedSourceIndex = sourceIndex(index);
      if (expectedSourceIndex !== currentSourceIndex) {const next = await original.next(); assert(!next.done && next.value, `${format}: original sampled decode incomplete.`);
        sourceImage.data.set(next.value!); sourceContext.putImageData(sourceImage, 0, 0); currentSourceIndex = expectedSourceIndex;}
      const next = await encoded.next(); assert(!next.done && next.value, `${format}: encoded sampled decode incomplete.`); const pixels = next.value!;
      const time = outputTime(index); paintScene(context as unknown as CanvasRenderingContext2D, time, format, sourceCanvas as unknown as CanvasImageSource);
      const expected = context.getImageData(0, 0, p.width, p.height).data;
      const sceneError = sceneMetric(pixels, expected, p.width, p.height); sceneErrors.push(sceneError);
      assert(sceneError < 12, `${format}: shared-scene encoded parity failed at ${time.toFixed(6)} (${sceneError}).`);
      for (const state of byIndex.get(index) ?? []) {
        const tokens = state.cue.lanes[0]!.tokens.filter(token => token.sourceIndices.includes(state.word.sourceIndex));
        for (const token of tokens) {
          const mask = maskMap.get(token.id)!; const metric = glyphMetric(pixels, expected, mask); glyphErrors.push(metric.meanAbsoluteError); focusFractions.push(metric.focusPreferredFraction);
          assert(metric.meanAbsoluteError < 18 && metric.focusPreferredFraction > .9, `${format}: encoded ${state.word.id}/${state.state} did not display active glyph focus (${metric.meanAbsoluteError}, ${metric.focusPreferredFraction}).`);
          encodedStates.push({format, cueId: state.cue.id, wordId: state.word.id, word: state.word.text, track: vocalTrack(state.cue), state: state.state,
            outputFrame: index, outputPtsSeconds: time, sourceFrame: expectedSourceIndex, sourcePtsSeconds: expectedSourceIndex * sourceRate.denominator / sourceRate.numerator,
            glyphTokenId: token.id, ...metric, sceneGridMeanAbsoluteError: sceneError});
        }
        // Deliberately expect the following inactive word to be focused. A
        // one-word-shift checker must fail this false target on real pixels.
        if (state.state === 'middle-frame' && !negativeCueIds.has(state.cue.id) && state.cue.words.length > 1) {
          const wrongIndex = (state.word.sourceIndex + 1) % state.cue.words.length;
          const wrongWord = state.cue.words[wrongIndex]!;
          if (!sourceActive(wrongWord, time, timeline.sampleRate)) {
            const wrongToken = state.cue.lanes[0]!.tokens.find(token => token.sourceIndices.includes(wrongIndex))!;
            const wrongMask = maskMap.get(wrongToken.id)!; const wrong = glyphMetric(pixels, expected, wrongMask);
            assert(wrong.focusPreferredFraction < .1, `${format}: negative control could not distinguish next-word rest from active focus.`);
            negativeControls.push({format, outputFrame: index, outputPtsSeconds: time, correctWordId: state.word.id,
              deliberatelyWrongFocusWordId: wrongWord.id, incorrectFocusPreferredFraction: wrong.focusPreferredFraction,
              falseActiveHypothesisRejected: true, scope: 'Actual decoded inactive adjacent glyph tested as an intentionally wrong active target.'}); negativesForFormat++; negativeCueIds.add(state.cue.id);
          }
        }
      }
      if (overviewIndices.includes(index)) {
        const image = context.createImageData(p.width, p.height); image.data.set(pixels); context.putImageData(image, 0, 0);
        const filename = `encoded-${format}-${String(index).padStart(5, '0')}.jpg`, bytes = canvas.toBuffer('image/jpeg', 91);
        writeFileSync(join(verificationDirectory, filename), bytes);
        overviewStills.push({format, file: `evidence/${filename}`, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length, outputFrame: index,
          outputPtsSeconds: time, sourceFrame: expectedSourceIndex, provenance: 'Decoded final MP4 frame; no reconstruction or compositing.'});
        if (index === 4679) {
          const finalName = format === 'landscape' ? 'final-wide-78.061317.jpg' : 'final-portrait-78.061317.jpg';
          writeFileSync(join(verificationDirectory, finalName), bytes);
          overviewStills.push({format, file: `evidence/${finalName}`, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length,
            outputFrame: index, outputPtsSeconds: time, sourceFrame: expectedSourceIndex, provenance: 'Decoded final MP4 frame; byte-identical to the corresponding encoded overview still.'});
        }
        const x = (contactIndex % 4) * contactWidth, y = Math.floor(contactIndex / 4) * (contactHeight + 30);
        contactContext.drawImage(canvas, x, y, contactWidth, contactHeight); contactContext.fillStyle = '#fff0dc'; contactContext.font = '14px sans-serif';
        contactContext.fillText(`${time.toFixed(3)}s · f${index}`, x + 6, y + contactHeight + 20); contactIndex++;
      }
      decodedCount++; if (decodedCount % 200 === 0) console.log(`${format}: ${decodedCount}/${indices.length} sampled frames checked.`);
    }
    assert((await encoded.next()).done && (await original.next()).done, `${format}: sampled decoder returned unexpected extra frames.`);
  } finally {await encoded.return(undefined); await original.return(undefined);}
  assert(negativesForFormat >= 20, `${format}: insufficient one-word-shift negative controls.`);
  const contactFile = `encoded-${format}-contact.jpg`, contactBytes = contact.toBuffer('image/jpeg', 91); writeFileSync(join(verificationDirectory, contactFile), contactBytes);
  assert(hash(path) === fileSha256, `${format}: master bytes changed during verification.`);
  assert(hash(join(root, producerScript)) === producerSha256 && Object.entries(dependencyHashes).every(([file, digest]) => hash(join(root, file)) === digest), `${format}: producer or dependency changed during verification.`);
  formats[format] = {file: names[format], sha256: fileSha256, bytes: statSync(path).size, width: p.width, height: p.height, fps: rate,
    producerScript, producerSha256, dependencyHashes,
    frameCount, durationSeconds: frameCount * rate.denominator / rate.numerator, videoPresentationTimes: presentationTimes, audio: decodedAudio,
    exactAacPacketIdentity: {packets: packetSequence.length, packetSequenceSha256: originalAudioPacketSequenceSha256,
      payloadHashesAndPtsDtsDurationsAndPrimingIdentical: true, timeBase: '1/44100', firstPts: packetSequence[0]!.pts, finalPts: packetSequence.at(-1)!.pts},
    completePictureDecode: true, fullDurationSourceCorrespondence: {frames: frameCount, region: cleanCrop, sampleWidth: tinyWidth, sampleHeight: tinyHeight,
      p50MeanAbsoluteError: percentile(errors, .5), p99MeanAbsoluteError: percentile(errors, .99), maximumMeanAbsoluteError: errors[maximumFrame], maximumErrorFrame: maximumFrame,
      unmatchedBlackFrames: suspectBlackFrames.length, expectedAuthoredDarknessAndFinalPictureHoldPreserved: true},
    sampledSceneParity: {frames: indices.length, gridStride: 16, maximumMeanAbsoluteError: Math.max(...sceneErrors), p99MeanAbsoluteError: percentile(sceneErrors, .99)},
    glyphFocus: {stateCount: glyphErrors.length, maximumMeanAbsoluteError: Math.max(...glyphErrors), p99MeanAbsoluteError: percentile(glyphErrors, .99), minimumFocusPreferredFraction: Math.min(...focusFractions),
      glyphInteriorMask: 'Opaque font core eroded by one pixel; shared exact renderer scene/font/layout; expected RGB compared with decoded lossy RGB.',
      thresholds: {maximumMeanAbsoluteErrorExclusive: 18, minimumFocusPreferredFractionExclusive: .9}, oneWordShiftNegativeControls: negativesForFormat},
    contactSheet: {file: `evidence/${contactFile}`, sha256: createHash('sha256').update(contactBytes).digest('hex'), frameCount: contactIndex}};
  writeFileSync(join(verificationDirectory, `verification-${format}.json`), JSON.stringify({schemaVersion: 1, status: 'format-passed', revision: gate.revision,
    approvedInputHashes: gate.inputs, rendererSha256, verifierSha256, formatResult: formats[format], encodedStates: encodedStates.filter(state => (state as {format: string}).format === format),
    negativeControls: negativeControls.filter(state => (state as {format: string}).format === format), overviewStills: overviewStills.filter(state => (state as {format: string}).format === format), recordedAt: new Date().toISOString()}, null, 2) + '\n');
  console.log(`${format}: all ${states.length} event states and ${frameCount} source-picture frames passed.`);
}
const currentGate = checkCurrentProductionGate(root);
assert(JSON.stringify(currentGate.inputs) === JSON.stringify(gate.inputs), 'Approved inputs changed during verification.');
assert(hash(join(root, 'scripts/render-production.ts')) === rendererSha256 && hash(fileURLToPath(import.meta.url)) === verifierSha256, 'Renderer or verifier changed during verification.');
if (!formats.landscape || !formats.portrait) {console.log('Selected format passed; both-format final acceptance remains pending.'); process.exit(0);}
const sceneReview = {schemaVersion: 1, status: 'passed', revision: gate.revision, sourceSha256: recording.sourceSha256, approvedInputHashes: gate.inputs, rendererSha256, verifierSha256,
  outputClock: rate, originalPictureClock: sourceRate, originalPcm: originalAudio, originalAacPacketSequenceSha256: originalAudioPacketSequenceSha256,
  eventCount: timeline.cues.reduce((total, cue) => total + cue.words.length, 0),
  scope: 'Final encoded frames at the first active, midpoint and last active output frame for every performed event in each format; all-duration original AAC decoded equality and clean source-picture region continuity.',
  limitations: ['Encoded-frame and pixel tests establish display/clock/source parity, not perceptually certified vocal boundaries or an additional listening review.',
    'Video refresh is 60000/1001 fps; presentation is quantized to the next available output frame at each onset and final active frame before release.',
    'Clean top-of-picture 32×6 area samples across every frame detect missing source imagery, stale cuts and black substitutes; they do not constitute semantic subject recognition.',
    'Contact sheets cover selected actual source cuts. The approved portrait contains the entire sharp original horizontal picture and its intentionally defocused source-derived ambient extension.',
    'Approved masked backing and lexical variant uncertainties remain unchanged.'],
  formats, encodedStates, negativeControls, overviewStills, recordedAt: new Date().toISOString()};
const sceneReviewPath = join(verificationDirectory, 'encoded-scene-review.json'); writeFileSync(sceneReviewPath, JSON.stringify(sceneReview, null, 2) + '\n');
const final = {schemaVersion: 1, status: 'passed', revision: gate.revision, sourceSha256: recording.sourceSha256, approvedInputHashes: gate.inputs, rendererSha256, verifierSha256,
  formats, encodedSceneReview: {file: 'evidence/encoded-scene-review.json', sha256: hash(sceneReviewPath)}, recordedAt: new Date().toISOString(),
  productionGateValid: true, assistantListeningClaim: false, wholeRecordingAudioUnchanged: true, fullSourcePictureClockPreserved: true,
  authoredSourceDarknessPreserved: true, firstMiddleLastEncodedFocusForEveryEventInBothFormats: true, negativeControlOneWordShiftDetected: true};
writeFileSync(join(verificationDirectory, 'final-verification.json'), JSON.stringify(final, null, 2) + '\n');
writeFileSync(join(verificationDirectory, 'final-film-still.json'), JSON.stringify({schemaVersion: 1, revision: gate.revision, sourceSha256: recording.sourceSha256, approvedInputHashes: gate.inputs,
  provenance: 'Actual decoded verified final MP4 frames; native frame4679/source frame2339; no reconstruction.',
  frames: overviewStills.filter(state => (state as {outputFrame: number}).outputFrame === 4679).map(state => ({...state,
    mediaSha256: (formats[(state as {format: string}).format] as {sha256: string}).sha256})), recordedAt: new Date().toISOString()}, null, 2) + '\n');
console.log(`Final verification passed: ${encodedStates.length} decoded glyph states, ${negativeControls.length} deliberate wrong-word hypotheses rejected.`);
