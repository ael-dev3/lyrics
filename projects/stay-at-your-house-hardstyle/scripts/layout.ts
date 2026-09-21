import {GlobalFonts,createCanvas} from '@napi-rs/canvas';
import {readFileSync,writeFileSync} from 'node:fs';
import {parseData} from '../src/schema.ts';
import type {Layouts,CueLayout} from '../src/layout-types.ts';
GlobalFonts.registerFromPath('public/SpaceGrotesk.ttf','StaySans');
const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8'))),ctx=createCanvas(10,10).getContext('2d');
const output={} as Layouts;
for(const format of ['landscape','portrait'] as const){const portrait=format==='portrait',width=portrait?1080:1920,height=portrait?1920:1080,safeX=portrait?84:100,maxWidth=portrait?912:1030,fontSize=portrait?74:76;
 ctx.font=`600 ${fontSize}px StaySans`;const gap=ctx.measureText(' ').width,cues:Record<string,CueLayout>={};
 for(const cue of data.cues){let rows:{id:string;text:string;width:number}[][]=[[]];let used=0;
  for(const w of cue.source){const text=w.text,width=ctx.measureText(text).width;
   if(used+gap+width>maxWidth&&rows.at(-1)!.length){rows.push([]);used=0;}
   rows.at(-1)!.push({id:w.id,text,width});used+=(used?gap:0)+width;
  }
  if(rows.length>3)throw Error('Too many rows '+cue.id);
  // Balance the fixed lines before playback; avoid a final one-word orphan.
  const words=rows.flat(),count=rows.length,target=(words.reduce((sum,w)=>sum+w.width,0)+gap*(words.length-count))/count;
  let best=Infinity,bestRows=rows;
  function partition(start:number,remaining:number,chosen:typeof rows,cost:number){
   if(!remaining){if(start===words.length&&cost<best){best=cost;bestRows=chosen;}return;}
   let width=0;
   for(let end=start;end<=words.length-remaining;end++){width+=words[end]!.width+(end>start?gap:0);if(width>maxWidth)break;
    const row=words.slice(start,end+1),orphan=row.length===1&&words.length>2?maxWidth*maxWidth*.6:0;
    const dangling=remaining>1&&/^(a|the|at|to|your|in|of|for|and)$/i.test(row.at(-1)!.text)?maxWidth*maxWidth*.15:0;
    partition(end+1,remaining-1,[...chosen,row],cost+(width-target)**2+orphan+dangling);
   }
  }
  partition(0,count,[],0);rows=bestRows;

  const centerY=portrait?1350:745,baseline=centerY-(rows.length-1)*fontSize*.64;
  const source=rows.flatMap((row,j)=>{const rowWidth=row.reduce((s,w)=>s+w.width,0)+(row.length-1)*gap;let x=portrait?(width-rowWidth)/2:safeX;
   return row.map(w=>{const box={...w,x,y:baseline+j*fontSize*1.28};x+=w.width+gap;return box;});});
  cues[cue.id]={fontSize,source,rows:rows.length};
 }
 output[format]={width,height,safeX,cues};
}
writeFileSync('src/layout.json',JSON.stringify(output,null,2)+'\n');console.log('Stable geometry reserved in both formats');
