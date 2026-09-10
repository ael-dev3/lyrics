import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Img,staticFile,useCurrentFrame,useVideoConfig,delayRender,continueRender,cancelRender} from 'remotion';
import cues from './cues.json';
import science from '../public/science.json';
import motion from '../public/motion.json';
import {displayWindow} from './timing';
const P={red:'#e10508',black:'#030303',light:'#c2c2c2',mid:'#5c5c5c'};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(a:number,b:number,x:number)=>{const q=clamp((x-a)/(b-a));return q*q*(3-2*q);};
const CSS=`@font-face{font-family:Oswald;src:url('${staticFile('Oswald-Bold.ttf')}');font-weight:700}@font-face{font-family:Oswald;src:url('${staticFile('Oswald-Medium.ttf')}');font-weight:500}@font-face{font-family:Space;src:url('${staticFile('SpaceGrotesk.ttf')}');font-weight:100 900}*{box-sizing:border-box}`;
let ready:Promise<unknown>|undefined;
export const ensureFonts=()=>ready??(ready=Promise.all([document.fonts.load('700 92px Oswald','Прыгай Отменяй'),document.fonts.load('500 61px Oswald','Русский'),document.fonts.load('500 35px Space','English')]));
export const Film:React.FC<{sampleFrame?:number}>=({sampleFrame})=>{
 const actualFrame=useCurrentFrame();
 const [handle]=useState(()=>delayRender('Load exact bundled fonts'));useEffect(()=>{ensureFonts().then(()=>continueRender(handle)).catch(cancelRender);},[handle]);
 const f=sampleFrame??actualFrame,{fps,durationInFrames}=useVideoConfig(),t=f/fps,sample=Math.round(t*48000),m=motion[Math.min(f,motion.length-1)]??[],pressure=m[0]??0,impact=m[1]??0,low=m[2]??0;
 const ci=cues.findIndex((c,i)=>{const w=displayWindow(c,cues[i-1],cues[i+1]);return sample>=w.start&&sample<w.end;});
 const cue=cues[ci],dw=cue?displayWindow(cue,cues[ci-1],cues[ci+1]):undefined;
 const cueOpacity=cue&&dw?smooth(dw.start,dw.settled,sample)*(1-smooth(cue.endSample,dw.end,sample)):0;
 const titleAllowed=!cues.some(c=>sample>c.startSample-43200&&sample<c.endSample+43200);
 const artScale=1.015+.016*Math.sin(t*.15)+.018*pressure+.006*impact;
 const titleOpacity=cue?0:1;
 const levels=science[Math.min(f,science.length-1)]??[];
 const active=(ids:number[])=>!!cue&&cue.groups.some(group=>group.some(i=>ids.includes(i))&&f>=Math.round(Math.min(...group.map(i=>cue.words[i]!.startSample))/800)&&f<Math.round(Math.max(...group.map(i=>cue.words[i]!.endSample))/800));
 
 return <AbsoluteFill style={{background:P.black,color:P.light,fontFamily:'Space',overflow:'hidden'}}>
  <style>{CSS}</style>
  <Img src={staticFile('artwork.png')} style={{position:'absolute',width:1920,height:1080,left:430+12*Math.sin(t*.12),top:0,transform:`scale(${artScale})`,transformOrigin:'52% 45%'}}/>
  <AbsoluteFill style={{background:`linear-gradient(90deg,${P.black} 0%,${P.black} 19%,rgba(3,3,3,.97) 28%,rgba(3,3,3,.70) 40%,rgba(3,3,3,.08) 68%,rgba(3,3,3,.0) 100%)`}}/>
  <AbsoluteFill style={{background:`linear-gradient(0deg,${P.black} 0%,rgba(3,3,3,.98) 8%,rgba(3,3,3,.22) 25%,transparent 48%)`}}/>
  <svg width="1920" height="1080" style={{position:'absolute',inset:0}}>
   <path d={`M 1840 ${170-50*pressure} L 1840 ${690+95*low}`} stroke={P.red} strokeWidth={3+2*impact} fill="none"/>
   <path d={`M 1824 ${170-50*pressure} L 1856 ${170-50*pressure} M 1824 ${690+95*low} L 1856 ${690+95*low}`} stroke={P.red} strokeWidth="3"/>
   <path d={`M 88 300 L ${180+170*pressure} 300`} stroke={P.red} strokeWidth="5"/>
   <path d={`M 1090 848 Q ${1270+30*impact} ${814-35*low} 1470 848 Q ${1630-30*impact} ${882+35*low} 1775 848`} stroke={P.red} strokeWidth={2+2*impact} fill="none" opacity={.35+.25*pressure}/>
  </svg>
  <div style={{position:'absolute',left:88,top:73,fontFamily:'Oswald',fontWeight:700,fontSize:32,letterSpacing:5,color:P.red}}>REDCHINAWAVE</div>
  <div style={{position:'absolute',left:88,top:130,fontFamily:'Oswald',fontWeight:500,fontSize:61,letterSpacing:1}}>ОТМЕНЯЙ</div>
  <div style={{position:'absolute',left:88,top:218,fontFamily:'Oswald',fontSize:15,letterSpacing:3.5,color:P.mid}}>РУССКИЙ / ENGLISH</div>
  {cue&&<div key={cue.id} data-cue={cue.id} style={{position:'absolute',left:88,top:399,width:935,opacity:cueOpacity}}>
   <div data-russian style={{fontFamily:'Oswald',fontSize:cue.line===2?80:92,fontWeight:700,lineHeight:1.28,letterSpacing:.2,display:'flex',flexWrap:'wrap',columnGap:20,rowGap:0,maxWidth:935}}>
    {cue.words.map((w,i)=><span key={i} data-word={i} style={{position:'relative',whiteSpace:'nowrap',color:active([i])?P.red:P.light}}>{w.text.toLocaleUpperCase('ru')}<span style={{position:'absolute',bottom:-10,left:0,right:0,height:4,background:P.red,opacity:active([i])?1:0}}/></span>)}
   </div>
   <div data-english style={{position:'absolute',top:272,fontSize:35,lineHeight:1.5,fontWeight:500,maxWidth:910,display:'flex',flexWrap:'wrap',columnGap:9}}>{cue.en.map((e,i)=><span key={i} style={{whiteSpace:'nowrap',color:active(e.words)?P.light:P.mid}}>{e.text}</span>)}</div>
  </div>}
  {!cue&&titleAllowed&&<div style={{position:'absolute',left:88,top:410,width:980,opacity:titleOpacity}}>
   <div style={{fontFamily:'Oswald',fontWeight:700,fontSize:157,letterSpacing:-3,lineHeight:1,color:P.light}}>ОТМЕНЯЙ</div>
   <div style={{marginTop:33,display:'flex',alignItems:'center',gap:22}}><div style={{height:3,width:74,background:P.red}}/><span style={{fontSize:22,letterSpacing:5,color:P.mid}}>REDCHINAWAVE</span></div>
  </div>}
  <svg width="1920" height="1080" style={{position:'absolute',inset:0}}>
   <line x1="88" x2="1832" y1="968" y2="968" stroke={P.mid} strokeWidth="1" opacity=".6"/>
   {levels.map((db,i)=>{const h=Math.max(2,clamp((db+60)/60)*116),x=88+i*27.25;return <rect key={i} x={x} y={966-h} width={i<24?14:10} height={h} fill={i<24?P.red:P.mid}/>;})}
   <rect x="88" y="1011" width={1744*clamp(f/(durationInFrames-1))} height="2" fill={P.red}/>
  </svg>
  <div style={{position:'absolute',left:88,bottom:35,fontFamily:'Oswald',fontSize:13,letterSpacing:2.2,color:P.mid}}>ОТМЕНЯЙ · 2022</div>
  <div style={{position:'absolute',right:88,bottom:35,fontSize:13,letterSpacing:2.2,color:P.mid}}>{String(Math.floor(t/60)).padStart(2,'0')}:{String(Math.floor(t%60)).padStart(2,'0')}</div>
  <AbsoluteFill style={{background:P.black,opacity:Math.max(1-smooth(0,.16,t),smooth(durationInFrames/fps-1.9,durationInFrames/fps,t)),pointerEvents:'none'}}/>
 </AbsoluteFill>;
};
