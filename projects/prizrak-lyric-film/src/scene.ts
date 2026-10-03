import {tokenActive, visibleCue, visibleCues, vocalTrack, validateTimeline, type Timeline, type FeatureData, type Cue, type Lane, type Token, type Word, type Format} from './model.ts';
export type {Format} from './model.ts';
type Context = CanvasRenderingContext2D;
export interface TextSlot {id:string;index:number;language:Lane['language'];text:string;x:number;y:number;width:number;token:Token;}
export interface LaneLayout {language:Lane['language'];slots:TextSlot[];rows:number;}
export interface CueLayout {size:number;top:number;bottom:number;lanes:LaneLayout[];}
export const PALETTE = {rest:'#a3b6ac',focus:'#f5ffe9',halo:'#9bddc7',spectrum:'#b9e5d4',ground:'#080e12'} as const;
export const COMPOSITION = {
 landscape:{width:1920,height:1080,readingWidth:1600,readingBottom:945,spectrumX:260,spectrumWidth:1400,spectrumBaseline:1050,spectrumTravel:68},
 portrait:{width:1080,height:1920,readingWidth:880,readingCenter:1280,spectrumX:100,spectrumWidth:880,spectrumBaseline:1748,spectrumTravel:110,sourceY:214,sourceHeight:607.5}
} as const;
let timeline:Timeline|undefined, features:FeatureData|undefined;
const layouts=new Map<string,CueLayout>();
const clamp=(x:number,a=0,b=1):number=>Math.max(a,Math.min(b,x));
const smooth=(a:number,b:number,x:number):number=>{if(b<=a)return x>=b?1:0;const u=clamp((x-a)/(b-a));return u*u*(3-2*u);};
const family=(language:Lane['language']):string=>language==='ja'?'PrizrakJP':'PrizrakSerif';
const setFont=(ctx:Context,size:number,language:Lane['language']):void=>{ctx.font=`${language==='ja'?600:500} ${size}px ${family(language)}`;};
function requireTimeline():Timeline {if(!timeline)throw Error('Complete lyric scene is not initialized');return timeline;}
export function initScene(nextTimeline:Timeline,nextFeatures:FeatureData):void {
 validateTimeline(nextTimeline);
 if(nextFeatures.sourceSha256!==nextTimeline.sourceSha256 || !Array.isArray(nextFeatures.rows) || !nextFeatures.rows.length || nextFeatures.analysis.frameRate.numerator!==25 || nextFeatures.analysis.frameRate.denominator!==1 || nextFeatures.rows.some(row=>row.length!==26 || row.some(v=>!Number.isInteger(v)||v<0||v>255)))throw Error('Measured features do not match the original video');
 timeline=nextTimeline;features=nextFeatures;layouts.clear();
}
export async function loadScene():Promise<void> {
 const read=async<T>(path:string):Promise<T>=>{const response=await fetch(path);if(!response.ok)throw Error(`Missing complete preview input: ${path}`);return await response.json() as T;};
 const [nextTimeline,nextFeatures]=await Promise.all([read<Timeline>('/public/timeline.json'),read<FeatureData>('/public/audio-features.json')]);
 const fonts=[new FontFace('PrizrakSerif','url(/public/fonts/NotoSerif.ttf)',{weight:'100 900'}),new FontFace('PrizrakJP','url(/public/fonts/NotoSerifJP.ttf)',{weight:'200 900'})];
 for(const font of fonts)document.fonts.add(await font.load());
 await document.fonts.ready;initScene(nextTimeline,nextFeatures);
}
export function getLines():Cue[] {return requireTimeline().cues;}
export function getReadingCue(time:number):Cue|undefined {return visibleCue(requireTimeline(),time);}
export function getReadingCues(time:number):Cue[] {return visibleCues(requireTimeline(),time);}
export function getSceneIdentity():{revision:string;sourceSha256:string} {const t=requireTimeline();return {revision:t.revision,sourceSha256:t.sourceSha256};}
export function cueOpacity(c:Cue,time:number):number {
 if(time<c.visibleStart || time>=c.visibleEnd)return 0;
 // Acoustic focus never waits for an entrance envelope. Atomic handoffs are
 // already fully opaque at the first performed sample.
 if(time>=c.start && time<c.end)return 1;
 const revealEnd=c.start-.012;
 const entrance=revealEnd<=c.visibleStart?1:smooth(c.visibleStart,revealEnd,time);
 const release=c.visibleEnd<=c.fullOpacityEnd?1:1-smooth(c.fullOpacityEnd,c.visibleEnd,time);
 return entrance*release;
}
function wrapLane(ctx:Context,lane:Lane,maxWidth:number,size:number):number[][] {
 setFont(ctx,size,lane.language);const gap=lane.language==='ja'?0:ctx.measureText(' ').width;
 const rows:number[][]=[];let row:number[]=[],width=0;
 lane.tokens.forEach((token,index)=>{const tokenWidth=ctx.measureText(token.text).width;const added=(row.length?gap:0)+tokenWidth;if(row.length && width+added>maxWidth){rows.push(row);row=[];width=0;}width+=(row.length?gap:0)+tokenWidth;row.push(index);});
 if(row.length)rows.push(row);return rows;
}
function positionLanes(ctx:Context,lanes:Lane[],wrapped:number[][][],size:number,top:number,canvasWidth:number):LaneLayout[] {
 let offset=top;
 return lanes.map((lane,laneIndex):LaneLayout=>{setFont(ctx,size,lane.language);const gap=lane.language==='ja'?0:ctx.measureText(' ').width;const rows=wrapped[laneIndex]!;const slots=rows.flatMap((row,rowIndex)=>{const widths=row.map(index=>ctx.measureText(lane.tokens[index]!.text).width);let x=(canvasWidth-widths.reduce((sum,value)=>sum+value,0)-gap*(row.length-1))/2;return row.map((index,i):TextSlot=>{const token=lane.tokens[index]!;const slot={id:token.id,index,language:lane.language,text:token.text,x,y:offset+size+rowIndex*size*1.20,width:widths[i]!,token};x+=widths[i]!+gap;return slot;});});offset+=rows.length*size*1.20+size*.38;return {language:lane.language,slots,rows:rows.length};});
}
export function layoutCue(ctx:Context,cue:Cue,format:Format):CueLayout {
 const key=`${cue.id}:${format}`;const cached=layouts.get(key);if(cached)return cached;
 const portrait=format==='portrait',three=cue.lanes.length===3,upper=vocalTrack(cue)==='japanese-upper';
 const dual= !upper && requireTimeline().cues.some(other=>vocalTrack(other)==='japanese-upper' && other.visibleStart<cue.visibleEnd && other.visibleEnd>cue.visibleStart);
 const width=portrait?COMPOSITION.portrait.readingWidth:upper?1280:COMPOSITION.landscape.readingWidth;
 const available=portrait?(upper?440:dual?290:610):430;let size=portrait?(upper||dual?64:three?72:76):(three||dual?64:74);let wrapped:number[][][]=[];let total=0;let fitted=false;
 for(;size>=(portrait?55:44);size--){wrapped=cue.lanes.map(lane=>wrapLane(ctx,lane,width,size));const rows=wrapped.reduce((sum,value)=>sum+value.length,0);total=rows*size*1.20+(cue.lanes.length-1)*size*.38;if(total<=available && cue.lanes.every(lane=>lane.tokens.every(token=>{setFont(ctx,size,lane.language);return ctx.measureText(token.text).width<=width;}))){fitted=true;break;}}
 if(!fitted)throw Error(`Complete equal-size language lanes cannot fit ${cue.id}/${format}`);
 // Both closing Japanese cues reserve the same source-aware region. Removing
 // a carried Russian voice never changes the primary block's geometry.
 const closing=cue.readingPlacement==='closing';
 const bottom=portrait?(upper?COMPOSITION.portrait.sourceY+COMPOSITION.portrait.sourceHeight+42+total:dual?1605:(closing?1355:COMPOSITION.portrait.readingCenter)+total/2):(upper?105+total:closing?610:COMPOSITION.landscape.readingBottom);
 const top=bottom-total;const canvasWidth=portrait?1080:1920;
 const lanes=positionLanes(ctx,cue.lanes,wrapped,size,top,canvasWidth);
 const result={size,top,bottom,lanes};layouts.set(key,result);return result;
}
export function layoutCarry(ctx:Context,cue:Cue,format:Format):CueLayout|undefined {
 if(!cue.carry)return undefined;
 const key=`${cue.id}:${format}:carry`;const cached=layouts.get(key);if(cached)return cached;
 const primary=layoutCue(ctx,cue,format),portrait=format==='portrait',size=primary.size;
 const width=portrait?COMPOSITION.portrait.readingWidth:COMPOSITION.landscape.readingWidth;
 const wrapped=cue.carry.lanes.map(lane=>wrapLane(ctx,lane,width,size));
 if(wrapped.some(rows=>rows.length!==1))throw Error(`Carried voice needs an authored multirow layout: ${cue.id}/${format}`);
 const total=wrapped.reduce((sum,rows)=>sum+rows.length,0)*size*1.20+(cue.carry.lanes.length-1)*size*.38;
 const bottom=primary.top-size*.38,top=bottom-total;
 const minimumTop=portrait?COMPOSITION.portrait.sourceY+COMPOSITION.portrait.sourceHeight+42:100;
 if(top<minimumTop)throw Error(`Carried voice would overlap protected source area: ${cue.id}/${format}`);
 const result={size,top,bottom,lanes:positionLanes(ctx,cue.carry.lanes,wrapped,size,top,portrait?1080:1920)};
 layouts.set(key,result);return result;
}
function featureAt(time:number):number[] {
 if(!features)throw Error('Measured feature scene is not initialized');
 const rowTime=time*features.analysis.frameRate.numerator/features.analysis.frameRate.denominator;
 if(rowTime<0 || rowTime>=features.rows.length)return Array<number>(26).fill(0);
 const first=Math.floor(rowTime),second=Math.min(first+1,features.rows.length-1),fraction=rowTime-first;
 return features.rows[first]!.map((value,index)=>value+(features!.rows[second]![index]!-value)*fraction);
}
function drawPicture(ctx:Context,source:CanvasImageSource,format:Format):void {
 const portrait=format==='portrait';ctx.fillStyle=PALETTE.ground;ctx.fillRect(0,0,portrait?1080:1920,portrait?1920:1080);
 if(!portrait){ctx.drawImage(source,0,0,1920,1080);return;}
 // The sharp complete film remains uncut. The enlarged, dim, defocused copy
 // supplies source-derived atmosphere only, never a second readable subject.
 ctx.save();ctx.globalAlpha=.27;ctx.filter='blur(38px)';ctx.drawImage(source,420,75,1080,930,-50,-50,1180,2020);ctx.restore();
 const veil=ctx.createLinearGradient(0,0,0,1920);veil.addColorStop(0,'rgba(8,14,18,.20)');veil.addColorStop(.45,'rgba(8,14,18,.40)');veil.addColorStop(1,'rgba(8,14,18,.66)');ctx.fillStyle=veil;ctx.fillRect(0,0,1080,1920);
 ctx.drawImage(source,0,0,1920,1080,0,COMPOSITION.portrait.sourceY,1080,COMPOSITION.portrait.sourceHeight);
}
function spectrum(ctx:Context,time:number,format:Format):void {
 const p=COMPOSITION[format],row=featureAt(time);const envelope=smooth(.1,.7,time)*(1-smooth(241.9,242.65,time));if(envelope<=0)return;
 const rms=clamp((-96+(row[0]??0)*96/255+42)/30);const bars=48,step=p.spectrumWidth/bars,width=format==='portrait'?9:13;
 ctx.save();ctx.globalAlpha=envelope;ctx.lineCap='butt';
 const baseline=ctx.createLinearGradient(p.spectrumX,0,p.spectrumX+p.spectrumWidth,0);baseline.addColorStop(0,'rgba(185,229,212,0)');baseline.addColorStop(.12,'rgba(185,229,212,.32)');baseline.addColorStop(.88,'rgba(185,229,212,.32)');baseline.addColorStop(1,'rgba(185,229,212,0)');ctx.strokeStyle=baseline;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p.spectrumX,p.spectrumBaseline);ctx.lineTo(p.spectrumX+p.spectrumWidth,p.spectrumBaseline);ctx.stroke();
 for(let i=0;i<bars;i++){const position=i*(23/(bars-1)),first=Math.floor(position),second=Math.min(23,first+1),fraction=position-first;const encoded=(row[2+first]??0)+((row[2+second]??0)-(row[2+first]??0))*fraction;const db=-96+encoded*96/255;const level=clamp((db+60)/48);const edge=.62+.38*Math.sin(Math.PI*(i+.5)/bars);const height=2+p.spectrumTravel*Math.pow(level,1.55)*(.42+.58*rms)*edge;const x=p.spectrumX+step*(i+.5)-width/2;
  const ink=ctx.createLinearGradient(0,p.spectrumBaseline-height,0,p.spectrumBaseline);ink.addColorStop(0,'rgba(238,255,245,.96)');ink.addColorStop(.30,'rgba(185,229,212,.90)');ink.addColorStop(1,'rgba(107,156,146,.48)');ctx.shadowColor='rgba(146,215,196,.28)';ctx.shadowBlur=format==='portrait'?9:6;ctx.fillStyle=ink;ctx.fillRect(x,p.spectrumBaseline-height,width,height);ctx.shadowBlur=0;
 }
 ctx.restore();
}
function drawWords(ctx:Context,words:Word[],layout:CueLayout,time:number,opacity:number):void {
 ctx.save();ctx.globalAlpha=opacity;ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.lineJoin='round';
 for(const lane of layout.lanes){setFont(ctx,layout.size,lane.language);for(const slot of lane.slots){const active=tokenActive(slot.token,words,time,requireTimeline().sampleRate);
  // Set each glyph's own shadow before its outline and fill. Brighter focus
  // and localized bloom improve phone salience without moving any glyph.
  ctx.shadowColor=active?'rgba(155,221,199,.64)':'rgba(0,0,0,.85)';ctx.shadowBlur=active?layout.size*.20:layout.size*.075;ctx.shadowOffsetY=1;ctx.strokeStyle='rgba(4,10,13,.88)';ctx.lineWidth=layout.size*.043;ctx.strokeText(slot.text,slot.x,slot.y);ctx.fillStyle=active?PALETTE.focus:PALETTE.rest;ctx.fillText(slot.text,slot.x,slot.y);
 }}ctx.restore();
}
export function paintScene(ctx:Context,time:number,format:Format,source:CanvasImageSource):void {
 const t=requireTimeline(),portrait=format==='portrait';ctx.clearRect(0,0,portrait?1080:1920,portrait?1920:1080);drawPicture(ctx,source,format);
 const cues=visibleCues(t,time),upper=cues.find(c=>vocalTrack(c)==='japanese-upper');
 // Readability is a continuous composition shade, independent of cue opacity.
 if(!portrait){ctx.save();ctx.globalAlpha=1-smooth(241.9,242.65,time);
  const shadeRegion=(top:number,bottom:number,upperRegion:boolean)=>{const shade=ctx.createLinearGradient(0,top,0,bottom);shade.addColorStop(0,'rgba(6,12,15,0)');shade.addColorStop(.42,'rgba(6,12,15,.14)');shade.addColorStop(.8,upperRegion?'rgba(6,12,15,.48)':'rgba(6,12,15,.58)');shade.addColorStop(1,upperRegion?'rgba(6,12,15,0)':'rgba(6,12,15,.48)');ctx.fillStyle=shade;ctx.fillRect(0,top,1920,bottom-top);};
  if(cues.some(c=>vocalTrack(c)==='lead'))shadeRegion(520,1020,false);
  if(upper)shadeRegion(80,430,true);
  if(!cues.length)shadeRegion(520,1020,false);
  ctx.restore();}
 const decoration=smooth(.1,.7,time)*(1-smooth(241.9,242.65,time));ctx.save();ctx.globalAlpha=decoration*.66;ctx.font=`500 ${portrait?27:26}px PrizrakSerif, PrizrakJP`;ctx.textAlign='center';ctx.fillStyle='#becbc5';ctx.fillText('sotode 外で · призрак',portrait?540:960,portrait?148:46);ctx.restore();
 spectrum(ctx,time,format);
 for(const current of cues){
  if(current.carry && time>=current.start && time<current.carry.visibleEnd){const carried=layoutCarry(ctx,current,format)!;drawWords(ctx,current.carry.words,carried,time,1);}
  drawWords(ctx,current.words,layoutCue(ctx,current,format),time,cueOpacity(current,time));
 }
}
