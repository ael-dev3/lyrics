import raw from './cues.json';
import layouts from './layout.json';
import bands from '../public/science.json';
import {parseData} from './schema.ts';
import {sceneSvg} from './scene.ts';
import {createPreviewPainter} from './preview-painter.ts';
const data=parseData(raw),host=document.getElementById('host')!,output=document.getElementById('result')!;
await document.fonts.load('400 82px LunarSans');await document.fonts.load('400 24px LunarSans');
const painter=createPreviewPainter(host,data,layouts,bands);
const failures:string[]=[];let states=0,glyphs=0;let minimumGap=Infinity;const ctx=document.createElement('canvas').getContext('2d')!;
for(const format of ['landscape','portrait'] as const){
 const l=layouts[format];host.style.width=l.width+'px';host.style.height=l.height+'px';
 for(const cue of data.cues){
  const times=[...new Set([cue.startSample,...cue.fr.flatMap(w=>[Math.round((w.startSample+w.endSample)/2),...[w.startSample,w.endSample].flatMap(s=>[-1,0,1].map(offset=>Math.round((Math.round(s/data.sampleRate*60)+offset)/60*data.sampleRate)))])])].filter(s=>s>=cue.visibleFrom&&s<cue.visibleUntil);let baseline:string|undefined;
  for(const time of times){
   const frame=Math.round(time/data.sampleRate*60);painter.paint(frame,format);states++;const reference=sceneSvg(frame,format,data,layouts,bands);const expected=new Map([...reference.matchAll(/data-word="([^"]+)"[^>]*fill="([^"]+)"/g)].map(m=>[m[1],m[2]]));for(const word of host.querySelectorAll('[data-word]'))if(word.getAttribute('fill')!==expected.get(word.getAttribute('data-word')??''))failures.push(`${format}/${cue.id}: painter focus mismatch`);const referenceDoc=new DOMParser().parseFromString(reference,'image/svg+xml');for(const id of ['scene-content','title-layer','moon-light','moon-atmosphere','moon-shade','instrumental-ripple'])for(const attr of ['opacity','r'])if(host.querySelector('#'+id)?.getAttribute(attr)!==referenceDoc.querySelector('#'+id)?.getAttribute(attr))failures.push('Lunar painter mismatch: '+id+'/'+attr);const referencePose=/id="art-pose" transform="([^"]+)"/.exec(reference)?.[1];if(host.querySelector('#art-pose')?.getAttribute('transform')!==referencePose)failures.push('Painter pose mismatch');
   const expectedBars=new Map([...reference.matchAll(/<path data-band="([^"]+)" d="([^"]+)"/g)].map(m=>[m[1],m[2]]));
   for(const bar of host.querySelectorAll('[data-band]'))if(bar.getAttribute('d')!==expectedBars.get(bar.getAttribute('data-band')??''))failures.push('Painter spectrum mismatch');
   const words=[...host.querySelectorAll<SVGTextElement>('text[data-word]')];
   if(words.length!==cue.fr.length+cue.en.length)failures.push(`${format}/${cue.id}: incomplete visible text`);
   const boxes=words.map(w=>{const r=w.getBBox();ctx.font=`400 ${l.fontSize}px LunarSans`;const ink=ctx.measureText(w.textContent??'');const baseline=Number(w.getAttribute('y'));return {id:w.dataset.word!,x:r.x,y:baseline-ink.actualBoundingBoxAscent,width:r.width,height:ink.actualBoundingBoxAscent+ink.actualBoundingBoxDescent,baseline};});glyphs+=boxes.length;
   const signature=JSON.stringify(boxes);if(baseline&&baseline!==signature)failures.push(`${format}/${cue.id}: glyph movement`);baseline=signature;
   for(const b of boxes)if(b.x<l.safeX-1||b.x+b.width>l.width-l.safeX+1||b.y<200||b.y+b.height>l.height-86)failures.push(`${format}/${b.id}: safe-area violation`);
   for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i]!,b=boxes[j]!;if(Math.abs(a.baseline-b.baseline)<1){const gap=Math.max(a.x,b.x)-Math.min(a.x+a.width,b.x+b.width);minimumGap=Math.min(minimumGap,gap);if(gap<0)failures.push(`${format}: horizontal overlap ${a.id}/${b.id}`);}else if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)failures.push(`${format}: vertical overlap ${a.id}/${b.id}`);}
  }
 }
}
host.replaceChildren();output.textContent=JSON.stringify({status:failures.length?'FAIL':'PASS',states,glyphs,minimumSameRowGap:minimumGap,failureCount:new Set(failures).size,failures:[...new Set(failures)].slice(0,15),method:'Browser SVG horizontal bounds plus Canvas actual ink ascent/descent with bundled actual fonts; persistent preview painter checked against static scene output at word midpoints and onset/end boundary frames in both formats. Does not certify actual audio.'},null,2);
