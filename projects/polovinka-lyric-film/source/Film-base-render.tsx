import React,{useEffect,useState} from 'react';
import {AbsoluteFill,OffthreadVideo,Freeze,Img,staticFile,useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';
import rawScience from '../public/science.json';
import {FPS,FRAMES,TRACK,P,layout} from './config';
import {cues,cueAt,wordActive,smooth} from './timing';
const css=`@font-face{font-family:Oswald;src:url('${staticFile('Oswald-Medium.ttf')}');font-weight:500} @font-face{font-family:Cormorant;src:url('${staticFile('CormorantGaramond-Semibold.ttf')}');font-weight:600} *{box-sizing:border-box;font-synthesis:none}`;
let fonts:Promise<unknown>|undefined;
export const ensureFonts=()=>fonts??(fonts=Promise.all([document.fonts.load('500 72px Oswald','ТАНЦЫ МИНУС ПОЛОВИНКА The dark forest'),document.fonts.load('600 100px Cormorant','Half of Myself')]));
export const Film:React.FC<{portrait?:boolean;sampleFrame?:number;forceCue?:number;forceActive?:boolean;staticBackground?:boolean}>=({portrait=false,sampleFrame,forceCue,forceActive,staticBackground=false})=>{
 const current=useCurrentFrame(),f=sampleFrame??current,t=f/FPS,L=layout(portrait),state=cueAt(f),cue=forceCue===undefined?state?.cue:cues[forceCue];
 const [handle]=useState(()=>delayRender('Load production fonts'));
 useEffect(()=>{ensureFonts().then(()=>continueRender(handle)).catch(cancelRender);},[handle]);
 const levels=rawScience[Math.min(f,rawScience.length-1)]??[];
 const globalFade=Math.min(smooth(0,24,f),1-smooth(FRAMES-54,FRAMES-1,f));
 const titleMode=!cue&&(t<12.9||t>141),lyricOpacity=forceCue===undefined?state?.opacity??0:1;
 const art:React.CSSProperties={position:'absolute',left:0,top:portrait?282:0,width:L.width,height:portrait?760:1080,objectFit:'cover',objectPosition:'center',filter:'saturate(.86) contrast(1.02)'};
 const source=staticBackground?<Img src={staticFile('reference-frame.png')} style={art}/>:<OffthreadVideo src={staticFile('footage.mp4')} muted style={art}/>;
 const active=(w:{startSample:number;endSample:number})=>forceActive??wordActive(w,f);
 const textStyle:React.CSSProperties={position:'absolute',left:L.left,width:L.lyricWidth,fontSize:L.fontSize,fontWeight:500,lineHeight:1.2,letterSpacing:0,color:P.cream,textShadow:'0 2px 8px rgba(0,0,0,.6)',textAlign:'center'};
 return <AbsoluteFill style={{background:P.ink,color:P.cream,fontFamily:'Oswald',overflow:'hidden'}}><style>{css}</style><AbsoluteFill style={{opacity:forceCue!==undefined?1:globalFade}}>
  {sampleFrame===undefined?source:<Freeze frame={sampleFrame}>{source}</Freeze>}
  {portrait?<AbsoluteFill style={{background:'linear-gradient(180deg,#100e0d 0%,#100e0d 18%,rgba(16,14,13,.10) 26%,rgba(16,14,13,.04) 38%,rgba(16,14,13,.62) 47%,#100e0d 54%,#100e0d 100%)'}}/>:<AbsoluteFill style={{background:'linear-gradient(180deg,rgba(16,14,13,.70) 0%,rgba(16,14,13,.08) 22%,rgba(16,14,13,.12) 40%,rgba(16,14,13,.82) 57%,rgba(16,14,13,.97) 72%,#100e0d 96%)'}}/>}
  <div style={{position:'absolute',left:portrait?76:88,top:portrait?114:52,fontSize:portrait?30:28,letterSpacing:6,fontWeight:500}}>{TRACK.artist}</div>
  <div style={{position:'absolute',left:portrait?72:84,top:portrait?163:96,fontSize:portrait?106:87,letterSpacing:portrait?1.4:1,lineHeight:1.12,fontWeight:500}}>{TRACK.title}</div>
  <div style={{position:'absolute',right:portrait?150:88,top:portrait?302:65,fontSize:portrait?18:19,letterSpacing:3,color:P.teal}}>РУССКИЙ / ENGLISH</div>
  {cue&&<div data-cue={cue.id} style={{opacity:lyricOpacity}}>
   <div data-lyrics="ru" style={{...textStyle,top:L.ruTop}}>{cue.ru.map((w,i)=><React.Fragment key={i}><span data-word={'ru-'+i} style={{color:active(w)?P.teal:P.cream,whiteSpace:'nowrap'}}>{w.text}</span>{i<cue.ru.length-1?' ':null}</React.Fragment>)}</div>
   <div data-lyrics="en" style={{...textStyle,top:L.enTop}}>{cue.en.map((g,i)=><React.Fragment key={i}><span data-group={i} style={{color:active(g)?P.teal:P.cream}}>{g.text.split(' ').map((w,j)=><React.Fragment key={j}><span data-word={'en-'+i+'-'+j} style={{whiteSpace:'nowrap'}}>{w}</span>{j<g.text.split(' ').length-1?' ':null}</React.Fragment>)}</span>{i<cue.en.length-1?' ':null}</React.Fragment>)}</div>
  </div>}
  {titleMode&&<div style={{position:'absolute',top:portrait?1110:701,left:L.left,width:L.lyricWidth,textAlign:'center',opacity:smooth(t<12.9?1:141,t<12.9?2:143,t)}}><div style={{fontFamily:'Cormorant',fontWeight:600,fontSize:portrait?91:88,lineHeight:1.2,color:P.teal}}>{TRACK.translation}</div><div style={{fontSize:portrait?24:23,letterSpacing:4,marginTop:25,color:P.cream}}>ТАНЦЫ МИНУС</div></div>}
  {!cue&&!titleMode&&<div style={{position:'absolute',top:portrait?1190:750,left:L.left,width:L.lyricWidth,textAlign:'center',fontFamily:'Cormorant',fontSize:portrait?62:60,color:P.cream,opacity:.8}}>Половинка</div>}
  <svg width={L.width} height={L.height} style={{position:'absolute',inset:0,pointerEvents:'none'}}>
   <defs><linearGradient id="spectrum" x1="0" x2="1"><stop stopColor={P.amber}/><stop offset=".55" stopColor={P.cream}/><stop offset="1" stopColor={P.teal}/></linearGradient></defs>
   {levels.map((db,i)=>{const h=Math.max(.9,Math.min(1,Math.max(0,(db+60)/60))*(portrait?148:104)),step=L.spectrumWidth/64;return <rect key={i} x={L.left+i*step} y={L.baseline-h} width={step*.65} height={h} fill={i<22?P.amber:i<43?P.cream:P.teal} opacity={.92}/>;})}
   <line x1={L.left} x2={L.left+L.spectrumWidth} y1={L.baseline+8} y2={L.baseline+8} stroke={P.muted} strokeWidth="1" opacity=".3"/>
   <line x1={L.left} x2={L.left+L.spectrumWidth*f/(FRAMES-1)} y1={L.baseline+8} y2={L.baseline+8} stroke={P.teal} strokeWidth="2"/>
  </svg>
  <div style={{position:'absolute',left:L.left,top:L.footer,width:L.spectrumWidth,display:'flex',justifyContent:'space-between',fontSize:portrait?17:16,letterSpacing:3,color:P.muted}}><span>ПОЛОВИНКА</span><span>RU / EN</span></div>
 </AbsoluteFill></AbsoluteFill>;
};
