import test from 'node:test';
import assert from 'node:assert/strict';
import {enforceGate,type Identity,type Review,type Approval} from '../scripts/render-gate.ts';
const current:Identity={project:'prizrak-lyric-film',revision:'fixture-v1',inputHashes:{'public/source.mp4':'source','public/timeline.json':'timeline','src/scene.ts':'scene'},cueIds:['opening','closing']};
const full:Review={...current,translationComplete:true,allLanguageSpansComplete:true,fullRecordingNormalSpeed:true,uncertainEventsReducedSpeed:true,nativeAndPortrait:true,noUnresolvedDefects:true,reviewerRole:'fixture only; never saved as evidence',reviewedCueIds:current.cueIds};
const approval:Approval={...current,productionAuthorized:true};
test('missing, incomplete, wrong-song and stale evidence cannot authorize a render',()=>{
 assert.throws(()=>enforceGate(current,null,approval),/review is missing/);
 assert.throws(()=>enforceGate(current,full,null),/authorization is missing/);
 assert.throws(()=>enforceGate(current,{...full,uncertainEventsReducedSpeed:false},approval),/complete actual-audio/);
 assert.throws(()=>enforceGate(current,{...full,nativeAndPortrait:false},approval),/complete actual-audio/);
 assert.throws(()=>enforceGate(current,{...full,reviewedCueIds:['opening']},approval),/complete actual-audio/);
 assert.throws(()=>enforceGate(current,full,{...approval,project:'other-song'}),/wrong song/);
 assert.throws(()=>enforceGate(current,{...full,inputHashes:{...full.inputHashes,'src/scene.ts':'changed'}},approval),/stale/);
 assert.throws(()=>enforceGate(current,full,{...approval,productionAuthorized:false}),/not authorized/);
});
