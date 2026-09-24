import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {validateTimeline} from '../src/model.ts';
import type {Timeline} from '../src/model.ts';

type Template = {es_tokens: string[]; en_tokens: string[]; en_to_es: number[][]; note: string};
type AlignmentWord = {text: string; start: number; end: number; score: number};
type AlignmentLine = {id: string; words: AlignmentWord[]};
const readJson = <T>(relative: string): T => JSON.parse(readFileSync(fileURLToPath(new URL(relative, import.meta.url)), 'utf8')) as T;
const mapping = readJson<{unique_lines: Template[]}>('../source/translation-mapping.json');
const alignment = readJson<{sourceSha256: string; lines: AlignmentLine[]}>('../analysis/provisional-word-evidence.json');
const media = readJson<{sha256: string; formatDuration: string}>('../source/media-manifest.json');
if (alignment.sourceSha256 !== media.sha256) throw Error('Alignment belongs to a different recording');

// Repeated performances share the translation only. Their acoustic windows are independent.
const templateSequence = [0,1,0,2,3,4,5,6,7,8,9,10,11,10,2,3,4,5,6,7,8,9,12,13];
const sections = [
  ...Array(4).fill('opening'), ...Array(7).fill('first refrain'),
  ...Array(4).fill('middle'), ...Array(7).fill('second refrain'),
  ...Array(2).fill('outro'),
] as string[];
const sampleRate = 44100;
const secondsToSample = (seconds: number): number => Math.round(seconds * sampleRate);
const lines = alignment.lines.map((aligned, lineIndex) => {
  const template = mapping.unique_lines[templateSequence[lineIndex]!]!;
  if (!template || template.es_tokens.length !== aligned.words.length || template.en_tokens.length !== template.en_to_es.length) {
    throw Error(`${aligned.id}: translation or alignment count mismatch`);
  }
  const es = aligned.words.map((word, index) => {
    const next = aligned.words[index + 1];
    let end = word.end;
    // Curated provisional boundaries include independently measured held vowels,
    // while preserving actual rests before the following words.
    if (next) end = Math.min(end, next.start - 0.005);
    end = Math.max(end, Math.min(word.start + 0.085, next?.start ?? Infinity));
    return {
      id: `${aligned.id}-W${String(index + 1).padStart(2, '0')}`,
      text: template.es_tokens[index]!,
      startSample: secondsToSample(word.start),
      endSample: secondsToSample(end),
      confidence: word.score,
      review: 'provisional' as const,
    };
  });
  const en = template.en_tokens.map((text, index) => ({
    text,
    sourceIds: template.en_to_es[index]!.map(sourceIndex => es[sourceIndex]?.id ?? (() => {throw Error('Invalid source index');})()),
  }));
  const first = es[0]!, last = es.at(-1)!;
  return {
    id: aligned.id,
    section: sections[lineIndex]!,
    es,
    en,
    visibleFromSample: Math.max(0, first.startSample - secondsToSample(0.24)),
    visibleUntilSample: last.endSample + secondsToSample(0.26),
  };
});
// Adjacent cues share one stable bilingual reading area. Divide a short pause
// between them so neither line masks the next line's first sung word.
for (let index = 0; index < lines.length - 1; index++) {
  const previous = lines[index]!;
  const next = lines[index + 1]!;
  if (previous.visibleUntilSample > next.visibleFromSample) {
    const previousEnd = previous.es.at(-1)!.endSample;
    const nextStart = next.es[0]!.startSample;
    if (previousEnd >= nextStart) throw Error(`${previous.id}/${next.id}: unresolved acoustic word overlap`);
    const handoff = Math.round((previousEnd + nextStart) / 2);
    previous.visibleUntilSample = handoff;
    next.visibleFromSample = handoff;
  }
}
const timeline: Timeline = {
  sourceSha256: media.sha256,
  sampleRate,
  durationSeconds: Number(media.formatDuration),
  status: 'provisional-preview',
  lines,
};
validateTimeline(timeline);
const output = fileURLToPath(new URL('../src/timeline.json', import.meta.url));
writeFileSync(output, JSON.stringify(timeline, null, 2) + '\n');
process.stdout.write(`Built ${lines.length} independent bilingual lines and ${lines.reduce((n, line) => n + line.es.length, 0)} source-word windows\n`);
