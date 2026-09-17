import React,{useEffect,useState} from 'react';
import {AbsoluteFill,delayRender,continueRender,staticFile} from 'remotion';
import raw from './cues.json';
import layouts from './layout.json';
import bands from '../public/science.json';
import {parseData} from './schema.ts';
import type {Format} from './schema.ts';
import {sceneSvg} from './scene.ts';
const data=parseData(raw);
export function PreviewStill({format='landscape',at=55.72}:{format?:Format;at?:number}){
 const [handle]=useState(()=>delayRender('Load preview artwork and both bundled fonts'));
 useEffect(()=>{let active=true;Promise.all([
  new FontFace('LyricSans',`url(${staticFile('Oswald-Medium.ttf')})`,{weight:'500'}).load(),
  new FontFace('LyricSans',`url(${staticFile('Oswald-Bold.ttf')})`,{weight:'700'}).load(),
  new Promise<void>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve();image.onerror=reject;image.src=staticFile('artwork.png');})
 ]).then(([regular,bold])=>{document.fonts.add(regular);document.fonts.add(bold);if(active)continueRender(handle);});return()=>{active=false;};},[handle]);
 const svg=sceneSvg(Math.round(at*60),format,data,layouts,bands).replaceAll('/public/artwork.png',staticFile('artwork.png'));
 return <AbsoluteFill dangerouslySetInnerHTML={{__html:svg}}/>;
}
