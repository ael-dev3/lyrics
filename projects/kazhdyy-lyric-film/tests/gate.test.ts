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
