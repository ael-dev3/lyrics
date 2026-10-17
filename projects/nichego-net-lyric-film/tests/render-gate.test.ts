import assert from 'node:assert/strict';
import {assertProduction} from '../scripts/check-production-gate.ts';
const identity={schemaVersion:1,sceneFiles:[] as string[],revision:'test-preview',sourceSha256:'source',timelineSha256:'timeline',sceneSha256:'scene'};
const valid={...identity,synchronization:{status:'complete',normalSpeedFullRecording:true,uncertainWordsAndHeldEndingsAtReducedSpeed:true,layouts:['landscape','portrait'],languages:['ru','en']},renderApproval:{approved:true}};
assert.doesNotThrow(()=>assertProduction(valid,identity));
assert.throws(()=>assertProduction({},identity));
for(const key of ['revision','sourceSha256','timelineSha256','sceneSha256'])assert.throws(()=>assertProduction({...valid,[key]:'changed'},identity));
for(const key of ['status','normalSpeedFullRecording','uncertainWordsAndHeldEndingsAtReducedSpeed','layouts','languages']){const r=structuredClone(valid) as any;r.synchronization[key]=key==='status'?'pending':key==='layouts'||key==='languages'?[]:false;assert.throws(()=>assertProduction(r,identity));}
assert.throws(()=>assertProduction({...valid,renderApproval:{approved:false}},identity));
console.log('12 missing/stale/incomplete production gate controls passed.');
