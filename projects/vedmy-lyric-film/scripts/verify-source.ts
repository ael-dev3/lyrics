import {execFileSync} from 'node:child_process';import {readFileSync,writeFileSync} from 'node:fs';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const digest=(file:string,codec:string)=>execFileSync('ffmpeg',['-v','error','-i',file,'-map','0:a:0','-c:a',codec,'-f','hash','-hash','sha256','pipe:1'],{encoding:'utf8'}).trim();
const packetsSource=digest('public/source.mp4','copy'),packetsPreview=digest('public/soundtrack.m4a','copy'),pcmSource=digest('public/source.mp4','pcm_f32le'),pcmPreview=digest('public/soundtrack.m4a','pcm_f32le');
assert.equal(packetsSource,packetsPreview);assert.equal(pcmSource,pcmPreview);
const pcmFile=createHash('sha256').update(readFileSync('analysis/audio-delivery.f32')).digest('hex');assert.equal(pcmPreview,'SHA256='+pcmFile);
writeFileSync('evidence/source-audio-verification.json',JSON.stringify({status:'PASS',encodedAacPacketPayloadHash:packetsSource,decodedFloat32PcmHash:pcmSource,pcmAnalysisHash:pcmFile,scope:'Preview soundtrack contains exactly the original AAC packet payloads; decoded stereo Float32 bytes equal source and analysis PCM. Container byte hashes and browser hardware latency are separate.'},null,2)+'\n');
console.log('Original AAC, decoded PCM and analysis PCM match.');
