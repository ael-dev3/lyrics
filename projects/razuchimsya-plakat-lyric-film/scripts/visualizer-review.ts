import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import {readFileSync,writeFileSync} from 'node:fs';
import {initializeScene,paintScene,COMPOSITION,MUSIC_LINE,setEffectsEnabled,type Surface} from '../src/scene.ts';
import {parseTimeline,parseFeatures} from '../src/model.ts';
const root=new URL('../',import.meta.url),read=(p:string)=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
GlobalFonts.registerFromPath(new URL('public/fonts/Cormorant.ttf',root).pathname,'Cormorant');
const source=await loadImage(new URL('public/artwork-reference.png',root).pathname);
const timeline=parseTimeline(read('public/timeline.json'));
initializeScene(timeline,parseFeatures(read('public/audio-features.json')),(w,h)=>{const canvas=createCanvas(w,h);return {canvas,context:canvas.getContext('2d')} as unknown as Surface},source as unknown as CanvasImageSource);
const results=[];
for(const format of ['landscape','portrait'] as const)for(const time of [8.8,33.5,74.7,164.7,202.7]){
 const p=COMPOSITION[format],native=createCanvas(p.width,p.height),smallWidth=format==='portrait'?320:480,small=createCanvas(smallWidth,Math.round(p.height*smallWidth/p.width));
 const grab=(enabled:boolean)=>{setEffectsEnabled(enabled);paintScene(native.getContext('2d') as unknown as CanvasRenderingContext2D,time,format,source as unknown as CanvasImageSource);small.getContext('2d').drawImage(native,0,0,small.width,small.height);return small.getContext('2d').getImageData(0,0,small.width,small.height).data};
 const on=grab(true),off=grab(false),spec=MUSIC_LINE[format],outputScale=smallWidth/p.width;
 const x0=Math.max(0,Math.floor((spec.center-spec.width/2-4)*outputScale)),x1=Math.min(small.width,Math.ceil((spec.center+spec.width/2+4)*outputScale)),y0=Math.max(0,Math.floor((spec.baseline-spec.maxDeviation-4)*outputScale)),y1=Math.min(small.height,Math.ceil((spec.baseline+spec.maxDeviation+4)*outputScale));let total=0,visible=0;const deltas=[];
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*small.width+x)*4,d=Math.max(...[0,1,2].map(k=>Math.abs(on[i+k]!-off[i+k]!)));deltas.push(d);total+=d;if(d>=12)visible++}
 deltas.sort((a,b)=>a-b);results.push({format,time,playerWidth:smallWidth,roi:[x0,y0,x1-x0,y1-y0],pixelsAbove12:visible,meanMaxChannelDelta:total/deltas.length,p99MaxChannelDelta:deltas[Math.floor(deltas.length*.99)]});
}
setEffectsEnabled(true);
const baseline=process.argv.includes('--baseline');writeFileSync(new URL(baseline?'analysis/visualizer-v1-measurements.json':'evidence/visualizer-visibility-checks.json',root),JSON.stringify({revision:timeline.revision,scope:'Downscaled on/off pixel-difference proxy; not a perceptual listening judgment.',results},null,2)+'\n');console.log(JSON.stringify(results));
