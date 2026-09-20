import {timedLyrics as data} from './timed-lyrics.ts';
import rawLayouts from './layout.json';import bands from '../public/science.json';import type {Layouts} from './layout-types.ts';
const layouts:Layouts=rawLayouts;
import {sceneSvg} from './scene.ts';
await document.fonts.load('600 74px EmberSerif');
const stage=document.getElementById('audit-stage'),output=document.getElementById('result');
if(!stage||!output)throw Error('Audit DOM unavailable');
const issues:string[]=[];let glyphs=0,maxMetricDifference=0,scenes=0;
for(const format of ['landscape','portrait'] as const){const l=layouts[format];for(const cue of data.cues){
 stage.innerHTML=sceneSvg(Math.round((cue.startSample+cue.endSample)/2/data.sampleRate*60),format,data,layouts,bands);
 const boxes=[...stage.querySelectorAll<SVGTextElement>('[data-word]')].map(el=>({id:el.dataset.word,lang:el.dataset.language,b:el.getBBox(),element:el}));
 for(const word of boxes){glyphs++;const b=word.b;
  if(b.x<l.safeX||b.x+b.width>l.width-l.safeX||b.y<0||b.y+b.height>l.height-140)issues.push('Bounds '+word.id+'/'+format);
  const planned=[...(l.cues[cue.id]?.ru??[]),...(l.cues[cue.id]?.en??[])].find(w=>w.id===word.id);if(planned)maxMetricDifference=Math.max(maxMetricDifference,Math.abs(planned.width-b.width));
  for(const other of boxes)if(word.id!==other.id&&word.id&&other.id&&word.id<other.id&&Math.min(b.x+b.width,other.b.x+other.b.width)>Math.max(b.x,other.b.x)+.5&&Math.min(b.y+b.height,other.b.y+other.b.height)>Math.max(b.y,other.b.y)+.5)issues.push('Overlap '+word.id+'/'+other.id+'/'+format);
 }
 scenes++;
}}
const result={status:issues.length?'FAIL':'PASS',scenes,glyphs,maxMetricDifference,issues,scope:'Actual browser SVG glyph bounds with the bundled Cyrillic-capable font; both full-format layouts.'};
output.textContent=JSON.stringify(result,null,2);stage.innerHTML='';
