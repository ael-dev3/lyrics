import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assertApprovedReview,checkCurrentProductionAuthorization} from '../scripts/production-authorization.ts';
import {currentIdentity,projectFile} from '../scripts/project-identity.ts';
const identity=currentIdentity(),review=JSON.parse(readFileSync(projectFile('source/REVIEW.json'),'utf8'));
assertApprovedReview(review,identity);
assert.throws(()=>assertApprovedReview(undefined,identity));
for(const key of ['revision','sourceSha256','timelineSha256','sceneSha256']){
 const altered=structuredClone(review);altered[key]='different';assert.throws(()=>assertApprovedReview(altered,identity));
}
for(const field of ['normalSpeedFullRecording','uncertainWordsAndHeldEndingsAtReducedSpeed']){
 const altered=structuredClone(review);altered.synchronization[field]=false;assert.throws(()=>assertApprovedReview(altered,identity));
}
for(const [field,value] of [['status','pending'],['layouts',['landscape']],['languages',['ru']]] as const){
 const altered=structuredClone(review);altered.synchronization[field]=value;assert.throws(()=>assertApprovedReview(altered,identity));
}
const noApproval=structuredClone(review);noApproval.renderApproval.approved=false;assert.throws(()=>assertApprovedReview(noApproval,identity));
assert.equal(checkCurrentProductionAuthorization().listeningGateComplete,true);
console.log('Production gate: current approval accepted; missing, stale, incomplete and unauthorized reviews rejected.');
