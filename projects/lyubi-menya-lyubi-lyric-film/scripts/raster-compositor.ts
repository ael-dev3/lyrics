import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {createCanvas,GlobalFonts,loadImage,Path2D} from '@napi-rs/canvas';
import type {Canvas,Image} from '@napi-rs/canvas';
import {sceneSvg,lyricMarkup,dynamics,ribbonPath} from '../src/scene.ts';
import {parseData} from '../src/schema.ts';
import type {Format} from '../src/schema.ts';
import type {Layouts} from '../src/layout-types.ts';

export const sha256=(bytes:Uint8Array|string)=>createHash('sha256').update(bytes).digest('hex');
const json=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
export const rendererPaths=['scripts/render.ts','scripts/raster-compositor.ts','scripts/render-proof.ts'];
export const rendererHashes=()=>Object.fromEntries(rendererPaths.map(path=>[path,sha256(readFileSync(path))]));
const attr=(markup:string,name:string)=>{const value=markup.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1];if(value===undefined)throw Error('Missing shared-scene attribute '+name);return value;};
const numeric=(markup:string,name:string)=>{const value=Number(attr(markup,name));if(!Number.isFinite(value))throw Error('Invalid shared-scene geometry');return value;};
const one=(svg:string,pattern:RegExp,label:string)=>{const found=svg.match(pattern);if(!found)throw Error('Shared scene no longer matches compositor contract: '+label);return found[0];};
type Attributes=Record<string,string>;
const attributes=(tag:string):Attributes=>Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(m=>[m[1]!,m[2]!]));
const unescape=(s:string)=>s.replaceAll('&quot;','"').replaceAll('&gt;','>').replaceAll('&lt;','<').replaceAll('&amp;','&');

// The SVG decoder drops raster images and does not implement text letter-spacing
// or text opacity consistently. Preserve these browser-visible attributes using
// a narrow parsed Canvas adapter, in both the cached and reference paths.
function staticText(svg:string){
 const stack:Attributes[]=[{}],text:Array<{text:string,attributes:Attributes}>=[];
 for(const token of svg.matchAll(/<g\b[^>]*>|<\/g>|<text\b[^>]*>[\s\S]*?<\/text>/g)){
  const tag=token[0];
  if(tag.startsWith('</g')){if(stack.length===1)throw Error('Unbalanced SVG groups');stack.pop();}
  else if(tag.startsWith('<g'))stack.push({...stack.at(-1),...attributes(tag)});
  else if(!tag.includes('data-word='))text.push({text:unescape(tag.replace(/^<text\b[^>]*>/,'').replace(/<\/text>$/,'')),attributes:{...stack.at(-1),...attributes(tag)}});
 }
 return text;
}

export async function createRasterCompositor(format:Format,scale=2){
 if(scale!==1&&scale!==2)throw Error('Capture scale must be 1 or 2');
 const data=parseData(json('src/cues.json')),layouts=json('src/layout.json') as Layouts,bands=json('public/science.json') as number[][];
 const l=layouts[format],width=l.width*scale,height=l.height*scale;
 if(!GlobalFonts.registerFromPath('public/fonts/Oswald-Medium.ttf','LyubiSans'))throw Error('The approved font could not load');
 const template=sceneSvg(0,format,data,layouts,bands);
 const metadata=staticText(template);
 if(metadata.length!==(format==='landscape'?3:2))throw Error('Unexpected static metadata inventory');
 const lyricTag=one(template,/<g data-lyrics=""[^>]*>/,'lyric group');
 const spectrumTag=one(template,/<g data-spectrum=""[^>]*>/,'spectrum group');
 const ribbonTag=one(template,/<path data-ribbon=""[^>]*\/>/,'ribbon path');
 const artGroup=one(template,/<g data-artwork=""[^>]*>/,'artwork group');
 const imageTag=one(template,/<image\s[^>]*\/>/,'artwork image');
 if(attr(imageTag,'href')!=='/public/artwork.png')throw Error('Unexpected artwork source');
 const transform=attr(artGroup,'transform').match(/^rotate\((-?[\d.]+) ([\d.]+) ([\d.]+)\)$/);
 if(!transform)throw Error('Unsupported artwork transform');
 const art={x:numeric(imageTag,'x'),y:numeric(imageTag,'y'),width:numeric(imageTag,'width'),height:numeric(imageTag,'height'),angle:Number(transform[1]),cx:Number(transform[2]),cy:Number(transform[3])};
 const picture=await loadImage('public/artwork.png');
 const stroke=attr(spectrumTag,'stroke'),lineCap=attr(spectrumTag,'stroke-linecap') as 'round'|'butt'|'square',lineWidth=numeric(ribbonTag,'stroke-width');
 const spectrumBaseOpacity=Number(attr(spectrumTag,'opacity'))/dynamics(0,format,data,bands).tail;
 if(!Number.isFinite(spectrumBaseOpacity))throw Error('Invalid spectrum opacity');
 const dimensions=(svg:string)=>svg.replace(/width="\d+" height="\d+" viewBox=/,`width="${width}" height="${height}" viewBox=`);
 const drawArtwork=(ctx:ReturnType<Canvas['getContext']>)=>{
  ctx.save();ctx.scale(scale,scale);ctx.translate(art.cx,art.cy);ctx.rotate(art.angle*Math.PI/180);ctx.translate(-art.cx,-art.cy);ctx.drawImage(picture,art.x,art.y,art.width,art.height);ctx.restore();
 };
 const drawMetadata=(ctx:ReturnType<Canvas['getContext']>)=>{
  ctx.save();ctx.scale(scale,scale);
  for(const item of metadata){
   const a=item.attributes;
   if(a['font-family']!=='LyubiSans'||!a.fill||!a['font-size']||!a.x||!a.y)throw Error('Incomplete static metadata font/geometry contract');
   ctx.font=`${a['font-weight']??'400'} ${a['font-size']}px ${a['font-family']}`;
   ctx.fontKerning='auto';ctx.letterSpacing=`${a['letter-spacing']??0}px`;
   ctx.textAlign=a['text-anchor']==='middle'?'center':a['text-anchor']==='end'?'right':'left';ctx.textBaseline='alphabetic';
   ctx.globalAlpha=Number(a.opacity??1);ctx.fillStyle=a.fill;
   ctx.fillText(item.text,Number(a.x),Number(a.y));
  }
  ctx.restore();
 };
 const removeImage=(svg:string)=>svg.replace(imageTag,'');
 const removeMetadata=(svg:string)=>svg.replace(/<text\b[^>]*>[\s\S]*?<\/text>/g,tag=>tag.includes('data-word=')?tag:'');
 const staticSvg=removeMetadata(removeImage(template)).replace(/<g data-lyrics=""[^>]*>[\s\S]*?<\/g>/,lyricTag+'</g>').replace(/<g data-spectrum=""[^>]*>[\s\S]*?<\/g>/,'');
 const base=createCanvas(width,height),baseContext=base.getContext('2d');
 baseContext.drawImage(await loadImage(Buffer.from(dimensions(staticSvg))),0,0);drawArtwork(baseContext);drawMetadata(baseContext);
 const canvas=createCanvas(width,height),ctx=canvas.getContext('2d');
 let currentMarkup='',currentText:Image|undefined,textBuilds=0,paintedFrames=0;
 async function paint(frame:number){
  if(!Number.isInteger(frame)||frame<0||frame>=data.frames)throw Error('Frame outside recording');
  const markup=lyricMarkup(frame,format,data,layouts);
  if(markup!==currentMarkup){
   currentMarkup=markup;currentText=undefined;
   if(markup){
    const layer=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${l.width} ${l.height}"><g font-family="LyubiSans" font-weight="500">${lyricTag}${markup}</g></g></svg>`;
    currentText=await loadImage(Buffer.from(layer));textBuilds++;
   }
  }
  ctx.globalAlpha=1;ctx.drawImage(base,0,0);
  if(currentText)ctx.drawImage(currentText,0,0);
  const d=dynamics(frame,format,data,bands);
  ctx.save();ctx.scale(scale,scale);ctx.globalAlpha=spectrumBaseOpacity*d.tail;ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.lineCap=lineCap;ctx.lineJoin='miter';ctx.stroke(new Path2D(ribbonPath(d.values,d.barMax,format)));ctx.restore();
  paintedFrames++;
  return canvas;
 }
 async function reference(frame:number){
  const svg=removeMetadata(sceneSvg(frame,format,data,layouts,bands)).replace(/<image\s[^>]*\/>/,'');
  const direct=createCanvas(width,height),context=direct.getContext('2d');
  context.drawImage(await loadImage(Buffer.from(dimensions(svg))),0,0);drawArtwork(context);drawMetadata(context);
  return direct;
 }
 return {data,layouts,bands,format,scale,width,height,canvas,paint,reference,stats:()=>({paintedFrames,textBuilds,retainedTextLayers:currentText?1:0,retainedFullFrameBases:1}),contract:{art,metadata,stroke,lineWidth,lineCap,spectrumBaseOpacity,baseSha256:sha256(base.data()),scope:'Shared SVG static scene and focus markup; original PNG at parsed shared-scene transform; static metadata Canvas adapter preserves parsed SVG letter spacing, opacity, font, anchor and geometry; shared dynamics/ribbon path. One static surface and at most one current text surface retained.'}};
}
