import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import {parseTimeline,parseFeatures,sourceActive,targetActive,visibleCues,PALETTE,type Cue,type Format} from '../src/model.ts';
import {initializeScene,layoutCue,cueOpacity,paintScene,setEffectsEnabled,FIGURE_GUARD,COMPOSITION,SOURCE_VIEWS,screenFigureGuard,SPECTRUM,spectrumGeometry,type Surface} from '../src/scene.ts';
const root=new URL('..',import.meta.url),file=(name:string)=>new URL(name,root);
const timeline=parseTimeline(JSON.parse(readFileSync(file('public/timeline.json'),'utf8')));
const features=parseFeatures(JSON.parse(readFileSync(file('public/audio-features.json'),'utf8')));
assert(GlobalFonts.registerFromPath(file('public/fonts/Literata.ttf').pathname,'Literata'));
const art=await loadImage(file('public/artwork-reference.png').pathname);
const factory=(w:number,h:number)=>{const c=createCanvas(w,h);return {canvas:c,context:c.getContext('2d')} as unknown as Surface};
const warmup=performance.now();initializeScene(timeline,features,factory,art as unknown as CanvasImageSource);
const cacheMilliseconds=performance.now()-warmup;
let boundaryChecks=0,semanticChecks=0;
for(const c of timeline.cues)for(const w of c.words){
 const start=w.startSample/44100,end=w.endSample/44100;
 assert(!sourceActive(w,(w.startSample-.5)/44100),w.id+' premature');
 assert(sourceActive(w,start),w.id+' missed exact onset');
 assert(sourceActive(w,(w.endSample-.5)/44100),w.id+' cropped end');
 assert(!sourceActive(w,end),w.id+' stale exclusive release');
 assert.equal(cueOpacity(c,start),1,w.id+' first word not fully visible');boundaryChecks+=5;
}
const cue=(id:string)=>{const c=timeline.cues.find(c=>c.id===id);assert(c,id);return c};
function expected(id:string,index:number,words:string[]){
 const c=cue(id),w=c.words[index]!;assert(w,id+'/'+index);
 const t=(w.startSample+w.endSample)/2/44100;
 const actual=c.targets.filter(x=>targetActive(x,c.words,t)).map(x=>x.text.toLowerCase()).sort();
 assert.deepEqual(actual,words.map(x=>x.toLowerCase()).sort(),id+'/'+w.text);semanticChecks++;
}
expected('open-words',0,['Words']);expected('open-words',1,['cannot']);expected('open-words',2,['describe']);
for(const id of ['tend-love-a','tend-love-b','tend-love-c','tend-love-d']){
 expected(id,0,['I']);expected(id,1,['love']);expected(id,2,['this']);expected(id,3,['will']);
 expected(id,4,['keep','warm']);expected(id,6,['nurture','it']);
}
for(const id of ['tree-a','tree-b','tree-c','tree-d']){
 expected(id,1,['it']);expected(id,4,['me']);expected(id,5,['into','a','tree']);
}
for(const id of ['fingertips-a','fingertips-b','fingertips-c','fingertips-d']){
 expected(id,1,['the','fingertips']);expected(id,2,['the','fingertips']);expected(id,4,['by','it']);
}
expected('hand-full',1,['not']);expected('hand-full',2,['will','grow','empty']);
expected('linen-a',4,['snow-white']);expected('linen-b',4,['snow-white']);
expected('blue-sky',3,['the','sky']);expected('blue-sky',4,['blue']);
for(const id of ['enough-a','enough-b']){
 expected(id,0,['grant','that']);expected(id,1,['God']);expected(id,2,['it']);expected(id,3,['will','be','enough']);
}
for(const id of ['quietly-a','quietly-b']){
 const c=cue(id);assert.equal(c.words.filter(w=>w.text.toLowerCase()==='тихо').length,2);
 expected(id,0,['Softly']);expected(id,1,['softly']);
 const a=c.targets.filter(x=>x.text.toLowerCase()==='softly');assert.equal(a.length,2);assert.notDeepEqual(a[0]!.focusSourceIndices,a[1]!.focusSourceIndices);
}
for(let t=104;t<=120.8;t+=.05)assert.equal(visibleCues(timeline,t).length,0,'False neutral lyric in the instrumental bridge');
let geometryChecks=0,duetChecks=0,guardChecks=0,pictureChecks=0;
const responseSamples:{format:Format;time:number;changedPixels:number;maximumChannelChange:number}[]=[];
const spectrumSamples:{format:Format;changedPixels:number}[]=[];
const glyphRects=(ctx:CanvasRenderingContext2D,c:Cue,format:Format)=>{
 const l=layoutCue(ctx,c,format);ctx.font='500 '+l.size+'px Literata';
 return [...l.source,...l.target].map(s=>{const m=ctx.measureText(s.text);return {left:s.x-m.actualBoundingBoxLeft,top:s.y-m.actualBoundingBoxAscent,right:s.x+m.actualBoundingBoxRight,bottom:s.y+m.actualBoundingBoxDescent}});
};
const intersects=(a:{left:number;right:number;top:number;bottom:number},b:{left:number;right:number;top:number;bottom:number})=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
for(const format of ['landscape','portrait'] as Format[]){
 const dims=COMPOSITION[format],s=factory(dims.width,dims.height);
 const v=SOURCE_VIEWS[format];
 const spec=SPECTRUM[format];
 const spectrumRect={left:spec.center-spec.width/2-3,top:spec.baseline-spec.maxHeight-3,
  right:spec.center+spec.width/2+3,bottom:spec.baseline+4};
 assert(spectrumRect.left>=0&&spectrumRect.right<=dims.width&&spectrumRect.top>=0&&spectrumRect.bottom<=dims.height,'Spectrum clipped');
 assert.equal(dims.width/v[2],dims.height/v[3],'Source aspect distortion');
 assert(v[0]<=FIGURE_GUARD[0]&&v[0]+v[2]>=FIGURE_GUARD[0]+FIGURE_GUARD[2],'Figure cropped horizontally');
 assert(v[1]<=FIGURE_GUARD[1]&&v[1]+v[3]>=FIGURE_GUARD[1]+FIGURE_GUARD[3],'Figure cropped vertically');
 // Independent expected full-frame composition detects repeated edges,
 // mirrored scenery, black filler and arbitrary scale deformation.
 setEffectsEnabled(false);paintScene(s.context,104,format,art as unknown as CanvasImageSource);
 const expected=factory(dims.width,dims.height);
 expected.context.drawImage(art as unknown as CanvasImageSource,v[0],v[1],v[2],v[3],0,0,dims.width,dims.height);
 const actualPixels=s.context.getImageData(0,0,dims.width,dims.height).data,expectedPixels=expected.context.getImageData(0,0,dims.width,dims.height).data;
 assert.deepEqual(actualPixels,expectedPixels,'Composition is not exactly one original-frame crop');
 setEffectsEnabled(true);pictureChecks++;
 for(const c of timeline.cues){
  const rects=glyphRects(s.context,c,format);
  for(const r of rects)assert(!intersects(r,spectrumRect),c.id+'/'+format+' lyric collides with the reserved spectrum margin');
  for(const r of rects)assert(r.left>=40&&r.right<=dims.width-40&&r.top>=32&&r.bottom<=dims.height-50,c.id+'/'+format+' glyph clipping');
  {
   const guard=screenFigureGuard(format);
   for(const r of rects)assert(!intersects(r,guard),c.id+' touches sitter');
  }
  geometryChecks++;
 }
 // Compare the complete spectrum against the effects-off image. Other
 // music-reactive picture layers are absent, so activity cannot pass on foliage.
 setEffectsEnabled(false);paintScene(s.context,41.539,format,art as unknown as CanvasImageSource);
 const rx=Math.floor(spectrumRect.left),ry=Math.floor(spectrumRect.top),rw=Math.ceil(spectrumRect.right)-rx,rh=Math.ceil(spectrumRect.bottom)-ry;
 const beforeSpectrum=s.context.getImageData(rx,ry,rw,rh).data;
 setEffectsEnabled(true);paintScene(s.context,41.539,format,art as unknown as CanvasImageSource);
 const afterSpectrum=s.context.getImageData(rx,ry,rw,rh).data;
 let spectrumChanged=0;for(let i=0;i<beforeSpectrum.length;i+=4)if([0,1,2].some(k=>Math.abs(beforeSpectrum[i+k]!-afterSpectrum[i+k]!)>=3))spectrumChanged++;
 assert(spectrumChanged>100,'Spectrum is not visible '+format);spectrumSamples.push({format,changedPixels:spectrumChanged});
 const geometry=spectrumGeometry(41.539,format);assert.equal(geometry.bars.length,24,'Measured frequency channels missing');
 for(const t of [1.8,27.4,33.253,41.539,65.732,104,132.2,166.5,193.7]){
  for(const bar of spectrumGeometry(t,format).bars){
   assert(bar.x>=spectrumRect.left&&bar.x+bar.width<=spectrumRect.right&&bar.y>=spectrumRect.top&&bar.y+bar.height<=spectrumRect.bottom,'Spectrum escaped reserved footprint '+format+'/'+t);
   assert(Math.abs(bar.y+bar.height-spec.baseline)<1e-8,'Baseline shifts '+format+'/'+t);
  }
 }
 const later=spectrumGeometry(65.732,format);
 assert.deepEqual(geometry.bars.map(b=>[b.x,b.width]),later.bars.map(b=>[b.x,b.width]),'Spectrum anchor or bar width moves');
 setEffectsEnabled(true);paintScene(s.context,65.732,format,art as unknown as CanvasImageSource);
 const laterSpectrum=s.context.getImageData(rx,ry,rw,rh).data;
 let musicalChanges=0;for(let i=0;i<laterSpectrum.length;i++)if(Math.abs(laterSpectrum[i]!-afterSpectrum[i]!)>=3)musicalChanges++;
 assert(musicalChanges>100,'Spectrum response is frozen '+format);
 const boundaries=new Set(timeline.cues.flatMap(c=>[c.visibleStart,c.start,c.end,c.fullOpacityEnd,c.visibleEnd]));
 for(const t of boundaries){
  const visible=visibleCues(timeline,t+.0001);
  if(visible.length<2)continue;
  const a=glyphRects(s.context,visible[0]!,format),b=glyphRects(s.context,visible[1]!,format);
  for(const x of a)for(const y of b)assert(!intersects(x,y),'Duet collision '+format+'/'+t);duetChecks++;
 }
 // Added response must not paint any skin, clothes or feet in the conservative
 // source-coordinate figure region. Compare two real renders, not mask metadata.
 for(const t of [19.8,76.9,132.2,166.5,194.5]){
  setEffectsEnabled(false);paintScene(s.context,t,format,art as unknown as CanvasImageSource);
  const guard=screenFigureGuard(format),px=Math.ceil(guard.left)+2,py=Math.ceil(guard.top)+2,gw=Math.floor(guard.right)-px-2,gh=Math.floor(guard.bottom)-py-2,before=s.context.getImageData(px,py,gw,gh).data;
  const beforeAll=t===19.8?s.context.getImageData(0,0,dims.width,dims.height).data:undefined;
  setEffectsEnabled(true);paintScene(s.context,t,format,art as unknown as CanvasImageSource);
  const after=s.context.getImageData(px,py,gw,gh).data;
  let changed=0;for(let i=0;i<before.length;i++)if(before[i]!==after[i])changed++;
  assert.equal(changed,0,'Added response painted sitter '+format+'/'+t);guardChecks++;
  if(beforeAll){
   const afterAll=s.context.getImageData(0,0,dims.width,dims.height).data;
   let changedPixels=0,maximumChannelChange=0;
   for(let i=0;i<beforeAll.length;i+=4){let different=false;for(let channel=0;channel<3;channel++){const d=Math.abs(beforeAll[i+channel]!-afterAll[i+channel]!);maximumChannelChange=Math.max(maximumChannelChange,d);different||=d>0}if(different)changedPixels++}
   assert(changedPixels>64&&maximumChannelChange>=3,'Missing material response '+format);
   responseSamples.push({format,time:t,changedPixels,maximumChannelChange});
  }
 }
}
// Silent input has no visible spectrum or independent idle movement.
const silentFeatures={...features,rows:features.rows.map(()=>Array(26).fill(0) as number[])};
initializeScene(timeline,silentFeatures,factory,art as unknown as CanvasImageSource);
for(const format of ['landscape','portrait'] as Format[]){
 const a=spectrumGeometry(41.539,format),b=spectrumGeometry(65.732,format);
 assert.equal(a.opacity,0);assert.deepEqual(a,b,'Autonomous spectrum movement in silence');
}
const report={revision:timeline.revision,sourceSha256:timeline.sourceSha256,status:'Technical and semantic preview checks; no listening attestation.',
 cacheMilliseconds,boundaryChecks,semanticChecks,geometryChecks,duetChecks,guardChecks,pictureChecks,responseSamples,spectrumSamples,
 picture:'Single original-frame crop with uniform scale; no reflection, repetition or synthesized extension. A compact fixed spectrum is separate from source imagery and tested against the protected figure.',palette:PALETTE};
mkdirSync(file('evidence/'),{recursive:true});writeFileSync(file('evidence/preview-validation.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
