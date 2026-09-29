import {mkdirSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {effectFor, sectionOfLine} from '../src/song.ts';

// SYNTHETIC development timeline for layout and effect work before real
// alignment exists. Evenly spaced placeholder words inside approximate section
// windows; never a timing claim. Written to analysis/work/ (ignored by Git).
const root = fileURLToPath(new URL('../', import.meta.url));
const counts = [6, 5, 6, 7, 5, 6, 6, 6, 5, 5, 5, 7, 6, 7, 6, 2, 6, 7, 6, 5, 6, 7, 5, 7, 6, 7, 6, 2, 6, 7, 6, 2, 6, 7, 4, 4, 4, 4, 3, 4];
const backingFrom: Record<number, number> = {33: 4, 34: 4, 35: 2, 36: 1};
const windows: [number, number, number, number][] = [[1, 8, 37.4, 67.2], [9, 12, 67.6, 81.8], [13, 16, 82.2, 106.8], [17, 20, 123.4, 138.2], [21, 24, 138.6, 152.8], [25, 28, 153.2, 177.2], [29, 32, 178.4, 203.6], [33, 40, 204.4, 231.2]];
const R = 44100, q = (s: number): number => Math.round(s * R) / R;
const cues = [];
for (const [first, last, a, b] of windows) {
  const span = (b - a) / (last - first + 1);
  for (let line = first; line <= last; line++) {
    const start = a + (line - first) * span, n = counts[line - 1]!, dur = span * 0.82 / n;
    const words = Array.from({length: n}, (_, i) => {
      const s = q(start + i * dur), e = q(start + (i + 1) * dur - 0.02), id = `L${String(line).padStart(2, '0')}-W${String(i + 1).padStart(2, '0')}`;
      const voice = backingFrom[line] !== undefined && i + 1 >= backingFrom[line]! ? 'backing' : 'lead';
      const effect = effectFor(id, i === n - 1 && (sectionOfLine(line)?.kind === 'chorus' || sectionOfLine(line)?.kind === 'outro') && [13, 14, 25, 26, 29, 30].concat([33, 34, 35, 36, 37, 38, 39, 40]).includes(line) ? 'down' : id === 'L02-W01' || id === 'L02-W04' ? 'neon' : id === 'L07-W06' ? 'moon' : id === 'L17-W06' || id === 'L18-W01' ? 'flames' : id === 'L19-W06' ? 'burn' : '', line);
      return {id, token: i + 1, voice, chars: 4 + ((line * 7 + i * 3) % 5), start: s, end: e, startSample: Math.round(s * R), endSample: Math.round(e * R), basis: 'synthetic-dev', spreadMs: 0, review: 'priority', effect};
    });
    cues.push({id: `L${String(line).padStart(2, '0')}`, line, section: sectionOfLine(line)!.id, start: words[0]!.start, end: Math.max(...words.map(w => w.end)), words});
  }
}
const timeline = {schema: 'lyric-film/timeline-id-only/v1', song: 'BnnbP7pCIvQ', revision: 'synthetic-dev', duration: 283.422766, sampleRate: R,
  text: {sha256: 'synthetic', lines: 40, tokens: counts.reduce((a, b) => a + b, 0), tokensPerLine: counts}, cues};
mkdirSync(`${root}analysis/work`, {recursive: true});
writeFileSync(`${root}analysis/work/dev-timeline.json`, JSON.stringify(timeline, null, 1));
console.log('synthetic dev timeline written');
