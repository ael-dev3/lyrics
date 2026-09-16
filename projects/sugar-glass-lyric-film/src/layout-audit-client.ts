import raw from './cues.json';
import layouts from './layout.json';
import {parseData} from './schema.ts';
import {sceneSvg} from './scene.ts';
import {frameAt,visibleCues} from './focus.ts';
const data=parseData(raw),holder=document.getElementById('holder'),result=document.getElementById('result');if(!holder||!result)throw Error('Audit elements missing');
await document.fonts.load('600 72px LyricSerif');
const findings:string[]=[];let words=0,cueLayouts=0,overlapStates=0,maxWidthDifference=0;
for(const format of ['landscape','portrait'] as const){const l=layouts[format];
 const visited=new Set<string>();
 for(const cue of data.cues){const frame=frameAt(cue.startSample,data.sampleRate,data.fps);holder.innerHTML=sceneSvg(frame,format,data,layouts,[]);cueLayouts++;
  for(const text of holder.querySelectorAll<SVGTextElement>('[data-word]')){
   const id=text.dataset.word;if(!id)throw Error('No word identity');const owner=data.cues.find(c=>c.source.some(w=>w.id===id)||c.target.some(w=>w.id===id));if(!owner)throw Error('Unknown word');const pos=l.cues[owner.id as keyof typeof l.cues];const box=[...pos.source,...pos.target].find(b=>b.id===id);if(!box)throw Error('No layout box');
   const r=text.getBBox(),delta=Math.abs(text.getComputedTextLength()-box.width);maxWidthDifference=Math.max(maxWidthDifference,delta);words++;
   if(r.x<l.safeX-2||r.x+r.width>l.width-l.safeX+2||r.y<0||r.y+r.height>l.height) findings.push(format+' '+id+' clipped');
   if(delta>3) findings.push(format+' '+id+' browser width differs by '+delta.toFixed(3));
  }
 }
 for(let f=0;f<data.frames;f++){const visible=visibleCues(data,f);if(visible.length<2)continue;const key=visible.map(c=>c.id).join(':');if(visited.has(key))continue;visited.add(key);overlapStates++;holder.innerHTML=sceneSvg(f,format,data,layouts,[]);
  const groups=[...holder.querySelectorAll<SVGGElement>('[data-cue]')];for(let i=0;i<groups.length;i++)for(let j=i+1;j<groups.length;j++){const a=groups[i]?.getBBox(),b=groups[j]?.getBBox();if(a&&b&&a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)findings.push(format+' overlapping vocal lanes '+key);}
 }
}
holder.replaceChildren();result.textContent=JSON.stringify({status:findings.length?'failed':'passed',cueLayouts,wordBoxes:words,overlapStates,maxWidthDifference,findings},null,2);
