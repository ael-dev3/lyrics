import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sourceActive,targetActive,readingWindow,type Word,type Target} from '../src/model.ts';
import {cueOpacity} from '../src/scene.ts';
import {checkCurrentProductionGate,assertRequiredPreviewInputs,requiredPreviewInputs} from '../scripts/render-gate.ts';
const word=(start:number,end:number,index=0):Word=>({id:`word${index}`,text:'voice',sourceIndex:index,startSample:start,endSample:end,confidence:'test fixture',method:'sample contract fixture'});
test('exact 60fps frame boundaries never keep the outgoing word for an extra frame',()=>{
  for(let frame=1;frame<10600;frame++){
    const start=frame*735,w=word(start,start+735);
    assert.equal(sourceActive(w,start/44100),true);
    assert.equal(sourceActive(w,(start+735)/44100),false);
    assert.equal(sourceActive(w,(start-.5)/44100),false);
  }
});
test('English follows contributor union, releasing through an unrelated word and real gap',()=>{
  const words=[word(44100,66150,0),word(88200,110250,1),word(132300,154350,2)];
  const target:Target={id:'relative',text:'where',sourceIndices:[0,2],focusSourceIndices:[0,2],relation:'construction',rationale:'Independent union regression fixture'};
  assert.equal(targetActive(target,words,1.25),true);
  assert.equal(targetActive(target,words,1.75),false);
  assert.equal(targetActive(target,words,2.25),false);
  assert.equal(targetActive(target,words,3.25),true);
});
test('no atomic reading handoff hides the incoming vocal at its first sample',()=>{
  const interval=readingWindow(2,2.6,10,2,2.8,2.6);
  assert.equal(interval.exitMode,'vocal-handoff');
  assert.equal(cueOpacity({...interval,start:2} as any,2),1);
  assert.ok(interval.fullOpacityEnd>=2.6);
});
test('complete editorial expansions keep both independently sung hook repeats and English grammar',()=>{
  const editor=JSON.parse(readFileSync('source/english-editorial-draft.json','utf8'));
  const cue=(key:string)=>editor.cues.find((c:any)=>c.cueKey===key);
  const contributors=(c:any,text:string)=>c.englishTokens.flatMap((word:string,i:number)=>word.replace(/[.,!:]/g,'').toLowerCase()===text?c.englishContributors[i]:[]);
  assert.deepEqual(contributors(cue('hook-feeling'),'very'),[0,1]);
  assert.deepEqual(contributors(cue('hook-light'),'a'),[2]);
  assert.deepEqual(contributors(cue('hook-light'),'light'),[2]);
  assert.deepEqual(contributors(cue('v1-world'),'grew'),[4]);
  assert.deepEqual(contributors(cue('v1-world'),'up'),[4]);
  assert.deepEqual(contributors(cue('v1-joy'),'not'),[8]);
});
test('this complete preview cannot start full production',()=>{
  assert.throws(checkCurrentProductionGate,/Preview-only: current song has no render approval/);
});
test('source digests cannot substitute for a missing executable preview bundle',()=>{
  const inputs=Object.fromEntries(requiredPreviewInputs.map(path=>[path,'a'.repeat(64)]));
  assert.doesNotThrow(()=>assertRequiredPreviewInputs({inputs}));
  delete inputs['review/client.js'];
  assert.throws(()=>assertRequiredPreviewInputs({inputs}),/Missing required complete-preview input: review\/client.js/);
});
