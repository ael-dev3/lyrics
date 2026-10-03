import {test} from 'node:test';
import assert from 'node:assert/strict';
import {enforceProductionGate,type Identity,type Review,type Approval} from '../scripts/render-gate.ts';

// Synthetic authority fixtures only: tests never write review grants or render.
const identity:Identity={project:'fixture',revision:'reviewed',inputs:{'source.mp4':'locked-audio','scene.ts':'locked-scene'},cueCount:1,cueIds:['cue-1']};
const review:Review={...identity,translationComplete:true,allSourceAndTargetSpansComplete:true,fullRecordingNormalSpeed:true,uncertainEventsReducedSpeed:true,nativeSquareAndPortrait:true,noUnresolvedDefects:true,reviewerRole:'fixture reviewer',reviewedCueIds:['cue-1']};
const approval:Approval={...identity,productionAuthorized:true};
test('production refuses missing review, authorization and incomplete listening/layout scope',()=>{
  assert.throws(()=>enforceProductionGate(identity,null,approval),/missing/);
  assert.throws(()=>enforceProductionGate(identity,review,null),/missing/);
  for(const key of ['translationComplete','allSourceAndTargetSpansComplete','fullRecordingNormalSpeed','uncertainEventsReducedSpeed','nativeSquareAndPortrait','noUnresolvedDefects'] as const){
    assert.throws(()=>enforceProductionGate(identity,{...review,[key]:false},approval),/complete actual-audio/);
  }
  assert.throws(()=>enforceProductionGate(identity,{...review,reviewedCueIds:[]},approval),/complete actual-audio/);
  assert.throws(()=>enforceProductionGate(identity,review,{...approval,productionAuthorized:false}),/not authorized/);
});
test('production rejects another recording, presentation, song or revision without refreshing review',()=>{
  for(const stale of [{...review,project:'another song'},{...review,revision:'earlier'},{...review,inputs:{...review.inputs,'source.mp4':'changed'}},{...review,inputs:{...review.inputs,'scene.ts':'changed'}},{...review,cueIds:['other-cue']}]){
    assert.throws(()=>enforceProductionGate(identity,stale,approval),/stale or mismatched/);
  }
  assert.throws(()=>enforceProductionGate(identity,review,{...approval,revision:'earlier'}),/stale or mismatched/);
  assert.doesNotThrow(()=>enforceProductionGate(identity,review,approval));
});
