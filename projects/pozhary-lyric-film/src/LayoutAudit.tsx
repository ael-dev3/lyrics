import React,{useEffect} from 'react';
import {useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';
import {Film,ensureFonts} from './Film';
import cues from './cues.json';
export const LayoutAudit:React.FC<{portrait?:boolean}>=({portrait=false})=>{
 const f=useCurrentFrame(),c=cues[Math.floor(f/2)]!;
 useEffect(()=>{const handle=delayRender('Measure lyric geometry');ensureFonts().then(()=>new Promise<void>(r=>requestAnimationFrame(()=>r()))).then(()=>{
  const inspect=(selector:string,top:number,bottom:number)=>Array.from(document.querySelectorAll<HTMLElement>(selector)).map(w=>{const b=w.getBoundingClientRect();if(b.left<(portrait?61:95)||b.right>(portrait?921:959)||b.top<top||b.bottom>bottom)throw Error(`Overflow ${c.id}: ${JSON.stringify(b)}`);return [b.x,b.y,b.width,b.height];});
  const ru=inspect('[data-russian] [data-word]',portrait?1111:394,portrait?1360:654),en=inspect('[data-english] [data-meaning]',portrait?1399:684,portrait?1490:814);
  if(ru.length!==c.words.length||en.length!==c.en.length)throw Error('Missing glyphs '+c.id);
  console.log('LAYOUT_OK '+JSON.stringify({cue:c.id,state:f%2,ru,en}));continueRender(handle);
 }).catch(cancelRender);},[f,c,portrait]);
 return <Film portrait={portrait} forceCue={Math.floor(f/2)} forceActive={f%2===1} sampleFrame={Math.round(c.startSample/800)+3}/>;
};
