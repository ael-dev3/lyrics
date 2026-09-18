import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Composition,registerRoot,useCurrentFrame,delayRender,continueRender,cancelRender,staticFile} from 'remotion';
import raw from './cues.json';import layouts from './layout.json';import bands from '../public/science.json';import {parseData} from './schema.ts';import type {Format} from './schema.ts';import {sceneSvg} from './scene.ts';import {palette} from './palette.ts';import {rasterEntries} from './raster-inventory.ts';
const data=parseData(raw);
function Layer({format='landscape'}:{format?:Format}){
 const frame=useCurrentFrame(),entry=rasterEntries[frame]!,[markup,setMarkup]=useState(''),[ready]=useState(()=>delayRender('Load raster cache inputs'));
 useEffect(()=>{Promise.all([new FontFace('LunarSans',`url(${staticFile('fonts/SpaceGrotesk.ttf')})`,{weight:'400'}).load(),new Promise<void>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve();image.onerror=reject;image.src=staticFile('moon-v2.png');})]).then(([font])=>{document.fonts.add(font);continueRender(ready);}).catch(cancelRender);},[ready]);
 useEffect(()=>{
  const handle=delayRender('Select exact scene layer'),cue=data.cues.find(c=>c.id===entry.cueId),at=cue?Math.ceil(cue.startSample/data.sampleRate*60):480;
  const dom=new DOMParser().parseFromString(sceneSvg(at,format,data,layouts,bands),'image/svg+xml'),svg=dom.documentElement,content=svg.querySelector('#scene-content')!;
  const nodes=entry.layer==='stars'?[...content.children].filter(n=>n.tagName==='circle'&&!n.id):entry.layer==='labels'?[...content.children].filter(n=>(n.tagName==='g'||n.tagName==='text')&&!n.id&&!n.querySelector('[data-band]')):[svg.querySelector('#'+entry.layer)!];
  if(nodes.some(n=>!n))throw Error('Missing cache layer');
  for(const n of nodes)if(n.id)n.setAttribute('opacity','1');
  if(cue)for(const word of [...nodes[0]!.querySelectorAll('[data-word]')]){const id=word.getAttribute('data-word'),active=id===entry.active||cue.en.some(w=>w.id===id&&w.sourceIds.includes(entry.active));word.setAttribute('fill',active?palette.accent:palette.ivory);}
  const defs=svg.querySelector('defs')!;svg.replaceChildren(defs,...nodes);svg.querySelector('image')?.setAttribute('href',staticFile('moon-v2.png'));
  setMarkup(new XMLSerializer().serializeToString(svg));continueRender(handle);
 },[entry,format]);
 return <AbsoluteFill style={{backgroundColor:'transparent'}} dangerouslySetInnerHTML={{__html:markup}}/>;
}
registerRoot(()=> <>{(['landscape','portrait'] as const).map(format=><Composition key={format} id={'cache-'+format} component={Layer} fps={60} durationInFrames={rasterEntries.length} width={format==='landscape'?1920:1080} height={format==='landscape'?1080:1920} defaultProps={{format}}/>)}</>);
