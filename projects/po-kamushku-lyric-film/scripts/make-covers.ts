import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {dirname,isAbsolute,join,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas,GlobalFonts,loadImage} from '@napi-rs/canvas';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const at=process.argv.indexOf('--dest'),argument=at<0?undefined:process.argv[at+1];
assert.ok(argument&&isAbsolute(argument),'Pass an absolute --dest staging folder');
const destination=resolve(argument);
const stagingRelative=relative(root,destination);
assert.ok(stagingRelative&&!stagingRelative.startsWith('..')&&!isAbsolute(stagingRelative),'Stage covers within this project');
const sha=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
const identity=JSON.parse(readFileSync(join(root,'evidence/preview-inputs.json'),'utf8')) as {revision:string;inputs:Record<string,string>};
for(const input of ['public/material-reference.png','public/fonts/Alegreya.ttf'])assert.equal(sha(readFileSync(join(root,input))),identity.inputs[input],`Changed approved cover input: ${input}`);
GlobalFonts.registerFromPath(join(root,'public/fonts/Alegreya.ttf'),'Kamushku Cover');
const original=await loadImage(join(root,'public/material-reference.png'));
assert.equal(original.width,1080);assert.equal(original.height,1080);
const proofDirectory=join(root,'analysis/covers');mkdirSync(proofDirectory,{recursive:true});
type Box={text:string;left:number;right:number;top:number;bottom:number};
type Cover={kind:string;path:string;width:number;height:number;bytes:number;sha256:string;sourcePlacement:{x:number;y:number;width:number;height:number};textBoxes:Box[]};
const files:Cover[]=[],proofs:{path:string;width:number;height:number;sha256:string}[]=[];
for(const kind of ['youtube','tiktok'] as const){
  const portrait=kind==='tiktok',width=portrait?1200:1280,height=portrait?1600:720;
  const canvas=createCanvas(width,height),context=canvas.getContext('2d');
  context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';
  // The source is a square photograph. Additional poster space receives only
  // empty source-soil texture; the complete stone circle/person stays square.
  context.fillStyle='#080807';context.fillRect(0,0,width,height);
  const soil=createCanvas(192,192);
  soil.getContext('2d').drawImage(original,0,0,192,192,0,0,192,192);
  const soilPattern=context.createPattern(soil,'repeat');assert.ok(soilPattern);
  context.globalAlpha=.45;context.fillStyle=soilPattern;context.fillRect(0,0,width,height);
  context.globalAlpha=1;
  const placement=portrait?{x:85,y:104,width:1030,height:1030}:{x:18,y:25,width:670,height:670};
  const artwork=createCanvas(placement.width,placement.height),art=artwork.getContext('2d');
  art.drawImage(original,0,0,placement.width,placement.height);
  // Feather only the empty outer soil. No stone or figure receives the edge
  // mask: the nearest photographed stone is >40 source pixels from an edge.
  const pixels=art.getImageData(0,0,placement.width,placement.height),feather=32*placement.width/1080;
  for(let y=0;y<placement.height;y++)for(let x=0;x<placement.width;x++){
    const distance=Math.min(x,y,placement.width-1-x,placement.height-1-y);
    const opacity=Math.max(0,Math.min(1,distance/feather));
    pixels.data[(y*placement.width+x)*4+3]=Math.round(255*opacity);
  }
  art.putImageData(pixels,0,0);context.drawImage(artwork,placement.x,placement.y);
  const boxes:Box[]=[];
  const text=(value:string,size:number,x:number,y:number,color:string)=>{
    context.font=`500 ${size}px "Kamushku Cover"`;context.textAlign='center';context.textBaseline='alphabetic';
    const measured=context.measureText(value);
    const box={text:value,left:x-measured.actualBoundingBoxLeft,right:x+measured.actualBoundingBoxRight,top:y-measured.actualBoundingBoxAscent,bottom:y+measured.actualBoundingBoxDescent};
    assert.ok(box.left>=width*.08&&box.right<=width*.92&&box.top>=height*.07&&box.bottom<=height*.93,`Cover text safe margin: ${kind} ${value}`);
    context.fillStyle=color;context.fillText(value,x,y);boxes.push(box);
  };
  if(portrait){
    text('По камушку',134,600,1300,'#ece5db');
    text('SETTLERS',80,600,1420,'#e0b797');
  }else{
    text('По',130,952,260,'#ece5db');
    text('камушку',112,952,376,'#ece5db');
    text('SETTLERS',58,952,472,'#e0b797');
  }
  const path=portrait?'TikTok/Po-Kamushku-Settlers-TikTok-Cover-Profile-1200x1600.jpg':'YouTube/Po-Kamushku-Settlers-YouTube-Thumbnail-1280x720.jpg';
  const bytes=canvas.toBuffer('image/jpeg',95),file=join(destination,path);mkdirSync(dirname(file),{recursive:true});writeFileSync(file,bytes);
  const decoded=await loadImage(bytes);
  assert.equal(decoded.width,width);assert.equal(decoded.height,height);
  assert.ok(!bytes.includes(Buffer.from('Exif\0\0')),'JPEG must not depend on EXIF rotation');
  if(!portrait)assert.ok(bytes.length<2000000,'YouTube thumbnail exceeds2MB');
  files.push({kind,path,width,height,bytes:bytes.length,sha256:sha(bytes),sourcePlacement:placement,textBoxes:boxes});
  for(const proofWidth of portrait?[150,300]:[320]){
    const proofHeight=Math.round(proofWidth*height/width),proof=createCanvas(proofWidth,proofHeight);
    proof.getContext('2d').drawImage(decoded,0,0,proofWidth,proofHeight);
    const bytes=proof.toBuffer('image/png'),path=`analysis/covers/${kind}-${proofWidth}x${proofHeight}.png`;
    writeFileSync(join(root,path),bytes);proofs.push({path,width:proofWidth,height:proofHeight,sha256:sha(bytes)});
  }
  if(portrait){
    const proof=createCanvas(300,400);proof.getContext('2d').drawImage(decoded,width*.05,height*.05,width*.9,height*.9,0,0,300,400);
    const bytes=proof.toBuffer('image/png'),path='analysis/covers/tiktok-center-crop-5percent.png';writeFileSync(join(root,path),bytes);
    proofs.push({path,width:300,height:400,sha256:sha(bytes)});
  }
}
writeFileSync(join(root,'evidence/cover-assets.json'),JSON.stringify({schemaVersion:1,status:'generated; visual inspection pending',revision:identity.revision,sourceSha256:identity.inputs['public/source.mp4'],approvedInputHashes:identity.inputs,makerSha256:sha(readFileSync(fileURLToPath(import.meta.url))),method:'Code-native recomposition of the original 1080-square photograph, complete stone circle and person preserved. Empty source-soil extension, approved Alegreya typography, ivory/clay; no generated replacement artwork.',sourceArtwork:'public/material-reference.png',files,proofs,limits:'Local small-size and 5% center-crop simulations; no platform upload preview claimed.'},null,2)+'\n');
console.log(JSON.stringify({status:'covers generated; inspect proofs before accepting',stage:stagingRelative,files:files.map(file=>({path:file.path,width:file.width,height:file.height,bytes:file.bytes}))}));
