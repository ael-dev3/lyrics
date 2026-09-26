import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseTimeline,cueAt,cueSlots,wordActive} from '../src/model.ts';

const timeline=parseTimeline(JSON.parse(readFileSync(new URL('../public/timeline.json',import.meta.url),'utf8')));

test('The intermediate vocal lead remains visible and word-focused at 45 seconds',()=>{
 const cue=cueAt(timeline,45);
 assert.ok(cue,'The former 43.65–46.22-second omission must not leave this vocal frame empty');
 assert.equal(cue.id,'middle-extra-lead');
 assert.deepEqual(cueSlots(cue).map(slot=>slot.text),['Take','me','there']);
 assert.deepEqual(cue.words.filter(word=>wordActive(word,45)).map(word=>word.text),['me']);
 assert.equal(cueAt(timeline,43.45)?.id,'hook-anywhere');
 assert.equal(cueAt(timeline,46.5)?.id,'middle-5');
});
