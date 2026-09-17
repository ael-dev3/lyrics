import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkProductionReview} from '../src/production-gate.ts';
const identity={song:'example',revision:'v2',hashes:{audio:'abc',timing:'def'}};
const valid=()=>({song:'example',revision:'v2',inputHashes:{...identity.hashes},actualAudioReviewComplete:true,translationReviewComplete:true,allCuesAllFormatsComplete:true,unresolvedDefects:[],reviewerRole:'synthetic test fixture',actualAudioMethod:'test only, no real review claimed',cues:[{id:'1',meaning:true,normalAudio:true,slowAudio:true,landscape:true,portrait:true}],authorization:{approved:true,revision:'v2',evidence:'synthetic fixture'}});
test('gate accepts structurally complete matching fixture',()=>assert.equal(checkProductionReview(valid(),identity,identity.hashes,['1']),true));
test('gate rejects absent, stale, incomplete and changed evidence',()=>{
 for(const bad of [null,{}, {...valid(),revision:'v1'},{...valid(),inputHashes:{}},{...valid(),actualAudioReviewComplete:false},{...valid(),cues:[]},{...valid(),unresolvedDefects:['bad timing']},{...valid(),authorization:{approved:false}}])assert.throws(()=>checkProductionReview(bad,identity,identity.hashes,['1']));
 assert.throws(()=>checkProductionReview(valid(),identity,{audio:'changed',timing:'def'},['1']));
 const partial=valid();partial.cues[0]!.portrait=false;assert.throws(()=>checkProductionReview(partial,identity,identity.hashes,['1']));
});
test('scoped accepted preview requires current explicit authorization and honest unknowns',()=>{
 const id={song:'3yDdoi1c7-8',revision:'preview-v3-audio-led',hashes:{audio:'abc',timing:'def'}};
 const auth={song:id.song,previewRevision:id.revision,authorizationId:'kazhdyy-v3-production-2026-09-17',fullRenderAuthorized:true,previewAccepted:true};
 const review={...valid(),song:id.song,revision:id.revision,status:'accepted-for-production',reviewMode:'owner-approved-preview',actualAudioReviewComplete:false,allCuesAllFormatsComplete:false,acceptance:{authorizationId:auth.authorizationId,evidenceBasis:'synthetic fixture',coverageLimit:'Granular listening log unknown'}};
 assert.equal(checkProductionReview(review,id,id.hashes,['1'],auth),true);
 for(const a of [undefined,{}, {...auth,fullRenderAuthorized:false},{...auth,previewRevision:'old'},{...auth,song:'another'},{...auth,authorizationId:'invented'}])assert.throws(()=>checkProductionReview(review,id,id.hashes,['1'],a));
 for(const r of [{...review,cues:[]},{...review,actualAudioReviewComplete:true},{...review,unresolvedDefects:['defect']}])assert.throws(()=>checkProductionReview(r,id,id.hashes,['1'],auth));
 assert.throws(()=>checkProductionReview(review,id,{...id.hashes,audio:'changed'},['1'],auth));
});
