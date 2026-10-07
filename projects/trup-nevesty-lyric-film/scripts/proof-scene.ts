import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createCanvas,GlobalFonts,loadImage} from '@napi-rs/canvas';
import {paintScene,setSceneForProof,setEffectsEnabled,cueLayout} from '../src/scene.ts';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
GlobalFonts.registerFromPath('public/fonts/Alegreya.ttf','Bridal');
const timeline=read('public/timeline.json'),source=await loadImage('public/material-reference.png');
setSceneForProof(timeline,read('public/audio-features.json'),read('public/material-anchors.json'),(w,h)=>{const c=createCanvas(w,h);return {canvas:c as unknown as CanvasImageSource,context:c.getContext('2d') as unknown as CanvasRenderingContext2D}},source as unknown as CanvasImageSource);
mkdirSync('analysis/scene-proofs',{recursive:true});
const issues:string[]=[];
for(const format of ['landscape','portrait'] as const){
 const canvas=createCanvas(format==='landscape'?1920:1080,format==='landscape'?1080:1920),ctx=canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
 for(const cue of timeline.cues){const l=cueLayout(ctx,cue,format);for(const s of [...l.source,...l.target])if(s.x<45||s.x+s.width>canvas.width-45||s.y-l.size<90||s.y>925)issues.push(`${format}:${cue.id}:${s.text}`);}
 for(const t of [0,4,12.5,16.7,36.8,57.95,74.7,91.9,95.2,97,116.9,134.05,150.25,163,178.8,196.3,203]){
  setEffectsEnabled(true);paintScene(ctx,t,format,source as unknown as CanvasImageSource);
  writeFileSync(`analysis/scene-proofs/${format}-${t}.png`,canvas.toBuffer('image/png'));
 }
 for(const t of [16.7,74.7,95.2,150.25]){
  setEffectsEnabled(false);paintScene(ctx,t,format,source as unknown as CanvasImageSource);writeFileSync(`analysis/scene-proofs/${format}-${t}-effects-off.png`,canvas.toBuffer('image/png'));
 }
}
setEffectsEnabled(true);
if(issues.length)throw Error(`Reading geometry issues: ${issues.join(', ')}`);
console.log('34 complete source-picture stills + 8 animation A/B stills; every cue fits both reading layouts. No production video encoded.');
