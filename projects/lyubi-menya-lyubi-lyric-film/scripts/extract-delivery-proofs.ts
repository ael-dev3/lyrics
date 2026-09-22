import {createReadStream,readFileSync,writeFileSync,mkdirSync,mkdtempSync,readdirSync,renameSync,rmSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {basename,join} from 'node:path';
import {createCanvas,loadImage} from '@napi-rs/canvas';

// This entry point only decodes already verified delivery bytes. It never
// captures the preview, rerenders the composition, or modifies the films.
const root='evidence/final',formats=['landscape','portrait'] as const;
const checkpoints=[0,22.2,33.2,152.2,180.62,186.9];
const fps=60,frames=11245;
const sha256=async(path:string)=>{const hash=createHash('sha256');for await(const part of createReadStream(path))hash.update(part);return hash.digest('hex');};
const json=(path:string):Record<string,unknown>=>JSON.parse(readFileSync(path,'utf8'));
const requireCheck=(condition:unknown,message:string)=>{if(!condition)throw Error(message);};
const run=(args:string[])=>{const result=spawnSync('ffmpeg',args,{encoding:'utf8',maxBuffer:8*1024*1024});if(result.error)throw result.error;if(result.status!==0)throw Error('Proof extraction failed: '+result.stderr);};
const inputIdentitySha256=await sha256('evidence/preview-identity.json');
const inventories=[];

// Verify both complete inputs before creating even the first proof image.
for(const format of formats){
 const width=format==='landscape'?1920:1080,height=format==='landscape'?1080:1920;
 const sourceFile=`output/Lyubi-Menya-Lyubi-${format}-${width}x${height}-60fps.mp4`;
 const verificationPath=`evidence/production/${format}-verification.json`,verification=json(verificationPath);
 requireCheck(verification.status==='PASS'&&verification.format===format,'A passing final-file verification is required for '+format);
 requireCheck(verification.inputFile===basename(sourceFile)&&verification.inputIdentitySha256===inputIdentitySha256,'Verification belongs to a different file or preview identity');
 requireCheck(verification.width===width&&verification.height===height&&verification.fps===fps&&verification.frames===frames&&verification.strictFullDecode===true,'Verified video geometry or frame clock differs from this project');
 const sourceFileSha256=await sha256(sourceFile);
 requireCheck(sourceFileSha256===verification.sha256,'Delivery bytes changed after verification: '+format);
 inventories.push({format,width,height,sourceFile,sourceFileSha256,verificationPath,verificationSha256:await sha256(verificationPath)});
}

mkdirSync(root,{recursive:true});
const temporary=mkdtempSync(join(root,'.extract-'));
const proofs:Array<{path:string;format:string;width:number;height:number;requestedSeconds:number;frame:number;seconds:number;sourceFile:string;sourceFileSha256:string;sha256:string}>=[];
const sheets=[];
try{
 for(const entry of inventories){
  const selected=checkpoints.map(time=>Math.round(time*fps));
  const pattern=join(temporary,`${entry.format}-%02d.png`);
  // select uses the actual zero-based decoded frame number. No scaling,
  // crop, overlays, grading or shared-scene reconstruction touches the PNGs.
  run(['-v','error','-xerror','-threads','4','-nostdin','-n','-i',entry.sourceFile,'-map','0:v:0','-an','-vf','select='+selected.map(frame=>`eq(n\\,${frame})`).join('+'),'-fps_mode','passthrough','-frames:v',String(selected.length),'-start_number','0',pattern]);
  requireCheck(readdirSync(temporary).filter(name=>name.startsWith(entry.format+'-')&&name.endsWith('.png')).length===selected.length,'Incomplete proof frame inventory');
  const tileWidth=entry.format==='landscape'?640:270,tileHeight=entry.format==='landscape'?360:480,labelHeight=42;
  const sheet=createCanvas(tileWidth*3,(tileHeight+labelHeight)*2),context=sheet.getContext('2d');
  context.fillStyle='#eee';context.fillRect(0,0,sheet.width,sheet.height);context.font='16px sans-serif';context.fillStyle='#222';
  for(let index=0;index<checkpoints.length;index++){
   const requestedSeconds=checkpoints[index]!,frame=selected[index]!,seconds=frame/fps;
   const path=`${root}/${entry.format}-${String(requestedSeconds).replaceAll('.','-')}.png`;
   const decodedPath=join(temporary,`${entry.format}-${String(index).padStart(2,'0')}.png`),decoded=await loadImage(decodedPath);
   requireCheck(decoded.width===entry.width&&decoded.height===entry.height,'Decoded PNG dimensions changed');
   const x=index%3*tileWidth,y=Math.floor(index/3)*(tileHeight+labelHeight);
   context.drawImage(decoded,x,y,tileWidth,tileHeight);
   context.fillText(`${seconds.toFixed(3)} s · frame ${frame}`,x+10,y+tileHeight+26);
   proofs.push({path,format:entry.format,width:decoded.width,height:decoded.height,requestedSeconds,frame,seconds,sourceFile:entry.sourceFile,sourceFileSha256:entry.sourceFileSha256,sha256:await sha256(decodedPath)});
   renameSync(decodedPath,join(temporary,basename(path)));
  }
  const path=`${root}/${entry.format}-contact-sheet.png`,sheetTemporary=join(temporary,basename(path));
  writeFileSync(sheetTemporary,sheet.toBuffer('image/png'));
  sheets.push({path,format:entry.format,width:sheet.width,height:sheet.height,sha256:await sha256(sheetTemporary),scope:'Annotated, resized overview only. Individual proof PNGs remain native decoded frames.'});
 }
 // A render replacement or verification rewrite during extraction invalidates
 // the entire export; do not publish a manifest mixing different editions.
 for(const entry of inventories){
  requireCheck(await sha256(entry.sourceFile)===entry.sourceFileSha256,'Delivery changed during extraction');
  requireCheck(await sha256(entry.verificationPath)===entry.verificationSha256,'Verification changed during extraction');
 }
 requireCheck(await sha256('evidence/preview-identity.json')===inputIdentitySha256,'Preview identity changed during extraction');
 for(const entry of [...proofs,...sheets])renameSync(join(temporary,basename(entry.path)),entry.path);
 const manifest={status:'PASS',scope:'Native-size PNG frames decoded directly from the exact SHA-256-verified final MP4s. Frame numbers are zero-based at 60 fps; requested decimal times are rounded to their nearest frame.',fps,inputIdentitySha256,extractorSha256:await sha256('scripts/extract-delivery-proofs.ts'),sources:inventories,readmeSelection:{landscape:`${root}/landscape-33-2.png`,portrait:`${root}/portrait-22-2.png`},proofs,contactSheets:sheets};
 writeFileSync(`${root}/manifest.json`,JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify({status:'PASS',proofs:proofs.length,contactSheets:sheets.length,manifest:`${root}/manifest.json`},null,2));
}finally{rmSync(temporary,{recursive:true,force:true});}
