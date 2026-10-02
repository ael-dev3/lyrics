import {PALETTE, SOURCE_HEIGHT, SOURCE_WIDTH, sourceActive, targetActive, validateTimeline, visibleCue, type Cue, type FeatureData, type Format, type FramingSpan, type Timeline} from './model.ts';
export type {Format} from './model.ts';
let timeline: Timeline;
let features: FeatureData;
let framing: FramingSpan[] = [];
const layouts = new Map<string, Layout>();
type Context = CanvasRenderingContext2D;
interface Surface {canvas:CanvasImageSource;context:Context;}
let surfaceFactory: (()=>Surface)|undefined;
let ambient:Surface|undefined;
let ambientFrame=-1;
interface Slot {index: number; text: string; x: number; y: number; width: number;}
interface Layout {size: number; source: Slot[]; target: Slot[]; top: number; bottom: number;}
const clamp = (x: number, a = 0, b = 1): number => Math.min(b, Math.max(a, x));
const smooth = (a: number, b: number, x: number): number => {if(b<=a)return x>=b?1:0;const u = clamp((x-a)/(b-a)); return u*u*(3-2*u);};
export function cueOpacity(cue:Cue,time:number):number {
  // Whole-line readability persists beyond lexical focus for reviewed vocal
  // tails. Closely adjoining phrases replace each other without a blank frame.
  const entryEnd=Math.max(cue.visibleStart,Math.min(cue.start, cue.start-.015));
  if(time<cue.visibleStart || time>=cue.visibleEnd)return 0;
  return smooth(cue.visibleStart,entryEnd,time)*(cue.exitMode==='vocal-handoff'?1:1-smooth(cue.fullOpacityEnd,cue.visibleEnd,time));
}

export async function loadScene(): Promise<void> {
  const read = async <T>(path: string): Promise<T> => {const r = await fetch(path); if (!r.ok) throw Error(`Cannot load ${path}`); return r.json() as Promise<T>;};
  [timeline, features, framing] = await Promise.all([read<Timeline>('/public/timeline.json'), read<FeatureData>('/public/audio-features.json'), read<FramingSpan[]>('/public/portrait-framing.json')]);
  validateTimeline(timeline);
  if (features.sourceSha256 !== timeline.sourceSha256 || features.analysis.frameRate.numerator !== 25 || features.analysis.frameRate.denominator !== 1) throw Error('Features do not belong to the locked source');
  const font = new FontFace('Komety', "url('/public/fonts/CormorantGaramond-Semibold.ttf')", {weight: '600'});
  await font.load(); document.fonts.add(font); await document.fonts.ready;
  surfaceFactory=()=>{const canvas=document.createElement('canvas');canvas.width=270;canvas.height=480;const context=canvas.getContext('2d');if(!context)throw Error('Portrait source atmosphere unavailable');return {canvas,context};};
}
export function getLines(): {id: string; label: string; start: number; end: number}[] {
  return timeline.cues.map(c => ({id:c.id, label:c.sourceText, start:c.start, end:c.end}));
}
export function getReadingCue(time:number):Cue|undefined {return visibleCue(timeline,time);}
export function getSceneIdentity():Pick<Timeline,'revision'|'sampleRate'|'sourceSha256'> {
  return {revision:timeline.revision,sampleRate:timeline.sampleRate,sourceSha256:timeline.sourceSha256};
}
export function setSceneForProof(t: Timeline, f: FeatureData, spans: FramingSpan[], factory?:()=>Surface): void {validateTimeline(t);timeline=t;features=f;framing=spans;layouts.clear();surfaceFactory=factory;ambient=undefined;ambientFrame=-1;}

function wrap(ctx: Context, tokens: {text:string}[], breaks: number[], maxWidth: number): number[][] {
  const lines: number[][] = []; let line: number[] = []; let width = 0;
  const space = ctx.measureText(' ').width;
  tokens.forEach((token,index) => {
    const word = ctx.measureText(token.text).width;
    if (line.length && width+space+word > maxWidth) {lines.push(line);line=[];width=0;}
    width += (line.length ? space : 0)+word;line.push(index);
    if (breaks.includes(index)) {lines.push(line);line=[];width=0;}
  });
  if(line.length) lines.push(line);return lines;
}
export function cueLayout(ctx: Context, cue: Cue, format: Format): Layout {
  const key = `${cue.id}:${format}`;
  const prior = layouts.get(key); if(prior) return prior;
  const portrait = format==='portrait';const width=portrait?1080:1920;
  const maxWidth=portrait?886:1720;
  const short=Math.max(cue.words.length,cue.targets.length)<=6;
  const endcard=cue.start>=234;
  let size=portrait?(short?76:65):(endcard?36:short?64:53);
  let sourceLines: number[][]=[],targetLines: number[][]=[];
  // Both languages share one size, face, weight, fill and outline. Dense phrases
  // reflow as complete geometry before any focus state is evaluated.
  for(;size>=(portrait?58:endcard?36:46);size--) {
    ctx.font=`600 ${size}px Komety`;
    sourceLines=wrap(ctx,cue.words,cue.sourceBreaks,maxWidth);targetLines=wrap(ctx,cue.targets,cue.targetBreaks,maxWidth);
    if (sourceLines.length+targetLines.length <= (portrait?7:4)) break;
  }
  const lineHeight=size*1.10;const languageGap=size*.42;
  const total=(sourceLines.length+targetLines.length)*lineHeight+languageGap;
  const bottom=portrait?1615:endcard?784:658;const top=bottom-total;
  const slots=(tokens:{text:string}[],lines:number[][],firstY:number):Slot[] => {
    const space=ctx.measureText(' ').width;
    return lines.flatMap((line,row) => {
      const widths=line.map(i=>ctx.measureText(tokens[i]!.text).width);
      let x=(width-widths.reduce((a,b)=>a+b,0)-space*(line.length-1))/2;
      return line.map((index,n)=>{const slot={index,text:tokens[index]!.text,x,y:firstY+row*lineHeight,width:widths[n]!};x+=widths[n]!+space;return slot;});
    });
  };
  const layout={size,source:slots(cue.words,sourceLines,top+size),target:slots(cue.targets,targetLines,top+sourceLines.length*lineHeight+languageGap+size),top,bottom};
  layouts.set(key,layout);return layout;
}

function picture(ctx: Context, time: number, format: Format, source: CanvasImageSource): void {
  if(format==='landscape') {ctx.drawImage(source,0,0,SOURCE_WIDTH,SOURCE_HEIGHT);return;}
  // A browser may round MP4 duration slightly beyond decoded PCM extent.
  // Retain the final authored framing when holding the last picture.
  const last=framing.at(-1);
  const span=framing.find(s=>time>=s.start && time<s.end)??(last&&time>=last.end?last:undefined);
  if(span?.mode==='wide' || span?.mode==='panorama') {
    // Full authored frame for multi-subject tableaux and original endcards.
    // A dark forest-ground canvas is deliberate portrait framing, not a poster.
    ctx.fillStyle='#080e0d';ctx.fillRect(0,0,1080,1920);
    if(time<234 && surfaceFactory) {
      // Defocused source-only atmosphere fills portrait's unavoidable extra
      // area. Keep the principal picture sharp, unstretched and unobscured.
      // Cache at native cadence/quarter size so focus painting stays light.
      ambient??=surfaceFactory();const frame=Math.floor(time*25);
      if(frame!==ambientFrame) {
        const crop=SOURCE_HEIGHT*9/16;const x=clamp(span.centerX*SOURCE_WIDTH-crop/2,0,SOURCE_WIDTH-crop);
        const b=ambient.context;b.save();b.clearRect(0,0,270,480);b.filter='blur(9px)';b.drawImage(source,x,0,crop,SOURCE_HEIGHT,-8,-14.222222,286,286*16/9);b.restore();
        b.fillStyle='rgba(4,12,8,.60)';b.fillRect(0,0,270,480);ambientFrame=frame;
      }
      ctx.drawImage(ambient.canvas,0,0,1080,1920);
    }
    const cropWidth=span.mode==='wide'?SOURCE_WIDTH:clamp(span.cropWidth??1500,796,SOURCE_WIDTH);
    const left=clamp(span.centerX*SOURCE_WIDTH-cropWidth/2,0,SOURCE_WIDTH-cropWidth);
    const h=1080*SOURCE_HEIGHT/cropWidth;
    const y=time>=234?(1920-h)/2:330;
    ctx.drawImage(source,left,0,cropWidth,SOURCE_HEIGHT,0,y,1080,h);return;
  }
  const fraction=span?clamp((time-span.start)/(span.end-span.start)):0;
  const center=span?.startCenterX!==undefined && span.endCenterX!==undefined
    ? span.startCenterX+(span.endCenterX-span.startCenterX)*fraction : span?.centerX??.5;
  const cropWidth=SOURCE_HEIGHT*1080/1920;
  const left=clamp(center*SOURCE_WIDTH-cropWidth/2,0,SOURCE_WIDTH-cropWidth);
  ctx.drawImage(source,left,0,cropWidth,SOURCE_HEIGHT,0,0,1080,1920);
}

function readingShade(ctx: Context, format: Format):void {
  const portrait=format==='portrait';const width=portrait?1080:1920;const height=portrait?1920:796;
  const g=ctx.createLinearGradient(0,height*(portrait?.51:.46),0,height);
  g.addColorStop(0,'rgba(4,10,8,0)');g.addColorStop(.58,'rgba(4,10,8,.19)');g.addColorStop(1,'rgba(4,10,8,.49)');
  ctx.fillStyle=g;ctx.fillRect(0,0,width,height);
}
function audioRow(time:number):number[] {
  const index=clamp(Math.floor(time*25),0,features.rows.length-1);
  const row=features.rows[index]!;
  // Trailing-only smoothing avoids an invented future response. Measurements
  // themselves retain their documented centered FFT/RMS analysis windows.
  const previous=features.rows[Math.max(0,index-1)]!;
  return row.map((v,i)=>i===1?v:.7*v+.3*previous[i]!);
}
export function response(row:number[]):{level:number;bands:number[];attack:number} {
  const db=(v:number)=>-96+v*96/255;
  const quiet=smooth(-60,-34,db(row[0]!));
  const level=quiet*Math.pow(clamp((db(row[0]!)+32)/27),1.55);
  return {level,bands:row.slice(2).map(v=>quiet*Math.pow(clamp((db(v)+62)/48),1.3)),attack:quiet*row[1]!/255};
}
function ribbon(ctx: Context,time:number,format:Format):void {
  if(time<3 || time>=234) return;
  const portrait=format==='portrait';const row=audioRow(time);const r=response(row);
  const fade=smooth(3,6,time)*(1-smooth(229,234,time));
  const width=portrait?730:930;const left=((portrait?1080:1920)-width)/2;
  const baseline=portrait?1780:760;const reach=portrait?76:42;
  const points=64;const path=()=>{
    ctx.beginPath();
    for(let i=0;i<=points;i++) {
      const u=i/points;const bandPosition=u*(r.bands.length-1);const j=Math.floor(bandPosition);
      const band=(r.bands[j]??0)*(1-bandPosition+j)+(r.bands[Math.min(j+1,r.bands.length-1)]??0)*(bandPosition-j);
      const edge=Math.sin(Math.PI*u);
      const y=baseline-edge*edge*(8+reach*band*(.5+.65*r.level)+reach*.18*r.attack);
      if(i===0)ctx.moveTo(left+i/points*width,y);else ctx.lineTo(left+i/points*width,y);
    }
  };
  ctx.save();ctx.globalAlpha=fade*(.21+.65*r.level);ctx.lineCap='round';ctx.lineJoin='round';
  path();ctx.strokeStyle=PALETTE.light;ctx.lineWidth=portrait?3.8:2.1;
  ctx.shadowColor=PALETTE.focus;ctx.shadowBlur=(portrait?8:5)+r.level*9;ctx.stroke();
  ctx.shadowBlur=0;ctx.globalAlpha=fade*(.12+.25*r.level);path();ctx.lineWidth=portrait?1.5:1;ctx.stroke();ctx.restore();
}
function lettering(ctx:Context,time:number,format:Format,cue:Cue):void {
  const layout=cueLayout(ctx,cue,format);
  const alpha=cueOpacity(cue,time);
  ctx.save();ctx.globalAlpha=alpha;ctx.font=`600 ${layout.size}px Komety`;ctx.textBaseline='alphabetic';
  ctx.lineJoin='round';ctx.lineWidth=format==='portrait'?3.3:2.3;ctx.strokeStyle='rgba(7,13,10,.79)';
  ctx.shadowColor='rgba(0,4,2,.8)';ctx.shadowBlur=format==='portrait'?11:7;ctx.shadowOffsetY=2;
  const draw=(slots:Slot[],target:boolean)=>slots.forEach(slot=>{
    const active=target?targetActive(cue.targets[slot.index]!,cue.words,time,timeline.sampleRate):sourceActive(cue.words[slot.index]!,time,timeline.sampleRate);
    ctx.fillStyle=active?PALETTE.focus:PALETTE.rest;
    ctx.strokeText(slot.text,slot.x,slot.y);ctx.fillText(slot.text,slot.x,slot.y);
  });
  draw(layout.source,false);draw(layout.target,true);ctx.restore();
}
export function paintScene(ctx:Context,time:number,format:Format,source:CanvasImageSource):void {
  ctx.save();ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);picture(ctx,time,format,source);
  // Endcards retain exact source colors, intact lettering and no extra layers.
  const cue=visibleCue(timeline,time);
  if(time<234) {readingShade(ctx,format);ribbon(ctx,time,format);}
  // The late radio reprise remains transcribed over the original endcards.
  // Keep their full picture and reserve the same low reading position.
  if(cue)lettering(ctx,time,format,cue);
  ctx.restore();
}
