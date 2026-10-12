import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync,readFileSync,copyFileSync,existsSync,readdirSync,statSync,renameSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {loadImage} from '@napi-rs/canvas';
import {root,read,fileHash,sourceFrameForOutput} from './render-production.ts';
import {checkCurrentProductionAuthorization} from './production-authorization.ts';

const json=(path:string,value:unknown)=>writeFileSync(resolve(root,path),JSON.stringify(value,null,2)+'\n');
const kit=resolve(root,'publishing-kit'),authorization=checkCurrentProductionAuthorization(),at=new Date().toISOString();
const movies=[],stills=[],receipts=[],verifications=[];
const selected=[0,738,3012,5568,6648,9012,9738,10602,12564,13974,15234,15575];
for(const [format,platform] of [['landscape','YouTube'],['portrait','TikTok']] as const){
 const verification=read<any>(`evidence/final-${format}-verification.json`),rendered=resolve(root,'renders',verification.file);
 assert.equal(verification.status,'pass');assert.equal(await fileHash(rendered),verification.sha256);
 for(const key of ['sourceSha256','timelineSha256','sceneSha256'] as const)assert.equal(verification[key],authorization.identity[key]);
 assert.equal(verification.sampledReadingGapFrames,381);assert.equal(verification.audioPacketsIdentical,true);assert.equal(verification.decodedPcmIdentical,true);
 const target=resolve(kit,platform,verification.file);
 if(existsSync(target))assert.equal(await fileHash(target),verification.sha256,'Existing kit movie differs.');else copyFileSync(rendered,target);
 assert.equal(await fileHash(target),verification.sha256);
 const receipt=JSON.parse(readFileSync(rendered+'.json','utf8'));assert.equal(receipt.sha256,verification.sha256);receipts.push(receipt);verifications.push(verification);
 movies.push({file:`${platform}/${verification.file}`,bytes:statSync(target).size,sha256:verification.sha256,width:verification.width,height:verification.height,fps:verification.fps,videoDurationSeconds:verification.videoDurationSeconds,audioDurationSeconds:verification.audioDurationSeconds,verification:`evidence/final-${format}-verification.json`,audio:'Original AAC packets and decoded PCM identical.',technicalStatus:'pass'});
 const temporary=resolve(root,`analysis/final-stills/${platform.toLowerCase()}`);mkdirSync(temporary,{recursive:true});
 execFileSync('ffmpeg',['-v','error','-nostdin','-i',rendered,'-vf',`select=${selected.map(n=>`eq(n\\,${n})`).join('+')}`,'-fps_mode','passthrough','-frames:v',String(selected.length),'-q:v','2','-y',resolve(temporary,'%02d.jpg')],{stdio:['ignore','ignore','pipe']});
 for(const [i,n] of selected.entries()){
  const still=`evidence/final-${platform.toLowerCase()}-${(n/60).toFixed(3)}.jpg`;renameSync(resolve(temporary,`${(i+1).toString().padStart(2,'0')}.jpg`),resolve(root,still));
  const image=await loadImage(resolve(root,still));assert.equal(image.width,verification.width);assert.equal(image.height,verification.height);
  const originalFrame=sourceFrameForOutput(n);
  stills.push({file:still,outputFrame:n,outputPtsSeconds:n/60,originalFrame,originalPicturePtsSeconds:originalFrame/25,width:image.width,height:image.height,bytes:statSync(resolve(root,still)).size,sha256:await fileHash(resolve(root,still)),encodedFile:verification.file,encodedSha256:verification.sha256,method:'Exact zero-based FFmpeg decoded frame selection; complete JPEG q2, no crop, repaint or new imagery.',reviewLimit:'Visible presentation evidence; acoustic listening and full-file checks are separate.'});
 }
}
const coverSpec=read<any>('evidence/cover-assets.json');assert.equal(coverSpec.status,'visually inspected; pass');
for(const cover of coverSpec.files){const image=await loadImage(resolve(kit,cover.path));assert.equal(image.width,cover.width);assert.equal(image.height,cover.height);assert.equal(await fileHash(resolve(kit,cover.path)),cover.sha256);}
json('evidence/final-stills.json',{schemaVersion:1,identity:authorization.identity,stills});
json('evidence/production-render-receipts.json',{schemaVersion:1,receipts});
const paths=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?paths(resolve(dir,entry.name)):[resolve(dir,entry.name)]);
const content=[];
for(const path of paths(kit).sort())if(!['DELIVERY.json','CHECKSUMS.sha256'].includes(relative(kit,path)))content.push({file:relative(kit,path),bytes:statSync(path).size,sha256:await fileHash(path)});
assert.equal(content.length,11,'Unexpected upload-kit contents.');
for(const language of ['Russian','English','Bilingual'])assert.equal((readFileSync(resolve(kit,'Captions',language+'.srt'),'utf8').match(/ --> /g)??[]).length,59);
const delivery={schemaVersion:1,edition:'volchya-pesnya-approved-v1-production',preparedAtUtc:at,identity:authorization.identity,productionScope:'Exact owner-accepted current v1 with explicit direction to render without further confirmation. Granular listening scope remains unattested; model observations and encoded checks are separate.',movies,covers:coverSpec.files,files:content,verificationSummary:verifications.map(v=>({format:v.format,fullStrictDecode:v.fullStrictDecode,everyFramePts:v.everyFramePtsVerified,originalAudioPacketsAndPcm:v.audioPacketsIdentical&&v.decodedPcmIdentical,blackIntervals:v.blackIntervals,selectedSceneFrames:v.selectedSceneFrames,glyphStateChecks:v.glyphStateChecks,allTokensFocusedAndNeutral:v.allSourceAndTargetTokensSeenFocusedAndNeutral,deliberatelyDelayedTimingControls:v.deliberatelyDelayedTimingControls,sampledReadingGapFrames:v.sampledReadingGapFrames})),posting:'Prepared for manual platform uploading; no platform upload or public media release is recorded.'};
json('publishing-kit/DELIVERY.json',delivery);json('evidence/upload-kit.json',delivery);
const checks=[];for(const path of paths(kit).sort())if(relative(kit,path)!=='CHECKSUMS.sha256')checks.push(`${await fileHash(path)}  ${relative(kit,path)}`);
writeFileSync(resolve(kit,'CHECKSUMS.sha256'),checks.join('\n')+'\n');
json('evidence/upload-kit-checksums.json',{schemaVersion:1,edition:delivery.edition,files:checks.length+1,checksumsSha256:await fileHash(resolve(kit,'CHECKSUMS.sha256')),checks:checks.map(line=>({sha256:line.slice(0,64),file:line.slice(66)}))});
console.log(JSON.stringify({status:'pass',kit:'publishing-kit',files:checks.length+1,movies:movies.length,stills:stills.length,totalBytes:paths(kit).reduce((sum,p)=>sum+statSync(p).size,0),checksumsSha256:await fileHash(resolve(kit,'CHECKSUMS.sha256'))}));
