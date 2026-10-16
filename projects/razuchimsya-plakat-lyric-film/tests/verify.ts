import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import {parseTimeline,parseFeatures,sourceActive,targetActive,visibleCues,PALETTE} from '../src/model.ts';
import {initializeScene,paintScene,layoutCue,cueOpacity,COMPOSITION,SOURCE_VIEWS,screenFigureGuard,visualizerGeometry,MUSIC_LINE,setEffectsEnabled,type Surface} from '../src/scene.ts';
const root=new URL('../',import.meta.url),read=(p:string)=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const t=parseTimeline(read('public/timeline.json')),f=parseFeatures(read('public/audio-features.json'));
GlobalFonts.registerFromPath(new URL('public/fonts/Cormorant.ttf',root).pathname,'Cormorant');
const source=await loadImage(new URL('public/artwork-reference.png',root).pathname);
initializeScene(t,f,(w,h)=>{const canvas=createCanvas(w,h);return {canvas,context:canvas.getContext('2d')} as unknown as Surface},source as unknown as CanvasImageSource);
let boundaries=0,semanticStates=0,protectedPixels=0,glyphStates=0,delayedControls=0;
const rgb=(s:string)=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16)),gold=rgb(PALETTE.focus);
for(const c of t.cues){for(const w of c.words){
 assert(!sourceActive(w,(w.startSample-1)/48000));assert(sourceActive(w,w.startSample/48000));assert(!sourceActive(w,w.endSample/48000));boundaries+=3;
 assert.equal(cueOpacity(c,w.startSample/48000),1);
 for(const target of c.targets){const expected=target.focusSourceIndices.includes(w.sourceIndex);assert.equal(targetActive(target,c.words,(w.startSample+w.endSample)/96000,48000),expected);semanticStates++;}
}}
// Independent language expectations catch partial grammatical highlighting.
const sun=t.cues[0]!;for(const word of ['the','sun'])assert(targetActive(sun.targets.find(x=>x.text===word)!,sun.words,13,48000));
const life=t.cues.find(c=>c.templateId==='live')!;for(const word of ['to','live'])assert(targetActive(life.targets.find(x=>x.text===word)!,life.words,67.5,48000));
const shard=t.cues.find(c=>c.templateId==='shard')!,speaker=shard.targets.find(x=>x.text==='I')!;
assert(targetActive(speaker,shard.words,47.9,48000));assert(targetActive(speaker,shard.words,53.4,48000));assert(!targetActive(speaker,shard.words,52.5,48000));
assert.equal(t.cues.filter(c=>c.templateId==='live').length,11,'Four first-half and seven second-half performances must survive transcription compression.');
for(const format of ['landscape','portrait'] as const){
 const p=COMPOSITION[format],canvas=createCanvas(p.width,p.height),ctx=canvas.getContext('2d'),context=ctx as unknown as CanvasRenderingContext2D;
 for(const c of t.cues){const l=layoutCue(context,c,format);assert(l.size>=48);assert(l.bottom<=p.reading[1]+p.reading[3]+1);
  for(const s of [...l.source,...l.target])assert(s.x>=(format==='portrait'?112:28)&&s.x+s.width<=p.width-(format==='portrait'?112:28),'Glyphs must fit both language lanes.');
  assert(l.bottom<screenFigureGuard(format).top-20,'Lyrics must remain clear of the person.');
  assert(l.bottom+12<=MUSIC_LINE[format].baseline-MUSIC_LINE[format].maxDeviation,'Reserve a stable gap before the music line.');
 }
 const base=createCanvas(p.width,p.height),b=base.getContext('2d'),v=SOURCE_VIEWS[format];b.drawImage(source,v[0],v[1],v[2],v[3],0,0,p.width,p.height);
 paintScene(context,158.7,format,source as unknown as CanvasImageSource);
 const a=ctx.getImageData(0,0,p.width,p.height).data,z=b.getImageData(0,0,p.width,p.height).data,g=screenFigureGuard(format);
 for(let y=Math.ceil(g.top);y<Math.min(p.height,g.bottom);y+=3)for(let x=Math.max(0,Math.ceil(g.left));x<Math.min(p.width,g.right);x+=3){const n=(y*p.width+x)*4;assert.deepEqual(a.slice(n,n+4),z.slice(n,n+4),'Protected person differs from source crop.');protectedPixels++;}
 setEffectsEnabled(false);
 for(const c of t.cues){const l=layoutCue(context,c,format);
  for(const w of c.words){const time=(w.startSample+w.endSample)/96000;paintScene(context,time,format,source as unknown as CanvasImageSource);
   for(const [slots,original] of [[l.source,true],[l.target,false]] as const)for(const s of slots){
    const expected=original?s.index===w.sourceIndex:c.targets[s.index]!.focusSourceIndices.includes(w.sourceIndex);
    ctx.font=`600 ${l.size}px Cormorant`;const metrics=ctx.measureText(s.text);
    const x=Math.max(0,Math.floor(s.x)),y=Math.max(0,Math.floor(s.y-metrics.actualBoundingBoxAscent)),width=Math.min(p.width-x,Math.ceil(s.width)+1),height=Math.max(1,Math.ceil(metrics.actualBoundingBoxAscent+metrics.actualBoundingBoxDescent));
    const data=ctx.getImageData(x,y,width,height).data;let focused=0;
    for(let i=0;i<data.length;i+=4)if(gold.every((v,k)=>Math.abs(data[i+k]!-v)<=2))focused++;
    assert.equal(focused>=4,expected,`Decoded focus mismatch ${format}/${c.id}/${original?'source':'target'}/${s.text} @${time}`);glyphStates++;
   }
   const wrong=time+.24;
   if(sourceActive(w,wrong,48000)!==true)delayedControls++;
  }
 }
 setEffectsEnabled(true);
}
const quiet=visualizerGeometry(8.8),loud=visualizerGeometry(164.7);
assert.equal(quiet.points.length,73);assert(quiet.opacity>.75);assert(loud.points.every(p=>Math.abs(p.deviation)<=20));
assert.equal(quiet.points[0]!.y,MUSIC_LINE.landscape.baseline);assert(Math.abs(quiet.points.at(-1)!.y-MUSIC_LINE.landscape.baseline)<1e-9);
assert(loud.points.reduce((a,p)=>a+Math.abs(p.deviation),0)>quiet.points.reduce((a,p)=>a+Math.abs(p.deviation),0)+30,'The measured chorus must have more reach than the quiet opening.');
const shifted=visualizerGeometry(165.3);assert(loud.points.some((p,i)=>Math.abs(p.y-shifted.points[i]!.y)>.10),'The measured music line must change with the source.');
const layer=read('source/held-release-corrections-v1.1.json');
for(const [id,time,english] of [['RZ-001-s01',10.0,['only']],['RZ-003-s03',33.5,['to','cry']],['RZ-008-s03',69.5,['to','live']],['RZ-012-s03',111.8,['sees']],['RZ-026-s05',205.2,['to','live']]] as const){
 const c=t.cues.find(c=>c.words.some(w=>w.id===id))!,w=c.words.find(w=>w.id===id)!;
 assert(sourceActive(w,time,48000),`Held body must stay focused: ${id} at ${time}`);
 assert(layer.records.find((r:{id:string})=>r.id===id).oldEndSample<time*48000,'The control must detect the original premature release.');
 for(const text of english)assert(targetActive(c.targets.find(w=>w.text===text)!,c.words,time,48000),`Complete English hold: ${text}`);
 for(const format of ['landscape','portrait'] as const){
  const p=COMPOSITION[format],canvas=createCanvas(p.width,p.height),ctx=canvas.getContext('2d');paintScene(ctx as unknown as CanvasRenderingContext2D,time,format,source as unknown as CanvasImageSource);
  const l=layoutCue(ctx as unknown as CanvasRenderingContext2D,c,format);
  for(const slot of [...l.source.filter(s=>s.index===w.sourceIndex),...l.target.filter(s=>english.some(text=>text===c.targets[s.index]!.text))]){
   ctx.font=`600 ${l.size}px Cormorant`;const m=ctx.measureText(slot.text),data=ctx.getImageData(Math.floor(slot.x),Math.floor(slot.y-m.actualBoundingBoxAscent),Math.ceil(slot.width)+1,Math.ceil(m.actualBoundingBoxAscent+m.actualBoundingBoxDescent)).data;let n=0;
   for(let i=0;i<data.length;i+=4)if(gold.every((v,k)=>Math.abs(data[i+k]!-v)<=2))n++;
   assert(n>=4,'Held focus must survive actual glyph paint');glyphStates++;
  }
 }
}

assert(delayedControls>10,'Delayed negative controls must detect short-word mistakes.');
assert.equal(visibleCues(t,220).length,0,'Original instrumental tail must be lyric-free.');
const report={revision:t.revision,sourceSha256:t.sourceSha256,status:'passed',scope:'Source-clock logic, complete semantic expansions, all-token rendered color states, both-layout fit and sampled protected-subject pixels compared exactly. Not an acoustic listening attestation.',boundaries,semanticStates,protectedPixels,glyphStates,delayedClockControls:delayedControls,humanListening:false};
writeFileSync(new URL('evidence/technical-preview-checks.json',root),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
