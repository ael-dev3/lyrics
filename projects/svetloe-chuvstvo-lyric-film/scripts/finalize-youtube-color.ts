import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync,readFileSync,renameSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkCurrentProductionGate} from './render-gate.ts';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));process.chdir(root);checkCurrentProductionGate();
const hash=(path:string)=>createHash('sha256').update(readFileSync(path)).digest('hex');
const receiptPath='evidence/youtube-wide-render.json',receipt=JSON.parse(readFileSync(receiptPath,'utf8'));
const film=`renders/${receipt.file}`,temporary=film.replace('.mp4','.color-finalized.mp4'),history=film.replace('.mp4','.before-color-tag.mp4');
assert.equal(hash(film),receipt.sha256);assert.equal(hash('evidence/youtube-wide-authority.json'),receipt.authoritySha256);
assert.ok(!existsSync(temporary)&&!existsSync(history),'Preserve existing color-finalization outputs');
const args=['-hide_banner','-v','error','-nostdin','-n','-i',film,'-map','0:v:0','-map','0:a:0','-c','copy',
 '-bsf:v','h264_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0',
 '-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-color_range','tv','-video_track_timescale','60000','-movflags','+faststart',temporary];
const child=spawnSync('ffmpeg',args,{encoding:'utf8'});if(child.error)throw child.error;assert.equal(child.status,0,child.stderr);
const outputSha256=hash(temporary);checkCurrentProductionGate();assert.equal(hash(film),receipt.sha256);
const correction={schemaVersion:1,status:'metadata finalized; independent full verification pending',checkedAt:new Date().toISOString(),
 inputSha256:receipt.sha256,outputSha256,finalizerSha256:hash(fileURLToPath(import.meta.url)),method:'Stream-copy remux with H264 SPS color primaries/transfer/matrix set to BT709 and limited range. No video picture or audio reencoding, filtering, trimming or clock shift.',
 reason:'PNG sRGB transfer metadata propagated through the overlay despite encoder color options. Full-file verification rejected that tag. Explicit H264 metadata finalization restores the intended limited BT709 signal description.',
 verificationRequired:'Every PTS, decoded central scene, AAC packet/priming, decoded PCM and full decode must pass after this finalization. Never weaken the color check.'};
renameSync(film,history);renameSync(temporary,film);
writeFileSync('evidence/youtube-wide-color-correction.json',JSON.stringify(correction,null,2)+'\n');
receipt.encodingOutputSha256=receipt.sha256;receipt.sha256=outputSha256;receipt.colorFinalization='evidence/youtube-wide-color-correction.json';
receipt.colorFinalizerSha256=correction.finalizerSha256;receipt.method+=' H264 SPS color metadata finalized by separate stream-copy remux; decoded pixels and audio were not reencoded.';
writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify({status:'color metadata finalized',sha256:outputSha256}));
