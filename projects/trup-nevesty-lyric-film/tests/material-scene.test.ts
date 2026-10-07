import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import {setSceneForProof,paintScene,setEffectsEnabled,cueLayout,stringPoint,stringResponseAt} from '../src/scene.ts';
const read=(p:string)=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const timeline=read('public/timeline.json'),features=read('public/audio-features.json'),plan=read('public/material-anchors.json');
const source=await loadImage(new URL('../public/material-reference.png',import.meta.url).pathname);
GlobalFonts.registerFromPath(new URL('../public/fonts/Alegreya.ttf',import.meta.url).pathname,'Bridal');
setSceneForProof(timeline,features,plan,(w,h)=>{const canvas=createCanvas(w,h);return {canvas:canvas as unknown as CanvasImageSource,context:canvas.getContext('2d') as unknown as CanvasRenderingContext2D}},source as unknown as CanvasImageSource);
test('frequency power belongs to six fixed painted strings, with fixed physical ends',()=>{
 assert.deepEqual(plan.strings.flatMap((s:any)=>s.bandIndices),Array.from({length:24},(_,i)=>i));
 for(const s of plan.strings)for(const t of [0,30,95.2,150.25,203]){
  const a=stringPoint(s,0,t,1),b=stringPoint(s,1,t,1);
  assert.ok(Math.abs(a.y-s.start.y)<1e-8);assert.ok(Math.abs(b.y-s.end.y)<1e-8);
 }
 for(const t of [0,30,95.2,150.25,203])assert.ok(stringResponseAt(t).every(x=>Number.isFinite(x)&&x>=0&&x<=1));
});
test('all bilingual geometry fits both complete-art compositions, with equal size',()=>{
 for(const format of ['landscape','portrait'] as const){
  const width=format==='landscape'?1920:1080,canvas=createCanvas(width,format==='landscape'?1080:1920),ctx=canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
  for(const cue of timeline.cues){const l=cueLayout(ctx,cue,format);assert.equal(l.source.length,cue.words.length);assert.equal(l.target.length,cue.targets.length);assert.ok(l.size>=54);for(const slot of [...l.source,...l.target]){assert.ok(slot.x>=45);assert.ok(slot.x+slot.width<=width-45);assert.ok(slot.y<=925);}}
 }
});
test('the visualizer never draws through the bridal fingers; paused rendering is deterministic',()=>{
 const canvas=createCanvas(1920,1080),ctx=canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
 setEffectsEnabled(false);paintScene(ctx,150.25,'landscape',source as unknown as CanvasImageSource);const off=ctx.getImageData(0,0,1920,1080).data;
 setEffectsEnabled(true);paintScene(ctx,150.25,'landscape',source as unknown as CanvasImageSource);const on=ctx.getImageData(0,0,1920,1080).data;
 for(const [x,y] of [[552,855],[583,939],[429,911],[651,852],[545,804]]){const p=(y!*1920+x!+420)*4;assert.deepEqual(Array.from(on.slice(p,p+4)),Array.from(off.slice(p,p+4)),`Finger ${x},${y}`);}
 const first=canvas.toBuffer('image/png');paintScene(ctx,150.25,'landscape',source as unknown as CanvasImageSource);assert.deepEqual(canvas.toBuffer('image/png'),first);
 assert.ok(on.some((v,i)=>v!==off[i]),'Measured musical response must be visible somewhere in the scene');
});
