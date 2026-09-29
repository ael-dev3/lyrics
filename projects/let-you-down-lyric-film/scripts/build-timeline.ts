import {createHash} from 'node:crypto';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {normalizeLyrics, parseLyrics} from '../src/lyrics.ts';
import {EXPECTED_LINES, SONG, effectFor, sectionOfLine} from '../src/song.ts';
import {parseTimeline} from '../src/model.ts';

// Assemble public/timeline.json from the acoustic selection and the local
// lyric file. The output carries IDs, sample-grid times, evidence labels,
// section and effect tags, and each word's character count; never the text.
const root = fileURLToPath(new URL('../', import.meta.url));
const lyricsPath = `${root}source/lyrics.local.txt`;
if (!existsSync(lyricsPath)) throw Error('source/lyrics.local.txt is missing');
const normalized = normalizeLyrics(readFileSync(lyricsPath, 'utf8'));
const textSha = createHash('sha256').update(normalized, 'utf8').digest('hex');
const lyrics = parseLyrics(normalized);
if (lyrics.lines.length !== EXPECTED_LINES) throw Error(`Expected ${EXPECTED_LINES} lines for this edition's section map, found ${lyrics.lines.length}`);
type Sel = {start: number; end: number; startSample: number; endSample: number; basis: string; spreadMs: number; review: string; voice: string};
const selection = JSON.parse(readFileSync(`${root}analysis/timing-selection.json`, 'utf8')) as {textSha256: string; words: Record<string, Sel>};
if (selection.textSha256 !== textSha) throw Error('timing-selection.json belongs to a different lyric text');
const source = JSON.parse(readFileSync(`${root}evidence/source-identity.json`, 'utf8')) as {audio: {duration: string}};
const revision = process.argv.includes('--revision') ? process.argv[process.argv.indexOf('--revision') + 1]! : 'preview-v1';
const effects: Record<string, number> = {};
const cues = lyrics.lines.map(line => {
  const section = sectionOfLine(line.index);
  if (!section) throw Error(`No section for ${line.id}`);
  const words = line.tokens.map(token => {
    const s = selection.words[token.id];
    if (!s) throw Error(`No timing for ${token.id}`);
    if (s.voice !== token.voice) throw Error(`Voice mismatch for ${token.id}`);
    const effect = effectFor(token.id, token.norm, line.index);
    if (effect) effects[effect] = (effects[effect] ?? 0) + 1;
    return {id: token.id, token: token.index, voice: token.voice, chars: token.display.replace(/[()]/gu, '').length, start: s.start, end: s.end,
      startSample: s.startSample, endSample: s.endSample, basis: s.basis, spreadMs: s.spreadMs, review: s.review, effect};
  });
  return {id: line.id, line: line.index, section: section.id, start: Math.min(...words.map(w => w.start)), end: Math.max(...words.map(w => w.end)), words};
});
const timeline = {
  schema: 'lyric-film/timeline-id-only/v1', song: SONG, revision, duration: Number(source.audio.duration), sampleRate: 44100,
  text: {sha256: textSha, lines: lyrics.lines.length, tokens: cues.reduce((a, q) => a + q.words.length, 0), tokensPerLine: lyrics.lines.map(l => l.tokens.length)},
  cues,
};
parseTimeline(timeline); // same validation the preview and renderer apply
writeFileSync(`${root}public/timeline.json`, JSON.stringify(timeline, null, 1) + '\n');
console.log(JSON.stringify({revision, lines: cues.length, words: timeline.text.tokens, priority: cues.flatMap(q => q.words).filter(w => w.review === 'priority').length, effects}));
