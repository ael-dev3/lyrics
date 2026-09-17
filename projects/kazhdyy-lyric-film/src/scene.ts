import type {ProductionData,Format} from './schema.ts';
import type {Layouts,Box} from './layout-types.ts';
import {activeSource,activeTargets,visibleCue} from './focus.ts';
import {palette as p} from './palette.ts';
import {artworkPose} from './motion.ts';
const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
const smooth=(n:number)=>{const t=clamp(n);return t*t*(3-2*t);};
const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const f=(n:number)=>n.toFixed(3);

// Musical sections and decorative framing stay separate from acoustic word intervals.
export function motionAt(t:number,bands:number[][]){
 const values=bands[Math.max(0,Math.min(bands.length-1,Math.round(t*60)))]??Array<number>(64).fill(-100);
 const low=values.slice(2,18).reduce((n,x)=>n+10**(x/10),0)/16;
 const energy=clamp((10*Math.log10(Math.max(1e-12,low))+40)/32);
 const chorus=[[69.7,88.5],[157,174],[174.4,192.4]].reduce((a,[s,e])=>Math.max(a,smooth((t-(s??0))/.7)*(1-smooth((t-(e??0))/1.3))),0);
 const interlude=smooth((t-87)/1.8)*(1-smooth((t-103)/1.4));
 const intro=1-smooth((t-15)/2.8),outro=smooth((t-192)/3);
 return {values,energy,chorus,interlude,intro,outro};
}

export function sceneSvg(frame:number,format:Format,data:ProductionData,layouts:Layouts,bands:number[][]){
 const l=layouts[format],{width:w,height:h}=l,t=frame/data.fps,m=motionAt(t,bands),portrait=format==='portrait';
 const cue=visibleCue(data,frame),a=cue?activeSource(cue,frame,data):new Set<string>(),b=cue?activeTargets(cue,frame,data):new Set<string>();
 const artW=portrait?1080:910,artH=portrait?1020:1080;
 const {scale,x,y}=artworkPose(frame,portrait);
 const opacity=1-smooth((t-(data.duration-2.2))/2.2);
 const artInk=p.ink,artPaper=p.ivory;
 const railY=portrait?1000:1026,railX=portrait?86:64,railW=artW-railX*2;
 const bars=m.values.map((db,i)=>{const value=clamp((db+64)/55)**1.35,height=3+value*(36+72*m.chorus);const bx=railX+i*railW/63;return `<path d="M ${f(bx)} ${railY} v ${f(-height)}" data-band="${i}" stroke="${p.vermilion}" stroke-width="${portrait?5:4}"/>`;}).join('');
 const lyric=(boxes:Box[],active:Set<string>,lang:string)=>`<g data-language="${lang}" font-family="LyricSans" font-size="${l.fontSize}" font-weight="500">${boxes.map(word=>`<text data-word="${word.id}" x="${word.x}" y="${word.y}" fill="${active.has(word.id)?p.vermilion:p.ivory}">${esc(word.text)}</text>`).join('')}</g>`;
 const body=cue&&l.cues[cue.id]?lyric(l.cues[cue.id]!.ru,a,'ru')+lyric(l.cues[cue.id]!.en,b,'en'):'';
 const titleX=portrait?90:995,titleY=portrait?1240:361,titleSize=portrait?116:112,titleLeading=portrait?137:132;
 const titleVisible=cue?0:Math.max(m.intro,m.interlude,m.outro);
 const title=`<g id="title-layer" opacity="${f(titleVisible)}" font-family="LyricSans" font-weight="700" font-size="${titleSize}" fill="${p.ivory}">${['КАЖДЫЙ, КТО','ДЕЛАЛ ТЕБЕ','БОЛЬНО'].map((line,i)=>`<text x="${titleX}" y="${titleY+i*titleLeading}"${i===2?` fill="${p.vermilion}"`:''}>${line}</text>`).join('')}<text x="${titleX+3}" y="${titleY+titleLeading*2+76}" font-size="${portrait?28:24}" font-weight="500" letter-spacing="3">EVERYONE WHO HURT YOU</text></g>`;
 const identityX=portrait?86:990,identityY=portrait?88:96;
 const seam=portrait?`<path d="M0 1012 Q 270 1029 540 1012 T1080 1012 V1045 H0Z" fill="${p.ink}"/>`:`<path d="M891 0 Q 910 200 894 380 T900 720 T894 1080 H950 V0Z" fill="${p.ink}"/>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" data-palette="three-base-colors"><defs><clipPath id="artclip"><rect width="${artW}" height="${artH}"/></clipPath><filter id="inkprint" color-interpolation-filters="sRGB"><feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .2126 .7152 .0722 0 0" result="luma"/><feComponentTransfer in="luma" result="lightmask"><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer><feFlood flood-color="${artInk}" result="black"/><feFlood flood-color="${artPaper}" result="paper"/><feComposite in="paper" in2="lightmask" operator="in" result="white"/><feComposite in="white" in2="black" operator="over" result="duotone"/><feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 3 -1.5 -1.5 0 0" result="redness"/><feComponentTransfer in="redness" result="redmask"><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer><feFlood flood-color="${p.vermilion}" result="red"/><feComposite in="red" in2="redmask" operator="in" result="redeyes"/><feComposite in="redeyes" in2="duotone" operator="over"/></filter><linearGradient id="artfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.ink}" stop-opacity="0"/><stop offset="1" stop-color="${p.ink}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="${p.ink}"/><g id="scene-content" opacity="${f(opacity)}"><g clip-path="url(#artclip)"><g id="art-pose" transform="translate(${f(x)} ${f(y)}) scale(${f(scale)})"><image href="/public/artwork.png" width="1080" height="1080" filter="url(#inkprint)"/></g><rect x="0" y="${railY-185}" width="${artW}" height="${artH-(railY-185)+5}" fill="url(#artfade)"/>${bars}</g>${seam}${portrait?`<rect width="1080" height="143" fill="${p.ink}"/>`:""}<g font-family="LyricSans" fill="${p.ivory}" font-weight="500"><text x="${identityX}" y="${identityY}" font-size="${portrait?28:28}" letter-spacing="5">ЗАБЕЙ, ЛЕРОЧКА</text><path d="M${identityX} ${identityY+29} h ${portrait?145:175}" stroke="${p.vermilion}" stroke-width="3"/></g>${portrait?'':`<text x="${identityX}" y="${identityY+78}" fill="${p.ivory}" font-family="LyricSans" font-size="21" letter-spacing="1.8">КАЖДЫЙ, КТО ДЕЛАЛ ТЕБЕ БОЛЬНО</text>`}<g id="lyric-layer" data-cue="${cue?.id??''}">${body}</g>${title}</g></svg>`;
}
