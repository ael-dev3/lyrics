import {useEffect} from 'react';
import {useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';
import {Film,ensureFonts} from './Film';
import cues from './cues.json';
const saved=new Map<string,string>();
export const LayoutAudit=()=>{
 const frame=useCurrentFrame();
 const cue=cues[Math.floor(frame/2)]??cues[0];
 const sampleTime=cue?cue.start+Math.min(.1+frame%2*.15,(cue.end-cue.start)*.6):0;
 useEffect(()=>{const h=delayRender('Layout audit');ensureFonts().then(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()))).then(()=>{
  const boxes=Array.from(document.querySelectorAll<HTMLElement>('[data-cue]')).map(el=>{
   const r=el.getBoundingClientRect();const lang=el.dataset.cue?.startsWith('fr')?'fr':'en';
   const words=Array.from(el.querySelectorAll<HTMLElement>('[data-word]')).map(w=>{const p=w.getBoundingClientRect();if(p.left<75||p.right>997||p.bottom>(lang==='fr'?555:814))throw Error('Lyric overflow '+el.dataset.cue);return {x:p.x,y:p.y,width:p.width,height:p.height};});
   const key=el.dataset.cue??'',serialized=JSON.stringify(words),before=saved.get(key);
   if(before&&before!==serialized)throw Error('Glyph movement on focus '+key);saved.set(key,serialized);return {key,words:words.length,width:r.width};
  });console.log('LAYOUT_OK '+JSON.stringify({frame,boxes}));continueRender(h);
 }).catch(cancelRender);},[frame]);
 return <Film sampleTime={sampleTime}/>;
};
