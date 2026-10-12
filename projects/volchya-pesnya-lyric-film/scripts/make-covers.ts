import assert from 'node:assert/strict';
import {writeFileSync,mkdirSync,readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {createCanvas,loadImage,GlobalFonts,type SKRSContext2D} from '@napi-rs/canvas';
import {root} from './render-production.ts';
import {checkCurrentProductionAuthorization} from './production-authorization.ts';
const identity=checkCurrentProductionAuthorization().identity;
const sha=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
assert.ok(GlobalFonts.registerFromPath(resolve(root,'public/fonts/Alegreya.ttf'),'Broadside'));
const source=await loadImage(resolve(root,'public/artwork-reference.png'));
const files:unknown[]=[],proofs:unknown[]=[];
type Box={text:string;x:number;y:number;right:number;bottom:number;fontSize:number};
function lettering(ctx:SKRSContext2D,text:string,center:number,baseline:number,size:number,maxWidth:number,width:number,height:number):Box{
 ctx.font=`600 ${size}px Broadside`;
 while(ctx.measureText(text).width>maxWidth){size--;ctx.font=`600 ${size}px Broadside`}
 const m=ctx.measureText(text),x=center-m.width/2;
 const box={text,x,y:baseline-m.actualBoundingBoxAscent,right:x+m.width,bottom:baseline+m.actualBoundingBoxDescent,fontSize:size};
 assert.ok(x>=width*.08&&box.right<=width*.92&&box.y>=height*.07&&box.bottom<=height*.93,`Unsafe cover text: ${text}`);
 ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle=text==='лунный бард'?'#2a502e':'#852f1f';ctx.fillText(text,x,baseline);return box;
}
for(const kind of ['youtube','tiktok'] as const){
 const tall=kind==='tiktok',width=tall?1200:1280,height=tall?1600:720;
 const canvas=createCanvas(width,height),ctx=canvas.getContext('2d'),patch=createCanvas(280,160),pc=patch.getContext('2d');
 pc.drawImage(source,605,186,280,160,0,0,280,160);ctx.fillStyle=ctx.createPattern(patch,'repeat')!;ctx.fillRect(0,0,width,height);
 ctx.globalAlpha=.2;ctx.fillStyle='#eee4bb';ctx.fillRect(0,0,width,height);ctx.globalAlpha=1;
 const boxes:Box[]=[];
 if(tall){ctx.drawImage(source,0,0,1200,1200);boxes.push(lettering(ctx,'Волчья песня',600,1346,142,970,width,height));boxes.push(lettering(ctx,'лунный бард',600,1456,84,970,width,height))}
 else{ctx.drawImage(source,0,0,720,720);boxes.push(lettering(ctx,'Волчья',1000,300,100,390,width,height));boxes.push(lettering(ctx,'песня',1000,406,112,390,width,height));boxes.push(lettering(ctx,'лунный бард',1000,498,49,390,width,height))}
 const path=tall?'TikTok/Volchya-Pesnya-TikTok-Cover-Profile-1200x1600.jpg':'YouTube/Volchya-Pesnya-YouTube-Thumbnail-1280x720.jpg';
 const bytes=canvas.toBuffer('image/jpeg',95);mkdirSync(dirname(resolve(root,'publishing-kit',path)),{recursive:true});writeFileSync(resolve(root,'publishing-kit',path),bytes);
 const decoded=await loadImage(bytes);assert.equal(decoded.width,width);assert.equal(decoded.height,height);assert.ok(!bytes.includes(Buffer.from('Exif\0\0')));if(!tall)assert.ok(bytes.length<2000000);
 files.push({kind,path,width,height,bytes:bytes.length,sha256:sha(bytes),textBoxes:boxes});
 mkdirSync(resolve(root,'analysis/covers'),{recursive:true});
 for(const proofWidth of tall?[150,300]:[320]){
  const h=Math.round(proofWidth*height/width),proof=createCanvas(proofWidth,h);proof.getContext('2d').drawImage(decoded,0,0,proofWidth,h);const data=proof.toBuffer('image/png'),path=`analysis/covers/${kind}-${proofWidth}x${h}.png`;writeFileSync(resolve(root,path),data);proofs.push({path,width:proofWidth,height:h,sha256:sha(data)});
 }
 if(tall){const proof=createCanvas(300,400);proof.getContext('2d').drawImage(decoded,width*.05,height*.05,width*.9,height*.9,0,0,300,400);const data=proof.toBuffer('image/png'),path='analysis/covers/tiktok-center-crop-5percent.png';writeFileSync(resolve(root,path),data);proofs.push({path,width:300,height:400,sha256:sha(data)})}
}
writeFileSync(resolve(root,'evidence/cover-assets.json'),JSON.stringify({schemaVersion:1,status:'generated; visual inspection pending',identity,makerSha256:sha(readFileSync(new URL(import.meta.url))),method:'Code-native poster composition from the complete original wolf artwork, its own paper texture and approved Alegreya serif. No image generation or replacement illustration.',sourceArtwork:'public/artwork-reference.png',files,proofs,limits:'Local profile-size and 5% crop simulations; no actual platform upload preview claimed.'},null,2)+'\n');
console.log(JSON.stringify({status:'covers generated',files}));
