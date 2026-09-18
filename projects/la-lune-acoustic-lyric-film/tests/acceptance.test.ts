import test from 'node:test';import assert from 'node:assert/strict';
import {checkGate} from '../src/production-gate.ts';
const song='p3E731cu_nE',revision='preview-v2-lunar',authorizationId='la-lune-v2-production-2026-09-18';
const identity={song,revision,hashes:{audio:'a'}},current={audio:'a'},auth={song,previewRevision:revision,authorizationId,previewAccepted:true,fullRenderAuthorized:true};
const ready=()=>({song,revision,inputHashes:current,reviewMode:'owner-approved-preview',status:'accepted-for-production',actualAudioReviewComplete:false,allCuesAllFormatsComplete:false,translationReviewComplete:true,finalTechnicalAuditComplete:true,unresolvedDefects:[],cues:[{id:'one',meaning:true,normalAudio:false,slowAudio:false,landscape:false,portrait:false}],acceptance:{authorizationId,evidenceBasis:'Fixture',coverageLimit:'Fixture'},authorization:{approved:true,song,revision}});
test('Scoped acceptance preserves unknown listening fields and rejects stale or unapproved inputs',()=>{
 assert.equal(checkGate(ready(),identity,current,['one'],auth),true);
 for(const mutation of [{fullRenderAuthorized:false},{previewRevision:'other'},{authorizationId:'other'},{song:'other'},{previewAccepted:false}])assert.throws(()=>checkGate(ready(),identity,current,['one'],{...auth,...mutation}));
 assert.throws(()=>checkGate(ready(),identity,{audio:'changed'},['one'],auth));
 for(const mutation of [{finalTechnicalAuditComplete:false},{actualAudioReviewComplete:true},{allCuesAllFormatsComplete:true},{unresolvedDefects:['defect']},{cues:[]}])assert.throws(()=>checkGate({...ready(),...mutation},identity,current,['one'],auth));
});
