import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import {parseTimeline,parseFeatures,sourceActive,targetActive,visibleCues,validateTimeline} from '../src/model.ts';
import {initializeScene,paintScene,setEffectsEnabled} from '../src/scene.ts';
import {assertApprovedReview} from '../scripts/production-authorization.ts';
import {currentIdentity} from '../scripts/project-identity.ts';
const root=new URL('../',import.meta.url),read=(p:string):unknown=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const timeline=parseTimeline(read('public/timeline.json')),features=parseFeatures(read('public/audio-features.json'));

test('recording-reviewed instrumental interval has no lyric reading or focus',()=>{
 // Independent negative recording observation, not a model score or a copy of the builder's decisions.
 for(let frame=71*60;frame<=81*60;frame++){
  const t=frame/60;assert.deepEqual(visibleCues(timeline,t),[],`Unheard lyric at ${t}`);
  assert.equal(timeline.cues.some(c=>c.words.some(w=>sourceActive(w,t))),false);
 }
});

test('every source start is inclusive and end exclusive against an integer sample oracle',()=>{
 for(const c of timeline.cues)for(const w of c.words){
  for(const n of [w.startSample-1,w.startSample,w.endSample-1,w.endSample])assert.equal(sourceActive(w,n/44100),n>=w.startSample&&n<w.endSample,w.id);
  for(const n of [Math.ceil(w.startSample/735)-1,Math.ceil(w.startSample/735),Math.ceil(w.endSample/735)-1,Math.ceil(w.endSample/735)])assert.equal(sourceActive(w,n/60),n*735>=w.startSample&&n*735<w.endSample,w.id+' frame oracle');
 }
});
test('reordered meanings and complete grammatical expansions follow their own source words',()=>{
 const at=(id:string,i:number)=>{const c=timeline.cues.find(c=>c.id===id)!;const w=c.words[i]!;return c.targets.filter(t=>targetActive(t,c.words,(w.startSample+w.endSample)/2/44100)).map(t=>t.text)};
 assert.deepEqual(at('OBN-001',0),['together,']);assert.deepEqual(at('OBN-001',2),['Keep']);assert.deepEqual(at('OBN-001',4),['do','you','hear?']);
 assert.deepEqual(at('OBN-007',2),['with','concrete.']);assert.deepEqual(at('OBN-007',3),['its']);
 assert.deepEqual(at('OBN-011',0),['I','run']);assert.deepEqual(at('OBN-013',0),["can't"]);assert.deepEqual(at('OBN-013',2),['I']);
 assert.deepEqual(at('OBN-014',2),['me,']);assert.deepEqual(at('OBN-017',2),['you,']);
 assert.deepEqual(at('OBN-015',3),['darkness']);assert.deepEqual(at('OBN-015',4),['surrounding']);
});
test('multiword meaning uses a union, never its enclosing span',()=>{
 const c=timeline.cues.find(c=>c.id==='OBN-001')!,target={...c.targets[2]!,sourceIndices:[0,4],focusSourceIndices:[0,4]};
 const unrelated=c.words[2]!;assert.equal(targetActive(target,c.words,(unrelated.startSample+unrelated.endSample)/2/44100),false);
});
test('line reading holds do not extend lexical focus into a pause',()=>{
 const c=timeline.cues.find(c=>c.id==='OBN-042')!;assert.equal(c.fullOpacityEnd>=c.end,true);
 const t=196.2;assert.equal(c.words.some(w=>sourceActive(w,t)),false);assert.equal(t<c.fullOpacityEnd,true);
});
test('invalid external data and altered timing fail validation',()=>{
 assert.throws(()=>parseTimeline({schemaVersion:1,cues:[]}));assert.throws(()=>parseFeatures({...features,rows:[[NaN]]}));
 const bad=structuredClone(timeline);bad.cues[0]!.words[0]!.endSample=bad.cues[0]!.words[0]!.startSample;assert.throws(()=>validateTimeline(bad));
 const unmapped=structuredClone(timeline);unmapped.cues[0]!.targets=unmapped.cues[0]!.targets.filter(t=>!t.focusSourceIndices.includes(4));assert.throws(()=>validateTimeline(unmapped));
});
test('production refuses absent, stale, incomplete or unapproved review',()=>{
 const i=currentIdentity(),complete={...i,synchronization:{status:'complete',normalSpeedFullRecording:true,uncertainWordsAndHeldEndingsAtReducedSpeed:true,layouts:['landscape','portrait'],languages:['ru','en']},renderApproval:{approved:true}};
 assert.throws(()=>assertApprovedReview(undefined,i));assert.throws(()=>assertApprovedReview({...complete,revision:'another-song'},i));
 assert.throws(()=>assertApprovedReview({...complete,sceneSha256:'stale'},i));assert.throws(()=>assertApprovedReview({...complete,synchronization:{...complete.synchronization,uncertainWordsAndHeldEndingsAtReducedSpeed:false}},i));
 assert.throws(()=>assertApprovedReview({...complete,renderApproval:{approved:false}},i));
 assert.doesNotThrow(()=>assertApprovedReview(complete,i)); // In-memory synthetic contract fixture only, never saved as approval.
});
test('measured petal light is visible and leaves the face untouched',async()=>{
 GlobalFonts.registerFromPath(new URL('public/fonts/NotoSerif.ttf',root).pathname,'Botanical');
 const reference=await loadImage(new URL('public/artwork-reference.png',root).pathname);
 initializeScene(timeline,features,(w,h)=>{const canvas=createCanvas(w,h);return {canvas:canvas as unknown as CanvasImageSource,context:canvas.getContext('2d') as unknown as CanvasRenderingContext2D}},reference as unknown as CanvasImageSource);
 const canvas=createCanvas(1920,1080),ctx=canvas.getContext('2d');
 setEffectsEnabled(false);paintScene(ctx as unknown as CanvasRenderingContext2D,55.43,'landscape',reference as unknown as CanvasImageSource);const off=ctx.getImageData(0,0,1080,1080).data;
 setEffectsEnabled(true);paintScene(ctx as unknown as CanvasRenderingContext2D,55.43,'landscape',reference as unknown as CanvasImageSource);const on=ctx.getImageData(0,0,1080,1080).data;
 let visible=0;for(let y=0;y<1080;y++)for(let x=0;x<1080;x++){const p=(y*1080+x)*4;const diff=Math.abs(on[p]!-off[p]!)+Math.abs(on[p+1]!-off[p+1]!)+Math.abs(on[p+2]!-off[p+2]!);if(x<520)assert.equal(diff,0,'Protected face/arms');if(diff>12)visible++;}
 assert.ok(visible>20000,`Response affects ${visible} textured petal pixels`);
});
