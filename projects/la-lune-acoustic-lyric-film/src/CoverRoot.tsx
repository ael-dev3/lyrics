import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Composition,registerRoot,delayRender,continueRender,cancelRender,staticFile} from 'remotion';
import {palette as p} from './palette.ts';
import bands from '../public/science.json';
const escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
function Cover({portrait=false}:{portrait?:boolean}){
 const [handle]=useState(()=>delayRender('Load cover art and font'));
 useEffect(()=>{Promise.all([new FontFace('LunarSans',`url(${staticFile('fonts/SpaceGrotesk.ttf')})`,{weight:'400'}).load(),new Promise<void>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve();image.onerror=()=>reject(Error('Moon missing'));image.src=staticFile('moon-v2.png');})]).then(([font])=>{document.fonts.add(font);continueRender(handle);}).catch(cancelRender);},[handle]);
 const w=portrait?1200:1920,h=portrait?1600:1080,cx=portrait?600:1420,cy=portrait?620:540,r=portrait?408:390,size=r/.397;
 const text=(value:string,x:number,y:number,font:number,fill:string,anchor='middle',tracking=0)=>`<text x="${x}" y="${y}" font-family="LunarSans" font-weight="400" font-size="${font}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${tracking}">${escape(value)}</text>`;
 const spectrum=(bands[10200]??[]).map((v,i)=>{const a=(-240+i*300/63)*Math.PI/180,rr=r+24,length=3+Math.max(0,Math.min(1,(v+62)/45))*25;return `<path d="M ${cx+Math.cos(a)*rr} ${cy+Math.sin(a)*rr} L ${cx+Math.cos(a)*(rr+length)} ${cy+Math.sin(a)*(rr+length)}" stroke="${p.halo}" stroke-width="3" opacity=".65"/>`;}).join('');
 const content=portrait?text('L’IMPÉRATRICE',600,163,80,p.ivory,'middle',4)+text('LA LUNE',600,1245,156,p.accent,'middle',8)+text('VERSION ACOUSTIQUE',600,1340,37,p.ivory,'middle',4):text('L’IMPÉRATRICE',142,334,55,p.ivory,'start',5)+text('LA LUNE',132,569,165,p.accent,'start',6)+text('VERSION ACOUSTIQUE',142,670,39,p.ivory,'start',4);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><radialGradient id="fade"><stop offset=".8" stop-color="white"/><stop offset="1" stop-color="black"/></radialGradient><mask id="mask"><circle cx="${cx}" cy="${cy}" r="${size/2}" fill="url(#fade)"/></mask></defs><rect width="${w}" height="${h}" fill="${p.ink}"/><image href="${staticFile('moon-v2.png')}" x="${cx-size/2}" y="${cy-size/2}" width="${size}" height="${size}" mask="url(#mask)" opacity=".92"/>${spectrum}${content}</svg>`;
 return <AbsoluteFill dangerouslySetInnerHTML={{__html:svg}}/>;
}
registerRoot(()=> <><Composition id="YouTubeCover" component={Cover} width={1920} height={1080} fps={60} durationInFrames={1} defaultProps={{portrait:false}}/><Composition id="TikTokCover" component={Cover} width={1200} height={1600} fps={60} durationInFrames={1} defaultProps={{portrait:true}}/></>);
