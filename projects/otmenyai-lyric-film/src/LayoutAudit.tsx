import {useEffect} from 'react';
import {useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';
import {Film,ensureFonts} from './Film';
import cues from './cues.json';
export const LayoutAudit=()=>{
 const f=useCurrentFrame(),c=cues[Math.floor(f/2)]!;
 const sampleFrame=Math.round(((f%2?c.words.at(-1)!.startSample:c.startSample)+1600)/800);
 useEffect(()=>{const handle=delayRender('Layout geometry');ensureFonts().then(()=>new Promise<void>(r=>requestAnimationFrame(()=>r()))).then(()=>{
 const ru=Array.from(document.querySelectorAll<HTMLElement>('[data-russian] [data-word]')).map(w=>{const b=w.getBoundingClientRect();if(b.left<87||b.right>1024||b.top<395||b.bottom>660)throw Error(`Russian overflow ${c.id}: ${JSON.stringify(b)}`);return [b.x,b.y,b.width,b.height];});
 const en=Array.from(document.querySelectorAll<HTMLElement>('[data-english] span')).map(w=>{const b=w.getBoundingClientRect();if(b.left<87||b.right>1024||b.top<660||b.bottom>790)throw Error(`English overflow ${c.id}: ${JSON.stringify(b)}`);return [b.x,b.y,b.width,b.height];});
 if(ru.length!==c.words.length||en.length!==c.en.length)throw Error('Missing lyric glyphs '+c.id);
 console.log('LAYOUT_OK '+JSON.stringify({cue:c.id,state:f%2,ru,en}));continueRender(handle);
 }).catch(cancelRender);},[f,c]);return <Film sampleFrame={sampleFrame}/>;
};
