import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {assertApprovedReview,currentPreviewAuthorized,checkCurrentProductionAuthorization} from '../scripts/production-authorization.ts';
import {currentIdentity,projectFile} from '../scripts/project-identity.ts';
import {renderClock,sourceFrameForOutput,type Recording} from '../scripts/render-production.ts';
const i=currentIdentity(),r=JSON.parse(readFileSync(projectFile('source/REVIEW.json'),'utf8')),a=JSON.parse(readFileSync(projectFile('source/PRODUCTION-AUTHORIZATION.json'),'utf8'));
assert.throws(()=>assertApprovedReview(r,i));assert(currentPreviewAuthorized(r,i,a));assert.equal(checkCurrentProductionAuthorization().listeningGateComplete,false);
for(const k of ['revision','sourceSha256','timelineSha256','sceneSha256']){
 const x=structuredClone(a);x[k]='different';assert.equal(currentPreviewAuthorized(r,i,x),false);
 const y=structuredClone(r);y[k]='different';assert.equal(currentPreviewAuthorized(y,i,a),false);
}
for(const k of ['render','noFurtherConfirmation']){const x=structuredClone(a);x[k]=false;assert.equal(currentPreviewAuthorized(r,i,x),false)}
assert.equal(currentPreviewAuthorized(r,i,undefined),false);const x=structuredClone(r);x.renderApproval.approved=false;assert.equal(currentPreviewAuthorized(x,i,a),false);
const rec=JSON.parse(readFileSync(projectFile('source/recording.json'),'utf8')) as Recording;assert.equal(renderClock(rec).outputFrames,11701);
for(let n=0;n<11701;n++)assert.equal(sourceFrameForOutput(n),Math.min(4873,Math.floor(n*25/60)));
assert.equal(sourceFrameForOutput(11700),4873);assert.throws(()=>sourceFrameForOutput(-1));
console.log('Exact owner scope accepted; incomplete standard checklist preserved; stale/missing authorization rejected. Every production source-frame mapping verified.');
