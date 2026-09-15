import {spawn} from 'node:child_process';
import {mkdirSync,writeFileSync,statSync} from 'node:fs';
const root='evidence/codec-ladder';mkdirSync(root,{recursive:true});
const run=(args:string[])=>new Promise<string>((resolve,reject)=>{const p=spawn('ffmpeg',['-hide_banner','-y',...args]);let log='';p.stderr.on('data',x=>log+=x);p.on('error',reject);p.on('exit',c=>c===0?resolve(log):reject(Error(log)));});
const records=[];
for(const kernel of ['lanczos','spline']){
 const reference=`${root}/${kernel}-reference.mkv`;
 await run(['-v','error','-ss','15','-i','evidence/previews/Tvoi-Glaza-portrait-reference/part-01.mov','-frames:v','120','-an','-vf',`setpts=N/(60*TB),scale=1080:1920:flags=${kernel},format=yuv420p10le`,'-c:v','ffv1','-level','3',reference]);
 for(const crf of [15,17,19]){
  const output=`${root}/${kernel}-crf${crf}.mp4`;
  await run(['-v','error','-i',reference,'-an','-c:v','libx265','-preset','medium','-crf',String(crf),'-x265-params','pools=2:frame-threads=2:colorprim=bt709:transfer=bt709:colormatrix=bt709:range=limited','-tag:v','hvc1','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-color_range','tv',output]);
  const metrics=await run(['-i',output,'-i',reference,'-filter_complex',`[0:v]settb=1/60,setpts=N,split=2[d0][d1];[1:v]settb=1/60,setpts=N,split=2[r0][r1];[d0][r0]ssim=stats_file=${root}/${kernel}-${crf}-ssim.log[s];[d1]crop=1080:560:0:980[d];[r1]crop=1080:560:0:980[r];[d][r]psnr=stats_file=${root}/${kernel}-${crf}-lyric-psnr.log[p]`,'-map','[s]','-map','[p]','-f','null','-']);
  records.push({kernel,crf,frames:120,seconds:[15,17],bytes:statSync(output).size,metrics:metrics.split('\n').filter(s=>s.includes('SSIM ')||s.includes('PSNR '))});console.log(records.at(-1));
 }
 await run(['-v','error','-ss','1','-i',reference,'-frames:v','1',`${root}/${kernel}-reference.png`]);
 await run(['-v','error','-ss','1','-i',`${root}/${kernel}-crf17.mp4`,'-frames:v','1',`${root}/${kernel}-crf17.png`]);
}
writeFileSync(`${root}/results.json`,JSON.stringify({method:'Two-second real-composition crop, equal frame count and normalized dimensions/pixel format. Full-frame SSIM and separately masked bilingual lyric PSNR. Scores support decoded visual review.',records},null,2));
