import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Audio,OffthreadVideo,staticFile,useCurrentFrame,delayRender,continueRender,cancelRender,getRemotionEnvironment} from 'remotion';
import raw from './cues.json';
import layout from './layout.json';
import bands from '../public/science.json';
import {parseData} from './schema.ts';
import type {Format} from './schema.ts';
import {sceneSvg,palette} from './scene.ts';
const data=parseData(raw);
export const Film:React.FC<{format:Format}>=({format})=>{
 if(getRemotionEnvironment().isRendering)throw Error('PREVIEW ONLY: film capture is disabled until this song is reviewed and explicitly authorized.');
 const frame=useCurrentFrame(),l=layout[format];
 const [handle]=useState(()=>delayRender('Load lyric font'));
 useEffect(()=>{const face=new FontFace('LyricSerif',`url('${staticFile('CormorantGaramond-Semibold.ttf')}')`,{weight:'600',style:'normal'});face.load().then(loaded=>{document.fonts.add(loaded);continueRender(handle);}).catch(cancelRender);},[handle]);
 const portrait=format==='portrait';
 return <AbsoluteFill style={{background:palette.night,overflow:'hidden'}}>
  <Audio src={staticFile('soundtrack.m4a')}/>
  <OffthreadVideo src={staticFile('footage.mp4')} muted style={{position:'absolute',width:l.width,height:portrait?650:1080,top:portrait?265:0,objectFit:'contain',maskImage:portrait?'linear-gradient(transparent,black 12%,black 82%,transparent)':undefined}}/>
  <div style={{position:'absolute',inset:0}} dangerouslySetInnerHTML={{__html:sceneSvg(frame,format,data,layout,bands)}}/>
 </AbsoluteFill>;
};
