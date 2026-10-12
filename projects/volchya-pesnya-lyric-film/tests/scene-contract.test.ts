import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import {parseTimeline,parseFeatures,sourceActive,targetActive,visibleCues,type Format} from '../src/model.ts';
import {initializeScene,paintScene,layoutCue,cueOpacity,setEffectsEnabled} from '../src/scene.ts';
import {assertApprovedReview} from '../scripts/production-authorization.ts';
const root=new URL('../',import.meta.url),read=(p:string)=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const timeline=parseTimeline(read('public/timeline.json'));
test('every source and translated focus follows an independent integer audio-sample oracle',()=>{
 for(const c of timeline.cues)for(const w of c.words){
  assert.ok(sourceActive(w,w.startSample/44100));assert.equal(sourceActive(w,w.endSample/44100),false);
  for(const n of [Math.ceil(w.startSample/735)-1,Math.ceil(w.startSample/735),Math.ceil(w.endSample/735)-1,Math.ceil(w.endSample/735)]){
   const sample=n*735,time=n/60;assert.equal(sourceActive(w,time),sample>=w.startSample&&sample<w.endSample);
   for(const t of c.targets)assert.equal(targetActive(t,c.words,time),t.focusSourceIndices.some(i=>sample>=c.words[i]!.startSample&&sample<c.words[i]!.endSample));
  }
 }
});
test('complete English grammar, conditional mood and the sung negative echo keep their own meanings',()=>{
 const get=(id:string)=>timeline.cues.find(c=>c.templateId===id)!;
 const alive=get('alive'),biting=(alive.words[3]!.startSample+alive.words[3]!.endSample)/88200;
 assert.deepEqual(alive.targets.filter(t=>targetActive(t,alive.words,biting)).map(t=>t.text),['I','bite']);
 const escape=get('escape'),middle=(escape.start+escape.end)/2;
 assert.deepEqual(escape.targets.filter(t=>targetActive(t,escape.words,middle)).map(t=>t.text),["I'll",'run','away']);
 const echo=get('keepup'),tail=(echo.words[4]!.startSample+echo.words[4]!.endSample)/88200;
 assert.deepEqual(echo.targets.filter(t=>targetActive(t,echo.words,tail)).map(t=>t.text),['fall','behind']);
 assert.equal(echo.targets.find(t=>t.text==="don't")!.focusSourceIndices[0],2);
 const hands=get('hands');assert.ok(hands.targetText.includes('hands'));assert.equal(hands.targetText.includes('arrows'),false);
});
test('held closing vowels remain readable while neutral reading never extends word focus',()=>{
 const last=timeline.cues.at(-1)!;assert.ok(last.end>255.5);assert.ok(cueOpacity(last,255.3)===1);
 const lastWord=last.words.at(-1)!;assert.ok(sourceActive(lastWord,255.3));assert.equal(sourceActive(lastWord,255.7),false);assert.equal(cueOpacity(last,255.7),1);
 for(const c of timeline.cues)for(const w of c.words)assert.equal(cueOpacity(c,w.startSample/44100),1);
 for(let n=0;n<700;n++)assert.equal(visibleCues(timeline,n/60).length,0);
});
test('review guard refuses a different song and keeps preview production closed',()=>{
 const identity={schemaVersion:1,revision:timeline.revision,sourceSha256:timeline.sourceSha256,timelineSha256:'unreviewed',sceneSha256:'unreviewed',sceneFiles:[]};
 assert.throws(()=>assertApprovedReview(undefined,identity));assert.throws(()=>assertApprovedReview({revision:'obnimay-preview-v2',renderApproval:{approved:true}},identity));
});
test('complete lexical inventory and independently selected repeats are retained',()=>{
 assert.equal(timeline.cues.length,59);assert.equal(timeline.cues.reduce((n,c)=>n+c.words.length,0),228);
 const repeats=timeline.cues.filter(c=>c.templateId==='race');assert.equal(repeats.length,4);assert.equal(new Set(repeats.map(c=>c.words[0]!.startSample)).size,4);
 assert.equal(timeline.cues.filter(c=>c.sourceText.includes('Завиляет')).length,1);
 assert.equal(timeline.cues.some(c=>c.sourceText.includes('Продолжение')),false);
});
test('material-bound response is visible, deterministic and leaves the entire wolf unchanged',async()=>{
 assert.ok(GlobalFonts.registerFromPath(new URL('public/fonts/Alegreya.ttf',root).pathname,'Broadside'));
 const reference=await loadImage(new URL('public/artwork-reference.png',root).pathname),features=parseFeatures(read('public/audio-features.json'));
 initializeScene(timeline,features,(w,h)=>{const c=createCanvas(w,h);return {canvas:c as unknown as CanvasImageSource,context:c.getContext('2d') as unknown as CanvasRenderingContext2D}},reference as unknown as CanvasImageSource);
 const canvas=createCanvas(1920,1080),ctx=canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
 setEffectsEnabled(false);paintScene(ctx,54.8,'landscape',reference as unknown as CanvasImageSource);const baseline=canvas.data();
 setEffectsEnabled(true);paintScene(ctx,54.8,'landscape',reference as unknown as CanvasImageSource);const active=canvas.data();let changed=0,protectedChanges=0;
 for(let y=0;y<1080;y++)for(let x=0;x<1080;x++){const p=(y*1920+x)*4;if([0,1,2].some(c=>baseline[p+c]!==active[p+c])){changed++;if(x>=220&&x<=900&&y>=165&&y<927)protectedChanges++}}
 assert.ok(changed>5000,`Response too small: ${changed}`);assert.equal(protectedChanges,0);
 paintScene(ctx,0,'landscape',reference as unknown as CanvasImageSource);paintScene(ctx,54.8,'landscape',reference as unknown as CanvasImageSource);assert.deepEqual(canvas.data(),active,'Source-time seek changed the effect');
 for(const format of ['landscape','portrait'] as Format[])for(const cue of timeline.cues){const l=layoutCue(ctx,cue,format),width=format==='portrait'?1080:1920;for(const glyph of [...l.source,...l.target]){assert.ok(glyph.x>=45&&glyph.x+glyph.width<=width-45);assert.ok(glyph.y-l.size>=(format==='portrait'?1110:285));assert.ok(glyph.y<=(format==='portrait'?1735:970))}}
});
