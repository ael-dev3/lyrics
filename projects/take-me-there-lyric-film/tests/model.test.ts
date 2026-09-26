import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseTimeline, cueSlots, wordActive, parseFeatures} from '../src/model.ts';
import {INPUTS,SONG,REVISION,validateGate} from '../scripts/render-gate.ts';
const data = {song: SONG, revision: REVISION, duration: 5, cues: [{id:'L01',kind:'hook',start:.5,end:2.8,review:'pending',words:[{id:'w1',text:'Take',start:.5,end:.9,evidence:'test'},{id:'w2',text:'me',start:1,end:1.2,evidence:'test'},{id:'w3',text:'there',start:1.4,end:1.8,evidence:'test'},{id:'w4',text:'there',start:2.3,end:2.8,evidence:'test'}]}]};
test('Echoes have distinct acoustic IDs and reuse one stable letterform without filling the pause', () => {
 const q = parseTimeline(data).cues[0]; assert.ok(q); const slots = cueSlots(q); assert.equal(slots.length,3); assert.deepEqual(slots[2]?.wordIds,['w3','w4']); assert.equal(q.words.some(w=>wordActive(w,2)),false); assert.equal(q.words.some(w=>wordActive(w,2.8)),false);
});
test('Malformed, overlapping and out-of-source word data cannot enter playback', () => {
 const invalid = structuredClone(data); const w=invalid.cues[0]?.words[1]; assert.ok(w); w.start=.8; assert.throws(()=>parseTimeline(invalid),/Overlapping/);
 w.start=1;w.end=NaN;assert.throws(()=>parseTimeline(invalid),/finite/);
 assert.throws(()=>parseFeatures({},0));
});
const actual=Object.fromEntries(INPUTS.map(p=>[p,'a'.repeat(64)]));
const complete={song:SONG,revision:REVISION,inputHashes:actual,status:'complete',actualAudio:'complete',fullCoverage:'complete',wordTiming:'complete',lyricText:'complete',unresolved:[],formats:['landscape','portrait'],speeds:['normal','reduced'],cueIds:['L01']};
const approved={song:SONG,revision:REVISION,inputHashes:actual,authorized:true,previewReviewed:true};
test('Production gate rejects absent, incomplete and stale evidence',()=>{
 assert.throws(()=>validateGate(undefined,approved,actual,['L01']));
 assert.throws(()=>validateGate({...complete,wordTiming:'pending'},approved,actual,['L01']),/incomplete/);
 assert.throws(()=>validateGate(complete,{...approved,authorized:false},actual,['L01']),/authorization/);
 assert.throws(()=>validateGate({...complete,revision:'old'},approved,actual,['L01']),/Stale/);
 assert.throws(()=>validateGate(complete,approved,{...actual,'src/scene.ts':'b'.repeat(64)},['L01']),/Stale/);
 assert.throws(()=>validateGate(complete,approved,actual,['L01','L02']),/All cues/);
 validateGate(complete,approved,actual,['L01']);
});
