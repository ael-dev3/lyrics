import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import {initializeScene,paintScene,layoutCue,cueOpacity,setEffectsEnabled} from '../src/scene.ts';
import {sourceActive,targetActive,validateTimeline,type Timeline,type FeatureData,type Format} from '../src/model.ts';
import {currentIdentity} from './project-identity.ts';
const root=new URL('../',import.meta.url);
const timeline=JSON.parse(readFileSync(new URL('public/timeline.json',root),'utf8')) as Timeline;
const features=JSON.parse(readFileSync(new URL('public/audio-features.json',root),'utf8')) as FeatureData;
validateTimeline(timeline);
if(!GlobalFonts.registerFromPath(new URL('public/fonts/NotoSerif.ttf',root).pathname,'Botanical'))throw Error('Font registration failed');
const reference=await loadImage(new URL('public/artwork-reference.png',root).pathname);
initializeScene(timeline,features,(w,h)=>{const canvas=createCanvas(w,h);return {canvas:canvas as unknown as CanvasImageSource,context:canvas.getContext('2d') as unknown as CanvasRenderingContext2D}},reference as unknown as CanvasImageSource);
mkdirSync(new URL('evidence/',root),{recursive:true});mkdirSync(new URL('analysis/',root),{recursive:true});
let layouts=0,glyphs=0,firstFrameVisibility=0,focusStates=0,holds=0,overlaps=0;
const chosen=[0,6.38,12.55,25.89,32.95,44.80,50.96,55.43,73.48,89.70,102,123.64,143.22,167.18,190.55,197.50,200.59];
for(const format of ['landscape','portrait'] as Format[]){
 const w=format==='landscape'?1920:1080,h=format==='landscape'?1080:1920,canvas=createCanvas(w,h),ctx=canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
 for(const c of timeline.cues){
  const l=layoutCue(ctx,c,format);layouts++;
  for(const slot of [...l.source,...l.target]){
   if(slot.x<40||slot.x+slot.width>w-40||slot.y-l.size<0||slot.y>h-(format==='portrait'?165:65))throw Error(`Clipped glyph ${format} ${c.id} ${slot.text}`);
   if(format==='landscape'&&slot.x<1090)throw Error(`Glyph enters the portrait ${c.id}`);
   if(format==='portrait'&&slot.y-l.size<1120)throw Error(`Glyph enters original photo ${c.id}`);
   glyphs++;
  }
  for(const word of c.words){
   const t=word.startSample/44100;if(cueOpacity(c,t)!==1||!sourceActive(word,t))throw Error(`Late first paint ${word.id}`);
   if(sourceActive(word,word.endSample/44100))throw Error(`Nonexclusive end ${word.id}`);
   firstFrameVisibility++;
   const middle=(word.startSample+word.endSample)/2/44100;
   const targets=c.targets.filter(s=>targetActive(s,c.words,middle));if(!targets.length)throw Error(`No English meaning ${word.id}`);focusStates+=targets.length;
  }
  for(let t=c.start;t<c.end;t+=1/60){if(cueOpacity(c,t)!==1)throw Error(`Voice faded ${c.id} ${t}`);holds++;}
 }
 // Every actual reading overlap reserves two complete language blocks.
 for(const a of timeline.cues.filter(c=>c.lane==='lead'))for(const b of timeline.cues.filter(c=>c.lane==='backing')){
  if(a.visibleStart<b.visibleEnd&&b.visibleStart<a.visibleEnd){const x=layoutCue(ctx,a,format),y=layoutCue(ctx,b,format);if(x.bottom+18>y.top)throw Error(`Overlapping language blocks ${format} ${a.id}/${b.id}`);overlaps++;}
 }
 for(const t of chosen){
  paintScene(ctx,t,format,reference as unknown as CanvasImageSource);
  writeFileSync(new URL(`evidence/preview-${format}-${t.toFixed(2)}.jpg`,root),canvas.toBuffer('image/jpeg',88));
  const small=createCanvas(format==='landscape'?768:270,format==='landscape'?432:480);small.getContext('2d').drawImage(canvas,0,0,small.width,small.height);
  writeFileSync(new URL(`analysis/mobile-${format}-${t.toFixed(2)}.jpg`,root),small.toBuffer('image/jpeg',92));
 }
 setEffectsEnabled(false);paintScene(ctx,55.43,format,reference as unknown as CanvasImageSource);writeFileSync(new URL(`analysis/effects-off-${format}.png`,root),canvas.toBuffer('image/png'));setEffectsEnabled(true);
}
const report={...currentIdentity(),status:'passed',scope:'Native shared-scene stills, full cue/word geometry and drawing-state contracts. Separate browser checks and actual listening are required.',layouts,glyphs,firstFrameVisibility,focusStates,fullOpacityFrameChecks:holds,overlapChecks:overlaps,normalSpeedHumanListening:false,productionRender:false};
writeFileSync(new URL('evidence/scene-proof.json',root),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
