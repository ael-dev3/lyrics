import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {dirname,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas,GlobalFonts,loadImage} from '@napi-rs/canvas';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const destination=join(root,'publishing');
const sha=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
const identity=JSON.parse(readFileSync(join(root,'evidence/preview-inputs.json'),'utf8')) as {revision:string;inputs:Record<string,string>};
for(const input of ['public/source-reference.png','public/fonts/NotoSerif.ttf']){
  assert.equal(sha(readFileSync(join(root,input))),identity.inputs[input],`Cover input differs from approved preview: ${input}`);
}
GlobalFonts.registerFromPath(join(root,'public/fonts/NotoSerif.ttf'),'Theatre Cover');
const original=await loadImage(join(root,'public/source-reference.png'));
assert.equal(original.width,1080);assert.equal(original.height,1080);
const palette={ink:'#282720',accent:'#ab3810'};
type Box={text:string;left:number;right:number;top:number;bottom:number};
type Placement={x:number;y:number;width:number;height:number;edgeFeather:string};
type SubjectBox={name:string;left:number;right:number;top:number;bottom:number};
type Asset={kind:string;path:string;width:number;height:number;bytes:number;sha256:string;sourcePlacement:Placement;textBoxes:Box[];protectedArtworkBoxes:SubjectBox[]};
const assets:Asset[]=[];
const proofs:{path:string;width:number;height:number;sha256:string;simulation?:string}[]=[];

for(const kind of ['youtube','tiktok'] as const){
  const portrait=kind==='tiktok',width=portrait?1200:1280,height=portrait?1600:720;
  const canvas=createCanvas(width,height),ctx=canvas.getContext('2d');
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  // Continue only the photograph's unoccupied pale paper. The complete stage
  // receives one uniformly scaled copy, preserving the figure, bird and print.
  ctx.drawImage(original,0,0,1080,140,0,0,width,height);
  const placement:Placement=portrait
    ?{x:0,y:400,width:1200,height:1200,edgeFeather:'top 50px within the empty source sky'}
    :{x:560,y:0,width:720,height:720,edgeFeather:'left 24px within the outer curtain edge'};
  const stage=createCanvas(placement.width,placement.height),sc=stage.getContext('2d');
  sc.drawImage(original,0,0,placement.width,placement.height);
  const pixels=sc.getImageData(0,0,placement.width,placement.height);
  for(let y=0;y<placement.height;y++)for(let x=0;x<placement.width;x++){
    const amount=portrait?Math.min(1,y/50):Math.min(1,x/24);
    pixels.data[(y*placement.width+x)*4+3]=Math.round(255*amount);
  }
  sc.putImageData(pixels,0,0);ctx.drawImage(stage,placement.x,placement.y);

  const boxes:Box[]=[];
  const text=(value:string,size:number,x:number,y:number,color:string)=>{
    ctx.font=`500 ${size}px "Theatre Cover"`;ctx.textAlign='center';ctx.textBaseline='alphabetic';
    const m=ctx.measureText(value),box={text:value,left:x-m.actualBoundingBoxLeft,right:x+m.actualBoundingBoxRight,top:y-m.actualBoundingBoxAscent,bottom:y+m.actualBoundingBoxDescent};
    assert.ok(box.left>=width*.08&&box.right<=width*.92&&box.top>=height*.07&&box.bottom<=height*.93,`Title safety margin failed: ${kind} ${value}`);
    ctx.fillStyle=color;ctx.fillText(value,x,y);boxes.push(box);
  };
  if(portrait){
    text('Светлое',116,600,225,palette.ink);
    text('чувство',116,600,352,palette.ink);
    text('Settlers',69,600,460,palette.accent);
  }else{
    text('Светлое',75,292,285,palette.ink);
    text('чувство',75,292,376,palette.ink);
    text('Settlers',48,292,461,palette.accent);
  }
  const scale=placement.width/1080;
  const protectedArtworkBoxes=[
    {name:'profile-face',left:placement.x+395*scale,right:placement.x+565*scale,top:placement.y+407*scale,bottom:placement.y+560*scale},
    {name:'bird',left:placement.x+615*scale,right:placement.x+725*scale,top:placement.y+470*scale,bottom:placement.y+568*scale},
  ];
  for(const b of protectedArtworkBoxes)assert.ok(b.left>width*.05&&b.right<width*.95&&b.top>height*.05&&b.bottom<height*.95,`Protected artwork fails 5% crop: ${kind} ${b.name}`);
  const path=portrait?'TikTok/Svetloe-Chuvstvo-Settlers-TikTok-Cover-Profile-1200x1600.jpg':'YouTube/Svetloe-Chuvstvo-Settlers-YouTube-Thumbnail-1280x720.jpg';
  const bytes=canvas.toBuffer('image/jpeg',95);mkdirSync(dirname(join(destination,path)),{recursive:true});writeFileSync(join(destination,path),bytes);
  const decoded=await loadImage(bytes);assert.equal(decoded.width,width);assert.equal(decoded.height,height);
  assert.ok(!bytes.includes(Buffer.from('Exif\0\0')),'JPEG must not rely on EXIF rotation');
  if(!portrait)assert.ok(bytes.length<2000000,'YouTube thumbnail exceeds 2 MB');
  assets.push({kind,path,width,height,bytes:bytes.length,sha256:sha(bytes),sourcePlacement:placement,textBoxes:boxes,protectedArtworkBoxes});

  for(const proofWidth of portrait?[150,300]:[320]){
    const proofHeight=Math.round(proofWidth*height/width),proof=createCanvas(proofWidth,proofHeight);
    proof.getContext('2d').drawImage(decoded,0,0,proofWidth,proofHeight);
    const proofBytes=proof.toBuffer('image/png'),proofPath=`Review/${kind}-${proofWidth}x${proofHeight}.png`;
    mkdirSync(dirname(join(destination,proofPath)),{recursive:true});writeFileSync(join(destination,proofPath),proofBytes);
    proofs.push({path:proofPath,width:proofWidth,height:proofHeight,sha256:sha(proofBytes)});
  }
  const cropWidth=portrait?300:320,cropHeight=portrait?400:180,crop=createCanvas(cropWidth,cropHeight);
  crop.getContext('2d').drawImage(decoded,width*.05,height*.05,width*.9,height*.9,0,0,cropWidth,cropHeight);
  const cropBytes=crop.toBuffer('image/png'),cropPath=`Review/${kind}-center-crop-5percent.png`;
  writeFileSync(join(destination,cropPath),cropBytes);
  proofs.push({path:cropPath,width:cropWidth,height:cropHeight,sha256:sha(cropBytes),simulation:'Remove 5% of each edge then resize; local crop stress simulation, not platform UI.'});
}
writeFileSync(join(destination,'cover-assets.json'),JSON.stringify({schemaVersion:1,status:'generated; inspect small-size and crop proofs before accepting',revision:identity.revision,sourceSha256:identity.inputs['public/source.mp4'],sourceArtwork:'public/source-reference.png',sourceReferenceSha256:identity.inputs['public/source-reference.png'],fontSha256:identity.inputs['public/fonts/NotoSerif.ttf'],makerSha256:sha(readFileSync(fileURLToPath(import.meta.url))),method:'Code-native poster recomposition of the original photographed paper shadow theatre. Complete source square is uniformly scaled once; only empty upper paper extends the canvas. Charcoal Noto Serif500 title and rust artist; no generated replacement scenery.',palette,files:assets,proofs,attribution:'Original recording/artwork: Settlers, linked official source https://www.youtube.com/watch?v=UANr7uyRZ3w. Original source artwork retains its rights; no redistribution license is inferred.',limits:'Local 150x200,300x400,320x180 and5% edge-crop reviews; no actual platform-upload preview claimed.'},null,2)+'\n');
console.log(JSON.stringify({stage:'publishing',revision:identity.revision,files:assets.map(a=>({path:a.path,width:a.width,height:a.height,bytes:a.bytes})),proofs:proofs.map(p=>p.path)}));
