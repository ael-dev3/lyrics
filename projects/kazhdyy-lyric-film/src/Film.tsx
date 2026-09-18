import React,{useEffect,useLayoutEffect,useRef,useState} from 'react';
import {AbsoluteFill,Composition,registerRoot,useCurrentFrame,delayRender,continueRender,staticFile} from 'remotion';
import raw from './cues.json';
import layouts from './layout.json';
import bands from '../public/science.json';
import {parseData} from './schema.ts';
import type {Format} from './schema.ts';
import {createPreviewPainter} from './preview-painter.ts';
import {shadowSeed} from './shadows.ts';
const data=parseData(raw);
// The same persistent painter used in the approved browser avoids rebuilding
// expensive SVG filters on frames where only word focus or bar height changes.
function Film({format='landscape'}:{format?:Format}){
 const frame=useCurrentFrame(),host=useRef<HTMLDivElement>(null),painter=useRef<ReturnType<typeof createPreviewPainter>|null>(null);
 const [handle]=useState(()=>delayRender('Load approved artwork and fonts'));
 useLayoutEffect(()=>{
  if(!host.current)return;
  painter.current??=createPreviewPainter(host.current,data,layouts,bands);
  painter.current.paint(frame,format);
  const art=host.current.querySelector('#art-pose')!;art.setAttribute('transform','translate(0 0)');
  const src=staticFile(`render-cache/${format}/seed-${shadowSeed(frame)}.png`);
  let cached=art.querySelector('image[data-raster]');
  if(!cached){art.replaceChildren();cached=document.createElementNS('http://www.w3.org/2000/svg','image');cached.setAttribute('data-raster','true');cached.setAttribute('width',format==='landscape'?'910':'1080');cached.setAttribute('height',format==='landscape'?'1080':'1020');art.appendChild(cached);}
  if(cached.getAttribute('href')!==src){const ready=delayRender('Load exact artwork raster');const image=new Image();image.onload=()=>continueRender(ready);image.src=src;cached.setAttribute('href',src);}
 },[frame,format]);
 useEffect(()=>{let active=true;Promise.all([
  new FontFace('LyricSans',`url(${staticFile('Oswald-Medium.ttf')})`,{weight:'500'}).load(),
  new FontFace('LyricSans',`url(${staticFile('Oswald-Bold.ttf')})`,{weight:'700'}).load(),
  new Promise<void>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve();image.onerror=reject;image.src=staticFile('artwork.png');})
 ]).then(([regular,bold])=>{document.fonts.add(regular);document.fonts.add(bold);if(active)continueRender(handle);});return()=>{active=false;};},[handle]);
 return <AbsoluteFill ref={host}/>;
}
function Root(){return <>{(['landscape','portrait'] as const).map(format=><Composition key={format} id={format} component={Film} fps={data.fps} durationInFrames={data.frames} width={format==='landscape'?1920:1080} height={format==='landscape'?1080:1920} defaultProps={{format}}/>)}</>;}
registerRoot(Root);
