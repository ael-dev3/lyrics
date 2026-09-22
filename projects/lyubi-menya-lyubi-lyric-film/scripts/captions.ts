import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseData} from '../src/schema.ts';

const cueBytes = readFileSync('src/cues.json');
const data = parseData(JSON.parse(cueBytes.toString('utf8')));
const stamp = (sample: number) => {
  const ms = Math.round(sample / data.sampleRate * 1000);
  return [Math.floor(ms / 3600000), Math.floor(ms / 60000) % 60, Math.floor(ms / 1000) % 60].map(value => String(value).padStart(2, '0')).join(':') + ',' + String(ms % 1000).padStart(3, '0');
};
mkdirSync('publishing/captions', {recursive: true});
mkdirSync('evidence', {recursive: true});
const files = [];
for (const language of ['ru', 'en', 'bilingual'] as const) {
  let previousEnd = -1;
  const content = data.cues.map((cue, index) => {
    const start = Math.round(cue.visibleFrom / data.sampleRate * 1000);
    const end = Math.round(cue.visibleUntil / data.sampleRate * 1000);
    if (start < previousEnd || end <= start || end > Math.ceil(data.duration * 1000)) throw Error(`Invalid caption clock: ${cue.id}`);
    previousEnd = end;
    const ru = cue.ru.map(word => word.text).join(' ');
    const en = cue.en.map(word => word.text).join(' ');
    const text = language === 'ru' ? ru : language === 'en' ? en : `${ru}\n${en}`;
    return `${index + 1}\n${stamp(cue.visibleFrom)} --> ${stamp(cue.visibleUntil)}\n${text}`;
  }).join('\n\n') + '\n';
  const path = `publishing/captions/Lyubi-Menya-Lyubi-${language}.srt`;
  writeFileSync(path, content, 'utf8');
  const bytes = readFileSync(path);
  files.push({path, language, cues: data.cues.length, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex')});
}
writeFileSync('evidence/caption-assets.json', JSON.stringify({method: 'UTF-8 line-level SRT captions generated from the reviewed cue text and the same visibleFrom/visibleUntil sample windows used by the film. Timestamps are rounded to milliseconds; no independent word timestamps or pronunciation text are introduced.', sourceCueSha256: createHash('sha256').update(cueBytes).digest('hex'), sampleRate: data.sampleRate, cueCount: data.cues.length, files}, null, 2) + '\n');
console.log({captionFiles: files.length, cuesPerFile: data.cues.length});
