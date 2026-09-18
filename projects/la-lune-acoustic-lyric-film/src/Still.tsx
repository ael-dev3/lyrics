import React,{useEffect,useState} from 'react';
import {AbsoluteFill,delayRender,continueRender,staticFile} from 'remotion';
import raw from './cues.json';
import layouts from './layout.json';
import bands from '../public/science.json';
import {parseData} from './schema.ts';
import type {Format} from './schema.ts';
import {sceneSvg} from './scene.ts';
const data=parseData(raw);
export function PreviewStill({format='landscape',at=46.8}:{format?:Format;at?:number}){
 const [handle]=useState(()=>delayRender('Load preview artwork and both bundled fonts'));
 useEffect(()=>{let active=true;Promise.all([
  new FontFace('LunarSans',`url(${staticFile('fonts/SpaceGrotesk.ttf')})`,{weight:'400'}).load(),
  new FontFace('LabelSans',`url(${staticFile('fonts/SpaceGrotesk.ttf')})`,{weight:'400'}).load(),
  new Promise<void>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve();image.onerror=reject;image.src=staticFile('moon-v2.png');})
 ]).then(([regular,bold])=>{document.fonts.add(regular);document.fonts.add(bold);if(active)continueRender(handle);});return()=>{active=false;};},[handle]);
 const svg=sceneSvg(Math.round(at*60),format,data,layouts,bands).replaceAll('/public/moon-v2.png',staticFile('moon-v2.png'));
 return <AbsoluteFill dangerouslySetInnerHTML={{__html:svg}}/>;
}
