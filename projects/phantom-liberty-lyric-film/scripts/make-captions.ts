import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateTimeline, vocalTrack, type Timeline} from '../src/model.ts';
import {checkCurrentProductionGate} from './render-gate.ts';

const root = fileURLToPath(new URL('../', import.meta.url)), approved = checkCurrentProductionGate();
const sha = (data: Uint8Array): string => createHash('sha256').update(data).digest('hex');
const timelineBytes = readFileSync(resolve(root, 'public/timeline.json'));
assert.equal(sha(timelineBytes), approved.inputs['public/timeline.json']);
const timeline = JSON.parse(timelineBytes.toString('utf8')) as Timeline; validateTimeline(timeline);
assert.equal(timeline.revision, approved.revision);
mkdirSync(resolve(root, 'publishing/Captions'), {recursive: true});
type Segment = {start: number; end: number; text: string; cueIds: string[]};
// Split at the union of independent vocal starts/releases so conventional SRT
// players can show both voices without overlapping cue scheduling. Sidecars are
// phrase-level accessibility aids; exact word focus remains in the film.
const boundaries = [...new Set(timeline.cues.flatMap(c => [Math.round(c.start * 1000), Math.round(c.end * 1000)]))].sort((a, b) => a - b);
const segments: Segment[] = [];
for (let i = 0; i < boundaries.length - 1; i++) {
  const start = boundaries[i]!, end = boundaries[i + 1]!;
  if (end <= start) continue;
  const middle = (start + end) / 2000;
  const cues = timeline.cues.filter(c => middle >= c.start && middle < c.end)
    .sort((a, b) => Number(vocalTrack(a) === 'backing') - Number(vocalTrack(b) === 'backing'));
  if (!cues.length) continue;
  const text = cues.map(c => `${vocalTrack(c) === 'backing' ? '[Backing] ' : ''}${c.label}`).join('\n');
  const previous = segments.at(-1);
  if (previous?.text === text && previous.end === start) previous.end = end;
  else segments.push({start, end, text, cueIds: cues.map(c => c.id)});
}
assert.ok(segments.length > 0);
for (const cue of timeline.cues) assert.ok(segments.some(s => s.cueIds.includes(cue.id)), `Caption omission: ${cue.id}`);
function clock(ms: number, separator: string): string {
  const hours = Math.floor(ms / 3600000), minutes = Math.floor(ms / 60000) % 60, seconds = Math.floor(ms / 1000) % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}${separator}${String(ms % 1000).padStart(3, '0')}`;
}
const files = [];
for (const extension of ['srt', 'vtt']) {
  const path = `publishing/Captions/English.${extension}`;
  if (existsSync(resolve(root, path))) throw Error(`Preserve existing captions: ${path}`);
  const contents = (extension === 'vtt' ? 'WEBVTT\n\n' : '') + segments.map((segment, i) =>
    `${i + 1}\n${clock(segment.start, extension === 'srt' ? ',' : '.')} --> ${clock(segment.end, extension === 'srt' ? ',' : '.')}\n${segment.text}\n`).join('\n');
  writeFileSync(resolve(root, path), contents);
  files.push({path, bytes: Buffer.byteLength(contents), sha256: sha(Buffer.from(contents)), format: extension});
}
assert.deepEqual(checkCurrentProductionGate(), approved);
writeFileSync(resolve(root, 'publishing/caption-assets.json'), JSON.stringify({
  schemaVersion: 1, status: 'passed', revision: approved.revision, sourceSha256: timeline.sourceSha256,
  approvedInputHashes: approved.inputs, timelineSha256: sha(timelineBytes), makerSha256: sha(readFileSync(fileURLToPath(import.meta.url))),
  method: 'Phrase-level intervals partitioned at the union of lead/backing starts and releases, rounded to subtitle milliseconds. Backing phrases are explicitly identified; no overlap scheduling or extra words.',
  cueCount: timeline.cues.length, captionCount: segments.length, coveredCueIds: timeline.cues.map(c => c.id), files,
  limitations: 'Both voices and word highlights are already burned into the films. Optional sidecars repeat the lyrics if enabled; use only when accessibility captions are desired. They inherit the selected timing map and its documented uncertainty.',
}, null, 2) + '\n');
console.log(JSON.stringify({status: 'caption assets passed', coveredCues: timeline.cues.length, captionCount: segments.length, files: files.length}));
