import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {createCanvas,loadImage,GlobalFonts,type SKRSContext2D} from '@napi-rs/canvas';
import {root} from './render-production.ts';
import {currentIdentity} from './project-identity.ts';
assert(GlobalFonts.registerFromPath(resolve(root,'public/fonts/Cormorant.ttf'),'Cormorant'));
const art=await loadImage(resolve(root,'public/artwork-reference.png')),identity=currentIdentity(),assets:unknown[]=[],proofs:unknown[]=[];
function text(ctx:SKRSContext2D,label:string,y:number,size:number,w:number,h:number,color:string){
 ctx.font=`600 ${size}px Cormorant`;while(ctx.measureText(label).width>w*.82){size--;ctx.font=`600 ${size}px Cormorant`}
 const m=ctx.measureText(label),x=(w-m.width)/2,box={text:label,left:x-m.actualBoundingBoxLeft,top:y-m.actualBoundingBoxAscent,right:x+m.actualBoundingBoxRight,bottom:y+m.actualBoundingBoxDescent,size};
 assert(box.left>=w*.08&&box.right<=w*.92&&box.top>=h*.07&&box.bottom<=h*.93,`Cover margin ${label}`);
 ctx.fillStyle=color;ctx.shadowColor='rgba(5,5,5,.94)';ctx.shadowBlur=3;ctx.shadowOffsetY=2;ctx.fillText(label,x,y);ctx.shadowBlur=0;ctx.shadowOffsetY=0;return box;
}
for(const platform of ['YouTube','TikTok','Farcaster'] as const){
 const tall=platform==='TikTok',w=tall?1200:1280,h=tall?1600:720,c=createCanvas(w,h),ctx=c.getContext('2d');
 if(tall)ctx.drawImage(art,75,0,810,1080,0,0,w,h);else ctx.drawImage(art,0,210,1080,607.5,0,0,w,h);
 const g=ctx.createLinearGradient(0,tall?1060:0,0,tall?1600:310);
 if(tall){g.addColorStop(0,'rgba(8,8,8,0)');g.addColorStop(.35,'rgba(8,8,8,.54)');g.addColorStop(1,'rgba(8,8,8,.74)')}
 else {g.addColorStop(0,'rgba(8,8,8,.70)');g.addColorStop(.65,'rgba(8,8,8,.50)');g.addColorStop(1,'rgba(8,8,8,0)')}
 ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
 const boxes=tall?[text(ctx,'ничего',1240,150,w,h,'#f6f4ef'),text(ctx,'нет',1380,140,w,h,'#f6f4ef'),text(ctx,'забей, лерочка',1455,72,w,h,'#d3d4d0')]:[text(ctx,'ничего',132,108,w,h,'#f6f4ef'),text(ctx,'нет',230,116,w,h,'#f6f4ef'),text(ctx,'забей, лерочка',286,46,w,h,'#d3d4d0')];
 const path=tall?'TikTok/Nichego-Net-TikTok-Cover-Profile-1200x1600.jpg':`${platform}/Nichego-Net-${platform}-Thumbnail-1280x720.jpg`,bytes=c.toBuffer('image/jpeg',95);
 mkdirSync(dirname(resolve(root,'publishing-kit',path)),{recursive:true});writeFileSync(resolve(root,'publishing-kit',path),bytes);const decoded=await loadImage(bytes);assert.equal(decoded.width,w);assert.equal(decoded.height,h);assert(bytes.length<2000000);assert(!bytes.includes(Buffer.from('Exif\0\0')));
 assets.push({platform,path,width:w,height:h,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),textBoxes:boxes});mkdirSync(resolve(root,'analysis/covers'),{recursive:true});
 for(const pw of tall?[150,300]:[320]){const ph=pw*h/w,proof=createCanvas(pw,ph);proof.getContext('2d').drawImage(decoded,0,0,pw,ph);const path=`analysis/covers/${platform.toLowerCase()}-${pw}x${ph}.png`;writeFileSync(resolve(root,path),proof.toBuffer('image/png'));proofs.push({path,width:pw,height:ph})}
 if(tall){const proof=createCanvas(300,400);proof.getContext('2d').drawImage(decoded,w*.05,h*.05,w*.9,h*.9,0,0,300,400);writeFileSync(resolve(root,'analysis/covers/tiktok-5percent-crop.png'),proof.toBuffer('image/png'))}
}
writeFileSync(resolve(root,'evidence/cover-assets.json'),JSON.stringify({schemaVersion:1,status:'generated; visual inspection pending',identity,method:'Code-native silver typography and continuous neutral exposure over one uniform crop of the original monochrome photograph. No synthesized replacement image.',assets,proofs,limits:'Local profile-size and crop simulations; no platform upload preview claimed.'},null,2)+'\n');console.log('Three dedicated covers and small-size proofs prepared.');
