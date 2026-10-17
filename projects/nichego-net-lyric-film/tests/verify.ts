import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import {parseTimeline,parseFeatures,sourceActive,targetActive,visibleCues,PALETTE} from '../src/model.ts';
import {initializeScene,paintScene,layoutCue,cueOpacity,COMPOSITION,SOURCE_VIEWS,screenFigureGuard,visualizerGeometry,MUSIC_LINE,setEffectsEnabled,type Surface} from '../src/scene.ts';
const root=new URL('../',import.meta.url),read=(p:string)=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const t=parseTimeline(read('public/timeline.json')),f=parseFeatures(read('public/audio-features.json'));
GlobalFonts.registerFromPath(new URL('public/fonts/Cormorant.ttf',root).pathname,'Cormorant');
const source=await loadImage(new URL('public/artwork-reference.png',root).pathname);
initializeScene(t,f,(w,h)=>{const c=createCanvas(w,h);return {canvas:c,context:c.getContext('2d')} as unknown as Surface},source as unknown as CanvasImageSource);
const gold=[1,3,5].map(i=>parseInt(PALETTE.focus.slice(i,i+2),16));let boundaries=0,semantic=0,glyphs=0,controls=0,protectedPixels=0;
for(const c of t.cues)for(const w of c.words){
 assert(!sourceActive(w,(w.startSample-1)/48000));assert(sourceActive(w,w.startSample/48000));assert(!sourceActive(w,w.endSample/48000));boundaries+=3;
 assert.equal(cueOpacity(c,w.startSample/48000),1);
 for(const x of c.targets){assert.equal(targetActive(x,c.words,(w.startSample+w.endSample)/96000),x.focusSourceIndices.includes(w.sourceIndex));semantic++;}
}
// Meaning expectations are separate from simply repeating the mapping loop.
const c=t.cues.find(c=>c.templateId==='sleep')!;
for(const text of ['Fall','asleep'])assert(targetActive(c.targets.find(x=>x.text===text)!,c.words,16.7));
const n=t.cues.find(c=>c.templateId==='nothing')!;
assert(targetActive(n.targets.find(x=>x.text==='nothing')!,n.words,73.5));
for(const text of ['There','is'])assert(targetActive(n.targets.find(x=>x.text===text)!,n.words,75.4));
assert(targetActive(n.targets.find(x=>x.text==='nothing')!,n.words,75.4));
const trace=t.cues.find(c=>c.templateId==='trace')!,no=trace.targets.find(x=>x.text==='no')!;
assert(targetActive(no,trace.words,108.7));assert(targetActive(no,trace.words,110.3));assert(!targetActive(no,trace.words,109.5));
// Independent held-body anchors would fail at the sparse model-core releases.
for(const [id,index,time] of [['NN-002',2,23.0],['NN-006',2,46.1],['NN-015',0,85.7],['NN-023',2,120.4],['NN-033',0,164.5],['NN-039',0,187.1]] as const){const q=t.cues.find(c=>c.id===id)!;assert(sourceActive(q.words[index]!,time));assert.equal(cueOpacity(q,time),1);}
for(const format of ['landscape','portrait'] as const){
 const p=COMPOSITION[format],canvas=createCanvas(p.width,p.height),ctx=canvas.getContext('2d'),context=ctx as unknown as CanvasRenderingContext2D;
 for(const q of t.cues){const l=layoutCue(context,q,format);assert(l.size>=48);assert(l.bottom<=p.reading[1]+p.reading[3]+1);for(const s of [...l.source,...l.target])assert(s.x>=90&&s.x+s.width<=p.width-90,'Glyph exceeds reading safe area');}
 const base=createCanvas(p.width,p.height),b=base.getContext('2d'),v=SOURCE_VIEWS[format];b.drawImage(source,v[0],v[1],v[2],v[3],0,0,p.width,p.height);paintScene(context,18.8,format,source as unknown as CanvasImageSource);
 const a=ctx.getImageData(0,0,p.width,p.height).data,z=b.getImageData(0,0,p.width,p.height).data,g=screenFigureGuard(format);
 for(let y=Math.ceil(g.top);y<Math.min(p.height,g.bottom);y+=4)for(let x=Math.max(0,Math.ceil(g.left));x<Math.min(p.width,g.right);x+=4){const i=(y*p.width+x)*4;assert.deepEqual(a.slice(i,i+4),z.slice(i,i+4),'Original mask pixels must remain untouched');protectedPixels++;}
 setEffectsEnabled(false);
 const painted=(time:number,slots:ReturnType<typeof layoutCue>['source'])=>{paintScene(context,time,format,source as unknown as CanvasImageSource);return slots.map(s=>{ctx.font=`600 ${layoutCue(context,visibleCues(t,time)[0]!,format).size}px Cormorant`;const m=ctx.measureText(s.text),d=ctx.getImageData(Math.floor(s.x),Math.floor(s.y-m.actualBoundingBoxAscent),Math.ceil(s.width)+1,Math.ceil(m.actualBoundingBoxAscent+m.actualBoundingBoxDescent)).data;let goldPixels=0;for(let i=0;i<d.length;i+=4)if(gold.every((v,k)=>Math.abs(d[i+k]!-v)<=2))goldPixels++;return goldPixels>=4;});};
 for(const q of t.cues){const l=layoutCue(context,q,format);for(const w of q.words){const time=(w.startSample+w.endSample)/96000,states=painted(time,[...l.source,...l.target]);states.forEach((state,i)=>{const expected=i<l.source.length?l.source[i]!.index===w.sourceIndex:q.targets[l.target[i-l.source.length]!.index]!.focusSourceIndices.includes(w.sourceIndex);assert.equal(state,expected,`${format}/${q.id}/${w.text}/${i}`);glyphs++;});
  // Deliberately delayed focus while preserving actual line geometry. A paint
  // test must fail when source time is wrong, not just agree with a boolean.
  const wrong=Math.min(q.end-.001,time+.30);if(!sourceActive(w,wrong)){const state=painted(wrong,l.source)[w.sourceIndex];assert.equal(state,false);controls++;}
 }
  const neutral=Math.min(q.visibleEnd-.00001,q.end+.06);if(neutral>q.end){for(const state of painted(neutral,[...l.source,...l.target])){assert.equal(state,false,'Every source/target token must also paint neutral after its focus');glyphs++;}}
 }
 setEffectsEnabled(true);
 for(const time of [0,18.8,65,112,164,194.5]){const q=visualizerGeometry(time,format);assert.equal(q.points.length,65);assert(q.points.every(x=>Math.abs(x.deviation)<=MUSIC_LINE[format].maxDeviation));assert(Math.abs(q.points[0]!.deviation)<1e-12);}
 const a0=visualizerGeometry(18.8,format),a1=visualizerGeometry(19.2,format);assert(a0.points.some((x,i)=>Math.abs(x.y-a1.points[i]!.y)>.05),'Measured music response must visibly change');
}
for(const time of [0,5,12,15.5,193.5])assert.equal(visibleCues(t,time).length,0,'Known instrumental/breath tail must not have invented lyrics');
const result={status:'passed',revision:t.revision,sourceSha256:t.sourceSha256,boundaries,semanticStates:semantic,paintedGlyphStates:glyphs,delayedClockControls:controls,protectedSourcePixels:protectedPixels,scope:'Both-format fit, actual glyph colors, independent held-body/meaning anchors, unchanged sampled mask pixels and measured line bounds. Acoustic listening remains pending.',humanListening:false};writeFileSync(new URL('evidence/technical-preview-checks.json',root),JSON.stringify(result,null,2)+'\n');console.log(result);
