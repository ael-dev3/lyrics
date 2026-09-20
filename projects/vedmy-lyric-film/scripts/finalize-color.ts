import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,renameSync,existsSync,createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {assertProductionGate} from './production-gate.ts';

assertProductionGate();
const format=process.argv[2];
if(format!=='landscape'&&format!=='portrait')throw Error('Expected landscape or portrait');
const receiptPath=`evidence/production/${format}-capture.json`;
const receipt=JSON.parse(readFileSync(receiptPath,'utf8'));
const file=receipt.output as string, reportPath=`evidence/production/${format}-color-metadata.json`;
const hash=async(path:string)=>{const h=createHash('sha256');for await(const b of createReadStream(path))h.update(b);return h.digest('hex');};
const beforeSha256=await hash(file);
if(beforeSha256!==receipt.sha256)throw Error('Capture bytes changed');
if(existsSync(reportPath)){
  const previous=JSON.parse(readFileSync(reportPath,'utf8'));
  if(previous.afterSha256===beforeSha256&&previous.status==='PASS'){console.log('Color metadata already finalized',format);process.exit(0);}
}
const command=(args:string[])=>{
  const result=spawnSync('ffmpeg',args,{encoding:'utf8',maxBuffer:8*1024*1024});
  if(result.status!==0)throw Error(result.stderr);
  return result.stdout;
};
const temporary=`output/${format}-color-tagged.mp4`;
command(['-v','error','-y','-i',file,'-map','0','-c','copy','-bsf:v','hevc_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-color_range','tv','-tag:v','hvc1','-video_track_timescale','60000','-movflags','+faststart',temporary]);
const frameLedger=(path:string)=>command(['-v','error','-threads','4','-i',path,'-map','0:v:0','-c:v','rawvideo','-pix_fmt','yuv420p10le','-threads','4','-f','framemd5','-']).split('\n').filter(line=>line&&!line.startsWith('#'));
console.log('Comparing decoded native 10-bit pixels and timestamps before/after color tags',format);
const before=frameLedger(file),after=frameLedger(temporary);
if(before.length!==JSON.parse(readFileSync('src/cues.json','utf8')).frames||JSON.stringify(before)!==JSON.stringify(after))throw Error('Metadata remux changed decoded pixels or timestamps');
const afterSha256=await hash(temporary),backup=`output/${format}-capture-untagged.mp4`;
if(existsSync(backup))throw Error('Existing untagged backup; inspect before replacing');
renameSync(file,backup);renameSync(temporary,file);
const report={status:'PASS',format,beforeSha256,afterSha256,untaggedBackup:backup,output:file,decodedFrames:before.length,allNativePixelHashesAndTimestampsIdentical:true,frameLedgerSha256:createHash('sha256').update(before.join('\n')).digest('hex'),method:'Stream-copy remux sets HEVC VUI and MP4 BT.709 primaries/transfer/matrix and limited range. No pixel re-encoding, scaling, timing edits or audio re-encoding. Every native yuv420p10le decoded frame hash and timestamp is identical before and after.',reason:'VideoToolbox omitted primaries and transfer metadata despite encoder options; the delivery verifier rejected missing tags.',scriptSha256:await hash('scripts/finalize-color.ts')};
writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
receipt.captureSha256=beforeSha256;receipt.sha256=afterSha256;receipt.finalization={report:reportPath,method:'Lossless color metadata remux',scriptSha256:report.scriptSha256};
writeFileSync(receiptPath,JSON.stringify(receipt,null,2)+'\n');
console.log(report);
