import raw from './cues.json';
import layouts from './layout.json';
import bands from '../public/science.json';
import {parseData} from './schema.ts';
import {sceneSvg} from './scene.ts';
const data=parseData(raw),host=document.getElementById('host')!,output=document.getElementById('result')!;
await document.fonts.load('500 82px LyricSans');await document.fonts.load('700 116px LyricSans');
const failures:string[]=[];let states=0,glyphs=0;let minimumGap=Infinity;const ctx=document.createElement('canvas').getContext('2d')!;
for(const format of ['landscape','portrait'] as const){
 const l=layouts[format];host.style.width=l.width+'px';host.style.height=l.height+'px';
 for(const cue of data.cues){
  const times=[cue.startSample,...cue.ru.map(w=>Math.round((w.startSample+w.endSample)/2))];let baseline:string|undefined;
  for(const time of times){
   host.innerHTML=sceneSvg(Math.round(time/data.sampleRate*60),format,data,layouts,bands);states++;
   const words=[...host.querySelectorAll<SVGTextElement>('text[data-word]')];
   if(words.length!==cue.ru.length+cue.en.length)failures.push(`${format}/${cue.id}: incomplete visible text`);
   const boxes=words.map(w=>{const r=w.getBBox();ctx.font=`500 ${l.fontSize}px LyricSans`;const ink=ctx.measureText(w.textContent??'');const baseline=Number(w.getAttribute('y'));return {id:w.dataset.word!,x:r.x,y:baseline-ink.actualBoundingBoxAscent,width:r.width,height:ink.actualBoundingBoxAscent+ink.actualBoundingBoxDescent,baseline};});glyphs+=boxes.length;
   const signature=JSON.stringify(boxes);if(baseline&&baseline!==signature)failures.push(`${format}/${cue.id}: glyph movement`);baseline=signature;
   for(const b of boxes)if(b.x<l.safeX-1||b.x+b.width>l.width-l.safeX+1||b.y<200||b.y+b.height>l.height-86)failures.push(`${format}/${b.id}: safe-area violation`);
   for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i]!,b=boxes[j]!;if(Math.abs(a.baseline-b.baseline)<1){const gap=Math.max(a.x,b.x)-Math.min(a.x+a.width,b.x+b.width);minimumGap=Math.min(minimumGap,gap);if(gap<0)failures.push(`${format}: horizontal overlap ${a.id}/${b.id}`);}else if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)failures.push(`${format}: vertical overlap ${a.id}/${b.id}`);}
  }
 }
}
host.replaceChildren();output.textContent=JSON.stringify({status:failures.length?'FAIL':'PASS',states,glyphs,minimumSameRowGap:minimumGap,failureCount:new Set(failures).size,failures:[...new Set(failures)].slice(0,15),method:'Browser SVG horizontal bounds plus Canvas actual ink ascent/descent with bundled actual fonts; complete cue geometry through every source focus state in both formats. Does not certify actual audio.'},null,2);
