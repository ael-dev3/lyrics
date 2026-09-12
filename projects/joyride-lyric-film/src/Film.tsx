import React,{useEffect,useState} from 'react';
import {AbsoluteFill,OffthreadVideo,Freeze,Img,staticFile,useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';
import rawCues from './cues.json';
import rawScience from '../public/science.json';
import rawMotion from '../public/motion.json';
import {parseCues} from './schema';
import {parseMatrix} from './features';
import {buildCueFrames,cueStateAtFrame} from './timing';
import {FPS,FRAMES,SR,P,TRACK,layout} from './config';
const cues=parseCues(rawCues),schedule=buildCueFrames(cues,{sampleRate:SR,fps:FPS});
const science=parseMatrix(rawScience,64,'Spectrum'),motion=parseMatrix(rawMotion,7,'Motion');
if(science.length!==FRAMES||motion.length!==FRAMES)throw Error('Feature duration mismatch');
const clamp=(x:number)=>Math.min(1,Math.max(0,x));
const smooth=(a:number,b:number,x:number)=>{const q=clamp((x-a)/Math.max(.00001,b-a));return q*q*(3-2*q);};
const css=`@font-face{font-family:Space;src:url('${staticFile('SpaceGrotesk.ttf')}');font-weight:100 900}@font-face{font-family:Oswald;src:url('${staticFile('Oswald-Bold.ttf')}');font-weight:700}@font-face{font-family:Oswald;src:url('${staticFile('Oswald-Medium.ttf')}');font-weight:500}*{box-sizing:border-box;font-synthesis:none}`;
let fonts:Promise<unknown>|undefined;
export const ensureFonts=()=>fonts??(fonts=Promise.all([document.fonts.load('700 160px Oswald','JOYRIDE'),document.fonts.load('500 82px Oswald','THE QUICK BROWN FOX'),document.fonts.load('500 30px Space','OLIVER TREE') ]));
export const Film:React.FC<{portrait?:boolean;sampleFrame?:number;forceCue?:number;forceActive?:boolean;staticBackground?:boolean}>=({portrait=false,sampleFrame,forceCue,forceActive,staticBackground=false})=>{
 const current=useCurrentFrame(),f=sampleFrame??current,t=f/FPS,L=layout(portrait),state=cueStateAtFrame(schedule,f),ci=forceCue??state?.index,cue=ci===undefined?undefined:cues[ci];
 const [handle]=useState(()=>delayRender('Load bundled production fonts'));
 useEffect(()=>{ensureFonts().then(()=>continueRender(handle)).catch(cancelRender);},[handle]);
 const m=motion[f]??[],pressure=m[0]??0,impact=m[1]??0,low=m[2]??0,levels=science[f]??[];
 const active=(i:number)=>forceActive??(state?.activeWordIndices.has(i)??false);
 const opacity=forceCue!==undefined?1:state?.opacity??0;
 const globalOpacity=forceCue!==undefined?1:Math.min(smooth(0,12,f),1-smooth(FRAMES-48,FRAMES-1,f));
 const art:React.CSSProperties={position:'absolute',left:0,top:portrait?334:0,width:portrait?1080:1360,height:portrait?810:1020};
 const source=staticBackground?<Img src={staticFile('source-frame.png')} style={art}/>:<OffthreadVideo src={staticFile('source-video.webm')} muted style={art}/>;
 const titleTop=portrait?116:184;
 const lastCue=cues.at(-1),outroStart=lastCue?Math.max(132, lastCue.endSample/SR+3):132;
 return <AbsoluteFill style={{background:P.ink,color:P.cream,fontFamily:'Oswald',overflow:'hidden'}}>
  <style>{css}</style>
  <AbsoluteFill style={{opacity:globalOpacity}}>
   {sampleFrame===undefined?source:<Freeze frame={sampleFrame}>{source}</Freeze>}
   {portrait?<AbsoluteFill style={{background:'linear-gradient(180deg,#101b1c 0%,#101b1c 18.5%,rgba(16,27,28,.03) 26%,transparent 45%,rgba(16,27,28,.10) 49%,rgba(16,27,28,.78) 55%,#101b1c 58.5%)'}}/>:<>
    <AbsoluteFill style={{background:'linear-gradient(90deg,rgba(16,27,28,0) 0%,rgba(16,27,28,0) 42%,rgba(16,27,28,.10) 51%,rgba(16,27,28,.54) 59%,rgba(16,27,28,.95) 66%,#101b1c 70%)'}}/>
    <AbsoluteFill style={{background:'linear-gradient(180deg,#101b1c 0%,rgba(16,27,28,.10) 9%,transparent 16%,transparent 73%,rgba(16,27,28,.60) 86%,#101b1c 94%)'}}/>
   </>}
   <svg width={L.width} height={L.height} style={{position:'absolute',inset:0,pointerEvents:'none'}}>
    <g transform={`translate(${portrait?1024:1888},${portrait?410:310})`} opacity={.11+.025*pressure} fill="none" stroke={P.teal} strokeWidth={1.4}>
     {Array.from({length:portrait?17:10},(_,i)=><path key={i} d={`M 0 ${i*72} l 27 34 l -27 34 l -27 -34 Z M 0 ${i*72+13} l 17 21 l -17 21 l -17 -21 Z`}/>)}
    </g>
    <g transform={`translate(${portrait?958:1828},${portrait?114:139}) rotate(${t*3})`} stroke={P.red} strokeWidth={2} fill="none" opacity={.6}>
     <circle r={18+impact*3}/><path d="M -26 0 H -10 M 10 0 H 26 M 0 -26 V -10 M 0 10 V 26"/>
    </g>
   </svg>
   <div style={{position:'absolute',left:L.lyricLeft,top:portrait?76:130,fontFamily:'Space',fontSize:portrait?29:28,fontWeight:500,letterSpacing:portrait?5.7:5.2,textTransform:'uppercase'}}>{TRACK.artist}</div>
   <div style={{position:'absolute',left:L.lyricLeft-3,top:titleTop,fontWeight:700,fontSize:portrait?190:157,lineHeight:1,letterSpacing:portrait?-4.6:-3.8,color:P.cream}}>JOYRIDE</div>
   <div style={{position:'absolute',left:L.lyricLeft,top:portrait?319:376,height:4,width:118+20*pressure,background:P.red}}/>
   {cue&&<div data-cue={cue.id} style={{opacity}}><div data-lyrics style={{position:'absolute',left:L.lyricLeft,top:L.lyricTop,width:L.lyricWidth,fontSize:L.fontSize,fontWeight:500,lineHeight:1.21,letterSpacing:-.6,display:'flex',flexWrap:'wrap',columnGap:portrait?18:16,rowGap:4,alignContent:'flex-start'}}>
    {cue.words.map((w,i)=><span key={i} data-word={i} style={{position:'relative',whiteSpace:'nowrap',color:active(i)?P.red:P.cream,textTransform:'uppercase',textShadow:'0 2px 10px rgba(6,14,14,.30)'}}>{w.text}</span>)}
   </div></div>}
   {!cue&&t>outroStart&&<div style={{position:'absolute',left:L.lyricLeft,top:L.lyricTop+20,opacity:.9*smooth(outroStart,outroStart+.65,t)}}><div style={{fontSize:portrait?106:90,fontWeight:500,letterSpacing:-1,color:P.red}}>JOYRIDE</div><div style={{fontFamily:'Space',fontSize:portrait?24:22,letterSpacing:3,marginTop:14,color:P.dim}}>OLIVER TREE</div></div>}
   <svg width={L.width} height={L.height} style={{position:'absolute',inset:0,pointerEvents:'none'}}>
    <line x1={L.spectrumLeft} x2={L.spectrumLeft+L.spectrumWidth} y1={L.baseline+3} y2={L.baseline+3} stroke={P.teal} strokeWidth={1} opacity={.4}/>
    {levels.map((db,i)=>{const h=Math.max(1,clamp((db+60)/60)*(portrait?99:82)),step=L.spectrumWidth/64;return <rect key={i} x={L.spectrumLeft+i*step} y={L.baseline-h} width={portrait?5.5:10} height={h} fill={i<22?P.red:P.dim} opacity={i<22?.9:.72}/>;})}
    <rect x={L.spectrumLeft} y={L.footerTop-23} width={L.spectrumWidth} height={1} fill={P.teal} opacity={.45}/>
    <rect x={L.spectrumLeft} y={L.footerTop-24} width={L.spectrumWidth*clamp(f/(FRAMES-1))} height={3} fill={P.red}/>
   </svg>
   <div style={{position:'absolute',left:L.spectrumLeft,top:L.footerTop,fontFamily:'Space',fontSize:portrait?17:15,fontWeight:500,letterSpacing:1.6,color:P.dim}}>OLIVER TREE / JOYRIDE</div>
  </AbsoluteFill>
 </AbsoluteFill>;
};
