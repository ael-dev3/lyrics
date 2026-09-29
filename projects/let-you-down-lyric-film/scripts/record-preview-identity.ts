import {readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {hashes, INPUTS, lyricsHash} from './render-gate.ts';
import {parseTimeline} from '../src/model.ts';

// Freeze the identity of the preview being handed to review: every gated input
// hash, the local lyric text's normalized hash and the timeline revision. A
// sync review and a render authorization must later carry exactly these values.
const root = fileURLToPath(new URL('../', import.meta.url));
const timeline = parseTimeline(JSON.parse(readFileSync(`${root}public/timeline.json`, 'utf8')));
const words = timeline.cues.flatMap(q => q.words);
const record = {
  schema: 'lyric-film/preview-identity/v1', song: timeline.song, revision: timeline.revision,
  inputHashes: hashes(), lyricsSha256: lyricsHash(), inputs: INPUTS.length,
  timing: {lines: timeline.cues.length, words: words.length, priorityWords: words.filter(w => w.review === 'priority').length,
    priorityLines: timeline.cues.filter(q => q.words.some(w => w.review === 'priority')).map(q => q.id)},
  note: 'Hashes of the preview handed to review. Any change to these inputs requires a fresh review before production.',
};
writeFileSync(`${root}evidence/preview-identity.json`, JSON.stringify(record, null, 2) + '\n');
console.log(JSON.stringify({revision: record.revision, lyricsSha256: record.lyricsSha256?.slice(0, 12), ...record.timing}));
