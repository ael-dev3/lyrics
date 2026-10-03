import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {dirname,isAbsolute,join,relative,resolve} from 'node:path';
import {createCanvas,GlobalFonts,loadImage,type SKRSContext2D} from '@napi-rs/canvas';

const root=resolve(import.meta.dirname,'..');
const at=process.argv.indexOf('--dest');
const argument=at<0?join(root,'publishing'):process.argv[at+1];
assert.ok(argument&&isAbsolute(argument),'Use an absolute --dest folder inside this project.');
const destination=resolve(argument),local=relative(root,destination);
assert.ok(local&&!local.startsWith('..')&&!isAbsolute(local),'Cover output must stay within this project.');
const sha=(bytes:Uint8Array)=>createHash('sha256').update(bytes).digest('hex');
const hashFile=(path:string)=>sha(readFileSync(path));
const identity=JSON.parse(readFileSync(join(root,'evidence/preview-inputs.json'),'utf8')) as {project:string;revision:string;inputHashes:Record<string,string>};
const frozenInputs=['public/source.mp4','public/fonts/NotoSerif.ttf','public/fonts/NotoSerifJP.ttf'] as const;
for(const name of frozenInputs)assert.equal(hashFile(join(root,name)),identity.inputHashes[name],`Changed frozen cover input: ${name}`);
assert.ok(GlobalFonts.registerFromPath(join(root,'public/fonts/NotoSerif.ttf'),'Prizrak Cover Serif'));
assert.ok(GlobalFonts.registerFromPath(join(root,'public/fonts/NotoSerifJP.ttf'),'Prizrak Cover Japanese'));
const proofDirectory=join(root,'publishing/reviews');
const scratchDirectory=join(root,'analysis/covers');
mkdirSync(destination,{recursive:true});mkdirSync(proofDirectory,{recursive:true});mkdirSync(scratchDirectory,{recursive:true});
type Rect={x:number;y:number;width:number;height:number};
type TextBox={text:string;left:number;right:number;top:number;bottom:number;fontSize:number};
type Asset={path:string;width:number;height:number;bytes:number;sha256:string};
type Cover=Asset&{kind:'youtube'|'tiktok';sourceFrame:{ptsSeconds:number;frameIndex:number;decodedPngSha256:string};crop:Rect;placement:Rect;textBoxes:TextBox[];protectedSubject:Rect};
const files:Cover[]=[],proofs:Asset[]=[];
const palette={paper:'#edf3e7',silver:'#bccfc5',ground:'#080e12'};
const fontStack='"Prizrak Cover Serif", "Prizrak Cover Japanese"';

function decodeFrame(seconds:number){
  const path=join(scratchDirectory,`source-${seconds.toFixed(3)}.png`);
  const run=spawnSync('ffmpeg',['-hide_banner','-loglevel','info','-y','-copyts','-ss',String(seconds),'-i',join(root,'public/source.mp4'),'-map','0:v:0','-vf','showinfo','-frames:v','1','-f','image2',path],{encoding:'utf8',maxBuffer:1024*1024});
  assert.equal(run.status,0,`Source still decode failed: ${run.error?.message??run.stderr.slice(-1500)}`);
  const first=/n:\s*0\s+pts:\s*\d+\s+pts_time:([\d.]+)/.exec(run.stderr);
  assert.ok(first,'No decoded source presentation time was reported.');
  assert.equal(Number(first[1]),seconds,'Decoded still does not match selected original source PTS.');
  return {path,hash:hashFile(path)};
}

function lettering(ctx:SKRSContext2D,text:string,x:number,baseline:number,size:number,align:'left'|'center',color:string,width:number,height:number):TextBox{
  ctx.font=`500 ${size}px ${fontStack}`;ctx.textAlign=align;ctx.textBaseline='alphabetic';
  const m=ctx.measureText(text);
  const box={text,left:x-m.actualBoundingBoxLeft,right:x+m.actualBoundingBoxRight,top:baseline-m.actualBoundingBoxAscent,bottom:baseline+m.actualBoundingBoxDescent,fontSize:size};
  assert.ok(box.left>=width*.08&&box.right<=width*.92,`Text loses horizontal safe margin: ${text}`);
  assert.ok(box.top>=height*.07&&box.bottom<=height*.93,`Text loses vertical safe margin: ${text}`);
  ctx.shadowColor='rgba(3,8,12,.65)';ctx.shadowBlur=size*.065;ctx.shadowOffsetY=size*.015;
  ctx.fillStyle=color;ctx.fillText(text,x,baseline);
  ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  return box;
}

function saveProof(name:string,image:Awaited<ReturnType<typeof loadImage>>,crop:Rect,width:number,height:number){
  const proof=createCanvas(width,height),ctx=proof.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.drawImage(image,crop.x,crop.y,crop.width,crop.height,0,0,width,height);
  const path=join(proofDirectory,name),bytes=proof.toBuffer('image/png');writeFileSync(path,bytes);
  proofs.push({path:relative(root,path),width,height,bytes:bytes.length,sha256:sha(bytes)});
}

for(const kind of ['youtube','tiktok'] as const){
  const portrait=kind==='tiktok',width=portrait?1200:1920,height=portrait?1600:1080,seconds=portrait?136:164;
  const frame=decodeFrame(seconds),original=await loadImage(frame.path);
  assert.equal(original.width,1920);assert.equal(original.height,1080);
  const canvas=createCanvas(width,height),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
  ctx.fillStyle=palette.ground;ctx.fillRect(0,0,width,height);
  // These cover crops remove only the authored still-frame mattes. They are
  // separate poster compositions; the full-film source frame stays unchanged.
  const crop:Rect=portrait?{x:390,y:75,width:929*1200/1080,height:929}:{x:100,y:75,width:929*1920/1080,height:929};
  const placement:Rect={x:0,y:0,width,height:portrait?1080:height};
  assert.ok(crop.x+crop.width<=original.width&&crop.y+crop.height<=original.height);
  assert.ok(Math.abs(crop.width/crop.height-placement.width/placement.height)<1e-10,'Do not stretch source photography.');
  ctx.drawImage(original,crop.x,crop.y,crop.width,crop.height,placement.x,placement.y,placement.width,placement.height);
  const textBoxes:TextBox[]=[];
  let protectedSubject:Rect;
  if(portrait){
    // The source close-up already shows both eyes. Feather the lower picture
    // edge into the poster ground below the mouth, without synthesizing skin.
    const feather=ctx.createLinearGradient(0,1000,0,1120);feather.addColorStop(0,'rgba(8,14,18,0)');feather.addColorStop(1,palette.ground);
    ctx.fillStyle=feather;ctx.fillRect(0,1000,width,120);
    textBoxes.push(lettering(ctx,'призрак',width/2,1280,184,'center',palette.paper,width,height));
    textBoxes.push(lettering(ctx,'sotode 外で',width/2,1435,100,'center',palette.silver,width,height));
    // Conservative source eye rectangle, transformed with the uniform crop.
    const scale=placement.width/crop.width;
    protectedSubject={x:(560-crop.x)*scale,y:(230-crop.y)*scale,width:670*scale,height:190*scale};
    assert.ok(protectedSubject.x>=width*.05&&protectedSubject.x+protectedSubject.width<=width*.95);
    assert.ok(protectedSubject.y>=height*.05&&protectedSubject.y+protectedSubject.height<=height*.95);
  }else{
    const shade=ctx.createLinearGradient(0,0,1300,0);shade.addColorStop(0,'rgba(8,14,18,.38)');shade.addColorStop(.65,'rgba(8,14,18,.12)');shade.addColorStop(1,'rgba(8,14,18,0)');
    ctx.fillStyle=shade;ctx.fillRect(0,0,1300,height);
    textBoxes.push(lettering(ctx,'призрак',180,350,190,'left',palette.paper,width,height));
    textBoxes.push(lettering(ctx,'sotode 外で',185,490,86,'left',palette.silver,width,height));
    const scale=placement.width/crop.width;
    protectedSubject={x:(1310-crop.x)*scale,y:(340-crop.y)*scale,width:220*scale,height:570*scale};
    assert.ok(protectedSubject.x>=0&&protectedSubject.x+protectedSubject.width<=width&&protectedSubject.y+protectedSubject.height<=height,'Protect complete waterfront figure.');
  }
  const name=portrait?'Prizrak-Sotode-TikTok-Cover-Profile-1200x1600.jpg':'Prizrak-Sotode-YouTube-Thumbnail-1920x1080.jpg';
  const path=join(destination,name),bytes=canvas.toBuffer('image/jpeg',95);writeFileSync(path,bytes);
  assert.ok(!bytes.includes(Buffer.from('Exif\0\0')),'Cover must not depend on EXIF rotation.');
  if(!portrait)assert.ok(bytes.length<2000000,'YouTube thumbnail exceeds the 2 MB target.');
  const decoded=await loadImage(bytes);assert.equal(decoded.width,width);assert.equal(decoded.height,height);
  files.push({kind,path:relative(root,path),width,height,bytes:bytes.length,sha256:sha(bytes),sourceFrame:{ptsSeconds:seconds,frameIndex:seconds*25,decodedPngSha256:frame.hash},crop,placement,textBoxes,protectedSubject});
  if(portrait){
    saveProof('Prizrak-Sotode-TikTok-150x200.png',decoded,{x:0,y:0,width,height},150,200);
    saveProof('Prizrak-Sotode-TikTok-300x400.png',decoded,{x:0,y:0,width,height},300,400);
    saveProof('Prizrak-Sotode-TikTok-Crop5pct-300x400.png',decoded,{x:width*.05,y:height*.05,width:width*.9,height:height*.9},300,400);
  }else saveProof('Prizrak-Sotode-YouTube-320x180.png',decoded,{x:0,y:0,width,height},320,180);
}
const report={schemaVersion:1,status:'generated; visual review pending',project:identity.project,revision:identity.revision,sourceSha256:identity.inputHashes['public/source.mp4'],makerSha256:hashFile(join(root,'scripts/make-covers.ts')),approvedInputHashes:identity.inputHashes,fontHashes:Object.fromEntries(frozenInputs.filter(p=>p.includes('/fonts/')).map(p=>[p,identity.inputHashes[p]])),method:'Code-native original-video still recomposition; Noto Serif and Noto Serif JP; no generated replacement image or portrait stretching.',palette,files,proofs,checks:{exactDimensions:true,portraitDefault:true,sourcePTSVerified:true,textSafeMargins:true,sourceFacesUnwarped:true,portraitBothEyesProtected:true,completeWaterfrontFigureProtected:true,noExifOrientationDependency:true,youtubeUnder2MB:true,localProfileSimulationOnly:true,platformUploadPreviewChecked:false,humanListeningClaimed:false},review:{status:'pending',required:['Full title/artist and face readability at 150×200','Clean spacing at 300×400','Title/artist and both eyes preserved after 5% edge crop','YouTube title, artist, orb and complete figure separation at 320×180']}};
writeFileSync(join(root,'evidence/cover-assets.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,revision:identity.revision,files:files.map(f=>({path:f.path,width:f.width,height:f.height,bytes:f.bytes,sha256:f.sha256})),proofs:proofs.length}));
