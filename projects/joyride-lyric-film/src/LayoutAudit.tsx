import React,{useEffect} from 'react';
import {useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';
import {Film,ensureFonts} from './Film';
import cues from './cues.json';
import {parseCues} from './schema';
import {layout} from './config';
const data=parseCues(cues);
export const LayoutAudit:React.FC<{portrait?:boolean}>=({portrait=false})=>{
 const f=useCurrentFrame(),c=data[Math.floor(f/2)];
 useEffect(()=>{const handle=delayRender('Measure English lyric geometry');if(!c){cancelRender(Error('No cue'));return;}ensureFonts().then(()=>new Promise<void>(r=>requestAnimationFrame(()=>r()))).then(()=>{
  const words=Array.from(document.querySelectorAll<HTMLElement>('[data-lyrics] [data-word]')).map(w=>{const b=w.getBoundingClientRect(),L=layout(portrait);if(b.left<L.lyricLeft-2||b.right>L.lyricLeft+L.lyricWidth+2||b.top<L.lyricTop-2||b.bottom>L.lyricBottom)throw Error(`Overflow ${c.id}: ${JSON.stringify(b)}`);return [b.x,b.y,b.width,b.height];});
  if(words.length!==c.words.length)throw Error('Missing glyphs '+c.id);
  console.log('LAYOUT_OK '+JSON.stringify({cue:c.id,state:f%2,words}));continueRender(handle);
 }).catch(cancelRender);},[f,c,portrait]);
 if(!c)return null;
 return <Film portrait={portrait} forceCue={Math.floor(f/2)} forceActive={f%2===1} sampleFrame={Math.round(c.startSample/800)+3} staticBackground/>;
};
