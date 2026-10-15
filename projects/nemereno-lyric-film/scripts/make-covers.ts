import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {createCanvas,loadImage,GlobalFonts,type SKRSContext2D} from '@napi-rs/canvas';
import {root} from './render-production.ts';
import {currentIdentity} from './project-identity.ts';
assert(GlobalFonts.registerFromPath(resolve(root,'public/fonts/Literata.ttf'),'Literata'));
const art=await loadImage(resolve(root,'public/artwork-reference.png'));
const identity=currentIdentity(),assets:unknown[]=[],proofs:unknown[]=[];
const sha=(bytes:Buffer)=>createHash('sha256').update(bytes).digest('hex');
function text(ctx:SKRSContext2D,label:string,cx:number,y:number,size:number,maxWidth:number,w:number,h:number,color:string){
 ctx.font=`500 ${size}px Literata`;
 while(ctx.measureText(label).width>maxWidth){size--;ctx.font=`500 ${size}px Literata`}
 const m=ctx.measureText(label),x=cx-m.width/2;
 const box={text:label,left:x-m.actualBoundingBoxLeft,top:y-m.actualBoundingBoxAscent,right:x+m.actualBoundingBoxRight,bottom:y+m.actualBoundingBoxDescent,size};
 assert(box.left>=w*.08&&box.right<=w*.92&&box.top>=h*.07&&box.bottom<=h*.93,`Cover margin ${label}`);
 ctx.fillStyle=color;ctx.shadowColor='rgba(3,5,4,.8)';ctx.shadowBlur=2;ctx.shadowOffsetY=1;ctx.fillText(label,x,y);ctx.shadowBlur=0;ctx.shadowOffsetY=0;return box;
}
for(const platform of ['YouTube','TikTok','Farcaster'] as const){
 const tall=platform==='TikTok',w=tall?1200:1280,h=tall?1600:720,c=createCanvas(w,h),ctx=c.getContext('2d');
 if(tall)ctx.drawImage(art,135,0,810,1080,0,0,w,h);else ctx.drawImage(art,0,194,1080,607.5,0,0,w,h);
 const shade=tall?ctx.createLinearGradient(0,1050,0,1600):ctx.createLinearGradient(650,0,1280,0);
 shade.addColorStop(0,'rgba(4,5,4,0)');shade.addColorStop(1,'rgba(4,5,4,.68)');ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
 const boxes=[];
 if(tall){
  boxes.push(text(ctx,'немерено',600,1310,200,960,w,h,'#ffdf9b'));
  boxes.push(text(ctx,'лампабикт',600,1420,58,960,w,h,'#e1e4d6'));
  boxes.push(text(ctx,'Элли на маковом поле',600,1481,48,960,w,h,'#e1e4d6'));
 }else{
  boxes.push(text(ctx,'немерено',955,316,94,420,w,h,'#ffdf9b'));
  boxes.push(text(ctx,'лампабикт',955,391,38,420,w,h,'#e1e4d6'));
  boxes.push(text(ctx,'Элли на маковом поле',955,438,29,420,w,h,'#e1e4d6'));
  boxes.push(text(ctx,'RUSSIAN / ENGLISH LYRICS',955,502,17,420,w,h,'#e1e4d6'));
  if(platform==='Farcaster')boxes.push(text(ctx,'AI-assisted lyric edition',955,613,22,420,w,h,'#e1e4d6'));
 }
 const path=tall?'TikTok/Nemereno-TikTok-Cover-Profile-1200x1600.jpg':`${platform}/Nemereno-${platform}-Thumbnail-1280x720.jpg`;
 const bytes=c.toBuffer('image/jpeg',95);mkdirSync(dirname(resolve(root,'publishing-kit',path)),{recursive:true});writeFileSync(resolve(root,'publishing-kit',path),bytes);
 const decoded=await loadImage(bytes);assert.equal(decoded.width,w);assert.equal(decoded.height,h);assert(!bytes.includes(Buffer.from('Exif\0\0')));assert(bytes.length<2000000);
 assets.push({platform,path,width:w,height:h,bytes:bytes.length,sha256:sha(bytes),textBoxes:boxes});
 mkdirSync(resolve(root,'analysis/covers'),{recursive:true});
 for(const pw of tall?[150,300]:[320]){const ph=pw*h/w,proof=createCanvas(pw,ph);proof.getContext('2d').drawImage(decoded,0,0,pw,ph);const data=proof.toBuffer('image/png'),file=`analysis/covers/${platform.toLowerCase()}-${pw}x${ph}.png`;writeFileSync(resolve(root,file),data);proofs.push({file,sha256:sha(data)})}
 if(tall){const proof=createCanvas(300,400);proof.getContext('2d').drawImage(decoded,w*.05,h*.05,w*.9,h*.9,0,0,300,400);writeFileSync(resolve(root,'analysis/covers/tiktok-5percent-crop.png'),proof.toBuffer('image/png'))}
}
writeFileSync(resolve(root,'evidence/cover-assets.json'),JSON.stringify({schemaVersion:1,status:'generated; visual inspection pending',identity,method:'Code-native typography over a single uniform crop of the original source photograph. No synthesized replacement image or repeated scenery.',assets,proofs,limits:'Local profile-size and crop simulations; no platform upload preview claimed.'},null,2)+'\n');
console.log(JSON.stringify({status:'covers generated',assets}));
