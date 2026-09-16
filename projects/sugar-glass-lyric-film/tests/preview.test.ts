import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {parseData} from '../src/schema.ts';
import {activeSource,activeTargets,frameAt,visibleCues} from '../src/focus.ts';
import {sceneSvg} from '../src/scene.ts';
import {assertAuthorization,assertReview,projectId,inputHashes} from '../scripts/sync-gate.ts';
import layouts from '../src/layout.json' with {type:'json'};
const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8')));
test('production refuses preview-only, foreign-song and stale authorization',()=>{
 const hashes={'audio':'locked'},valid={projectId,status:'authorized',fullRenderAuthorized:true,previewRevision:'v1',evidenceBasis:'test fixture only',hashes};
 assert.doesNotThrow(()=>assertAuthorization(valid,hashes,'v1'));
 for(const bad of [{...valid,status:'preview-only'},{...valid,fullRenderAuthorized:false},{...valid,projectId:'previous-song'},{...valid,previewRevision:'old'},{...valid,hashes:{audio:'changed'}}])assert.throws(()=>assertAuthorization(bad,hashes,'v1'));
 assert.throws(()=>assertReview({status:'incomplete'},hashes,[]));
});
test('render entry refuses before creating output',()=>{
 assert.equal(existsSync('output'),false);const result=spawnSync(process.execPath,['scripts/render.ts'],{encoding:'utf8'});assert.notEqual(result.status,0);assert.match(result.stderr,/preview-only authorization/);assert.equal(existsSync('output'),false);
});
test('review hashes match the delivered preview and approval stays closed',()=>{
 const identity=JSON.parse(readFileSync('evidence/preview-identity.json','utf8'));assert.deepEqual(identity.hashes,inputHashes());
 const auth=JSON.parse(readFileSync('evidence/render-authorization.json','utf8'));assert.equal(auth.fullRenderAuthorized,false);
});
test('all selected boundaries are ordered, positive and represented at 60 fps',()=>{
 for(const cue of data.cues){let end=0;for(const word of cue.source){assert.ok(word.startSample>=end,word.id);assert.ok(frameAt(word.endSample,44100,60)>frameAt(word.startSample,44100,60),word.id+' invisible');assert.ok(cue.visibleFrom<=word.startSample&&cue.visibleUntil>=word.endSample);end=word.endSample;}}
});
test('all-frame bilingual focus follows exact source membership and preserves gaps',()=>{
 let states=0;for(let frame=0;frame<data.frames;frame++)for(const cue of visibleCues(data,frame)){
  const active=activeSource(cue,frame,data),target=activeTargets(cue,frame,data);
  for(const word of cue.target){assert.equal(target.has(word.id),word.sourceIds.some(id=>active.has(id)),word.id);states++;}
 }assert.ok(states>20000);
});
test('reordered meanings and necessary grammar light together',()=>{
 const morning=data.cues.find(c=>c.id==='SG-022');assert.ok(morning);const w=morning.source.find(w=>w.text==='morning');assert.ok(w);
 const target=activeTargets(morning,frameAt(w.startSample,44100,60),data);assert.deepEqual(morning.target.filter(w=>target.has(w.id)).map(w=>w.text),['утро']);
 const never=data.cues.find(c=>c.id==='SG-011');assert.ok(never);const n=never.source.find(w=>w.text==='never');assert.ok(n);
 const negative=activeTargets(never,frameAt(n.startSample,44100,60),data);assert.deepEqual(never.target.filter(w=>negative.has(w.id)).map(w=>w.text),['никогда','не']);
});
test('both layouts have complete stable geometry, equal type and separate vocal lanes',()=>{
 for(const format of ['landscape','portrait'] as const){const l=layouts[format];for(const cue of data.cues){const b=l.cues[cue.id as keyof typeof l.cues];assert.ok(b);assert.equal(b.source.length,cue.source.length);assert.equal(b.target.length,cue.target.length);for(const word of [...b.source,...b.target]){assert.ok(word.x>=l.safeX-1);assert.ok(word.x+word.width<=l.width-l.safeX+1);assert.ok(word.y-l.fontSize>180&&word.y<l.height-100);}
  const frame=frameAt(cue.startSample,44100,60),svg=sceneSvg(frame,format,data,layouts,[]);assert.match(svg,/data-language="en"/);assert.match(svg,/data-language="ru"/);
 }
 for(let f=0;f<data.frames;f++){const cues=visibleCues(data,f);assert.ok(cues.filter(c=>c.layer==='main').length<=1);assert.ok(cues.filter(c=>c.layer==='backing').length<=1);}
 }
});
