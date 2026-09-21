import type {Format,ProductionData} from './schema.ts';
import type {Layouts} from './layout-types.ts';
import {activeSource,visibleCues} from './focus.ts';
import {montageAt,shotAt} from './trailer.ts';
import {clamp,ease,mixAt} from './score.ts';
export const palette={ink:'#03050b',rest:'#f1f3ed',active:'#fcee0a',cyan:'#00f0ff',violet:'#a879db'};
export type MotionFrame={bass:number;kick:number;strength:number};
export type Media={art:CanvasImageSource;dropOne:CanvasImageSource;dropTwo:CanvasImageSource;pictureTime?:number};
/** Reserve the actual reading area, with a short approach/release outside cue visibility. */
export function spectrumTravelAt(t:number,format:Format,data:ProductionData,layouts:Layouts,nominal:number){
 const p=format==='portrait',baseline=p?1735:997;let travel=nominal;
 for(const cue of data.cues){
  const from=cue.visibleFrom/data.sampleRate,until=cue.visibleUntil/data.sampleRate;
  if(t<from-.2||t>until+.2)continue;
  const l=layouts[format].cues[cue.id]!,floor=Math.max(...l.source.map(w=>w.y))+l.fontSize*.25+(p?40:32);
  // Two pixels of minimum height and the four-pixel facet sit above this travel.
  const safe=Math.max(0,baseline-floor-6),weight=ease((t-from+.2)/.2)*(1-ease((t-until)/.2));
  travel=Math.min(travel,nominal+(Math.min(nominal,safe)-nominal)*weight);
 }
 return travel;
}
const cover=(ctx:CanvasRenderingContext2D,img:CanvasImageSource,x:number,y:number,w:number,h:number,iw:number,ih:number,fx=.5,fy=.5)=>{const scale=Math.max(w/iw,h/ih),sw=w/scale,sh=h/scale;ctx.drawImage(img,(iw-sw)*fx,(ih-sh)*fy,sw,sh,x,y,w,h);};
export function drawScene(ctx:CanvasRenderingContext2D,t:number,format:Format,data:ProductionData,layouts:Layouts,bands:readonly number[][],motion:readonly MotionFrame[],media:Media){
 const l=layouts[format],w=l.width,h=l.height,p=format==='portrait',frame=Math.min(data.frames-1,Math.max(0,Math.round(t*60))),m=motion[frame]!,strength=m.strength,hard=mixAt(t);
 ctx.save();ctx.clearRect(0,0,w,h);ctx.fillStyle=palette.ink;ctx.fillRect(0,0,w,h);
 // Quiet passages preserve the original artwork. The two selected trailer edits
 // enter on the locked music timeline; no 3D scene remains in the composition.
 cover(ctx,media.art,0,0,w,p?1230:h,1254,720,p?.78:.5,.5);
 const montage=montageAt(t),shot=shotAt(media.pictureTime??t);
 if(montage&&hard>0){
  ctx.globalAlpha=hard;
  ctx.fillStyle=palette.ink;ctx.fillRect(0,0,w,h);
  const video=montage.id==='drop-one'?media.dropOne:media.dropTwo;
  cover(ctx,video,0,0,w,p?1435:h,1920,1080,shot?.portraitFocusX??.5,.5);
  ctx.globalAlpha=1;
 }
 let shade=ctx.createLinearGradient(0,0,p?0:w,p?h:0);
 if(p){shade.addColorStop(0,'rgba(3,5,11,.70)');shade.addColorStop(.18,'rgba(3,5,11,.02)');shade.addColorStop(.49,'rgba(3,5,11,.14)');shade.addColorStop(.65,'rgba(3,5,11,.90)');shade.addColorStop(1,'rgba(3,5,11,.96)');}
 else{shade.addColorStop(0,'rgba(3,5,11,.96)');shade.addColorStop(.39,'rgba(3,5,11,.82)');shade.addColorStop(.68,'rgba(3,5,11,.07)');shade.addColorStop(1,'rgba(3,5,11,.16)');}
 ctx.globalAlpha=1-.85*hard;ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);ctx.globalAlpha=1;
 if(p&&hard>0){const edge=ctx.createLinearGradient(0,0,0,1435);edge.addColorStop(0,'rgba(3,5,11,.12)');edge.addColorStop(.12,'rgba(3,5,11,0)');edge.addColorStop(.81,'rgba(3,5,11,0)');edge.addColorStop(1,'#03050b');ctx.globalAlpha=hard;ctx.fillStyle=edge;ctx.fillRect(0,0,w,1435);ctx.globalAlpha=1;}
 const bottom=ctx.createLinearGradient(0,h*.53,0,h);bottom.addColorStop(0,'rgba(3,5,11,0)');bottom.addColorStop(1,'rgba(3,5,11,.9)');ctx.fillStyle=bottom;ctx.fillRect(0,0,w,h);
 const fade=1-ease((t-(data.duration-1.3))/1.3);ctx.globalAlpha=fade;
 const titleAlpha=.8*(1-hard);
 ctx.fillStyle=palette.rest;ctx.textAlign=p?'center':'left';ctx.font=`500 ${p?22:23}px StaySans`;ctx.globalAlpha=fade*titleAlpha;
 ctx.fillText('LAAEMEL / OBLIVION',p?w/2:100,p?61:69);
 ctx.font=`700 ${p?65:71}px StayDisplay`;
 ctx.fillText('I REALLY WANT TO',p?w/2:100,p?139:163);
 ctx.fillText('STAY AT YOUR HOUSE',p?w/2:100,p?218:247);
 ctx.globalAlpha=fade*.74*(1-hard);ctx.fillStyle=palette.active;ctx.font=`500 ${p?20:20}px StaySans`;
 ctx.fillText('H A R D S T Y L E',p?w/2:104,p?267:292);
 ctx.textAlign='left';ctx.globalAlpha=fade;
 const cues=visibleCues(data,frame);
 // The last chorus overlaps the drop. Maintain its reading contrast without
 // dimming the entire action sequence or changing any word geometry.
 if(hard>0&&cues.length&&!p){const protection=ctx.createLinearGradient(0,500,1200,500);protection.addColorStop(0,'rgba(3,5,11,.86)');protection.addColorStop(.7,'rgba(3,5,11,.70)');protection.addColorStop(1,'rgba(3,5,11,0)');ctx.globalAlpha=hard;ctx.fillStyle=protection;ctx.fillRect(0,480,1200,420);ctx.globalAlpha=fade;}

 for(const cue of cues){const active=activeSource(cue,frame,data),layout=l.cues[cue.id]!;
  // Stable glyph positions; source meaning is carried solely by color.
  ctx.font=`600 ${layout.fontSize}px StaySans`;ctx.shadowColor='rgba(0,0,0,.95)';ctx.shadowBlur=10;
  for(const word of layout.source){ctx.fillStyle=active.has(word.id)?palette.active:palette.rest;ctx.fillText(word.text,word.x,word.y);}
  ctx.shadowBlur=0;
 }
 const dbs=bands[frame]??[],baseline=p?1735:997,barWidth=p?8:16,step=p?14:26,origin=(w-step*63-barWidth)/2;
 const maxTravel=p?38+212*strength**1.8:20+187*strength**1.8;
 const gain=1+.16*m.kick*strength;
 const travel=spectrumTravelAt(t,format,data,layouts,maxTravel*gain);
 ctx.globalAlpha=fade*(.50+.47*strength);
 const gradient=ctx.createLinearGradient(origin,0,origin+step*64,0);gradient.addColorStop(0,palette.cyan);gradient.addColorStop(.52,palette.active);gradient.addColorStop(1,palette.cyan);
 for(let i=0;i<64;i++){const amp=clamp(((dbs[i]??-120)+65)/48),height=2+amp**1.45*travel,x=origin+i*step,y=baseline-height;
  ctx.fillStyle=gradient;ctx.fillRect(x,y,barWidth,height);
  if(strength>.55){ctx.fillStyle='rgba(252,238,10,.32)';ctx.beginPath();ctx.moveTo(x+barWidth,y);ctx.lineTo(x+barWidth+3,y-4);ctx.lineTo(x+barWidth+3,baseline-4);ctx.lineTo(x+barWidth,baseline);ctx.fill();}
 }
 // Small reflected light on the scene, confined below lyric baselines; no full-screen strobe.
 if(strength>.75){const glow=ctx.createRadialGradient(w/2,baseline,0,w/2,baseline,w*.5);glow.addColorStop(0,`rgba(0,240,255,${.045+.075*m.kick})`);glow.addColorStop(1,'rgba(0,240,255,0)');ctx.fillStyle=glow;ctx.fillRect(0,baseline-50,w,160);}
 ctx.globalAlpha=fade*.55*(1-.7*hard);ctx.fillStyle=palette.rest;ctx.font=`500 ${p?16:16}px StaySans`;ctx.textAlign=p?'center':'right';
 ctx.fillText('ROSA WALTON  ·  SAMUEL KIM & LORIEN COVER',p?w/2:w-75,p?1835:1048);
 ctx.restore();
}
