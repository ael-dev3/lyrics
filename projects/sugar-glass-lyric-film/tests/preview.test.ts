import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {parseData} from '../src/schema.ts';
import {activeSource,frameAt,visibleCues} from '../src/focus.ts';
import {sceneSvg,spectrumHeights,intensityAt} from '../src/scene.ts';
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
test('all-frame focus preserves exact word boundaries and gaps',()=>{
 let states=0;for(let frame=0;frame<data.frames;frame++)for(const cue of visibleCues(data,frame)){
  const active=activeSource(cue,frame,data);
  for(const word of cue.source){assert.equal(active.has(word.id),frame>=Math.round(word.startSample/44100*60)&&frame<Math.round(word.endSample/44100*60),word.id);states++;}
 }assert.ok(states>20000);
});
test('spectrum is bounded, silent without signal and more expansive in choruses',()=>{
 const bands=Array.from({length:data.frames},()=>Array(64).fill(-30));
 for(const format of ['landscape','portrait'] as const){const verse=spectrumHeights(8*60,format,bands),chorus=spectrumHeights(90*60,format,bands);assert.equal(chorus.length,64);assert.ok(chorus[0]>verse[0]*1.4);assert.ok(chorus.every(h=>h<=197));assert.deepEqual(spectrumHeights(90*60,format,[Array(64).fill(-120)]),Array(64).fill(2));}
 assert.equal(intensityAt(231),0);
});
test('both English layouts retain every word, stable emphasis and separate vocal lanes',()=>{
 for(const format of ['landscape','portrait'] as const){const l=layouts[format];for(const cue of data.cues){const b=l.cues[cue.id as keyof typeof l.cues];assert.ok(b);assert.equal(b.source.length,cue.source.length);for(const word of b.source){assert.ok(word.x>=l.safeX-1);assert.ok(word.x+word.width<=l.width-l.safeX+1);assert.ok(word.y-b.fontSize>180&&word.y<l.height-160);}
  const frame=frameAt(cue.startSample,44100,60),svg=sceneSvg(frame,format,data,layouts,[]);assert.match(svg,/data-language="en"/);assert.doesNotMatch(svg,/[\u0400-\u04ff]|data-language="ru"/);assert.doesNotMatch(svg,/<animate|<tspan|text-decoration/);
 }
 for(let f=0;f<data.frames;f++){const cues=visibleCues(data,f);assert.ok(cues.filter(c=>c.layer==='main').length<=1);assert.ok(cues.filter(c=>c.layer==='backing').length<=1);}
 }
});
