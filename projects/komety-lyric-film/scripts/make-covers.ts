import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas,GlobalFonts,loadImage} from '@napi-rs/canvas';
import {checkCurrentProductionGate} from './render-gate.ts';
checkCurrentProductionGate();
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const identity=JSON.parse(readFileSync(resolve(root,'evidence/preview-inputs.json'),'utf8'));
GlobalFonts.registerFromPath(resolve(root,'public/fonts/CormorantGaramond-Semibold.ttf'),'Komety');
const sha=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex');
const sourceFrame=310; // Reviewed flower-bed portrait at 12.400 s, exact original 25 fps frame.
const bytes=execFileSync('ffmpeg',['-hide_banner','-v','error','-nostdin','-i',resolve(root,'public/source.mp4'),'-vf',`select=eq(n\\,${sourceFrame})`,'-frames:v','1','-fps_mode','passthrough','-f','image2pipe','-c:v','png','pipe:1'],{maxBuffer:32000000});
const original=await loadImage(bytes);
if(original.width!==1920||original.height!==796)throw Error('Source dimensions changed');
mkdirSync(resolve(root,'publishing'),{recursive:true});mkdirSync(resolve(root,'evidence/covers'),{recursive:true});
const files:object[]=[],proofs:object[]=[];
for(const kind of ['youtube','tiktok'] as const){
  const portrait=kind==='tiktok',width=portrait?1200:1920,height=portrait?1600:1080;
  const cropWidth=796*width/height,center=950,cropX=Math.max(0,Math.min(1920-cropWidth,center-cropWidth/2));
  const canvas=createCanvas(width,height),ctx=canvas.getContext('2d');
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(original,cropX,0,cropWidth,796,0,0,width,height);
  const wash=ctx.createLinearGradient(0,height*.55,0,height);wash.addColorStop(0,'rgba(8,15,12,0)');wash.addColorStop(.6,'rgba(8,15,12,.62)');wash.addColorStop(1,'rgba(8,15,12,.85)');ctx.fillStyle=wash;ctx.fillRect(0,0,width,height);
  const boxes:{text:string;left:number;right:number;top:number;bottom:number}[]=[];
  const text=(value:string,size:number,y:number,color:string)=>{
    ctx.font=`600 ${size}px Komety`;ctx.textAlign='center';ctx.textBaseline='alphabetic';
    const m=ctx.measureText(value),box={text:value,left:width/2-m.actualBoundingBoxLeft,right:width/2+m.actualBoundingBoxRight,top:y-m.actualBoundingBoxAscent,bottom:y+m.actualBoundingBoxDescent};
    if(box.left<width*.08||box.right>width*.92||box.top<height*.07||box.bottom>height*.93)throw Error(`Cover safe margin ${kind}: ${value}`);
    ctx.shadowColor='rgba(8,15,12,.8)';ctx.shadowBlur=size*.08;ctx.fillStyle=color;ctx.fillText(value,width/2,y);ctx.shadowBlur=0;boxes.push(box);
  };
  text('КОМЕТЫ',portrait?164:210,portrait?1280:865,'#eee3cf');
  text('POLNALYUBVI',portrait?92:82,portrait?1395:975,'#ffd58d');
  const filename=portrait?'POLNALYUBVI-Komety-TikTok-Cover-1200x1600.jpg':'POLNALYUBVI-Komety-YouTube-Thumbnail-1920x1080.jpg';
  const encoded=canvas.toBuffer('image/jpeg',95);writeFileSync(resolve(root,'publishing',filename),encoded);
  const decoded=await loadImage(encoded);if(decoded.width!==width||decoded.height!==height||encoded.includes(Buffer.from('Exif\0\0')))throw Error('JPEG dimensions/orientation');
  files.push({kind,path:`publishing/${filename}`,width,height,bytes:encoded.length,sha256:sha(encoded),sourceFrame,sourceTimeSeconds:sourceFrame/25,sourceCrop:{x:cropX,y:0,width:cropWidth,height:796},textBoxes:boxes});
  for(const w of portrait?[150,300]:[320]){const h=Math.round(w*height/width),c=createCanvas(w,h);c.getContext('2d').drawImage(decoded,0,0,w,h);const b=c.toBuffer('image/png'),path=`evidence/covers/${kind}-${w}x${h}.png`;writeFileSync(resolve(root,path),b);proofs.push({path,sha256:sha(b),width:w,height:h});}
  if(portrait){const c=createCanvas(300,400);c.getContext('2d').drawImage(decoded,width*.05,height*.05,width*.9,height*.9,0,0,300,400);const b=c.toBuffer('image/png'),path='evidence/covers/tiktok-center-crop-5percent.png';writeFileSync(resolve(root,path),b);proofs.push({path,sha256:sha(b),width:300,height:400});}
}
checkCurrentProductionGate();
writeFileSync(resolve(root,'evidence/cover-assets.json'),JSON.stringify({status:'generated; visual inspection pending',approvedInputHashes:identity.inputs,makerSha256:sha(readFileSync(fileURLToPath(import.meta.url))),revision:identity.revision,sourceSha256:identity.inputs['public/source.mp4'],method:'Exact original source frame, crop to platform cover ratio, approved Cormorant typography and ivory/gold. Original picture is retained; no replacement artwork.',files,proofs,limits:'Local small-size and centered-crop simulations; no platform upload preview claimed.'},null,2)+'\n');
console.log('Generated two original-video covers and four size/crop proofs.');
