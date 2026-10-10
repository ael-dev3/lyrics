import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync,readFileSync,copyFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {loadImage} from '@napi-rs/canvas';
import {root,read,fileHash,sourceFrameForOutput,renderClock,type Recording} from './render-production.ts';
import {checkCurrentProductionAuthorization} from './production-authorization.ts';

const json=(path:string,value:unknown)=>writeFileSync(resolve(root,path),JSON.stringify(value,null,2)+'\n');
const kit=resolve(root,'publishing-kit'),authorization=checkCurrentProductionAuthorization(),at=new Date().toISOString();
const recording=read<Recording>('source/recording.json'),clock=renderClock(recording);
const movies=[],stills=[],receipts=[],verifications=[];
for(const [format,platform,n] of [['landscape','YouTube',1572],['portrait','TikTok',5172]] as const){
 const verification=read<any>(`evidence/final-${format}-verification.json`),rendered=resolve(root,'renders',verification.file);
 assert.equal(verification.status,'pass');assert.equal(await fileHash(rendered),verification.sha256);
 const metadata=JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_streams','-of','json',rendered],{encoding:'utf8'})).streams[0];
 assert.equal(Number(metadata.tags?.rotate??0),0);assert.ok((metadata.side_data_list??[]).every((s:any)=>s.rotation===undefined||Number(s.rotation)===0),'Unexpected picture rotation.');
 for(const key of ['sourceSha256','timelineSha256','sceneSha256'] as const)assert.equal(verification[key],authorization.identity[key]);
 const target=resolve(kit,platform,verification.file);
 if(existsSync(target))assert.equal(await fileHash(target),verification.sha256,'Existing kit movie differs.');else copyFileSync(rendered,target);
 assert.equal(await fileHash(target),verification.sha256);
 const receipt=JSON.parse(readFileSync(rendered+'.json','utf8'));assert.equal(receipt.sha256,verification.sha256);receipts.push(receipt);verifications.push(verification);
 movies.push({file:`${platform}/${verification.file}`,bytes:statSync(target).size,sha256:verification.sha256,width:verification.width,height:verification.height,fps:verification.fps,videoDurationSeconds:verification.videoDurationSeconds,audioDurationSeconds:verification.audioDurationSeconds,verification:`evidence/final-${format}-verification.json`,audio:'Original AAC packets and decoded PCM identical.',rotationDegrees:0,technicalStatus:'pass'});
 const still=`evidence/final-${platform.toLowerCase()}-${(n/60).toFixed(3)}.jpg`;
 execFileSync('ffmpeg',['-v','error','-nostdin','-i',rendered,'-vf',`select=eq(n\\,${n})`,'-frames:v','1','-q:v','2','-y',resolve(root,still)],{stdio:['ignore','ignore','pipe']});
 const image=await loadImage(resolve(root,still));assert.equal(image.width,verification.width);assert.equal(image.height,verification.height);
 stills.push({file:still,outputFrame:n,outputPtsSeconds:n/60,originalFrame:sourceFrameForOutput(n,clock.sourceFrames),originalPicturePtsSeconds:sourceFrameForOutput(n,clock.sourceFrames)/30,width:image.width,height:image.height,bytes:statSync(resolve(root,still)).size,sha256:await fileHash(resolve(root,still)),encodedFile:verification.file,encodedSha256:verification.sha256,method:'Exact zero-based FFmpeg decoded frame selection; complete JPEG q2, no crop, repaint or new imagery.',reviewLimit:'Visible presentation evidence; acoustic listening and full-file checks are separate.'});
}
const coverSpec=read<any>('evidence/cover-specification.json');
for(const cover of coverSpec.covers){const image=await loadImage(resolve(kit,cover.file));assert.equal(image.width,cover.width);assert.equal(image.height,cover.height);cover.bytes=statSync(resolve(kit,cover.file)).size;cover.sha256=await fileHash(resolve(kit,cover.file));}
coverSpec.reviewStatus='Complete title and artist remain readable at profile size and in the 5% crop simulation; the original face stays recognizable.';
json('evidence/cover-specification.json',coverSpec);
json('evidence/final-stills.json',{schemaVersion:1,identity:authorization.identity,stills});
json('evidence/production-render-receipts.json',{schemaVersion:1,receipts});
const paths=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?paths(resolve(dir,entry.name)):[resolve(dir,entry.name)]);
const content=[];
for(const path of paths(kit).sort())if(!['DELIVERY.json','CHECKSUMS.sha256'].includes(relative(kit,path)))content.push({file:relative(kit,path),bytes:statSync(path).size,sha256:await fileHash(path)});
assert.equal(content.length,11,'Unexpected upload-kit contents.');
for(const language of ['Russian','English','Bilingual'])assert.equal((readFileSync(resolve(kit,'Captions',language+'.srt'),'utf8').match(/ --> /g)??[]).length,22);
json('publishing-kit/DELIVERY.json',{schemaVersion:1,edition:'drug-v2-natural-city',preparedAtUtc:at,identity:authorization.identity,productionScope:'Exact owner-approved current complete preview; granular listening checklist not separately logged.',movies,covers:coverSpec.covers,files:content,verificationSummary:{fullStrictDecode:true,everyFramePts:true,originalAudioPacketsAndPcm:true,blackIntervals:[],formats:verifications.map(v=>({format:v.format,frames:v.frames,selectedSceneFrames:v.selectedSceneFrames,glyphStateChecks:v.glyphStateChecks,allSourceAndTargetTokensSeenFocusedAndNeutral:v.allSourceAndTargetTokensSeenFocusedAndNeutral,deliberatelyDelayedTimingControls:v.deliberatelyDelayedTimingControls}))},posting:'Prepared for manual platform uploading; no platform upload or public media release is recorded.'});
const checks=[];for(const path of paths(kit).sort())if(relative(kit,path)!=='CHECKSUMS.sha256')checks.push(`${await fileHash(path)}  ${relative(kit,path)}`);
writeFileSync(resolve(kit,'CHECKSUMS.sha256'),checks.join('\n')+'\n');
console.log(JSON.stringify({status:'pass',kit:'publishing-kit',files:checks.length+1,movies:movies.length,stills:stills.length,totalBytes:paths(kit).reduce((sum,p)=>sum+statSync(p).size,0),checksumsSha256:await fileHash(resolve(kit,'CHECKSUMS.sha256'))}));
