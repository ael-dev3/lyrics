import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createCanvas,loadImage,GlobalFonts,type Canvas} from '@napi-rs/canvas';
import {initializeScene,paintScene,layoutCue,COMPOSITION,type Surface,type Format} from '../src/scene.ts';
import {parseTimeline,parseFeatures} from '../src/model.ts';
const root=new URL('..',import.meta.url),file=(name:string)=>new URL(name,root);
const t=parseTimeline(JSON.parse(readFileSync(file('public/timeline.json'),'utf8')));
const f=parseFeatures(JSON.parse(readFileSync(file('public/audio-features.json'),'utf8')));
if(!GlobalFonts.registerFromPath(file('public/fonts/Literata.ttf').pathname,'Literata'))throw Error('Literata registration failed');
const artwork=await loadImage(file('public/artwork-reference.png').pathname);
const factory=(w:number,h:number)=>{const canvas=createCanvas(w,h);return {canvas,context:canvas.getContext('2d')} as unknown as Surface};
initializeScene(t,f,factory,artwork as unknown as CanvasImageSource);
const out=file('analysis/rebuild/stills/');mkdirSync(out,{recursive:true});
const sampleTimes=[1.8,27.4,33.253,41.539,65.732,104,132.2,166.5,193.7];
const failures:string[]=[],geometries:unknown[]=[];
for(const format of ['landscape','portrait'] as Format[]){
 const {width,height}=COMPOSITION[format],s=factory(width,height);
 for(const cue of t.cues){
  const l=layoutCue(s.context,cue,format),rows=[...l.source,...l.target];
  if(rows.some(p=>p.x<45||p.x+p.width>width-45||p.y-l.size<0||p.y+15>height-45))failures.push(cue.id+'/'+format+': frame bounds');
  const minX=Math.min(...rows.map(r=>r.x)),maxX=Math.max(...rows.map(r=>r.x+r.width));
  geometries.push({id:cue.id,format,size:l.size,duet:l.duet,top:l.top,bottom:l.bottom,left:minX,right:maxX});
 }
 for(const time of sampleTimes){
  paintScene(s.context,time,format,artwork as unknown as CanvasImageSource);
  const canvas=s.canvas as unknown as Canvas;
  writeFileSync(new URL('v4.3-'+format+'-'+time.toFixed(1)+'.png',out),canvas.toBuffer('image/png'));
 }
}
writeFileSync(file('analysis/rebuild/geometry.json'),JSON.stringify({revision:t.revision,failures,geometries,font:'Official Literata variable font, weight 500; both languages identical'},null,2)+'\n');
console.log(JSON.stringify({revision:t.revision,layouts:geometries.length,failures,stills:sampleTimes.length*2}));
if(failures.length)process.exitCode=1;
