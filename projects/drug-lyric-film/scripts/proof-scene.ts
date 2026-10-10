import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import {initializeScene,paintScene,layoutCue,cueOpacity} from '../src/scene.ts';
import {sourceActive,targetActive,validateTimeline,type Timeline,type FeatureData,type Format} from '../src/model.ts';
const root=new URL('../',import.meta.url);
const timeline=JSON.parse(readFileSync(new URL('public/timeline.json',root),'utf8')) as Timeline;
const features=JSON.parse(readFileSync(new URL('public/audio-features.json',root),'utf8')) as FeatureData;
validateTimeline(timeline);
if(!GlobalFonts.registerFromPath(new URL('public/fonts/Oswald-Medium.ttf',root).pathname,'Ink'))throw Error('Font registration failed');
const reference=await loadImage(new URL('public/artwork-reference.png',root).pathname);
const native=createCanvas(1920,1080);native.getContext('2d').drawImage(reference,420,0,1080,1080);
initializeScene(timeline,features,(w,h)=>{const canvas=createCanvas(w,h);return {canvas:canvas as unknown as CanvasImageSource,context:canvas.getContext('2d') as unknown as CanvasRenderingContext2D}},reference as unknown as CanvasImageSource);
mkdirSync(new URL('evidence/',root),{recursive:true});
let layouts=0,glyphs=0,firstFrameVisibility=0,focusStates=0;
for(const format of ['landscape','portrait'] as Format[]){
 const w=format==='landscape'?1920:1080,h=format==='landscape'?1080:1920,canvas=createCanvas(w,h),ctx=canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
 for(const c of timeline.cues){
  const l=layoutCue(ctx,c,format);layouts++;
  for(const slot of [...l.source,...l.target]){
   if(slot.x<40||slot.x+slot.width>w-35||slot.y-l.size<0||slot.y>h-210)throw Error(`Clipped glyph ${format} ${c.id} ${slot.text}`);
   if(format==='landscape'&&slot.x<1080)throw Error(`Glyph enters the artwork ${c.id}`);
   if(format==='portrait'&&slot.y-l.size<1170)throw Error(`Glyph enters portrait face ${c.id}`);
   glyphs++;
  }
  for(const word of c.words){
   const t=word.startSample/44100;if(cueOpacity(c,t)!==1||!sourceActive(word,t))throw Error(`Late first paint ${word.id}`);
   if(sourceActive(word,word.endSample/44100))throw Error(`Nonexclusive end ${word.id}`);
   firstFrameVisibility++;
   const middle=(word.startSample+word.endSample)/2/44100;
   const targets=c.targets.filter(s=>targetActive(s,c.words,middle));if(!targets.length)throw Error(`No English meaning ${word.id}`);focusStates+=targets.length;
  }
 }
 for(const t of [4,10.95,17.9,24.3,33.9,39.35,70.95,100.98,108.7,145]){
  paintScene(ctx,t,format,native as unknown as CanvasImageSource);
  writeFileSync(new URL(`evidence/preview-${format}-${t.toFixed(2)}.jpg`,root),canvas.toBuffer('image/jpeg',86));
  const small=createCanvas(format==='landscape'?768:270,format==='landscape'?432:480);small.getContext('2d').drawImage(canvas,0,0,small.width,small.height);
  writeFileSync(new URL(`analysis/mobile-${format}-${t.toFixed(2)}.jpg`,root),small.toBuffer('image/jpeg',90));
 }
}
const report={schemaVersion:1,status:'passed',revision:timeline.revision,scope:'Native scene stills and geometry; complete browser and actual-audio reviews remain separate.',layouts,glyphs,firstFrameVisibility,focusStates,normalSpeedHumanListening:false,productionRender:false};
writeFileSync(new URL('evidence/scene-proof.json',root),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
