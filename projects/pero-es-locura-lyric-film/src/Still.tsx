import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Img,delayRender,continueRender,staticFile} from 'remotion';
import raw from './cues.json';import layouts from './layout.json';import bands from '../public/science.json';import {parseData} from './schema.ts';import type {Format} from './schema.ts';import {sceneSvg,portraitMask} from './scene.ts';import {palette} from './palette.ts';
const data=parseData(raw);
export function PreviewStill({format='landscape',at=109}:{format?:Format;at?:number}){
 const [handle]=useState(()=>delayRender('Load bundled lyric font'));
 useEffect(()=>{let active=true;new FontFace('LiveSerif',`url(${staticFile('fonts/CormorantGaramond-Semibold.ttf')})`,{weight:'600'}).load().then(font=>{document.fonts.add(font);if(active)continueRender(handle);});return()=>{active=false;};},[handle]);
 const portrait=format==='portrait';
 return <AbsoluteFill style={{background:palette.ink}}><Img src={staticFile('diagnostic-frames/'+at+'.png')} style={{position:'absolute',width:'100%',height:portrait?607.5:1080,top:portrait?310:0,objectFit:'contain',...(portrait?{maskImage:portraitMask(at)}:{})}}/><AbsoluteFill dangerouslySetInnerHTML={{__html:sceneSvg(Math.round(at*60),format,data,layouts,bands)}}/></AbsoluteFill>;
}
