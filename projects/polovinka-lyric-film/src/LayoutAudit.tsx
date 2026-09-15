import React,{useEffect} from 'react';
import {useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';
import {Film,ensureFonts} from './Film';
import {cues} from './timing';
import {layout} from './config';
export const LayoutAudit:React.FC<{portrait?:boolean}>=({portrait=false})=>{
 const f=useCurrentFrame(),c=cues[Math.floor(f/2)];
 useEffect(()=>{const handle=delayRender('Measure bilingual geometry');if(!c){cancelRender(Error('No cue'));return;}ensureFonts().then(()=>new Promise<void>(r=>requestAnimationFrame(()=>r()))).then(()=>{
  const L=layout(portrait),rows=['ru','en'].map(lang=>{
   const parent=document.querySelector<HTMLElement>('[data-lyrics="'+lang+'"]');if(!parent)throw Error('Missing language');
   const style=getComputedStyle(parent);
   const words=Array.from(parent.querySelectorAll<HTMLElement>('[data-word]')).map(w=>{const b=w.getBoundingClientRect(),top=lang==='ru'?L.ruTop:L.enTop,bottom=lang==='ru'?L.enTop-24:L.baseline-(portrait?155:75);if(b.left<L.left-2||b.right>L.left+L.lyricWidth+2||b.top<top-16||b.bottom>bottom)throw Error(`Overflow ${c.id} ${lang}: ${JSON.stringify(b)}`);return [b.x,b.y,b.width,b.height];});
   const expected=lang==='ru'?c.ru.length:c.en.reduce((n,g)=>n+g.text.split(' ').length,0);if(words.length!==expected)throw Error('Missing words');
   return {lang,font:style.fontFamily,size:style.fontSize,weight:style.fontWeight,words};
  });
  if(rows[0]!.size!==rows[1]!.size||rows[0]!.weight!==rows[1]!.weight)throw Error('Bilingual mismatch');
  console.log('LAYOUT_OK '+JSON.stringify({cue:c.id,state:f%2,words:rows.flatMap(r=>r.words),languages:rows}));continueRender(handle);
 }).catch(cancelRender);},[f,c,portrait]);
 if(!c)return null;
 return <Film portrait={portrait} forceCue={Math.floor(f/2)} forceActive={f%2===1} sampleFrame={Math.ceil(c.startSample/800)+3} staticBackground/>;
};
