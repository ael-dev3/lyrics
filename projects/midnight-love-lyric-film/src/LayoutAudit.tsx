import React,{useEffect} from 'react';
import {useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';
import {Film,ensureFonts} from './Film';
import cues from './cues.json';
import {parseCues} from './schema';
const data=parseCues(cues);
export const LayoutAudit:React.FC<{portrait?:boolean}>=({portrait=false})=>{
 const f=useCurrentFrame(),c=data[Math.floor(f/2)];
 useEffect(()=>{const handle=delayRender('Measure English lyric geometry');if(!c){cancelRender(Error('No cue'));return;}ensureFonts().then(()=>new Promise<void>(r=>requestAnimationFrame(()=>r()))).then(()=>{
  const words=Array.from(document.querySelectorAll<HTMLElement>('[data-lyrics] [data-word]')).map(w=>{const b=w.getBoundingClientRect();if(b.left<(portrait?67:1071)||b.right>(portrait?933:1827)||b.top<(portrait?1166:444)||b.bottom>(portrait?1510:803))throw Error(`Overflow ${c.id}: ${JSON.stringify(b)}`);return [b.x,b.y,b.width,b.height];});
  if(words.length!==c.words.length)throw Error('Missing glyphs '+c.id);
  console.log('LAYOUT_OK '+JSON.stringify({cue:c.id,state:f%2,words}));continueRender(handle);
 }).catch(cancelRender);},[f,c,portrait]);
 if(!c)return null;
 return <Film portrait={portrait} forceCue={Math.floor(f/2)} forceActive={f%2===1} sampleFrame={Math.round(c.startSample/800)+3} staticBackground/>;
};
