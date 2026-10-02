import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import {paintScene,setSceneForProof} from '../src/scene.ts';
import type {Timeline,FeatureData,FramingSpan} from '../src/model.ts';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const read=<T>(p:string):T=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
const timeline=read<Timeline>('public/timeline.json'),features=read<FeatureData>('public/audio-features.json'),spans=read<FramingSpan[]>('public/portrait-framing.json');
GlobalFonts.registerFromPath(resolve(root,'public/fonts/CormorantGaramond-Semibold.ttf'),'Komety');
setSceneForProof(timeline,features,spans,()=>{const canvas=createCanvas(270,480);return {canvas:canvas as unknown as CanvasImageSource,context:canvas.getContext('2d') as unknown as CanvasRenderingContext2D};});
const requestedTimes=process.argv.find(arg=>arg.startsWith('--times='))?.slice(8).split(',').map(Number);
if(requestedTimes?.some(time=>!Number.isFinite(time)||time<0||time>timeline.sourceDuration))throw Error('Proof times must be within the locked source');
const times=requestedTimes??(process.argv.includes('--all')?timeline.cues.map(c=>c.start+Math.min(.35,(c.end-c.start)/2)):[12.4,26.1,46.04,100.7,113.8,158.7,187.5,241.2,249.7,259.8]);
mkdirSync(resolve(root,'analysis/scene-proofs'),{recursive:true});
for(const format of ['landscape','portrait'] as const) {
  const canvas=createCanvas(format==='landscape'?1920:1080,format==='landscape'?796:1920);const ctx=canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
  const cellW=format==='landscape'?480:216;const cellH=Math.round(cellW*canvas.height/canvas.width)+26;
  const contact=createCanvas(cellW*4,cellH*Math.ceil(times.length/4));const cc=contact.getContext('2d');cc.fillStyle='#111713';cc.fillRect(0,0,contact.width,contact.height);
  for(const [i,time] of times.entries()) {
    const result=spawnSync('ffmpeg',['-v','error','-ss',String(time),'-i',resolve(root,'public/source.mp4'),'-frames:v','1','-c:v','png','-f','image2pipe','pipe:1'],{maxBuffer:16*1024*1024});
    if(result.status!==0)throw Error(result.stderr.toString());const frame=await loadImage(result.stdout);
    paintScene(ctx,time,format,frame as unknown as CanvasImageSource);
    const encoded=canvas.toBuffer('image/jpeg',92);
    writeFileSync(resolve(root,`analysis/scene-proofs/${format}-${time.toFixed(3)}.jpg`),encoded);
    if(time===12.4)writeFileSync(resolve(root,`evidence/preview-${format}.jpg`),encoded);
    // Snapshot immutable pixels before reusing the main canvas. Native Skia
    // contact drawing may otherwise retain a mutable surface reference.
    const snapshot=await loadImage(encoded);
    const x=i%4*cellW,y=Math.floor(i/4)*cellH;cc.drawImage(snapshot,x,y,cellW,cellH-26);cc.fillStyle='#eee3cf';cc.font='14px sans-serif';cc.fillText(`${format} · ${time.toFixed(3)}s`,x+8,y+cellH-7);
  }
  writeFileSync(resolve(root,`analysis/scene-proofs/${format}-contact.jpg`),contact.toBuffer('image/jpeg',90));
}
console.log(`Wrote ${times.length*2} source-frame still proofs; no video capture or encoding.`);
