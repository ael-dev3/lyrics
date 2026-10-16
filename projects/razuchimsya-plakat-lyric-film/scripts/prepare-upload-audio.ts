import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkCurrentProductionAuthorization} from './production-authorization.ts';
import {verifyAudio} from './verify-audio.ts';
import {hashFile} from './project-identity.ts';
const root=fileURLToPath(new URL('../',import.meta.url)),authorization=checkCurrentProductionAuthorization();
mkdirSync(resolve(root,'analysis'),{recursive:true});
const source=resolve(root,'public/source.mp4'),raw=resolve(root,'analysis/apple-aac-full-access-candidate.m4a'),output=resolve(root,'analysis/upload-audio.m4a');
if(!existsSync(raw))execFileSync('ffmpeg',['-v','error','-nostdin','-i',source,'-vn','-map','0:a:0','-c:a','aac_at','-aac_at_quality','2','-b:a','320k','-ar','48000','-n',raw]);
// AudioToolbox adds surplus AAC padding. Preserve every compressed payload
// needed for the complete source; only clip the final packet's declared valid
// duration to the exact 10,899,504 decoded source samples.
if(!existsSync(output))execFileSync('ffmpeg',['-v','error','-nostdin','-i',raw,'-map','0:a:0','-c','copy','-bsf:a',"setts=duration='min(DURATION,10899504-PTS)'",'-t','227.073','-n',output]);
const audio=verifyAudio(source,output),meta=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','stream=duration,start_time','-of','json',output],{encoding:'utf8'})).streams[0];
assert.equal(Number(meta.start_time),0);assert.equal(Number(meta.duration),227.073);
const result={...audio,sourceSha256:authorization.identity.sourceSha256,derivedAudioSha256:hashFile('analysis/upload-audio.m4a'),encoder:'Apple AudioToolbox AAC, quality 2, 320 kb/s. Native codec-service access is required on macOS.',padding:'Original 10,899,504 samples remain intact. Final AAC packet valid duration is explicitly bounded; 912 decoder padding samples may remain outside the track duration.',streamDurationSeconds:Number(meta.duration),rejectedInitialExport:{encoder:'FFmpeg native AAC 320 kb/s',gain:.9497800650253257,snrDb:22.93324157945459,reason:'Did not meet selected level/waveform quality checks.'}};
writeFileSync(resolve(root,'evidence/audio-export-verification.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
