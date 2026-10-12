import assert from 'node:assert/strict';
import {writeFileSync,mkdirSync,readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {createCanvas,loadImage,GlobalFonts,type SKRSContext2D} from '@napi-rs/canvas';
import {root} from './render-production.ts';
import {checkCurrentProductionAuthorization} from './production-authorization.ts';

const identity=checkCurrentProductionAuthorization().identity;
const sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
if(!GlobalFonts.registerFromPath(resolve(root,'public/fonts/NotoSerif.ttf'),'Botanical'))throw Error('Approved cover font unavailable.');
const source=await loadImage(resolve(root,'public/artwork-reference.png'));
const files:unknown[]=[],proofs:unknown[]=[];
type Box={text:string;x:number;y:number;right:number;bottom:number;fontSize:number};
function lettering(ctx:SKRSContext2D,text:string,center:number,baseline:number,size:number,maxWidth:number,width:number,height:number):Box {
 ctx.font=`500 ${size}px Botanical`;
 while(ctx.measureText(text).width>maxWidth){size--;ctx.font=`500 ${size}px Botanical`}
 const m=ctx.measureText(text),x=center-m.width/2;
 const box={text,x,y:baseline-m.actualBoundingBoxAscent,right:x+m.width,bottom:baseline+m.actualBoundingBoxDescent,fontSize:size};
 assert.ok(box.x>=width*.08&&box.right<=width*.92&&box.y>=height*.07&&box.bottom<=height*.93,`Unsafe cover text ${text}`);
 ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle=text==='Обнимай'?'#ffe5ab':'#d8ddd5';
 ctx.shadowColor='#0d1413';ctx.shadowBlur=1;ctx.shadowOffsetY=2;ctx.fillText(text,x,baseline);ctx.shadowBlur=0;ctx.shadowOffsetY=0;
 return box;
}
for(const kind of ['youtube','tiktok'] as const){
 const portrait=kind==='tiktok',width=portrait?1200:1280,height=portrait?1600:720;
 const canvas=createCanvas(width,height),ctx=canvas.getContext('2d');ctx.fillStyle='#141817';ctx.fillRect(0,0,width,height);
 const boxes:Box[]=[];
 if(portrait){
  ctx.globalAlpha=.20;ctx.drawImage(source,930,420,150,660,0,1050,1200,550);ctx.globalAlpha=1;
  ctx.drawImage(source,0,0,1200,1200);
  const fade=ctx.createLinearGradient(0,1050,0,1220);fade.addColorStop(0,'#14181700');fade.addColorStop(1,'#141817');ctx.fillStyle=fade;ctx.fillRect(0,1050,1200,550);
  boxes.push(lettering(ctx,'Обнимай',600,1290,139,990,width,height));
  boxes.push(lettering(ctx,'Элли на',600,1380,62,990,width,height));
  boxes.push(lettering(ctx,'маковом поле',600,1455,62,990,width,height));
 }else{
  ctx.globalAlpha=.26;ctx.drawImage(source,775,80,305,1000,675,0,605,720);ctx.globalAlpha=1;
  ctx.drawImage(source,0,0,720,720);
  const fade=ctx.createLinearGradient(650,0,830,0);fade.addColorStop(0,'#14181700');fade.addColorStop(1,'#141817');ctx.fillStyle=fade;ctx.fillRect(650,0,630,720);
  boxes.push(lettering(ctx,'Обнимай',985,328,88,380,width,height));
  boxes.push(lettering(ctx,'Элли на',985,414,42,380,width,height));
  boxes.push(lettering(ctx,'маковом поле',985,474,42,380,width,height));
 }
 const path=portrait?'TikTok/Obnimay-Elli-Na-Makovom-Pole-TikTok-Cover-Profile-1200x1600.jpg':'YouTube/Obnimay-Elli-Na-Makovom-Pole-YouTube-Thumbnail-1280x720.jpg';
 const bytes=canvas.toBuffer('image/jpeg',95);mkdirSync(dirname(resolve(root,'publishing-kit',path)),{recursive:true});writeFileSync(resolve(root,'publishing-kit',path),bytes);
 const decoded=await loadImage(bytes);assert.equal(decoded.width,width);assert.equal(decoded.height,height);assert.ok(!bytes.includes(Buffer.from('Exif\0\0')),'Unexpected rotation metadata.');if(!portrait)assert.ok(bytes.length<2000000);
 files.push({kind,path,width,height,bytes:bytes.length,sha256:sha(bytes),textBoxes:boxes});
 mkdirSync(resolve(root,'analysis/covers'),{recursive:true});
 for(const proofWidth of portrait?[150,300]:[320]){
  const proofHeight=Math.round(proofWidth*height/width),proof=createCanvas(proofWidth,proofHeight);proof.getContext('2d').drawImage(decoded,0,0,proofWidth,proofHeight);
  const data=proof.toBuffer('image/png'),path=`analysis/covers/${kind}-${proofWidth}x${proofHeight}.png`;writeFileSync(resolve(root,path),data);proofs.push({path,width:proofWidth,height:proofHeight,sha256:sha(data)});
 }
 if(portrait){const proof=createCanvas(300,400);proof.getContext('2d').drawImage(decoded,width*.05,height*.05,width*.9,height*.9,0,0,300,400);const data=proof.toBuffer('image/png'),path='analysis/covers/tiktok-center-crop-5percent.png';writeFileSync(resolve(root,path),data);proofs.push({path,width:300,height:400,sha256:sha(data)})}
}
writeFileSync(resolve(root,'evidence/cover-assets.json'),JSON.stringify({schemaVersion:1,status:'generated; visual inspection pending',identity,makerSha256:sha(readFileSync(new URL(import.meta.url))),method:'Code-native recomposition of the original floral photograph with approved Noto Serif, warm ivory and silver. Original subject retained; no generated replacement artwork.',sourceArtwork:'public/artwork-reference.png',files,proofs,limits:'Local profile-size and 5% center-crop simulations; no actual platform upload preview claimed.'},null,2)+'\n');
console.log(JSON.stringify({status:'covers generated',files}));
