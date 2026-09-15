import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,OffthreadVideo,Freeze,staticFile,useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';
import raw from './cues.json';
import layout from './layout.json';
import bands from '../public/science.json';
import {parseData} from './schema.ts';
import type {Format} from './schema.ts';
import {sceneSvg,palette} from './scene.ts';
const data=parseData(raw);
export const Film:React.FC<{format:Format}>=({format})=>{
 const frame=useCurrentFrame(),l=layout[format];
 const [handle]=useState(()=>delayRender('Load exact bilingual font'));
 useEffect(()=>{const face=new FontFace('LyricSerif',`url('${staticFile('CormorantGaramond-Semibold.ttf')}')`,{weight:'600',style:'normal'});face.load().then(loaded=>{document.fonts.add(loaded);continueRender(handle);}).catch(cancelRender);},[handle]);
 const portrait=format==='portrait';
 return <AbsoluteFill style={{background:palette.night,overflow:'hidden'}}>
  <style>{`*{box-sizing:border-box;font-synthesis:none}`}</style>
  <Audio src={staticFile('soundtrack.m4a')}/>
  <Freeze frame={Math.min(frame,10089)}><OffthreadVideo src={staticFile('footage.mp4')} muted pauseWhenBuffering style={{position:'absolute',width:l.width,height:portrait?608:1080,top:portrait?208:0,objectFit:'contain',maskImage:portrait?'linear-gradient(transparent,black 12%,black 83%,transparent)':undefined}}/></Freeze>
  <div style={{position:'absolute',inset:0}} dangerouslySetInnerHTML={{__html:sceneSvg(frame,format,data,layout,bands)}}/>
 </AbsoluteFill>;
};
