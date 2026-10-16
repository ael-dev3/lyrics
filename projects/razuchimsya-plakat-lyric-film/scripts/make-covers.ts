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
 ctx.fillStyle=color;ctx.shadowColor='rgba(3,12,7,.94)';ctx.shadowBlur=3;ctx.shadowOffsetY=2;ctx.fillText(label,x,y);ctx.shadowBlur=0;ctx.shadowOffsetY=0;return box;
}
for(const platform of ['YouTube','TikTok','Farcaster'] as const){
 const tall=platform==='TikTok',w=tall?1200:1280,h=tall?1600:720,c=createCanvas(w,h),ctx=c.getContext('2d');
 if(tall)ctx.drawImage(art,135,0,810,1080,0,0,w,h);else ctx.drawImage(art,0,300,1080,607.5,0,0,w,h);
 const shade=createCanvas(w,h),s=shade.getContext('2d'),g=s.createRadialGradient(w/2,tall?400:165,40,w/2,tall?400:165,tall?840:820);
 g.addColorStop(0,'rgba(7,20,14,.66)');g.addColorStop(.6,'rgba(7,20,14,.4)');g.addColorStop(1,'rgba(7,20,14,0)');s.fillStyle=g;s.fillRect(0,0,w,h);
 const fade=s.createLinearGradient(0,tall?700:260,0,tall?800:292);fade.addColorStop(0,'rgba(0,0,0,1)');fade.addColorStop(1,'rgba(0,0,0,0)');s.globalCompositeOperation='destination-in';s.fillStyle=fade;s.fillRect(0,0,w,h);ctx.drawImage(shade,0,0);
 const boxes=tall?[text(ctx,'Разучимся',330,140,w,h,'#e3d9c6'),text(ctx,'плакать',500,174,w,h,'#ffdf91'),text(ctx,'SETTLERS',630,84,w,h,'#e3d9c6')]:[text(ctx,'Разучимся',140,94,w,h,'#e3d9c6'),text(ctx,'плакать',230,108,w,h,'#ffdf91'),text(ctx,'SETTLERS',280,40,w,h,'#e3d9c6')];
 const path=tall?'TikTok/Razuchimsya-Plakat-TikTok-Cover-Profile-1200x1600.jpg':`${platform}/Razuchimsya-Plakat-${platform}-Thumbnail-1280x720.jpg`,bytes=c.toBuffer('image/jpeg',95);
 mkdirSync(dirname(resolve(root,'publishing-kit',path)),{recursive:true});writeFileSync(resolve(root,'publishing-kit',path),bytes);const decoded=await loadImage(bytes);assert.equal(decoded.width,w);assert.equal(decoded.height,h);assert(bytes.length<2000000);assert(!bytes.includes(Buffer.from('Exif\0\0')));
 const sha=createHash('sha256').update(bytes).digest('hex');assets.push({platform,path,width:w,height:h,bytes:bytes.length,sha256:sha,textBoxes:boxes});mkdirSync(resolve(root,'analysis/covers'),{recursive:true});
 for(const pw of tall?[150,300]:[320]){const ph=pw*h/w,proof=createCanvas(pw,ph);proof.getContext('2d').drawImage(decoded,0,0,pw,ph);const path=`analysis/covers/${platform.toLowerCase()}-${pw}x${ph}.png`;writeFileSync(resolve(root,path),proof.toBuffer('image/png'));proofs.push({path,width:pw,height:ph})}
 if(tall){const proof=createCanvas(300,400);proof.getContext('2d').drawImage(decoded,w*.05,h*.05,w*.9,h*.9,0,0,300,400);writeFileSync(resolve(root,'analysis/covers/tiktok-5percent-crop.png'),proof.toBuffer('image/png'))}
}
writeFileSync(resolve(root,'evidence/cover-assets.json'),JSON.stringify({schemaVersion:1,status:'generated; visual inspection pending',identity,method:'Code-native typography and continuous carpet shade over one uniform crop of the original photograph; subject preserved. No synthesized replacement image.',assets,proofs,limits:'Local profile-size and crop simulations; no platform upload preview claimed.'},null,2)+'\n');console.log('Three dedicated covers and small-size proofs prepared.');
