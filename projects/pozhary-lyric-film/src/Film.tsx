import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Img,staticFile,useCurrentFrame,useVideoConfig,delayRender,continueRender,cancelRender} from 'remotion';
import cueData from './cues.json';
import science from '../public/science.json';
import motion from '../public/motion.json';
import vocalEnvelope from '../public/vocal-envelope.json';
import {displayWindow} from './timing';
import type {Cue} from './schema';
const cues:readonly Cue[]=cueData;
export const P={dark:'#101814',cream:'#e8e4d9',ember:'#f3a66b',sage:'#9caf9f',dim:'#708277'};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(a:number,b:number,x:number)=>{const q=clamp((x-a)/Math.max(1,b-a));return q*q*(3-2*q);};
const CSS=`@font-face{font-family:Oswald;src:url('${staticFile('Oswald-Bold.ttf')}');font-weight:700}@font-face{font-family:Oswald;src:url('${staticFile('Oswald-Medium.ttf')}');font-weight:500}@font-face{font-family:Space;src:url('${staticFile('SpaceGrotesk.ttf')}');font-weight:100 900}*{box-sizing:border-box}`;
let ready:Promise<unknown>|undefined;
export const ensureFonts=()=>ready??(ready=Promise.all([document.fonts.load('700 88px Oswald','ПОЖАРЫ Рождаем'),document.fonts.load('500 38px Space','English ray!')]));
export const Film:React.FC<{portrait?:boolean;sampleFrame?:number;forceCue?:number;forceActive?:boolean}> = ({portrait=false,sampleFrame,forceCue,forceActive})=>{
 const current=useCurrentFrame(),f=sampleFrame??current,{durationInFrames}=useVideoConfig(),t=f/60,sample=f*800;
 const [handle]=useState(()=>delayRender('Load bundled Cyrillic fonts'));
 useEffect(()=>{ensureFonts().then(()=>continueRender(handle)).catch(cancelRender);},[handle]);
 const width=portrait?1080:1920,height=portrait?1920:1080,left=portrait?62:96,right=portrait?920:958,lyricTop=portrait?1112:395,enTop=portrait?1400:685;
 const row=motion[Math.min(f,motion.length-1)]??[],pressure=row[0]??0,impact=row[1]??0,low=row[2]??0;
 const levels=science[Math.min(f,science.length-1)]??[];
 const ci=forceCue??cues.findIndex((c,i)=>{const w=displayWindow(c,cues[i-1],cues[i+1]);return sample>=w.start&&sample<w.end;});
 const cue=cues[ci],dw=cue?displayWindow(cue,cues[ci-1],cues[ci+1]):undefined;
 const opacity=forceCue!==undefined?1:cue&&dw?smooth(dw.start,dw.settled,sample)*(1-smooth(cue.endSample,dw.end,sample)):0;
 const active=(ids:number[])=>forceActive??(!!cue&&cue.groups.some(g=>g.some(i=>ids.includes(i))&&f>=Math.round(Math.min(...g.map(i=>cue.words[i]!.startSample))/800)&&f<Math.round(Math.max(...g.map(i=>cue.words[i]!.endSample))/800)));
 const titleAllowed=!cues.some(c=>sample>c.startSample-38400&&sample<c.endSample+38400);
 const echoStrength=cue?.echo?clamp(((vocalEnvelope[f]??-100)+38)/24):1;
 const ruSize=portrait?(cue?.words.map(w=>w.text).join(' ').length??0)>26?76:86:(cue?.words.map(w=>w.text).join(' ').length??0)>26?78:88;
 const baseline=portrait?1602:951,spectrumWidth=portrait?858:1728,step=spectrumWidth/64;
 const globalOpacity=Math.min(smooth(0,8,f),1-smooth(durationInFrames-96,durationInFrames-1,f));
 return <AbsoluteFill style={{background:P.dark,color:P.cream,fontFamily:'Space',overflow:'hidden'}}>
  <style>{CSS}</style>
  <AbsoluteFill style={{opacity:forceCue!==undefined?1:globalOpacity}}>
   <div style={{position:'absolute',left:portrait?0:734,top:portrait?0:-34,width:portrait?1080:1230,height:portrait?1100:1114,overflow:'hidden'}}>
    <Img src={staticFile('artist-cover.jpg')} style={{position:'absolute',width:portrait?1100:1230,height:portrait?1100:1230,left:portrait?-10:0,top:portrait?-12:-45,transform:`translate(${Math.sin(t*.105)*5}px,${Math.cos(t*.083)*3}px) scale(${1.018+.009*pressure+.003*impact+.006*Math.sin(t*.12)})`,transformOrigin:'55% 65%'}}/>
    <AbsoluteFill style={{background:portrait?'linear-gradient(180deg,rgba(16,24,20,.20),transparent 42%,rgba(16,24,20,.05) 69%,#101814 100%)':'linear-gradient(90deg,#101814 0%,rgba(16,24,20,.58) 12%,transparent 35%)'}}/>
    <AbsoluteFill style={{background:'linear-gradient(0deg,#101814 0%,rgba(16,24,20,.1) 19%,transparent 42%)'}}/>
   </div>
   <div style={{position:'absolute',left:0,top:0,width:portrait?700:1050,height:portrait?350:1080,maskImage:portrait?'linear-gradient(180deg,#000 0%,#000 70%,transparent 100%)':undefined,background:portrait?'linear-gradient(90deg,rgba(16,24,20,.9),rgba(16,24,20,.6) 54%,transparent)':'linear-gradient(90deg,#101814 0%,#101814 64%,rgba(16,24,20,.65) 84%,transparent)'}}/>
   <svg width={width} height={height} style={{position:'absolute',inset:0}}>
    {Array.from({length:15},(_,i)=>{const phase=(t*(.016+(i%4)*.004)+i*.137)%1,x=(portrait?70:1050)+(i*83)%(portrait?920:780)+Math.sin(t*.4+i)*12,y=(portrait?1040:875)-phase*(portrait?740:640),a=Math.sin(phase*Math.PI)**2*(.12+.2*pressure);return <line key={i} x1={x} x2={x+2} y1={y} y2={y-5-3*impact} stroke={P.ember} strokeWidth={1.2+(i%2)*.7} opacity={a}/>;})}
    <path d={portrait?`M 64 1062 L ${190+135*pressure} 1062`:`M 1030 887 Q ${1270+35*impact} ${851-22*low} 1510 868 L 1810 818`} fill="none" stroke={P.ember} strokeWidth={1.5+impact} opacity={.35+.12*pressure}/>
    <path d={`M ${left} ${portrait?322:294} H ${left+70+120*pressure}`} stroke={P.ember} strokeWidth="3"/>
   </svg>
   <div style={{position:'absolute',left,top:portrait?112:78,fontSize:portrait?37:34,fontWeight:600,letterSpacing:1.2,color:P.sage}}>ray!</div>
   <div style={{position:'absolute',left,top:portrait?166:133,fontFamily:'Oswald',fontWeight:500,fontSize:portrait?71:69,letterSpacing:3.5}}>ПОЖАРЫ</div>
   <div style={{position:'absolute',left,top:portrait?263:235,fontFamily:'Oswald',fontSize:portrait?16:15,fontWeight:500,letterSpacing:3,color:P.sage}}>РУССКИЙ / ENGLISH</div>
   {cue&&<div key={cue.id} data-cue={cue.id} style={{opacity}}>
    <div data-russian style={{position:'absolute',left,top:lyricTop,width:right-left,fontFamily:'Oswald',fontSize:ruSize,fontWeight:700,lineHeight:1.2,letterSpacing:.15,display:'flex',flexWrap:'wrap',columnGap:portrait?17:19,rowGap:6}}>
     {cue.words.map((word,i)=><React.Fragment key={i}>{cue.words[0]?.text==='Нам'&&i===2&&<span style={{flexBasis:'100%',height:0}}/>}<span data-word={i} style={{position:'relative',whiteSpace:'nowrap',color:active([i])?P.ember:P.cream,opacity:cue.echo? .65+.35*echoStrength:1}}>{word.text.toLocaleUpperCase('ru')}<span style={{position:'absolute',left:0,right:0,bottom:-8,height:3,background:P.ember,opacity:active([i])?echoStrength:0}}/></span></React.Fragment>)}
    </div>
    <div data-english style={{position:'absolute',left,top:enTop,width:right-left,fontSize:portrait?36:34,lineHeight:1.48,fontWeight:500,display:'flex',flexWrap:'wrap',columnGap:9,rowGap:0}}>{cue.en.map((meaning,i)=><span data-meaning={i} key={i} style={{whiteSpace:'nowrap',color:active(meaning.words)?P.cream:P.dim}}>{meaning.text}</span>)}</div>
   </div>}
   {!cue&&titleAllowed&&<div style={{position:'absolute',left,top:portrait?1120:407,width:right-left}}>
    <div style={{fontFamily:'Oswald',fontSize:portrait?151:155,fontWeight:700,lineHeight:1.12,letterSpacing:1}}>ПОЖАРЫ</div>
    <div style={{marginTop:27,fontSize:portrait?21:22,letterSpacing:7,color:P.ember}}>FIRES</div>
   </div>}
   <svg width={width} height={height} style={{position:'absolute',inset:0}}>
    <line x1={left} x2={left+spectrumWidth} y1={baseline+2} y2={baseline+2} stroke={P.dim} strokeWidth="1" opacity=".5"/>
    {levels.map((db,i)=>{const h=Math.max(1.5,clamp((db+60)/60)*(portrait?97:108));return <rect key={i} x={left+i*step} y={baseline-h} width={portrait?6:12} height={h} fill={i<24?P.ember:P.sage} opacity={i<24?.95:.65}/>;})}
    <rect x={left} y={portrait?1641:1008} width={spectrumWidth*clamp(f/(durationInFrames-1))} height="2" fill={P.ember}/>
   </svg>
   <div style={{position:'absolute',left,top:portrait?1661:1027,fontFamily:'Oswald',fontSize:portrait?14:13,letterSpacing:2.4,color:P.dim}}>ray! · ПОЖАРЫ · 2026</div>
   <div style={{position:'absolute',right:portrait?160:96,top:portrait?1661:1027,fontSize:portrait?14:12,letterSpacing:2,color:P.dim}}>{String(Math.floor(t/60)).padStart(2,'0')}:{String(Math.floor(t%60)).padStart(2,'0')}</div>
  </AbsoluteFill>
 </AbsoluteFill>;
};
