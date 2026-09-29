import {createHash} from 'node:crypto';
import {existsSync, readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {bindText, parseFeatures, parseTimeline, parseTones} from '../src/model.ts';
import {normalizeLyrics, parseLyrics} from '../src/lyrics.ts';
import {EXPECTED_LINES, SONG, effectFor} from '../src/song.ts';
import {SHOTS} from '../src/shots.ts';

// Structural checks (npm run check). They establish data shape, identities and
// consistency, never acoustic accuracy, perceived sync or visual quality.
// --local-media additionally requires the locked source video.
const root = fileURLToPath(new URL('../', import.meta.url));
const sha = (b: Uint8Array | string): string => createHash('sha256').update(b).digest('hex');
const results: string[] = [], problems: string[] = [];
const ok = (m: string): void => {results.push(`ok   ${m}`);};
const fail = (m: string): void => {problems.push(`FAIL ${m}`);};
const json = (p: string): unknown => JSON.parse(readFileSync(`${root}${p}`, 'utf8'));

// Source identity (media is local and ignored by Git).
const identity = json('evidence/source-identity.json') as {sha256: string; bytes: number; video: {frames: number}; audio: {duration: string; packetFramemd5Sha256: string}};
if (existsSync(`${root}public/source.mp4`)) {
  const bytes = readFileSync(`${root}public/source.mp4`);
  if (bytes.length !== identity.bytes || sha(bytes) !== identity.sha256) fail('public/source.mp4 differs from evidence/source-identity.json');
  else ok(`source video ${identity.sha256.slice(0, 12)}… (${identity.video.frames} frames)`);
  const packets = execFileSync('ffmpeg', ['-v', 'error', '-nostdin', '-i', `${root}public/source.mp4`, '-map', '0:a:0', '-c', 'copy', '-f', 'framemd5', 'pipe:1'], {maxBuffer: 64 << 20});
  if (sha(packets) !== identity.audio.packetFramemd5Sha256) fail('source AAC packets differ'); else ok('source AAC packet identity');
} else if (process.argv.includes('--local-media')) fail('public/source.mp4 is required with --local-media');
else ok('source video not present locally (identity check skipped)');

// Measured features and picture tones.
const featureBytes = readFileSync(`${root}public/audio-features.bin`);
const features = parseFeatures(json('public/audio-features.json'), featureBytes.byteLength);
if (sha(featureBytes) !== features.dataSha256) fail('audio-features.bin hash mismatch');
else if (features.sourceSha256 !== identity.sha256) fail('audio features were measured from a different source');
else if (Math.abs(features.durationSeconds - Number(identity.audio.duration)) > 1e-3) fail('feature duration differs from the source audio');
else ok(`audio features: ${features.frameCount} rows × ${features.scalarsPerFrame} at 60 Hz`);
const view = new DataView(featureBytes.buffer, featureBytes.byteOffset, featureBytes.byteLength);
for (let i = 0; i < featureBytes.byteLength; i += 4) if (!Number.isFinite(view.getFloat32(i, true))) {fail(`non-finite feature at byte ${i}`); break;}
const tonesRaw = json('public/picture-tones.json') as {sourceSha256: string};
const tones = parseTones(tonesRaw);
if (tones.frames !== identity.video.frames || tonesRaw.sourceSha256 !== identity.sha256) fail('picture tones do not match the source'); else ok(`picture tones: ${tones.frames} frames × ${tones.fields.length} zones`);

const palette = json('public/picture-palette.json') as {sourceSha256: string; frames: number; hueA: number[]; hueB: number[]; strength: number[]};
if (palette.sourceSha256 !== identity.sha256 || palette.frames !== identity.video.frames || [palette.hueA, palette.hueB, palette.strength].some(a => a.length !== palette.frames)) fail('picture palette does not match the source');
else ok(`picture palette: ${palette.frames} frames of dominant neon hue pairs`);

// Shot map.
if (SHOTS[0]!.frames[0] !== 0 || SHOTS.at(-1)!.frames[1] !== identity.video.frames || SHOTS.some((s, i) => i > 0 && s.frames[0] !== SHOTS[i - 1]!.frames[1])) fail('shot map is not contiguous over every source frame');
else ok(`shot map: ${SHOTS.length} contiguous shots, ${SHOTS.filter(s => s.portrait.mode === 'fit').length} full-frame portrait, ${SHOTS.filter(s => s.protect).length} protected`);

// Fonts and licences.
for (const [font, licence] of [['Rajdhani-Bold.ttf', 'Rajdhani-OFL.txt']] as const) {
  if (!existsSync(`${root}public/fonts/${font}`) || !readFileSync(`${root}public/fonts/${licence}`, 'utf8').includes('SIL OPEN FONT LICENSE')) fail(`${font} or its OFL text is missing`);
  else ok(`${font} with OFL licence`);
}

// Timeline, lyric binding and effect tags.
if (existsSync(`${root}public/timeline.json`)) {
  const timeline = parseTimeline(json('public/timeline.json'));
  if (timeline.revision.startsWith('synthetic') || timeline.text.sha256 === 'synthetic') fail('public/timeline.json is the synthetic development map; never commit it');
  if (timeline.song !== SONG) fail('timeline song differs');
  if (Math.abs(timeline.duration - Number(identity.audio.duration)) > 1e-6) fail('timeline duration differs from source audio');
  if (timeline.text.lines !== EXPECTED_LINES) fail(`timeline has ${timeline.text.lines} lines; the section map expects ${EXPECTED_LINES}`);
  const words = timeline.cues.flatMap(q => q.words);
  ok(`timeline ${timeline.revision}: ${timeline.cues.length} lines, ${words.length} words, ${words.filter(w => w.review === 'priority').length} priority-review words`);
  const lyricPath = `${root}source/lyrics.local.txt`;
  if (existsSync(lyricPath)) {
    const normalized = normalizeLyrics(readFileSync(lyricPath, 'utf8')), lyrics = parseLyrics(normalized);
    try {
      bindText(timeline, lyrics, sha(normalized));
      const mismatched = timeline.cues.flatMap(q => q.words.map(w => ({w, line: q.line}))).filter(({w, line}) => {
        const token = lyrics.lines[line - 1]!.tokens[w.token - 1]!;
        return effectFor(w.id, token.norm, line) !== w.effect || token.display.replace(/[()]/gu, '').length !== w.chars;
      });
      if (mismatched.length) fail(`${mismatched.length} effect tags or character counts disagree with the lyric file`);
      else ok('local lyric text binds to every timed word; effect tags agree');
    } catch (error) {fail(`lyric binding: ${(error as Error).message}`);}
  } else ok('source/lyrics.local.txt not present (binding check skipped)');
} else ok('public/timeline.json not built yet (alignment pending the local lyric text)');

// The public record carries no lyric text: committed data files hold no words.
for (const file of ['public/timeline.json', 'analysis/word-candidates.json', 'analysis/timing-selection.json']) {
  if (!existsSync(`${root}${file}`) || !existsSync(`${root}source/lyrics.local.txt`)) continue;
  const text = readFileSync(`${root}${file}`, 'utf8').toLowerCase();
  const lyricWords = new Set(parseLyrics(readFileSync(`${root}source/lyrics.local.txt`, 'utf8')).lines.flatMap(l => l.tokens.map(t => t.norm)).filter(w => w.length >= 5));
  const leaked = [...lyricWords].filter(w => new RegExp(`"[^"]*\\b${w}\\b[^"]*"`, 'u').test(text));
  if (leaked.length) fail(`${file} appears to contain lyric words`); else ok(`${file} contains no lyric words`);
}

console.log([...results, ...problems].join('\n'));
if (problems.length) process.exit(1);
