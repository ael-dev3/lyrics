import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createCanvas,GlobalFonts,loadImage} from '@napi-rs/canvas';
import {paintScene,setSceneForProof} from '../src/scene.ts';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
GlobalFonts.registerFromPath('public/fonts/Alegreya.ttf','Kamushku');
const timeline=read(process.argv[2]??'public/timeline.json');
const source=await loadImage('public/material-reference.png');
setSceneForProof(timeline,read('public/audio-features.json'),read('public/stone-anchors.json').stones,(w,h)=>{const c=createCanvas(w,h);return {canvas:c as unknown as CanvasImageSource,context:c.getContext('2d') as unknown as CanvasRenderingContext2D};},source as unknown as CanvasImageSource);
mkdirSync('analysis/scene-proofs',{recursive:true});
for(const t of [0,9,18,34,50,68,99,118,141,171,191,203])for(const format of ['landscape','portrait'] as const){
  const canvas=createCanvas(1080,format==='portrait'?1920:1080);
  paintScene(canvas.getContext('2d') as unknown as CanvasRenderingContext2D,t,format,source as unknown as CanvasImageSource);
  writeFileSync(`analysis/scene-proofs/${format}-${t}.jpg`,canvas.toBuffer('image/jpeg',90));
}
console.log('24 complete composition stills; static-source composition diagnostic, not listening or render approval.');
