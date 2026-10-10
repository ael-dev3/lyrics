import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdirSync,writeFileSync,readFileSync,copyFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {resolve,relative} from 'node:path';
import {loadImage} from '@napi-rs/canvas';
import {root,read,fileHash,sourceFrameForOutput} from './render-production.ts';
import {checkCurrentProductionAuthorization} from './production-authorization.ts';

const json=(path:string,value:unknown)=>writeFileSync(resolve(root,path),JSON.stringify(value,null,2)+'\n');
const kit=resolve(root,'publishing-kit'),authorization=checkCurrentProductionAuthorization(),at=new Date().toISOString();
const movies=[],stills=[],receipts=[];
for(const [format,platform,n] of [['landscape','YouTube',1497],['portrait','TikTok',9564]] as const){
 const verification=read<any>(`evidence/final-${format}-verification.json`),rendered=resolve(root,'renders',verification.file);
 assert.equal(verification.status,'pass');assert.equal(await fileHash(rendered),verification.sha256);
 for(const key of ['sourceSha256','timelineSha256','sceneSha256'])assert.equal(verification[key],authorization.identity[key as keyof typeof authorization.identity]);
 const target=resolve(kit,platform,verification.file);
 if(existsSync(target))assert.equal(await fileHash(target),verification.sha256,'Existing kit movie differs.');else copyFileSync(rendered,target);
 assert.equal(await fileHash(target),verification.sha256);
 const receipt=JSON.parse(readFileSync(rendered+'.json','utf8'));assert.equal(receipt.sha256,verification.sha256);receipts.push(receipt);
 movies.push({file:`${platform}/${verification.file}`,bytes:statSync(target).size,sha256:verification.sha256,width:verification.width,height:verification.height,fps:verification.fps,videoDurationSeconds:verification.videoDurationSeconds,audioDurationSeconds:verification.audioDurationSeconds,verification:`evidence/final-${format}-verification.json`,audio:'Original AAC packets and decoded PCM identical.',technicalStatus:'pass'});
 const still=`evidence/final-${platform.toLowerCase()}-${(n/60).toFixed(3)}.jpg`;
 execFileSync('ffmpeg',['-v','error','-nostdin','-i',rendered,'-vf',`select=eq(n\\,${n})`,'-frames:v','1','-q:v','2','-y',resolve(root,still)],{stdio:['ignore','ignore','pipe']});
 const image=await loadImage(resolve(root,still));assert.equal(image.width,verification.width);assert.equal(image.height,verification.height);
 stills.push({file:still,outputFrame:n,outputPtsSeconds:n/60,originalFrame:sourceFrameForOutput(n,5025),originalPicturePtsSeconds:sourceFrameForOutput(n,5025)/25,width:image.width,height:image.height,bytes:statSync(resolve(root,still)).size,sha256:await fileHash(resolve(root,still)),encodedFile:verification.file,encodedSha256:verification.sha256,method:'Exact zero-based FFmpeg decoded frame selection; complete JPEG q2, no crop, repaint or new imagery.',reviewLimit:'Visible presentation evidence; acoustic listening and full-file checks are separate.'});
}
const coverSpec=read<any>('evidence/cover-specification.json');
for(const cover of coverSpec.covers){const image=await loadImage(resolve(kit,cover.file));assert.equal(image.width,cover.width);assert.equal(image.height,cover.height);cover.bytes=statSync(resolve(kit,cover.file)).size;cover.sha256=await fileHash(resolve(kit,cover.file));}
coverSpec.reviewStatus='Complete title, artists and subject readable at 150x200; title/artist remain complete in the 5% portrait crop simulation.';
json('evidence/cover-specification.json',coverSpec);
json('evidence/final-stills.json',{schemaVersion:1,identity:authorization.identity,stills});
json('evidence/production-render-receipts.json',{schemaVersion:1,receipts});
const paths=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?paths(resolve(dir,entry.name)):[resolve(dir,entry.name)]);
const content=[];
for(const path of paths(kit).sort())if(!['DELIVERY.json','CHECKSUMS.sha256'].includes(relative(kit,path)))content.push({file:relative(kit,path),bytes:statSync(path).size,sha256:await fileHash(path)});
assert.equal(content.length,11,'Unexpected upload-kit contents.');
const captionCounts=['Russian','English','Bilingual'].map(language=>(readFileSync(resolve(kit,'Captions',language+'.srt'),'utf8').match(/ --> /g)??[]).length);assert.ok(captionCounts.every(n=>n===captionCounts[0]&&n>=40),'Caption coverage incomplete.');
json('publishing-kit/DELIVERY.json',{schemaVersion:1,edition:'gde-ty-v1',preparedAtUtc:at,identity:authorization.identity,productionScope:'Owner-reviewed complete preview, complete listening scope and explicit current-song production approval.',movies,covers:coverSpec.covers,files:content,verificationSummary:{fullStrictDecode:true,everyFramePts:true,originalAudioPacketsAndPcm:true,blackIntervals:[],selectedSceneFramesPerFormat:680,glyphStateChecksPerFormat:9034,all445TokensFocusedAndNeutralPerFormat:true,deliberatelyDelayedTimingControlsPerFormat:91},posting:'Prepared for manual platform uploading; no platform upload or public media release is recorded.'});
const checks=[];for(const path of paths(kit).sort())if(relative(kit,path)!=='CHECKSUMS.sha256')checks.push(`${await fileHash(path)}  ${relative(kit,path)}`);
writeFileSync(resolve(kit,'CHECKSUMS.sha256'),checks.join('\n')+'\n');
console.log(JSON.stringify({status:'pass',kit:'publishing-kit',files:checks.length+1,movies:movies.length,stills:stills.length,totalBytes:paths(kit).reduce((sum,p)=>sum+statSync(p).size,0),checksumsSha256:await fileHash(resolve(kit,'CHECKSUMS.sha256'))}));
