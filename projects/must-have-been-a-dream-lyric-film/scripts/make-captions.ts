import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const timeline = JSON.parse(readFileSync(resolve(root, 'public/timeline.json'), 'utf8')) as {
  song: string;
  cues: Array<{text: string; words: Array<{start: number; end: number}>}>;
};
if (timeline.song !== 'AK6duyCPU50' || timeline.cues.length !== 26) throw Error('Expected the complete locked lyric timeline');

function clock(seconds: number, separator: ',' | '.'): string {
  const millis = Math.round(seconds * 1000);
  const hours = Math.floor(millis / 3600000);
  const minutes = Math.floor(millis / 60000) % 60;
  const whole = Math.floor(millis / 1000) % 60;
  const part = millis % 1000;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(whole).padStart(2, '0')}${separator}${String(part).padStart(3, '0')}`;
}

let previousEnd = 0;
const captions = timeline.cues.map((cue, index) => {
  const first = cue.words[0], last = cue.words.at(-1);
  if (!first || !last || !Number.isFinite(first.start) || !Number.isFinite(last.end) || first.start < previousEnd || last.end <= first.start) {
    throw Error(`Invalid caption interval at cue ${index + 1}`);
  }
  previousEnd = last.end;
  return {start: first.start, end: last.end, text: cue.text};
});
const srt = captions.map((cue, i) => `${i + 1}\n${clock(cue.start, ',')} --> ${clock(cue.end, ',')}\n${cue.text}\n`).join('\n');
const vtt = `WEBVTT\n\n${captions.map(cue => `${clock(cue.start, '.')} --> ${clock(cue.end, '.')}\n${cue.text}\n`).join('\n')}`;
writeFileSync(resolve(root, 'publishing/Computer-Kill-Must-Have-Been-A-Dream.en.srt'), srt);
writeFileSync(resolve(root, 'publishing/Computer-Kill-Must-Have-Been-A-Dream.en.vtt'), vtt);
console.log(`Wrote ${captions.length} source-clocked English captions`);
