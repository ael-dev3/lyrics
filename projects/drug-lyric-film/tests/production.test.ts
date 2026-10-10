import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {currentPreviewAuthorized,type OwnerAuthorization} from '../scripts/production-authorization.ts';
import {renderClock,sourceFrameForOutput} from '../scripts/render-production.ts';
import {productionAllowed,type Review} from '../src/review-gate.ts';

test('Scoped owner approval cannot transfer to changed inputs or replace a missing render direction',()=>{
 const identity={revision:'current',sourceSha256:'source',timelineSha256:'timeline',sceneSha256:'scene'};
 const review:Review={...identity,synchronization:{status:'owner-approved-preview',normalSpeedFullRecording:false,uncertainWordsAndHeldEndingsAtReducedSpeed:false,layouts:[],languages:[]},renderApproval:{approved:true}};
 const authorization:OwnerAuthorization={...identity,scope:'current-complete-preview',actorRole:'owner',render:true,desktopKit:true,sourceHandoff:true,recordedAtUtc:'2026-10-10T00:00:00Z',basis:'Current complete preview explicitly accepted for production.'};
 assert.ok(currentPreviewAuthorized(review,identity,authorization));
 assert.ok(!productionAllowed(review,identity),'Acceptance must not fabricate completed granular listening.');
 for(const key of ['revision','sourceSha256','timelineSha256','sceneSha256'] as const){assert.ok(!currentPreviewAuthorized(review,{...identity,[key]:'different'},authorization));assert.ok(!currentPreviewAuthorized(review,identity,{...authorization,[key]:'different'}));}
 assert.ok(!currentPreviewAuthorized(review,identity,{...authorization,render:false}));
 assert.ok(!currentPreviewAuthorized({...review,renderApproval:{approved:false}},identity,authorization));
 assert.ok(!currentPreviewAuthorized(review,identity,{...authorization,basis:''}));
});
test('Native 30 fps picture mapping covers the AAC tail without a missing or invented source frame',()=>{
 const clock=renderClock({sourceSha256:'source',sourceDuration:150.070567,audioSampleRate:44100,audioStart:0,pictureStart:0,nativePicture:{width:1920,height:1080,fpsNumerator:30,fpsDenominator:1,frames:4500}});
 assert.equal(clock.outputFrames,9005);
 const mapped=Array.from({length:clock.outputFrames},(_,n)=>sourceFrameForOutput(n,clock.sourceFrames));
 assert.equal(new Set(mapped).size,4500);assert.equal(mapped[0],0);assert.equal(mapped.at(-1),4499);
 assert.equal(mapped.filter(n=>n===4499).length,7);
 assert.ok(clock.outputFrames/60>=clock.audioEnd&&clock.outputFrames/60-clock.audioEnd<1/60);
});
