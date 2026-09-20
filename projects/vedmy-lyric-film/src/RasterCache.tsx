import {useEffect,useState} from 'react';
import {AbsoluteFill,Composition,registerRoot,useCurrentFrame,delayRender,continueRender,cancelRender,staticFile} from 'remotion';
import raw from './cues.json';import layouts from './layout.json';import bands from '../public/science.json';import {parseData} from './schema.ts';import type {Format} from './schema.ts';import {sceneSvg} from './scene.ts';import {paletteAt} from './palette.ts';import {sourceFocusIds,targetFocusIds} from './focus.ts';import {rasterEntries} from './raster-inventory.ts';
const data=parseData(raw);
function Layer({format='landscape'}:{format?:Format}){
 const entry=rasterEntries[useCurrentFrame()]!,[markup,setMarkup]=useState(''),[ready]=useState(()=>delayRender('Raster font and artwork'));
 useEffect(()=>{Promise.all([new FontFace('EmberSerif',`url(${staticFile('fonts/CormorantGaramond-Semibold.ttf')})`,{weight:'600'}).load(),new Promise<void>((ok,fail)=>{const img=new Image();img.onload=()=>ok();img.onerror=fail;img.src=staticFile('artwork.png');})]).then(([font])=>{document.fonts.add(font);continueRender(ready);}).catch(cancelRender);},[ready]);
 useEffect(()=>{const h=delayRender('Scene layer');try{const cue=data.cues.find(c=>c.id===entry.cueId),at=cue?Math.round((cue.startSample+cue.endSample)/2/data.sampleRate*60):600,dom=new DOMParser().parseFromString(sceneSvg(at,format,data,layouts,bands),'image/svg+xml'),svg=dom.documentElement,defs=svg.querySelector('defs')!;
 if(entry.layer==='background'){svg.querySelectorAll('text,[data-leaf],[data-band]').forEach(n=>n.remove());}
 else if(entry.layer==='labels'){const idle=svg.querySelector('[data-idle]')!,group=idle.parentElement!,footer=svg.lastElementChild!;idle.remove();svg.replaceChildren(defs,group,footer);}
 else if(entry.layer==='idle'){const idle=svg.querySelector('[data-idle]')!,group=idle.parentElement!;group.replaceChildren(idle);idle.setAttribute('opacity','1');svg.replaceChildren(defs,group);}
 else if(cue){const group=svg.querySelector('[data-word]')!.parentElement!,p=paletteAt(0),ids=new Set(entry.active?sourceFocusIds(cue,entry.active):[]);for(const w of group.querySelectorAll('[data-word]')){const id=w.getAttribute('data-word')!,active=ids.has(id)||cue.en.some(e=>e.id===id&&targetFocusIds(e).includes(entry.active));w.setAttribute('fill',active?p.active:p.rest);}svg.replaceChildren(defs,group);}
 svg.querySelector('image')?.setAttribute('href',staticFile('artwork.png'));setMarkup(new XMLSerializer().serializeToString(svg));continueRender(h);}catch(error){cancelRender(error);}},[entry,format]);
 return <AbsoluteFill style={{backgroundColor:'transparent'}} dangerouslySetInnerHTML={{__html:markup}}/>;
}
registerRoot(()=> <>{(['landscape','portrait'] as const).map(format=><Composition key={format} id={'cache-'+format} component={Layer} fps={60} durationInFrames={rasterEntries.length} width={format==='landscape'?1920:1080} height={format==='landscape'?1080:1920} defaultProps={{format}}/>)}</>);
