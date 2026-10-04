import {createCanvas,GlobalFonts,loadImage} from '@napi-rs/canvas';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {paintScene,setSceneForProof,cueLayout} from '../src/scene.ts';
import type {Timeline,FeatureData,Cue,Format} from '../src/model.ts';
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const design=process.argv.includes('--design');
const timeline=read(design?'analysis/design-timeline.json':'public/timeline.json') as Timeline;
const features=read('public/audio-features.json') as FeatureData;
const anchors=read('public/window-anchors.json').windows;
const reference=await loadImage('public/source-reference.png');
GlobalFonts.registerFromPath('public/fonts/NotoSerif.ttf','Theatre');
const factory=(w:number,h:number)=>{const canvas=createCanvas(w,h);return {canvas:canvas as unknown as CanvasImageSource,context:canvas.getContext('2d') as unknown as CanvasRenderingContext2D}};
setSceneForProof(timeline,features,anchors,factory,reference as unknown as CanvasImageSource);
const folder=design?'analysis/design-proofs':'proofs';mkdirSync(folder,{recursive:true});
const rows:unknown[]=[];
for(const format of ['landscape','portrait'] as Format[]){
  const contact=createCanvas(360*4,Math.ceil(timeline.cues.length/4)*(format==='portrait'?640:360));
  const grid=contact.getContext('2d');
  for(const [i,cue] of timeline.cues.entries()){
    const canvas=createCanvas(1080,format==='portrait'?1920:1080),ctx=canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
    const word=cue.words[cue.id==='SV-016-p2'?cue.words.length-1:Math.min(2,cue.words.length-1)]!,time=(word.startSample+word.endSample)/2/44100;
    paintScene(ctx,time,format,reference as unknown as CanvasImageSource);
    const layout=cueLayout(ctx,cue,format);
    rows.push({cue:cue.id,format,time,size:layout.size,top:layout.top,bottom:layout.bottom,sourceRows:[...new Set(layout.source.map(s=>s.y))].length,targetRows:[...new Set(layout.target.map(s=>s.y))].length});
    const hh=format==='portrait'?640:360;grid.drawImage(canvas,(i%4)*360,Math.floor(i/4)*hh,360,hh);
    if(i===0||cue.templateId==='hook-feeling'||cue.id==='SV-016-p2')writeFileSync(`${folder}/${format}-${String(i+1).padStart(2,'0')}.png`,canvas.toBuffer('image/png'));
  }
  writeFileSync(`${folder}/${format}-all-cues.jpg`,contact.toBuffer('image/jpeg',84));
}
writeFileSync(`${folder}/layout-review.json`,JSON.stringify({scope:design?'semantic-layout fixture; invented times, no acoustic claim':'shared-scene current-timeline stills; no listening or encoded-film claim',revision:timeline.revision,rows},null,2)+'\n');
console.log(JSON.stringify({scope:design?'design-only':'current-timeline',cues:timeline.cues.length,layouts:rows.length,folder}));
