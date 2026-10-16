import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,renameSync,existsSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {root,movieName,fileHash} from './render-production.ts';
import {checkCurrentProductionAuthorization} from './production-authorization.ts';
import {verifyAudio} from './verify-audio.ts';
const a=checkCurrentProductionAuthorization(),audio=resolve(root,'analysis/upload-audio.m4a');verifyAudio(resolve(root,'public/source.mp4'),audio);
const packets=(path:string)=>JSON.parse(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_packets','-show_data_hash','sha256','-show_entries','packet=pts,dts,duration,size,data_hash','-of','json',path],{encoding:'utf8',maxBuffer:16*1024*1024})).packets;
const before=resolve(tmpdir(),'razuchimsya-plakat-initial-aac');mkdirSync(before,{recursive:true});mkdirSync(resolve(root,'analysis/initial-render-receipts'),{recursive:true});const records=[];
for(const format of ['landscape','portrait'] as const){
 const file=movieName(format),output=resolve(root,'renders',file),receipt=JSON.parse(readFileSync(output+'.json','utf8')),old=resolve(before,file),partial=output.replace('.mp4','.audio-fixed.partial.mp4');assert(!existsSync(old)&&!existsSync(partial));
 assert.equal(await fileHash(output),receipt.sha256);assert.deepEqual(receipt.identity,a.identity);
 const originalPackets=packets(output);assert.equal(originalPackets.length,13625);
 execFileSync('ffmpeg',['-v','error','-nostdin','-n','-i',output,'-i',audio,'-map','0:v:0','-map','1:a:0','-c','copy','-map_metadata','0','-video_track_timescale','60000','-movflags','+faststart',partial]);
 assert.deepEqual(packets(partial),originalPackets,'Video packet bytes or timestamps changed.');const checked=verifyAudio(resolve(root,'public/source.mp4'),partial);
 const sha=await fileHash(partial);renameSync(output,old);renameSync(partial,output);writeFileSync(resolve(root,'analysis/initial-render-receipts',file+'.json'),JSON.stringify(receipt,null,2)+'\n');
 const adapters=[];for(const path of ['analysis/initial-render-production.ts','scripts/remux-upload-audio.ts','scripts/production-authorization.ts','scripts/project-identity.ts','scripts/prepare-upload-audio.ts','scripts/verify-audio.ts','analysis/upload-audio.m4a'])adapters.push({path,sha256:await fileHash(resolve(root,path))});
 const next={...receipt,sha256:sha,bytes:statSync(output).size,audio:'Checked Apple AAC LC 320 kb/s export, copied without further encoding or timing shift; track end bounded to the complete source decoded samples.',adapters,videoRender:{initialArtifactSha256:receipt.sha256,initialAdapterSha256:receipt.adapters[0].sha256,unchangedVideoPackets:originalPackets.length,packetMetadataAndPayloadSha256:createHash('sha256').update(JSON.stringify(originalPackets)).digest('hex')},audioVerification:checked};
 writeFileSync(output+'.json',JSON.stringify(next,null,2)+'\n');records.push({format,sha256:sha,...next.videoRender});
}
assert.deepEqual(checkCurrentProductionAuthorization().identity,a.identity);writeFileSync(resolve(root,'evidence/audio-remux-video-identity.json'),JSON.stringify({status:'pass',identity:a.identity,records},null,2)+'\n');console.log(JSON.stringify(records));
