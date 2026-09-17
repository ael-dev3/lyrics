import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Composition,registerRoot,useCurrentFrame,delayRender,continueRender,staticFile} from 'remotion';
import raw from './cues.json';
import layouts from './layout.json';
import bands from '../public/science.json';
import {parseData} from './schema.ts';
import type {Format} from './schema.ts';
import {sceneSvg} from './scene.ts';
import events from '../public/shadow-events.json';
import {palette} from './palette.ts';
const data=parseData(raw),frames=[0,...events.events.flatMap(e=>[e.frame,e.frame+2,e.frame+4])];
function Artwork({format='landscape'}:{format?:Format}){
 const frame=frames[useCurrentFrame()]!,portrait=format==='portrait',width=portrait?1080:910,height=portrait?1020:1080;
 const source=sceneSvg(frame,format,data,layouts,bands),defs=source.match(/<defs>[\s\S]*?<\/defs>/)![0],art=source.match(/<g id="art-pose"[\s\S]*?<\/g><\/g>/)![0];
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${defs}<rect width="${width}" height="${height}" fill="${palette.ink}"/>${art}</svg>`.replaceAll('/public/artwork.png',staticFile('artwork.png'));
 const [handle]=useState(()=>delayRender('Load source artwork'));
 useEffect(()=>{const image=new Image();image.onload=()=>continueRender(handle);image.src=staticFile('artwork.png');},[handle]);
 return <AbsoluteFill dangerouslySetInnerHTML={{__html:svg}}/>;
}
function Root(){return <>{(['landscape','portrait'] as const).map(format=><Composition key={format} id={format} component={Artwork} fps={60} durationInFrames={frames.length} width={format==='landscape'?910:1080} height={format==='landscape'?1080:1020} defaultProps={{format}}/>)}</>;}
registerRoot(Root);
