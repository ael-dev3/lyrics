import type {ProductionData,Format} from './schema.ts';
import type {Layouts,Box} from './layout-types.ts';
import {activeSource,activeTargets,visibleCue} from './focus.ts';
import {palette as p} from './palette.ts';
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
 const scale=(portrait?1.02:1.12)+.12*m.chorus+.055*m.energy+.20*m.intro+.14*m.interlude;
 const x=(artW-1080*scale)/2+(portrait?10:38)*Math.sin(t*.11);
 const driftY=(portrait?100:(artH-1080*scale)/2)+26*Math.sin(t*.13+.5)+35*m.chorus;
 const y=portrait?driftY:Math.max(driftY,32-64*scale);
 const opacity=1-smooth((t-(data.duration-2.2))/2.2);
 const artInk=m.chorus>.52?p.ivory:p.ink,artPaper=m.chorus>.52?p.ink:p.ivory;
 const eye=(cx:number,cy:number)=>{const radius=19+6*m.energy+8*m.chorus;return `<g transform="translate(${cx} ${cy}) rotate(${f(t*(9+8*m.chorus))})" stroke="${p.vermilion}" fill="none"><ellipse rx="${f(radius)}" ry="${f(radius*.69)}" stroke-width="2.7"/><ellipse rx="${f(radius*.7)}" ry="${f(radius*.47)}" stroke-width="1.5"/><path d="M -8 0 Q 0 -12 10 0 Q 1 12 -8 0" stroke-width="1.5"/></g>`;};
 const threads=Array.from({length:3},(_,i)=>{const phase=t*.22+i*2.1,cx=artW*.48+90*Math.sin(phase),cy=artH*.45+70*Math.cos(phase*.8),r=190+i*85+m.chorus*95+m.energy*30;return `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(r)}" ry="${f(r*.7)}" transform="rotate(${f(-25+phase*12)} ${f(cx)} ${f(cy)})" fill="none" stroke="${p.vermilion}" stroke-width="${i===0?3:1.4}" opacity="${f((.3+.48*m.chorus)*(i===0?1:.7))}"/>`;}).join('');
 const railY=portrait?1000:1026,railX=portrait?86:64,railW=artW-railX*2;
 const bars=m.values.map((db,i)=>{const value=clamp((db+64)/55)**1.35,height=3+value*(36+72*m.chorus);const bx=railX+i*railW/63;return `<path d="M ${f(bx)} ${railY} v ${f(-height)}" stroke="${i%8===0?p.vermilion:p.ivory}" stroke-width="${portrait?5:4}"/>`;}).join('');
 const lyric=(boxes:Box[],active:Set<string>,lang:string)=>`<g data-language="${lang}" font-family="LyricSans" font-size="${l.fontSize}" font-weight="500">${boxes.map(word=>`<text data-word="${word.id}" x="${word.x}" y="${word.y}" fill="${active.has(word.id)?p.vermilion:p.ivory}">${esc(word.text)}</text>`).join('')}</g>`;
 const body=cue&&l.cues[cue.id]?lyric(l.cues[cue.id]!.ru,a,'ru')+lyric(l.cues[cue.id]!.en,b,'en'):'';
 const titleX=portrait?90:995,titleY=portrait?1240:361,titleSize=portrait?116:112,titleLeading=portrait?137:132;
 const titleVisible=cue?0:Math.max(m.intro,m.interlude,m.outro);
 const title=`<g opacity="${f(titleVisible)}" font-family="LyricSans" font-weight="700" font-size="${titleSize}" fill="${p.ivory}">${['КАЖДЫЙ, КТО','ДЕЛАЛ ТЕБЕ','БОЛЬНО'].map((line,i)=>`<text x="${titleX}" y="${titleY+i*titleLeading}"${i===2?` fill="${p.vermilion}"`:''}>${line}</text>`).join('')}<text x="${titleX+3}" y="${titleY+titleLeading*2+76}" font-size="${portrait?28:24}" font-weight="500" letter-spacing="3">EVERYONE WHO HURT YOU</text></g>`;
 const identityX=portrait?86:990,identityY=portrait?88:96;
 const seam=portrait?`<path d="M0 1012 Q ${f(270+22*Math.sin(t*.3))} 1029 540 1012 T1080 1012 V1045 H0Z" fill="${p.ink}"/>`:`<path d="M891 0 Q 910 200 894 380 T900 720 T894 1080 H950 V0Z" fill="${p.ink}"/>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" data-palette="three-base-colors"><defs><clipPath id="artclip"><rect width="${artW}" height="${artH}"/></clipPath><filter id="inkprint" color-interpolation-filters="sRGB"><feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .2126 .7152 .0722 0 0" result="luma"/><feComponentTransfer in="luma" result="lightmask"><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer><feFlood flood-color="${artInk}" result="black"/><feFlood flood-color="${artPaper}" result="paper"/><feComposite in="paper" in2="lightmask" operator="in" result="white"/><feComposite in="white" in2="black" operator="over" result="duotone"/><feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 3 -1.5 -1.5 0 0" result="redness"/><feComponentTransfer in="redness" result="redmask"><feFuncA type="discrete" tableValues="0 1"/></feComponentTransfer><feFlood flood-color="${p.vermilion}" result="red"/><feComposite in="red" in2="redmask" operator="in" result="redeyes"/><feComposite in="redeyes" in2="duotone" operator="over"/></filter><linearGradient id="artfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.ink}" stop-opacity="0"/><stop offset="1" stop-color="${p.ink}"/></linearGradient></defs><rect width="${w}" height="${h}" fill="${p.ink}"/><g opacity="${f(opacity)}"><g clip-path="url(#artclip)"><g transform="translate(${f(x)} ${f(y)}) scale(${f(scale)})"><image href="/public/artwork.png" width="1080" height="1080" filter="url(#inkprint)"/>${eye(374,94)}${eye(340,172)}<path d="M296 433 C${f(255+10*Math.sin(t))} 390 ${f(333+20*Math.cos(t*.7))} 364 296 326" stroke="${p.vermilion}" stroke-width="2" fill="none" opacity=".65"/></g>${threads}<rect x="0" y="${railY-185}" width="${artW}" height="${artH-(railY-185)+5}" fill="url(#artfade)"/>${bars}</g>${seam}${portrait?`<rect width="1080" height="143" fill="${p.ink}"/>`:""}<g font-family="LyricSans" fill="${p.ivory}" font-weight="500"><text x="${identityX}" y="${identityY}" font-size="${portrait?28:28}" letter-spacing="5">ЗАБЕЙ, ЛЕРОЧКА</text><path d="M${identityX} ${identityY+29} h ${portrait?145:175}" stroke="${p.vermilion}" stroke-width="3"/></g>${portrait?'':`<text x="${identityX}" y="${identityY+78}" fill="${p.ivory}" font-family="LyricSans" font-size="21" letter-spacing="1.8">КАЖДЫЙ, КТО ДЕЛАЛ ТЕБЕ БОЛЬНО</text>`}${body}${title}</g></svg>`;
}
