import test from 'node:test';
import assert from 'node:assert/strict';
import {productionAllowed,type Review,type RevisionIdentity} from '../src/review-gate.ts';
const current:RevisionIdentity={revision:'fixture-v1',sourceSha256:'fixture-source',timelineSha256:'fixture-timing',sceneSha256:'fixture-scene'};
function completeFixture():Review{return {...current,synchronization:{status:'complete',normalSpeedFullRecording:true,uncertainWordsAndHeldEndingsAtReducedSpeed:true,layouts:['landscape','portrait'],languages:['ru','en']},renderApproval:{approved:true}}}
test('technical completion cannot replace listening scope or explicit approval',()=>{
 assert.equal(productionAllowed(completeFixture(),current),true);
 for(const field of ['status','normalSpeedFullRecording','uncertainWordsAndHeldEndingsAtReducedSpeed','layouts','languages'] as const){
  const review=completeFixture();
  if(field==='status')review.synchronization[field]='pending';
  else if(field==='layouts')review.synchronization[field]=['landscape'];
  else if(field==='languages')review.synchronization[field]=['ru'];
  else review.synchronization[field]=false;
  assert.equal(productionAllowed(review,current),false,field);
 }
 const review=completeFixture();review.renderApproval.approved=false;assert.equal(productionAllowed(review,current),false);
});
test('a changed recording, timing, scene, or revision invalidates approval',()=>{
 for(const field of ['revision','sourceSha256','timelineSha256','sceneSha256'] as const){
  const changed={...current,[field]:'different'};assert.equal(productionAllowed(completeFixture(),changed),false,field);
 }
});
