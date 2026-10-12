import test from 'node:test';
import assert from 'node:assert/strict';
import {renderClock,sourceFrameForOutput,read,type Recording} from '../scripts/render-production.ts';
import {currentPreviewAuthorized} from '../scripts/production-authorization.ts';
import {currentIdentity} from '../scripts/project-identity.ts';
test('all native pictures survive the rational 25-to-60 clock and its short AAC tail',()=>{
 const recording=read<Recording>('source/recording.json'),clock=renderClock(recording),seen=new Set<number>();
 assert.equal(clock.outputFrames,15576);assert.equal(clock.sourceFrames,6489);
 for(let n=0;n<clock.outputFrames;n++){
  const selected=sourceFrameForOutput(n,clock.sourceFrames);seen.add(selected);
  assert.ok(selected/25<=n/60+1e-10);assert.ok(selected>=0&&selected<clock.sourceFrames);
  if(n<15574)assert.ok(n/60-selected/25<.040001);
 }
 assert.equal(seen.size,6489);assert.equal(sourceFrameForOutput(15575,6489),6488);
 assert.ok(clock.outputFrames/60-clock.audioEnd>=0&&clock.outputFrames/60-clock.audioEnd<1/60);
 assert.throws(()=>sourceFrameForOutput(10,5015));
});
test('owner-directed rendering never turns unknown listening scope into a completed attestation',()=>{
 const identity=currentIdentity(),review={...identity,renderApproval:{approved:true}},authorization={...identity,actorRole:'owner',scope:'current-complete-preview',render:true,noFurtherConfirmation:true,recordedAtUtc:'2026-10-12',basis:'Fixture for a current-song direction.'};
 assert.equal(currentPreviewAuthorized(review,identity,authorization),true);
 assert.equal(currentPreviewAuthorized(review,identity,{...authorization,sourceSha256:'different'}),false);
 assert.equal(currentPreviewAuthorized(review,identity,{...authorization,noFurtherConfirmation:false}),false);
 assert.equal(currentPreviewAuthorized({...review,renderApproval:{approved:false}},identity,authorization),false);
 assert.equal(currentPreviewAuthorized(review,identity,undefined),false);
});
