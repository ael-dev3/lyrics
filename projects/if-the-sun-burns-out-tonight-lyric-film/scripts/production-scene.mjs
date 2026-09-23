import {readFileSync} from 'node:fs';
import {canvasApi} from './native-env.mjs';
import {createCues,cueAt,wordIndexAt,spectrumAt} from '../src/preview-core.js';
import {paintSpectrum} from '../src/spectrum-view.js';
import {drawSunfire} from '../src/sunfire.js';
import {fireDynamicsAt} from '../src/fire-dynamics.js';
import {isSunbeamWord,sunbeamPresence,drawSunbeam} from '../src/sunbeam.js';
import {frostState,drawFrost} from '../src/frost.js';
import {darknessState,drawDarkness} from '../src/darkness.js';
import {damageState,drawDamage} from '../src/damage.js';
const {createCanvas,GlobalFonts}=canvasApi;
const json=p=>JSON.parse(readFileSync(p,'utf8'));
const smooth=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
const token=w=>w.text.toLowerCase().replace(/[^a-z]/g,'');
export const timeline=json('src/timeline.json'),cues=createCues(timeline);
const measured=json('src/production-layout.json'),features=json('public/audio-features.json');
const bytes=readFileSync('public/'+features.data.path),values=new Uint16Array(bytes.buffer,bytes.byteOffset,bytes.length/2);
const fireData=json('public/fire-dynamics.json');
GlobalFonts.registerFromPath(process.env.LYRIC_FONT||'output/runtime/AvenirNextCondensed-DemiBold.ttf','SunburnApprovedDemi');

export function createScene(format) {
  if(!['landscape','portrait'].includes(format))throw Error('Unknown format');
  const portrait=format==='portrait',width=portrait?1080:1920,height=portrait?1920:818;
  const [rw,rh,fontSize,spacing,wordHeight]=measured.reference[format],scale=width/rw;
  const canvas=createCanvas(width,height),c=canvas.getContext('2d');
  const effect=createCanvas(width,height),ec=effect.getContext('2d');
  const layouts=new Map(),words=new Map();
  const gap=portrait?6.8203125:8.2890625;
  const m=createCanvas(2,2).getContext('2d');m.font=`600 ${fontSize}px "SunburnApprovedDemi"`;m.letterSpacing=spacing+'px';
  function makeWord(word,x,y,w) {
    const padding=fontSize*.8,mask=createCanvas(Math.ceil((w+padding*2)*scale),Math.ceil((wordHeight+padding*2)*scale));
    const mc=mask.getContext('2d');mc.scale(scale,scale);mc.translate(padding,padding);
    mc.font=m.font;mc.letterSpacing=m.letterSpacing;mc.fillStyle='#fff';
    const nativeWidth=m.measureText(word.text).width,fit=w/nativeWidth;
    mc.save();mc.scale(fit,1);mc.fillText(word.text,0,fontSize);mc.restore();
    const glyphs=[...word.text].map((ch,i)=>{const a=m.measureText(word.text.slice(0,i)).width*fit,b=m.measureText(word.text.slice(0,i+1)).width*fit;return{ch,x:x+a,width:b-a};});
    const cache={};
    for(const [key,color] of [['paper','#eef0ec'],['gold','#ffda85']]){
      const f=createCanvas(mask.width,mask.height),fc=f.getContext('2d');fc.drawImage(mask,0,0);fc.globalCompositeOperation='source-in';fc.fillStyle=color;fc.fillRect(0,0,f.width,f.height);cache[key]=f;
    }
    const result={...word,x,y,width:w,height:wordHeight,padding,mask,cache,glyphs};words.set(word.id,result);return result;
  }
  for(const entry of measured.formats[format])for(const index of entry.cues){
    let wi=0;const list=[];
    for(const [y,first,...widths] of entry.rows){let x=first;for(const w of widths){list.push(makeWord(cues[index].words[wi++],x,y,w));x+=w+gap;}}
    if(wi!==cues[index].words.length)throw Error('Incomplete frozen layout '+index);
    layouts.set(index,list);
  }
  function layer(paint,blur=0){ec.setTransform(1,0,0,1,0,0);ec.clearRect(0,0,width,height);ec.save();ec.scale(scale,scale);paint(ec);ec.restore();c.save();c.setTransform(1,0,0,1,0,0);c.filter=blur?`blur(${blur*scale}px)`:'none';c.drawImage(effect,0,0);c.restore();}
  function gradient(ctx,w,h,angle,stops){const a=angle*Math.PI/180,dx=Math.sin(a),dy=-Math.cos(a),length=Math.abs(w*dx)+Math.abs(h*dy);const g=ctx.createLinearGradient(w/2-dx*length/2,h/2-dy*length/2,w/2+dx*length/2,h/2+dy*length/2);for(const [p,color]of stops)g.addColorStop(Math.max(0,Math.min(1,p)),color);return g;}
  function coloredWord(w,frost,damage){
    const out=createCanvas(w.mask.width,w.mask.height),q=out.getContext('2d');q.scale(scale,scale);q.translate(w.padding,w.padding);
    if(frost?.presence){const ice=[255,218,133].map((v,i)=>Math.round(v+([180,225,246][i]-v)*frost.presence));const front=(frost.spread*118-18)/100;
      q.fillStyle=gradient(q,w.width,wordHeight,108,[[0,`rgb(${ice})`],[Math.max(0,front),`rgb(${ice})`],[Math.max(0,front+.18),'#ffda85'],[1,'#ffda85']]);
    }else q.fillStyle='#ffda85';
    q.fillRect(-w.padding,-w.padding,w.width+w.padding*2,wordHeight+w.padding*2);
    if(damage?.fracture)for(const[a,p,span]of[[119,.29,.014],[64,.57,.013],[127,.77,.01]]){
      // Explicit narrow strips avoid native-gradient duplicate-stop ambiguity.
      const rad=a*Math.PI/180,dx=Math.sin(rad),dy=-Math.cos(rad),length=Math.abs(w.width*dx)+Math.abs(wordHeight*dy);
      const cx=w.width/2+dx*(p+span*.5-.5)*length,cy=wordHeight/2+dy*(p+span*.5-.5)*length,reach=w.width+wordHeight;
      q.strokeStyle=`rgba(90,47,25,${damage.fracture*.62})`;q.lineWidth=length*span;
      q.beginPath();q.moveTo(cx-dy*reach,cy+dx*reach);q.lineTo(cx+dy*reach,cy-dx*reach);q.stroke();
    }
    q.setTransform(1,0,0,1,0,0);q.globalCompositeOperation='destination-in';q.drawImage(w.mask,0,0);return out;
  }
  function drawWord(w,active,fx){
    const x=(w.x-w.padding)*scale,y=(w.y-w.padding)*scale;
    const body=(fx.frost?.presence||fx.damage?.fracture)?coloredWord(w,fx.frost,fx.damage):w.cache[active?'gold':'paper'];
    c.save();c.setTransform(1,0,0,1,0,0);
    // Shadows are layered behind fixed glyphs; CSS uses the same per-word envelopes.
    const shadows=[[0,2,active?7:8,'rgba(0,0,0,.88)']];
    if(fx.dark?.presence)shadows.unshift([Math.sin(fx.dark.progress*Math.PI*1.25)*fontSize*.17,(-.09+Math.cos(fx.dark.progress*Math.PI)*.08)*fontSize,fontSize*.19,`rgba(4,5,13,${fx.dark.presence*.75})`]);
    if(fx.nova)shadows.push([0,0,fontSize*.43,`rgba(154,88,235,${fx.nova*.3})`],[0,0,fontSize*.16,`rgba(209,166,255,${fx.nova*.52})`]);
    if(fx.beam)shadows.push([0,0,fontSize*.24,`rgba(255,226,157,${fx.beam*.32})`]);
    if(fx.fire)shadows.push([0,0,fontSize*.2,`rgba(255,167,45,${fx.fire})`]);
    if(fx.frost?.presence)shadows.push([0,0,fontSize*.12,`rgba(184,230,249,${fx.frost.presence*.26})`]);
    if(fx.damage?.impact)shadows.push([0,0,fontSize*.13,`rgba(225,151,95,${fx.damage.impact*.24})`]);
    // Rasterize tinted masks on-canvas. Skia culls an off-canvas body even
    // when its shadow offset would return to the output. Gaussian sigma is
    // half the CSS/Canvas shadow blur radius; glyph body is painted once.
    for(const[dx,dy,blur,color]of shadows){
      const tint=createCanvas(body.width,body.height),tc=tint.getContext('2d');
      tc.drawImage(w.mask,0,0);tc.globalCompositeOperation='source-in';
      tc.fillStyle=color;tc.fillRect(0,0,tint.width,tint.height);
      c.filter=`blur(${blur*scale*.5}px)`;c.drawImage(tint,x+dx*scale,y+dy*scale);
    }
    c.filter='none';c.drawImage(body,x,y);c.restore();
  }
  function paint(time){
    c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,width,height);c.scale(scale,scale);
    const presence=smooth((time-cues[0].words[0].start+.8)/.6)*smooth((cues.at(-1).words.at(-1).end+.8-time)/.6);
    const shade=c.createLinearGradient(0,0,0,rh);
    for(const[p,a]of(portrait?[[0,.03],[.38,0],[.50,.1],[.67,.36],[1,.56]]:[[0,0],[.44,0],[.57,.06],[.77,.32],[1,.68]]))shade.addColorStop(p,`rgba(7,9,12,${a*presence})`);
    c.fillStyle=shade;c.fillRect(0,0,rw,rh);
    const cue=cueAt(cues,time),list=cue?layouts.get(cue.index):[],active=cue?wordIndexAt(cue.words,time):-1,w=list[active],tok=w?token(w):'';
    const fd=fireDynamicsAt(fireData,time),first=cue?cue.words.findIndex((w,i)=>token(w)==='sun'&&/^(burns|burnt)$/.test(token(cue.words[i+1]||{text:''}))&&token(cue.words[i+2]||{text:''})==='out'&&token(cue.words[i+3]||{text:''})==='tonight'):-1;
    let fp=0;
    if(first>=0){const phrase={start:cue.words[first].start,end:Math.min(cue.displayEnd,cue.words[first+3].end+.18)};fp=smooth((time-phrase.start)/.12)*smooth((phrase.end-time)/.20);
      if(fp&&fd.drive){const anchors=[];for(let wi=first;wi<first+4;wi++){const word=list[wi];for(let i=0;i<word.glyphs.length;i++){const g=word.glyphs[i];if(!/[a-z]/i.test(g.ch))continue;let seed=i+1;for(const ch of word.id)seed=(seed*31+ch.charCodeAt(0))>>>0;const gy=word.y+fontSize*(/[bdfhkltA-Z]/.test(g.ch)?.2:.39),prior=list.filter(n=>n.y<word.y-3).map(n=>n.y+n.height);anchors.push({x:g.x+g.width*.5,y:gy,width:g.width,fontSize,maxRise:Math.min(fontSize*1.9,Math.max(0,gy-(prior.length?Math.max(...prior):-Infinity)-fontSize*.08)),seed,wordStart:word.start,wordEnd:word.end,role:wi===first+1?'burns':token(word)});}}
        layer(q=>drawSunfire(q,rw,rh,anchors,time,fd.drive,{phase:fd.phase,presence:fp}),.3);
      }
    }
    const beam=w&&isSunbeamWord(cue.words,active)?sunbeamPresence(time,w):0;
    const frost=/^(colder|freezing)$/.test(tok)?frostState(time,w):null;
    const nova=/^(supernova|void)$/.test(tok)?smooth((time-w.start)/.18)*smooth((w.end-time)/.28):0;
    const dark=/^(darkness|void)$/.test(tok)?darknessState(time,w):null;
    const damage=damageState(time,w);
    if(beam)layer(q=>drawSunbeam(q,rw,rh,{x:w.x+w.width*.5,y:w.y+w.height*.48,wordWidth:w.width,fontSize},beam,(time-w.start)/(w.end-w.start)));
    if(frost?.presence)layer(q=>drawFrost(q,w.glyphs.map(g=>({x:g.x+g.width*.53,y:w.y+fontSize*(/[bdfhkltA-Z]/.test(g.ch)?.2:.39),fontSize})),frost.presence,frost.spread));
    if(dark?.presence)layer(q=>{q.translate(w.x-fontSize*.7,w.y-fontSize*.55);drawDarkness(q,w.width+fontSize*1.4,w.height+fontSize*1.1,fontSize,w.width,dark.presence,dark.progress);});
    if(damage.presence)layer(q=>{q.translate(w.x-fontSize*.45,w.y-fontSize*.45);drawDamage(q,w.width+fontSize*.9,w.height+fontSize*.9,fontSize,w.width,damage);});
    const spec={x:rw*(portrait?.13:.15),y:rh*(portrait?.79:.845),width:rw*(portrait?.74:.7),height:rh*(portrait?.1:.135)};
    layer(q=>{q.translate(spec.x,spec.y);q.globalAlpha=presence;paintSpectrum(q,spec.width,spec.height,spectrumAt(values,features,time));});
    list.forEach((word,i)=>drawWord(word,i===active,{...(i===active?{beam,frost,nova,dark,damage}:{}),fire:fp&&i>=first&&i<first+4?fp*(.15+.85*Math.sqrt(fd.drive))*(i===active?.85:.12):0}));
    return canvas;
  }
  return{paint,width,height,format,scale,reference:[rw,rh],layouts};
}
