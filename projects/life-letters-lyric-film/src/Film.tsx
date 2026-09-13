import React,{useEffect,useState} from 'react';
import {AbsoluteFill,OffthreadVideo,staticFile,useCurrentFrame,delayRender,continueRender,cancelRender} from 'remotion';
import data from './landscape-cues.json';
import spectrum from '../public/science.json';
import voice from '../public/vocal-motion.json';
import {parseCues} from './schema';
import {FPS,WIDTH,HEIGHT,FRAMES,FONT,PHONETIC_FONT,LANE,P} from './config';
const cues=parseCues(data);
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const smooth=(a:number,b:number,t:number)=>{const q=clamp((t-a)/Math.max(.0001,b-a));return q*q*(3-2*q);};
const windows=cues.map((c,i)=>{
 const prev=cues[i-1],next=cues[i+1];
 return {a:c.displayStart??Math.max(c.start-.24,prev?(prev.end+c.start)/2:0),b:c.displayEnd??Math.min(c.end+.3,next?(c.end+next.start)/2:Infinity)};
});
const css=`@font-face{font-family:Oswald;src:url('${staticFile('Oswald-Medium.ttf')}');font-weight:500}@font-face{font-family:Cormorant;src:url('${staticFile('CormorantGaramond-Semibold.ttf')}');font-weight:600}*{box-sizing:border-box;font-synthesis:none}`;
export const Film:React.FC=()=>{
 const f=useCurrentFrame(),t=f/FPS;
 const [handle]=useState(()=>delayRender('Load Cyrillic and Spanish fonts'));
 useEffect(()=>{Promise.all([document.fonts.load('500 82px Oswald'),document.fonts.load('600 96px Cormorant')]).then(()=>continueRender(handle)).catch(cancelRender);},[handle]);
 const index=windows.findIndex(w=>t>=w.a&&t<w.b),cue=cues[index],window=windows[index];
 const activeEvents=cue?.events.filter(e=>f>=Math.round(e.start*FPS)&&f<Math.round(e.end*FPS))??[];
 const held=activeEvents.find(e=>e.held)?.held;
 const level=voice[Math.min(f,voice.length-1)]??0,energy=spectrum[Math.min(f,spectrum.length-1)]??[];
 useEffect(()=>{
  if(!cue)return;
  const check=delayRender('Verify three-layer lyric bounds');
  document.fonts.ready.then(()=>{
   for(const lane of Array.from(document.querySelectorAll<HTMLElement>('[data-lane]'))){
    const boundary=lane.getBoundingClientRect();
    for(const token of Array.from(lane.querySelectorAll<HTMLElement>('[data-lyrics],[data-pronunciation]'))){
     const b=token.getBoundingClientRect();
     if(b.left<boundary.left-1||b.right>boundary.right+1||b.bottom>904)throw Error('Lyric geometry overflow: '+cue.id+' '+token.textContent);
    }
   }
   continueRender(check);
  }).catch(cancelRender);
 },[cue?.id]);

 const opacity=cue&&window?smooth(window.a,Math.min(cue.start,window.a+.14),t)*(1-smooth(Math.max(cue.end,window.b-.14),window.b,t)):0;
 const endShade=1-smooth(FRAMES-24,FRAMES-1,f),overlay=1-smooth(232,234,t);
 const activeWord=(i:number)=>cue?.words[i]?t>=cue.words[i]!.start&&t<cue.words[i]!.end:activeEvents.some(e=>e.ru.includes(i));
 const shadow=(color:string,live:boolean)=>`0 2px 12px #100b18,0 0 28px rgba(16,11,24,.9)${live?`,0 0 ${12+22*level}px ${color}66`:''}`;
 const letters=(word:string,character:number,color:string)=><>{Array.from(word).map((ch,j)=><span key={j} data-held-letter={j===character?'true':undefined} style={{color:j===character?color:P.paper,textShadow:shadow(color,j===character)}}>{ch}</span>)}</>;
 return <AbsoluteFill style={{background:P.night,color:P.paper,fontFamily:'Oswald',overflow:'hidden'}}>
  <style>{css}</style>
  <AbsoluteFill style={{opacity:endShade}}>
   <OffthreadVideo src={staticFile('footage-1080p.mp4')} muted style={{position:'absolute',left:0,top:(HEIGHT-1080*WIDTH/1920)/2,width:WIDTH,height:1080*WIDTH/1920}}/>
   <AbsoluteFill style={{opacity:overlay,background:'linear-gradient(180deg,rgba(16,11,24,.55),transparent 23%,rgba(16,11,24,.22) 42%,rgba(16,11,24,.84) 54%,rgba(16,11,24,.96) 86%,#100b18)'}}/>
   <div style={{opacity:overlay,position:'absolute',left:128,top:83,fontSize:22,letterSpacing:2.4,color:P.paper}}>NEVER GET USED TO PEOPLE</div>
   <div style={{opacity:overlay,position:'absolute',left:124,top:116,fontFamily:'Cormorant',fontWeight:600,fontSize:76,letterSpacing:-.4}}>Life Letters</div>
   <div style={{opacity:overlay,position:'absolute',right:128,top:89,fontSize:19,letterSpacing:2.4,color:P.dim}}>РУССКИЙ / ESPAÑOL ARGENTINO</div>
   <div style={{position:'absolute',left:60,top:400,width:WIDTH-120,height:630,opacity:held?.char!==undefined?.25+level*.4:.08,background:'radial-gradient(ellipse at 35% 60%,#c6228955,transparent 63%)'}}/>
   {cue&&<div data-cue={cue.id} style={{opacity}}>
    <div data-lane="ru" style={{position:'absolute',left:128,top:545,width:LANE}}>
     <div style={{fontSize:19,letterSpacing:3,color:P.dim,marginBottom:20}}>РУССКИЙ <span style={{marginLeft:22,color:P.phonetic,letterSpacing:1.4}}>{cue.texture?'· ECO VOCAL':'· PRONUNCIACIÓN'}</span></div>
     {cue.ruRows.map((row,ri)=><div data-row={ri} key={ri} style={{display:'flex',gap:20,height:155,alignItems:'flex-start'}}>{row.map(i=>{
      const active=activeWord(i),h=held?.word===i?held:undefined;
      return <div data-token={i} key={i} style={{display:'flex',flexDirection:'column',alignItems:'flex-start',whiteSpace:'nowrap',opacity:cue.texture&&i===0?.32:1}}>
       <div data-lyrics style={{fontSize:FONT,lineHeight:1.15,textTransform:'uppercase',color:active?P.accent:P.paper,textShadow:shadow(P.accent,active)}}>{h?letters(cue.ru[i]??'',h.char,P.accent):cue.ru[i]}</div>
       <div data-pronunciation style={{fontSize:PHONETIC_FONT,lineHeight:1.15,marginTop:8,letterSpacing:.1,color:active?P.accent:P.phonetic,textShadow:shadow(P.accent,active)}}>{h&&h.phonChar!==undefined?letters(cue.phonetic[i]??'',h.phonChar,P.accent):cue.phonetic[i]}</div>
      </div>;
     })}</div>)}
    </div>
    <div data-lane="es" style={{position:'absolute',left:1236,top:545,width:LANE}}>
     <div style={{fontSize:19,letterSpacing:3,color:P.dim,marginBottom:20}}>ESPAÑOL · ARGENTINA</div>
     {cue.esRows.map((row,ri)=><div data-row={ri} key={ri} style={{display:'flex',gap:20,height:101}}>{row.map(i=>{const active=activeEvents.some(e=>e.es.includes(i));return <span data-token={i} data-lyrics key={i} style={{fontSize:FONT,lineHeight:1.15,textTransform:'uppercase',whiteSpace:'nowrap',color:active?P.esAccent:P.paper,textShadow:shadow(P.esAccent,active)}}>{cue.es[i]}</span>;})}</div>)}
    </div>
   </div>}
   {t<8.5&&<div style={{position:'absolute',left:128,top:615,opacity:smooth(.7,1.3,t)*(1-smooth(7.7,8.4,t))}}>
    <div style={{fontFamily:'Cormorant',fontSize:68}}>Una voz. Dos idiomas. Cada sonido.</div>
    <div style={{fontSize:32,marginTop:20,color:P.phonetic,letterSpacing:.5}}>La tilde marca el acento · ia, sin «sh» · ï, una i más atrás</div>
   </div>}
   <svg width={WIDTH} height={HEIGHT} style={{opacity:overlay,position:'absolute',inset:0,pointerEvents:'none'}}>
    <defs><linearGradient id="bar" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#98337d"/><stop offset=".65" stopColor={P.accent}/><stop offset="1" stopColor="#ffe4d6"/></linearGradient><filter id="spectrum-glow"><feGaussianBlur stdDeviation="6"/></filter></defs>
    <g opacity={.25} filter="url(#spectrum-glow)">{energy.map((db,i)=>{const h=3+Math.pow(clamp((db+72)/58),1.4)*117;return <rect key={i} x={128+i*32.7} y={1030-h} width={20} height={h} fill={P.accent}/>;})}</g>
    {energy.map((db,i)=>{const h=3+Math.pow(clamp((db+72)/58),1.4)*117;return <rect key={i} x={128+i*32.7} y={1030-h} rx={2} width={20} height={h} fill="url(#bar)" opacity={.88}/>;})}
    <line x1={128} x2={2220} y1={1049} y2={1049} stroke={P.paper} strokeOpacity={.15}/>
    <line x1={128} x2={128+2092*f/(FRAMES-1)} y1={1049} y2={1049} stroke={P.accent} strokeOpacity={.85} strokeWidth={2}/>
   </svg>
  </AbsoluteFill>
 </AbsoluteFill>;
};
