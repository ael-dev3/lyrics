import React,{useEffect,useState} from 'react';
import {AbsoluteFill,OffthreadVideo,Freeze,Img,staticFile,useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';
import rawCues from './cues.json';
import science from '../public/science.json';
import motion from '../public/motion.json';
import {parseCues} from './schema';
import {displayWindow} from './timing';
import {FPS,FRAMES,P,TRACK} from './config';
const cues=parseCues(rawCues);
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(a:number,b:number,x:number)=>{const q=clamp((x-a)/Math.max(.0001,b-a));return q*q*(3-2*q);};
const css=`@font-face{font-family:Space;src:url('${staticFile('SpaceGrotesk.ttf')}');font-weight:100 900}@font-face{font-family:Cormorant;src:url('${staticFile('CormorantGaramond-Semibold.ttf')}');font-weight:600}@font-face{font-family:Cormorant;src:url('${staticFile('CormorantGaramond-Italic.ttf')}');font-weight:500;font-style:italic}*{box-sizing:border-box;font-synthesis:none}`;
let ready:Promise<unknown>|undefined;
export const ensureFonts=()=>ready??(ready=Promise.all([document.fonts.load('600 76px Space',"I can't be your midnight love"),document.fonts.load('600 150px Cormorant','midnight love'),document.fonts.load('italic 500 150px Cormorant','love')]));
export const Film:React.FC<{portrait?:boolean;sampleFrame?:number;forceCue?:number;forceActive?:boolean;staticBackground?:boolean}>=({portrait=false,sampleFrame,forceCue,forceActive,staticBackground=false})=>{
 const current=useCurrentFrame(),f=sampleFrame??current,t=f/FPS,sample=f*800;
 const [handle]=useState(()=>delayRender('Load bundled production fonts'));
 useEffect(()=>{ensureFonts().then(()=>continueRender(handle)).catch(cancelRender);},[handle]);
 const width=portrait?1080:1920,height=portrait?1920:1080;
 const row=motion[Math.min(f,motion.length-1)]??[],pressure=row[0]??0,impact=row[1]??0,low=row[2]??0;
 const levels=science[Math.min(f,science.length-1)]??[];
 const ci=forceCue??cues.findIndex((c,i)=>{const w=displayWindow(c,cues[i-1],cues[i+1]);return sample>=w.start&&sample<w.end;});
 const cue=cues[ci],dw=cue?displayWindow(cue,cues[ci-1],cues[ci+1]):undefined;
 const opacity=forceCue!==undefined?1:cue&&dw?smooth(dw.start,dw.settled,sample)*(1-smooth(cue.endSample,dw.end,sample)):0;
 const active=(i:number)=>forceActive??(!!cue&&cue.groups.some(g=>g.includes(i)&&f>=Math.round(Math.min(...g.map(j=>cue.words[j]?.startSample??0))/800)&&f<Math.round(Math.max(...g.map(j=>cue.words[j]?.endSample??0))/800)));
 const lyricLeft=portrait?68:1072,lyricTop=portrait?1167:445,lyricWidth=portrait?864:754;
 const baseline=portrait?1620:953,spectrumLeft=portrait?68:96,spectrumWidth=portrait?864:1728,step=spectrumWidth/64;
 const globalOpacity=forceCue!==undefined?1:Math.min(smooth(0,16,f),1-smooth(FRAMES-84,FRAMES-1,f));
 const intro=smooth(16,80,f)*(1-smooth(14*FPS,14.8*FPS,f));
 const headerOpacity=portrait?1:smooth(14.8*FPS,15.7*FPS,f);
 const artStyle:React.CSSProperties={position:'absolute',width:portrait?2200:1960,height:portrait?1237.5:1102.5,left:portrait?-467:-20,top:portrait?-10:-12,transform:`translate(${Math.sin(t*.078)*4}px,${Math.cos(t*.061)*3}px) scale(${1.015+.006*Math.sin(t*.105)+.003*pressure})`,transformOrigin:portrait?'41% 52%':'43% 65%'};
 const source=staticBackground?<Img src={staticFile('source-frame.png')} style={artStyle}/>:<OffthreadVideo src={staticFile('source-video.webm')} muted style={artStyle}/>;
 return <AbsoluteFill style={{background:P.night,color:P.silver,fontFamily:'Space',overflow:'hidden'}}>
  <style>{css}</style>
  <AbsoluteFill style={{opacity:globalOpacity}}>
   <div style={{position:'absolute',left:0,top:0,width,height:portrait?1250:1080,overflow:'hidden'}}>{sampleFrame===undefined?source:<Freeze frame={sampleFrame}>{source}</Freeze>}</div>
   <AbsoluteFill style={{background:portrait?'linear-gradient(180deg,rgba(9,15,36,.9) 0%,rgba(9,15,36,.56) 11%,rgba(9,15,36,.12) 24%,rgba(9,15,36,.02) 36%,rgba(9,15,36,.12) 45%,rgba(9,15,36,.48) 53%,rgba(9,15,36,.94) 59%,#090f24 63%)':'linear-gradient(90deg,rgba(9,15,36,.02) 0%,rgba(9,15,36,.04) 30%,rgba(9,15,36,.12) 45%,rgba(9,15,36,.28) 60%,rgba(9,15,36,.52) 78%,rgba(9,15,36,.76) 100%)'}}/>
   {!portrait&&<AbsoluteFill style={{background:'linear-gradient(0deg,rgba(9,15,36,.92) 0%,rgba(9,15,36,.66) 5%,rgba(9,15,36,.28) 13%,rgba(9,15,36,.07) 23%,transparent 35%)'}}/>}
   <div style={{position:'absolute',left:portrait?410:825,top:portrait?658:670,width:portrait?335:365,height:portrait?420:300,background:`radial-gradient(ellipse,rgba(255,183,117,${.025+.04*pressure+.025*impact}),transparent 68%)`,mixBlendMode:'screen',pointerEvents:'none'}}/>
   <svg width={width} height={height} style={{position:'absolute',inset:0,pointerEvents:'none'}}>
    {Array.from({length:22},(_,i)=>{const phase=(t*(.024+(i%5)*.003)+i*.163)%1,life=Math.sin(Math.PI*phase)**2;const x=(portrait?670:1020)+Math.sin(i*2.3+phase*3)*(.35+phase)*(90+55*pressure),y=(portrait?1080:870)-phase*(portrait?650:650);return <line key={i} x1={x} x2={x+Math.sin(i)*2} y1={y} y2={y-2.5-i%3} stroke={i%4===0?P.silver:P.gold} strokeWidth={i%3===0?1.8:1.1} opacity={life*(.07+.23*pressure+.09*impact)}/>;})}
   </svg>
   <div style={{position:'absolute',left:portrait?68:1072,top:portrait?89:95,opacity:headerOpacity}}>
    <div style={{fontSize:portrait?32:27,fontWeight:500,letterSpacing:1.5,color:P.silver}}>{TRACK.artist}</div>
    <div style={{fontFamily:'Cormorant',fontSize:portrait?104:86,fontWeight:600,lineHeight:1.08,marginTop:portrait?11:16,letterSpacing:-1.5}}>{TRACK.title}</div>
    <div style={{width:64+85*pressure,height:2,background:P.gold,marginTop:portrait?21:29,opacity:.85}}/>
   </div>
   {!portrait&&<div style={{position:'absolute',left:1060,top:268,width:750,opacity:intro}}>
    <div style={{fontSize:28,letterSpacing:2,color:P.silver,marginBottom:24}}>{TRACK.artist}</div>
    <div style={{fontFamily:'Cormorant',fontSize:170,lineHeight:.95,fontWeight:600,letterSpacing:-2}}>midnight</div>
    <div style={{fontFamily:'Cormorant',fontSize:188,lineHeight:.95,fontWeight:500,fontStyle:'italic',color:P.gold}}>love</div>
   </div>}
   {cue&&<div key={cue.id} data-cue={cue.id} style={{opacity}}>
    <div data-lyrics style={{position:'absolute',left:lyricLeft,top:lyricTop,width:lyricWidth,fontSize:portrait?78:76,fontWeight:600,lineHeight:1.25,letterSpacing:-1.65,display:'flex',flexWrap:'wrap',columnGap:portrait?19:18,rowGap:7,alignContent:'flex-start'}}>
     {cue.words.map((word,i)=><span key={i} data-word={i} style={{position:'relative',whiteSpace:'nowrap',color:active(i)?P.gold:P.silver,textShadow:'0 2px 12px rgba(4,8,24,.85)'}}>{word.text.toLowerCase()}<span style={{position:'absolute',left:0,right:0,bottom:-3,height:3,background:P.gold,opacity:active(i)?1:0}}/></span>)}
    </div>
   </div>}
   {!cue&&f>181*FPS&&<div style={{position:'absolute',left:lyricLeft,top:portrait?1200:481,width:lyricWidth,opacity:.8*smooth(181*FPS,183*FPS,f)}}>
    <div style={{fontFamily:'Cormorant',fontSize:portrait?108:102,fontWeight:500,fontStyle:'italic',color:P.gold}}>midnight love</div>
    <div style={{height:1,width:portrait?240:200,background:P.blue,marginTop:28,opacity:.6}}/>
   </div>}
   <svg width={width} height={height} style={{position:'absolute',inset:0,pointerEvents:'none'}}>
    <line x1={spectrumLeft} x2={spectrumLeft+spectrumWidth} y1={baseline+2} y2={baseline+2} stroke={P.blue} strokeWidth={1} opacity={.18}/>
    {levels.map((db,i)=>{const h=Math.max(1.5,clamp((db+60)/60)*(portrait?102:96));return <rect key={i} x={spectrumLeft+i*step} y={baseline-h} width={portrait?5:9} height={h} fill={i<21?P.gold:P.blue} opacity={i<21?.83:.67}/>;})}
    <rect x={spectrumLeft} y={portrait?1664:1010} width={spectrumWidth} height={1} fill={P.blue} opacity={.2}/>
    <rect x={spectrumLeft} y={portrait?1664:1010} width={spectrumWidth*clamp(f/(FRAMES-1))} height={2} fill={P.gold} opacity={.7}/>
   </svg>
   <div style={{position:'absolute',left:spectrumLeft,top:portrait?1683:1029,fontSize:portrait?16:14,fontWeight:500,letterSpacing:1.2,color:P.dim}}>girl in red · midnight love</div>
  </AbsoluteFill>
 </AbsoluteFill>;
};
