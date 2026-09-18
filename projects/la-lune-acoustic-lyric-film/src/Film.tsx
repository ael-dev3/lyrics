import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {AbsoluteFill,Composition,registerRoot,useCurrentFrame,delayRender,continueRender,cancelRender,staticFile} from 'remotion';
import raw from './cues.json';
import layouts from './layout.json';
import bands from '../public/science.json';
import {parseData} from './schema.ts';
import type {Format} from './schema.ts';
import {createPreviewPainter} from './preview-painter.ts';
const data=parseData(raw);
export function Film({format='landscape'}:{format?:Format}){
 const frame=useCurrentFrame(),host=useRef<HTMLDivElement>(null),painter=useRef<ReturnType<typeof createPreviewPainter>|null>(null);
 const [handle]=useState(()=>delayRender('Load approved lunar artwork and font'));
 useLayoutEffect(()=>{
  if(!host.current)return;
  painter.current??=createPreviewPainter(host.current,data,layouts,bands);
  painter.current.paint(frame,format);
  const image=host.current.querySelector('image');
  if(image?.getAttribute('href')==='/public/moon-v2.png')image.setAttribute('href',staticFile('moon-v2.png'));
 },[frame,format]);
 useEffect(()=>{let active=true;Promise.all([
  new FontFace('LunarSans',`url(${staticFile('fonts/SpaceGrotesk.ttf')})`,{weight:'400'}).load(),
  new Promise<void>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve();image.onerror=()=>reject(Error('Moon artwork unavailable'));image.src=staticFile('moon-v2.png');})
 ]).then(([font])=>{document.fonts.add(font);if(active)continueRender(handle);}).catch(cancelRender);return()=>{active=false;};},[handle]);
 return <AbsoluteFill ref={host}/>;
}
function Root(){return <>{(['landscape','portrait'] as const).map(format=><Composition key={format} id={format} component={Film} fps={data.fps} durationInFrames={data.frames} width={format==='landscape'?1920:1080} height={format==='landscape'?1080:1920} defaultProps={{format}}/>)}</>;}
registerRoot(Root);
