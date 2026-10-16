import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync,readFileSync,copyFileSync,existsSync,readdirSync,statSync,renameSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {loadImage,createCanvas} from '@napi-rs/canvas';
import {root,read,fileHash,sourceFrameForOutput} from './render-production.ts';
import {checkCurrentProductionAuthorization} from './production-authorization.ts';
const json=(path:string,value:unknown)=>writeFileSync(resolve(root,path),JSON.stringify(value,null,2)+'\n');
const kit=resolve(root,'publishing-kit'),authorization=checkCurrentProductionAuthorization();
const movies:unknown[]=[],stills:any[]=[],receipts:unknown[]=[],verifications:any[]=[];
const selected=[72,2010,3336,9882,12312,13200,13624];
for(const [format,platform] of [['landscape','YouTube'],['portrait','TikTok']] as const){
 const v=read<any>(`evidence/final-${format}-verification.json`),rendered=resolve(root,'renders',v.file);
 assert.equal(v.status,'pass');assert.equal(await fileHash(rendered),v.sha256);
 for(const key of ['sourceSha256','timelineSha256','sceneSha256'] as const)assert.equal(v[key],authorization.identity[key]);
 assert(v.sampledReadingGapFrames>50);assert.equal(v.audioVerification.status,'pass');assert.equal(v.audioVerification.bestLagSamples,0);assert.equal(v.listeningGateComplete,authorization.listeningGateComplete);
 const destination=resolve(kit,platform,v.file);
 if(existsSync(destination))assert.equal(await fileHash(destination),v.sha256);else copyFileSync(rendered,destination);
 assert.equal(await fileHash(destination),v.sha256);
 const receipt=JSON.parse(readFileSync(rendered+'.json','utf8'));assert.equal(receipt.sha256,v.sha256);receipts.push(receipt);verifications.push(v);
 movies.push({file:`${platform}/${v.file}`,bytes:statSync(destination).size,sha256:v.sha256,width:v.width,height:v.height,fps:v.fps,videoDurationSeconds:v.videoDurationSeconds,audioDurationSeconds:v.audioDurationSeconds,verification:`evidence/final-${format}-verification.json`,audio:v.audioVerification,status:'pass'});
 const temporary=resolve(root,`analysis/final-stills/${platform.toLowerCase()}`);mkdirSync(temporary,{recursive:true});
 execFileSync('ffmpeg',['-v','error','-nostdin','-i',rendered,'-vf',`select=${selected.map(n=>`eq(n\\,${n})`).join('+')}`,'-fps_mode','passthrough','-frames:v',String(selected.length),'-q:v','2','-y',resolve(temporary,'%02d.jpg')],{stdio:['ignore','ignore','pipe']});
 for(const [i,n] of selected.entries()){
  const file=`evidence/final-${platform.toLowerCase()}-${(n/60).toFixed(3)}.jpg`;const native=await loadImage(resolve(temporary,`${(i+1).toString().padStart(2,'0')}.jpg`));const width=format==='landscape'?1440:675,small=createCanvas(width,Math.round(width*native.height/native.width));small.getContext('2d').drawImage(native,0,0,small.width,small.height);writeFileSync(resolve(root,file),small.toBuffer('image/jpeg',91));
  const image=await loadImage(resolve(root,file));assert.equal(image.width,format==='landscape'?1440:675);
  const originalFrame=sourceFrameForOutput(n);
  stills.push({file,outputFrame:n,outputPtsSeconds:n/60,originalFrame,originalPicturePtsSeconds:originalFrame/25,width:image.width,height:image.height,bytes:statSync(resolve(root,file)).size,sha256:await fileHash(resolve(root,file)),encodedFile:v.file,encodedSha256:v.sha256,method:'Exact zero-based FFmpeg decoded frame selection, then uniform downscale to documentation JPEG; no crop, repaint or new imagery.',reviewLimit:'Visible presentation evidence; acoustic listening and full-file checks are separate.'});
 }
}
const wide=verifications.find(v=>v.format==='landscape'),fc='Farcaster/Razuchimsya-Plakat-Farcaster-1920x1080-60fps.mp4';
copyFileSync(resolve(kit,'YouTube',wide.file),resolve(kit,fc));assert.equal(await fileHash(resolve(kit,fc)),wide.sha256);
movies.push({file:fc,bytes:statSync(resolve(kit,fc)).size,sha256:wide.sha256,width:1920,height:1080,fps:60,videoDurationSeconds:13625/60,byteIdenticalTo:`YouTube/${wide.file}`,status:'pass'});
const covers=read<any>('evidence/cover-assets.json');assert.equal(covers.status,'visually inspected; pass');
for(const c of covers.assets){const image=await loadImage(resolve(kit,c.path));assert.equal(image.width,c.width);assert.equal(image.height,c.height);assert.equal(await fileHash(resolve(kit,c.path)),c.sha256)}
json('evidence/final-stills.json',{schemaVersion:1,identity:authorization.identity,stills});
json('evidence/production-render-receipts.json',{schemaVersion:1,receipts});
const paths=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?paths(resolve(dir,e.name)):[resolve(dir,e.name)]);
const content=[];
for(const path of paths(kit).sort())if(!['DELIVERY.json','CHECKSUMS.sha256'].includes(relative(kit,path)))content.push({file:relative(kit,path),bytes:statSync(path).size,sha256:await fileHash(path)});
assert.equal(content.length,15,'Unexpected upload-kit inventory.');
for(const language of ['Russian','English','Bilingual'])assert.equal((readFileSync(resolve(kit,'Captions',language+'.srt'),'utf8').match(/ --> /g)??[]).length,26);
const delivery={schemaVersion:1,edition:'razuchimsya-plakat-approved-v1.1-production',preparedAtUtc:new Date().toISOString(),identity:authorization.identity,review:'Owner reported completed current-preview review and explicitly directed production, Desktop delivery and GitHub integration. Granular listening fields remain unlogged; acceptance is bound to the frozen v1.1 inputs.',movies,covers:covers.assets,files:content,verificationSummary:verifications.map(v=>({format:v.format,fullStrictDecode:v.fullStrictDecode,everyFramePts:v.everyFramePtsVerified,audioZeroOffset:v.audioVerification.bestLagSamples===0,audioVerification:v.audioVerification,blackIntervals:v.blackIntervals,selectedSceneFrames:v.selectedSceneFrames,glyphStateChecks:v.glyphStateChecks,allTokensVerified:v.sourceAndTargetTokensVerified,tokensFocusedAndNeutral:v.tokensSeenFocusedAndNeutral,continuousFocusTokens:v.continuousFocusTokens,clearStateGlyphChecks:v.clearStateGlyphChecks,deliberatelyDelayedTimingControls:v.deliberatelyDelayedTimingControls,sampledReadingGapFrames:v.sampledReadingGapFrames})),posting:'Files prepared for manual uploading; no social-media post or platform upload performed.'};
json('publishing-kit/DELIVERY.json',delivery);json('evidence/upload-kit.json',delivery);
const checks=[];for(const path of paths(kit).sort())if(relative(kit,path)!=='CHECKSUMS.sha256')checks.push(`${await fileHash(path)}  ${relative(kit,path)}`);
writeFileSync(resolve(kit,'CHECKSUMS.sha256'),checks.join('\n')+'\n');
json('evidence/upload-kit-checksums.json',{schemaVersion:1,edition:delivery.edition,files:checks.length+1,checksumsSha256:await fileHash(resolve(kit,'CHECKSUMS.sha256')),checks:checks.map(line=>({sha256:line.slice(0,64),file:line.slice(66)}))});
console.log(JSON.stringify({status:'pass',kit:'publishing-kit',files:checks.length+1,movies:movies.length,decodedStills:stills.length,totalBytes:paths(kit).reduce((sum,p)=>sum+statSync(p).size,0)}));
