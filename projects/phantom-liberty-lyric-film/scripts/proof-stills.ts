import {createHash} from 'node:crypto';
import {mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas, GlobalFonts, loadImage} from '@napi-rs/canvas';
import {COMPOSITION, PALETTE, cueOpacity, initScene, layoutCue, paintScene} from '../src/scene.ts';
import {sourceActive, tokenActive, vocalTrack, type Cue, type FeatureData, type Format, type Timeline} from '../src/model.ts';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const read = <T>(path: string): T => JSON.parse(readFileSync(join(root, path), 'utf8')) as T;
const hash = (path: string): string => createHash('sha256').update(readFileSync(join(root, path))).digest('hex');
const timeline = read<Timeline>('public/timeline.json');
const features = read<FeatureData>('public/audio-features.json');
const recording = read<{sourceSha256: string; picture: {frameRate: {numerator: number; denominator: number}; frameCount: number}}>('source/recording.json');
const sourceHash = hash('public/source.mp4');
if (sourceHash !== recording.sourceSha256 || timeline.sourceSha256 !== sourceHash || features.sourceSha256 !== sourceHash) throw Error('Shared-scene stills require the exact source/timing/feature identities.');
const inputPaths = {timeline: 'public/timeline.json', features: 'public/audio-features.json', scene: 'src/scene.ts',
  model: 'src/model.ts', font: 'public/fonts/SpaceGrotesk.ttf', proofScript: 'scripts/proof-stills.ts'};
const inputHashes = Object.fromEntries(Object.entries(inputPaths).map(([name, path]) => [name, hash(path)]));
if (!GlobalFonts.registerFromPath(join(root, 'public/fonts/SpaceGrotesk.ttf'), 'PhantomGrotesk')) throw Error('The pinned scene font could not be registered.');
initScene(timeline, features);

function require(condition: boolean, message: string): void {if (!condition) throw Error(message);}
const layoutResults: object[] = [], overlapResults: object[] = [];
let checkedWordStates = 0;
for (const format of ['landscape', 'portrait'] as const) {
  const p = COMPOSITION[format];
  const canvas = createCanvas(p.width, p.height), ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
  const horizontalMargin = format === 'portrait' ? 60 : 80;
  const spectrumTop = p.spectrumBaseline - p.travel - 2;
  for (const cue of timeline.cues) {
    const layout = layoutCue(ctx, cue, format);
    require(layout.top >= 0 && layout.bottom < p.height, `Off-canvas reading block ${cue.id}/${format}`);
    require(layout.bottom + 8 <= spectrumTop, `Spectrum maximum reach overlaps ${cue.id}/${format}`);
    if (format === 'portrait') require(layout.bottom < p.height - 180, `Portrait platform area collision ${cue.id}`);
    for (const slot of layout.slots) require(slot.x >= horizontalMargin && slot.x + slot.width <= p.width - horizontalMargin, `Horizontal glyph clearance failed ${slot.token.id}/${format}`);
    for (const word of cue.words) {
      const start = word.startSample / timeline.sampleRate;
      const middle = (word.startSample + Math.floor((word.endSample - word.startSample) / 2)) / timeline.sampleRate;
      const lastActive = (word.endSample - 1) / timeline.sampleRate;
      for (const [state, time] of [['entry', start], ['middle', middle], ['last-active-sample', lastActive]] as const) {
        require(sourceActive(word, time, timeline.sampleRate), `Inactive ${state} fixture ${word.id}`);
        require(cueOpacity(cue, time) === 1, `Incomplete ${state} vocal opacity ${word.id}/${format}`);
        const owners = cue.lanes[0]!.tokens.filter(token => token.sourceIndices.includes(word.sourceIndex));
        require(owners.length > 0 && owners.every(token => tokenActive(token, cue.words, time, timeline.sampleRate)), `Missing complete English focus ${word.id}/${format}/${state}`);
        checkedWordStates++;
      }
      require(!sourceActive(word, word.endSample / timeline.sampleRate, timeline.sampleRate), `Nonexclusive lexical release ${word.id}`);
    }
    layoutResults.push({cueId: cue.id, vocalTrack: vocalTrack(cue), format, size: layout.size, top: layout.top, bottom: layout.bottom,
      distinctRows: new Set(layout.slots.map(slot => slot.y)).size, spectrumMaximumBodyTop: spectrumTop,
      spectrumClearance: spectrumTop - layout.bottom, tokenCount: layout.slots.length});
  }
  const lead = timeline.cues.filter(cue => vocalTrack(cue) === 'lead');
  const backing = timeline.cues.filter(cue => vocalTrack(cue) === 'backing');
  for (const a of lead) for (const b of backing) {
    if (a.visibleStart >= b.visibleEnd || b.visibleStart >= a.visibleEnd) continue;
    const upper = layoutCue(ctx, a, format), lower = layoutCue(ctx, b, format);
    require(upper.bottom + 12 <= lower.top, `Concurrent vocal blocks collide ${a.id}/${b.id}/${format}`);
    overlapResults.push({leadCueId: a.id, backingCueId: b.id, format, clearance: lower.top - upper.bottom,
      overlapStart: Math.max(a.visibleStart, b.visibleStart), overlapEnd: Math.min(a.visibleEnd, b.visibleEnd)});
  }
}

const simultaneousProofs = [77.9, 178, 246.9].map(nominalTime => {
  const intersections: Array<{sample: number; leadCueId: string; backingCueId: string; leadWord: string; backingWord: string; overlapSamples: number}> = [];
  for (const lead of timeline.cues.filter(cue => vocalTrack(cue) === 'lead')) for (const backing of timeline.cues.filter(cue => vocalTrack(cue) === 'backing')) {
    for (const a of lead.words) for (const b of backing.words) {
      const start = Math.max(a.startSample, b.startSample), end = Math.min(a.endSample, b.endSample);
      if (end - start < timeline.sampleRate * .02) continue;
      const sample = start + Math.floor((end - start) / 2);
      if (Math.abs(sample / timeline.sampleRate - nominalTime) > 4) continue;
      intersections.push({sample, leadCueId: lead.id, backingCueId: backing.id, leadWord: a.text, backingWord: b.text, overlapSamples: end - start});
    }
  }
  intersections.sort((a, b) => Math.abs(a.sample / timeline.sampleRate - nominalTime) - Math.abs(b.sample / timeline.sampleRate - nominalTime));
  const selected = intersections[0]; if (!selected) throw Error(`No actual two-voice word intersection near ${nominalTime}; investigate the timeline before visual proof.`);
  return {nominalTime, selectedTime: selected.sample / timeline.sampleRate, ...selected};
});
const requestedTimes = [14, 79.8, 85.4, 176.8, 217, 248, 292, 334, ...simultaneousProofs.map(proof => proof.selectedTime)].sort((a, b) => a - b);
const rate = recording.picture.frameRate;
const sourceFrameIndices = requestedTimes.map(time => Math.min(recording.picture.frameCount - 1, Math.floor(time * rate.numerator / rate.denominator)));
const frames = [...new Set(sourceFrameIndices)].sort((a, b) => a - b);
const temporary = mkdtempSync(join(tmpdir(), 'phantom-liberty-still-source-'));
const output = join(root, 'evidence'); mkdirSync(output, {recursive: true});
const stillResults: object[] = [];
try {
  // A single bounded decode extracts exact original frame indices. Picture PTS
  // and finer lyric time are recorded independently; no soundtrack is encoded.
  const filter = `select=${frames.map(frame => `eq(n\\,${frame})`).join('+')}`;
  const decode = spawnSync('ffmpeg', ['-v', 'error', '-threads', '2', '-filter_threads', '1', '-i', join(root, 'public/source.mp4'),
    '-vf', filter, '-fps_mode', 'passthrough', '-frames:v', String(frames.length), '-compression_level', '2', join(temporary, 'source-%02d.png')], {maxBuffer: 1e6});
  if (decode.status !== 0) throw Error(`Source-frame extraction failed: ${decode.stderr.toString()}`);
  require(readdirSync(temporary).filter(path => path.endsWith('.png')).length === frames.length, 'Source-frame extraction is incomplete.');
  const sourceImages = new Map<number, Awaited<ReturnType<typeof loadImage>>>();
  for (const [index, frame] of frames.entries()) sourceImages.set(frame, await loadImage(join(temporary, `source-${String(index + 1).padStart(2, '0')}.png`)));
  for (const [index, time] of requestedTimes.entries()) {
    const sourceFrameIndex = sourceFrameIndices[index]!, source = sourceImages.get(sourceFrameIndex);
    if (!source) throw Error(`Missing extracted frame ${sourceFrameIndex}`);
    for (const format of ['landscape', 'portrait'] as const) {
      const p = COMPOSITION[format], canvas = createCanvas(p.width, p.height), ctx = canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
      paintScene(ctx, time, format, source as unknown as CanvasImageSource);
      const timeLabel = Number(time.toFixed(6)).toString().replace('.', '-');
      const name = `scene-proof-${timeLabel}-${format}.jpg`;
      const bytes = canvas.toBuffer('image/jpeg', 91); writeFileSync(join(output, name), bytes);
      const visible = timeline.cues.filter(cue => time >= cue.visibleStart && time < cue.visibleEnd);
      stillResults.push({file: `evidence/${name}`, sha256: createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length,
        format, width: p.width, height: p.height, requestedWordClockSeconds: time, sourceFrameIndex,
        sourcePicturePtsSeconds: sourceFrameIndex * rate.denominator / rate.numerator,
        vocalTracks: visible.map((cue: Cue) => ({cueId: cue.id, vocalTrack: vocalTrack(cue), opacity: cueOpacity(cue, time),
          activeWords: cue.words.filter(word => sourceActive(word, time, timeline.sampleRate)).map(word => word.text)}))});
    }
  }
} finally {rmSync(temporary, {recursive: true, force: true});}

for (const [name, path] of Object.entries(inputPaths)) require(hash(path) === inputHashes[name], `Input changed during the proof: ${path}. Rerun against a frozen revision.`);
require(hash('public/source.mp4') === sourceHash, 'Original source changed during the still proof.');

const evidence = {schemaVersion: 1, revision: timeline.revision, sourceSha256: sourceHash,
  provenance: 'Generated shared-TypeScript-scene stills using native canvas and explicitly indexed original decoded picture frames. These are not browser screenshots, encoded final-film frames, pixel-parity proof or listening evidence.',
  checks: {allCueLayoutsInBothFormats: true, allWordEntryMiddleLastActiveOpacity: true, allEnglishSourceOwnersFocused: true,
    lexicalReleaseExclusive: true, independentVocalBlockClearance: true, boundedSpectrumBodyBelowText: true,
    checkedWordStates, layoutCount: layoutResults.length, overlapStateCount: overlapResults.length},
  inputHashes,
  environment: {node: process.version, nativeCanvas: read<{version: string}>('node_modules/@napi-rs/canvas/package.json').version,
    fontFamily: 'PhantomGrotesk', nominalSceneWeight: 600, ffmpeg: spawnSync('ffmpeg', ['-version'], {encoding: 'utf8'}).stdout.split('\n')[0]},
  palette: PALETTE, simultaneousProofs, layoutResults, overlapResults, stillResults};
writeFileSync(join(output, 'proof-stills.json'), JSON.stringify(evidence, null, 2) + '\n');
console.log(`${layoutResults.length} cue/layout states; ${checkedWordStates} active-word states; ${overlapResults.length} overlap states; ${stillResults.length} shared-scene stills.`);
