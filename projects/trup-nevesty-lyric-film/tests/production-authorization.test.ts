import test from 'node:test';
import assert from 'node:assert/strict';
import {currentPreviewAuthorized,type OwnerAuthorization} from '../scripts/production-authorization.ts';
import type {Review,RevisionIdentity} from '../src/review-gate.ts';
const identity:RevisionIdentity={revision:'fixture',sourceSha256:'source',timelineSha256:'timing',sceneSha256:'scene'};
const review:Review={...identity,synchronization:{status:'pending',normalSpeedFullRecording:false,uncertainWordsAndHeldEndingsAtReducedSpeed:false,layouts:[],languages:[]},renderApproval:{approved:true}};
const authorization:OwnerAuthorization={...identity,actorRole:'owner',scope:'current-complete-preview',render:true,desktopKit:true,sourceHandoff:true,recordedAtUtc:'fixture-time',basis:'Fixture direct owner instruction; not a listening claim.'};
test('owner-directed rendering is frozen to the exact accepted preview and retains incomplete listening evidence',()=>{
 assert.equal(currentPreviewAuthorized(review,identity,authorization),true);
 assert.equal(review.synchronization.status,'pending');
 for(const k of ['revision','sourceSha256','timelineSha256','sceneSha256'] as const)assert.equal(currentPreviewAuthorized(review,{...identity,[k]:'changed'},authorization),false,k);
 assert.equal(currentPreviewAuthorized({...review,renderApproval:{approved:false}},identity,authorization),false);
 assert.equal(currentPreviewAuthorized(review,identity,{...authorization,render:false}),false);
});
