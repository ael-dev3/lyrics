import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyFileSync,cpSync,existsSync,mkdirSync,readFileSync,renameSync,statSync,writeFileSync} from 'node:fs';
import {basename,dirname,isAbsolute,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {checkCurrentProductionGate} from './render-gate.ts';
import {validateCfrTimestamps,compareAudioPackets,canonical} from './verify-final.ts';

// A scoped delivery-aspect adaptation of an already approved and verified film.
// The scene renderer, source clock, timeline and original acceptance are untouched.
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));process.chdir(root);
const square='Svetloe-Chuvstvo-Settlers-YouTube-1080x1080-60fps.mp4';
const wide='Svetloe-Chuvstvo-Settlers-YouTube-1920x1080-60fps.mp4';
const parent=join(root,'renders',square),output=join(root,'renders',wide);
const background='proofs/youtube-wide-edge-material.png';
const authority='evidence/youtube-wide-authority.json';
const report='evidence/youtube-wide-verification.json';
const oldStage='archives/Svetloe-Chuvstvo-Settlers-Upload-Kit';
const stage='archives/Svetloe-Chuvstvo-Settlers-Upload-Kit-YouTube-16x9';
const archive='Archive/YouTube-Square-2026-10-04';
const hash=(path:string)=>createHash('sha256').update(readFileSync(path)).digest('hex');
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const save=(path:string,data:unknown)=>{mkdirSync(dirname(path),{recursive:true});writeFileSync(path,JSON.stringify(data,null,2)+'\n');};
const mode=process.argv[2];
function verifyParent():void {
 checkCurrentProductionGate();
 const original=read('evidence/production-verification.json');
 assert.equal(original.status,'passed');assert.equal(hash(parent),original.formats.landscape.sha256);
 assert.equal(original.formats.landscape.sha256,'ec033b5419a25438e381bfd6d6bf16c73d58f37d070355985e44a50c9565ab97');
 assert.equal(hash('public/source-reference.png'),read('evidence/preview-inputs.json').inputs['public/source-reference.png']);
}
async function command(bin:string,args:string[],capture=true):Promise<Buffer> {
 return new Promise((done,fail)=>{
  const child=spawn(bin,args,{stdio:['ignore','pipe','pipe']});const chunks:Buffer[]=[];let tail='';
  child.stdout.on('data',(part:Buffer)=>{if(capture)chunks.push(part);});
  child.stderr.on('data',(part:Buffer)=>{tail=(tail+part.toString()).slice(-6000);});
  child.on('error',fail);child.on('close',code=>code===0?done(Buffer.concat(chunks)):fail(Error(`${bin} failed (${code}): ${tail.replaceAll(root,'<project>')}`)));
 });
}
async function probe(path:string,extra:string[]=[]):Promise<any> {
 return JSON.parse((await command('ffprobe',['-v','error',...extra,'-of','json',path])).toString());
}
function verifyAuthority():any {
 verifyParent();const a=read(authority);
 assert.equal(a.scope,'YouTube delivery aspect only');assert.equal(a.status,'authorized scoped adaptation');
 assert.equal(a.parentFilmSha256,hash(parent));assert.equal(a.backgroundSha256,hash(background));
 assert.equal(a.adapterSha256,hash(fileURLToPath(import.meta.url)));
 assert.equal(a.diagnosticReview.status,'passed');
 assert.equal(a.diagnosticReview.proofSha256,hash('proofs/youtube-wide-32.500.png'));
 assert.equal(a.approvedPreviewInputsSha256,hash('evidence/preview-inputs.json'));
 return a;
}
if(mode==='proof') {
 verifyParent();mkdirSync('proofs',{recursive:true});
 const original=await loadImage('public/source-reference.png');assert.equal(original.width,1080);assert.equal(original.height,1080);
 const canvas=createCanvas(1920,1080),ctx=canvas.getContext('2d');
 ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 // Only the outer 24 unlettered source columns supply side material. These
 // contain no houses, figure, bird, stars, printed title or right-edge scratch.
 // Reflect outward and expand horizontally; source y coordinates stay intact.
 ctx.save();ctx.translate(420,0);ctx.scale(-1,1);ctx.drawImage(original,0,0,24,1080,0,0,420,1080);ctx.restore();
 ctx.save();ctx.translate(1920,0);ctx.scale(-1,1);ctx.drawImage(original,1056,0,24,1080,0,0,420,1080);ctx.restore();
 ctx.drawImage(original,420,0,1080,1080);
 // Soften the expanded grain rather than making horizontally stretched dust
 // marks into new visual details. Clamp the blur at the image's outer edges.
 const raw=ctx.getImageData(0,0,1920,1080),padded=createCanvas(2048,1208),pc=padded.getContext('2d');
 pc.drawImage(canvas,64,64);
 pc.drawImage(canvas,0,0,1,1080,0,64,64,1080);pc.drawImage(canvas,1919,0,1,1080,1984,64,64,1080);
 pc.drawImage(padded,0,64,2048,1,0,0,2048,64);pc.drawImage(padded,0,1143,2048,1,0,1144,2048,64);
 ctx.filter='blur(24px)';ctx.drawImage(padded,-64,-64);ctx.filter='none';
 const soft=ctx.getImageData(0,0,1920,1080);
 for(let y=0;y<1080;y++)for(let x=0;x<1920;x++)if(x<420||x>=1500){
  const distance=x<420?419-x:x-1500,u=Math.min(1,distance/48),mix=u*u*(3-2*u),at=(y*1920+x)*4;
  for(let channel=0;channel<3;channel++)soft.data[at+channel]=Math.round(raw.data[at+channel]!*(1-mix)+soft.data[at+channel]!*mix);
  soft.data[at+3]=255;
 }
 ctx.putImageData(soft,0,0);ctx.drawImage(original,420,0,1080,1080);
 writeFileSync(background,canvas.toBuffer('image/png'));
 // Decode the approved encoded master, rather than substituting a source still
 // for its real lyric/window-light state. Diagnostic proof is not a film export.
 const png=await command('ffmpeg',['-v','error','-threads','2','-i',parent,'-vf','select=eq(n\\,1950)','-frames:v','1','-f','image2pipe','-c:v','png','pipe:1']);
 ctx.drawImage(await loadImage(png),420,0,1080,1080);
 writeFileSync('proofs/youtube-wide-32.500.png',canvas.toBuffer('image/png'));
 const phone=createCanvas(640,360);phone.getContext('2d').drawImage(canvas,0,0,640,360);
 writeFileSync('proofs/youtube-wide-phone-640x360.png',phone.toBuffer('image/png'));
 console.log(JSON.stringify({status:'aspect diagnostic prepared',proof:'proofs/youtube-wide-32.500.png',phone:'proofs/youtube-wide-phone-640x360.png',parentFilmSha256:hash(parent),backgroundSha256:hash(background),adapterSha256:hash(fileURLToPath(import.meta.url))}));
} else if(mode==='render') {
 const a=verifyAuthority();assert.ok(!existsSync(output),'Preserve completed wide delivery');
 const partial=output.replace('.mp4','.partial.mp4');assert.ok(!existsSync(partial),'Inspect incomplete prior encode before retry');
 console.log(JSON.stringify({phase:'encoding 16:9',frames:10608,parent:basename(parent)}));
 await command('ffmpeg',['-hide_banner','-v','warning','-nostdin','-n','-loop','1','-framerate','60','-i',background,'-threads','2','-i',parent,
  '-filter_complex','[0:v]scale=1920:1080:in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p[paper];[paper][1:v]overlay=420:0:shortest=1:eof_action=endall,setsar=1[out]',
  '-map','[out]','-map','1:a:0','-map_metadata','-1','-c:v','libx264','-preset','medium','-crf','16','-threads','6','-g','120',
  '-color_range','tv','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-video_track_timescale','60000',
  '-frames:v','10608','-c:a','copy','-movflags','+faststart','-metadata','title=Settlers — Светлое чувство | 16:9 Lyric Film',partial],false);
 verifyAuthority();renameSync(partial,output);
 save('evidence/youtube-wide-render.json',{schemaVersion:1,status:'encoded; independent verification pending',file:wide,sha256:hash(output),bytes:statSync(output).size,
  width:1920,height:1080,framesPerSecond:60,frames:10608,parentFilmSha256:hash(parent),authoritySha256:hash(authority),adapterSha256:hash(fileURLToPath(import.meta.url)),
  backgroundSha256:a.backgroundSha256,method:'Approved encoded square centered at x420–1499, full height. Side material from only outer24 unlettered source columns. No crop, stretch of central scene, word remapping, clock offset or new visual response. H264 CRF16; original AAC copied.'});
 console.log(JSON.stringify({status:'encoded',file:wide,sha256:hash(output)}));
} else if(mode==='verify') {
 verifyAuthority();assert.equal(hash(output),read('evidence/youtube-wide-render.json').sha256);
 const metadata=await probe(output,['-show_streams','-show_format']);
 const v=metadata.streams.find((s:any)=>s.codec_type==='video'),audio=metadata.streams.find((s:any)=>s.codec_type==='audio');
 assert.equal(metadata.streams.length,2);assert.equal(v.width,1920);assert.equal(v.height,1080);assert.equal(v.sample_aspect_ratio,'1:1');
 assert.ok(v.tags?.rotate===undefined||Number(v.tags.rotate)===0,'Unexpected stream rotation');
 for(const item of v.side_data_list??[])if(item.rotation!==undefined)assert.equal(Number(item.rotation),0,'Unexpected display-matrix rotation');
 assert.equal(v.avg_frame_rate,'60/1');assert.equal(v.r_frame_rate,'60/1');assert.equal(Number(v.nb_frames),10608);
 assert.equal(v.pix_fmt,'yuv420p');assert.equal(v.color_range,'tv');
 for(const key of ['color_space','color_primaries','color_transfer'])assert.equal(v[key],'bt709');
 assert.equal(Number(v.start_time),0);assert.equal(Number(v.duration),176.8);
 const pts=await probe(output,['-threads','2','-select_streams','v:0','-show_frames','-show_entries','frame=best_effort_timestamp,best_effort_timestamp_time']);
 const timestamps=validateCfrTimestamps(pts.frames,v.time_base,10608,'YouTube wide');
 const packets=async(path:string)=>(await probe(path,['-select_streams','a:0','-show_packets','-show_data_hash','sha256','-show_entries','packet=pts,dts,duration,size,data_hash:packet_side_data'])).packets.map((p:any)=>({...p,side_data_list:p.side_data_list??[]}));
 const [parentPackets,widePackets]=await Promise.all([packets(parent),packets(output)]);compareAudioPackets(parentPackets,widePackets,'YouTube wide');
 const pcm=async(path:string)=>{const bytes=await command('ffmpeg',['-v','error','-xerror','-err_detect','explode','-threads','2','-i',path,'-map','0:a:0','-vn','-c:a','pcm_f32le','-f','f32le','pipe:1']);return {sha256:createHash('sha256').update(bytes).digest('hex'),samples:bytes.length/8};};
 const [parentPcm,widePcm]=await Promise.all([pcm(parent),pcm(output)]);assert.equal(canonical(parentPcm),canonical(widePcm));assert.equal(widePcm.samples,7796160);
 const ssimPath=resolve('proofs/youtube-wide-central-ssim.txt');
 console.log(JSON.stringify({phase:'complete central-scene comparison',frames:10608}));
 await command('ffmpeg',['-hide_banner','-v','error','-nostdin','-xerror','-err_detect','explode','-threads','2','-i',output,'-threads','2','-i',parent,
  '-filter_complex',`[0:v]crop=1080:1080:420:0[center];[center][1:v]ssim=stats_file=${ssimPath}[out]`,'-map','[out]','-map','0:a:0','-f','null','-'],false);
 const scores=readFileSync(ssimPath,'utf8').trim().split('\n').map((line,n)=>{const match=/n:(\d+).*All:([\d.]+)/.exec(line);assert.ok(match);assert.equal(Number(match[1]),n+1);return Number(match[2]);});
 assert.equal(scores.length,10608);const minSsim=Math.min(...scores),meanSsim=scores.reduce((a,b)=>a+b,0)/scores.length;
 assert.ok(minSsim>=.985,'Central scene changed beyond delivery-codec tolerance');
 await command('ffmpeg',['-hide_banner','-v','error','-nostdin','-xerror','-err_detect','explode','-threads','2','-i',output,
  '-map','0:v:0','-map','0:a:0','-vf','blackdetect=d=0:pix_th=0.02:pic_th=0.98,metadata=mode=print:file=proofs/youtube-wide-black-metadata.txt','-f','null','-'],false);
 assert.ok(!readFileSync('proofs/youtube-wide-black-metadata.txt','utf8').includes('lavfi.black_start'),'Unexpected black frame');
 const bytes=readFileSync(output);let offset=0;const atoms:{type:string;offset:number}[]=[];
 while(offset<bytes.length){let size=bytes.readUInt32BE(offset);const type=bytes.toString('ascii',offset+4,offset+8);if(size===1)size=Number(bytes.readBigUInt64BE(offset+8));else if(size===0)size=bytes.length-offset;assert.ok(size>=8);atoms.push({type,offset});offset+=size;}
 assert.equal(offset,bytes.length);assert.ok(atoms.find(a=>a.type==='moov')!.offset<atoms.find(a=>a.type==='mdat')!.offset);
 verifyAuthority();
 const parentAudio=(await probe(parent,['-show_streams'])).streams.find((s:any)=>s.codec_type==='audio');
 for(const key of ['codec_name','sample_rate','channels','time_base','start_pts','start_time','duration_ts','duration'])assert.equal(audio[key],parentAudio[key]);
 save(report,{schemaVersion:1,status:'passed',checkedAt:new Date().toISOString(),edition:'YouTube 16:9 aspect adaptation of approved v3',file:wide,sha256:hash(output),bytes:statSync(output).size,
  parentFilmSha256:hash(parent),authoritySha256:hash(authority),adapterSha256:hash(fileURLToPath(import.meta.url)),width:1920,height:1080,displayAspectRatio:'16:9',sampleAspectRatio:'1:1',frames:10608,framesPerSecond:60,durationSeconds:176.8,
  rotationDegrees:0,timestamps:{allFramesChecked:true,...timestamps},audio:{aacPackets:widePackets.length,allPayloadClockAndPrimingIdentical:true,decodedPcm:widePcm,inventorySha256:createHash('sha256').update(canonical(widePackets)).digest('hex')},
  centralScene:{allFramesCompared:true,frames:scores.length,minimumSsim:minSsim,meanSsim,threshold:.985,method:'Every decoded1080square center compared at identical n/60 against approved encoded master; SSIM permits lossy encoding differences. No independent acoustic accuracy claim.'},
  completeDecode:true,blackFrames:0,fastStart:true,color:'limited BT709 YUV420P',platformRule:{checkedOn:'2026-10-05',source:'https://support.google.com/youtube/answer/15424877?hl=en',decision:'Wider-than-square1920x1080 matches recommended16:9 standard-video route; no actual platform-upload classification test.'}});
 const still=await command('ffmpeg',['-v','error','-threads','2','-i',output,'-vf','select=eq(n\\,1950)','-frames:v','1','-q:v','2','-f','image2pipe','-c:v','mjpeg','pipe:1']);
 writeFileSync('evidence/final-youtube-wide-32.500.jpg',still);
 save('evidence/youtube-wide-still.json',{schemaVersion:1,status:'decoded verified film',file:'evidence/final-youtube-wide-32.500.jpg',sha256:hash('evidence/final-youtube-wide-32.500.jpg'),film:wide,filmSha256:hash(output),frame:1950,seconds:32.5,width:1920,height:1080,attribution:'Original recording and artwork: Settlers https://www.youtube.com/watch?v=UANr7uyRZ3w. Bilingual lyrics, window light and16:9 material adaptation by this project.'});
 console.log(JSON.stringify({status:'passed',file:wide,minSsim,meanSsim}));
} else if(mode==='stage') {
 verifyAuthority();const verified=read(report);assert.equal(verified.status,'passed');assert.equal(verified.sha256,hash(output));assert.ok(!existsSync(stage));
 cpSync(oldStage,stage,{recursive:true,errorOnExist:true,force:false});mkdirSync(join(stage,archive),{recursive:true});
 renameSync(join(stage,'YouTube',square),join(stage,archive,square));
 for(const file of ['START-HERE.md','Delivery-Manifest.json','SHA256SUMS.txt'])copyFileSync(join(oldStage,file),join(stage,archive,file));
 writeFileSync(join(stage,archive,'README.txt'),'Historical square YouTube film and original delivery inventory. The inventory describes the previous root kit paths; unchanged companion files remain in the current kit. The complete original staged kit is preserved separately. This square film may be classified as a Short; upload the current1920x1080 YouTube file instead.\n');
 copyFileSync(output,join(stage,'YouTube',wide));
 copyFileSync(report,join(stage,'Verification/youtube-wide-verification.json'));
 copyFileSync(authority,join(stage,'Verification/youtube-wide-authority.json'));
 const guide=`# Settlers — Светлое чувство — Upload Kit\n\nUse YouTube/${wide} for a regular YouTube video:1920×1080,16:9,60fps. The complete approved square theatre is centered without crop or stretch; source-edge curtain/floor material fills the sides. The original audio and word timing are preserved.\n\nTikTok remains the unchanged1080×1920 portrait film. Both platform thumbnails, descriptions and optional Russian/English captions remain valid.\n\nArchive/YouTube-Square-2026-10-04 preserves the earlier square master and delivery inventory. Do not use that square master for a standard YouTube upload: at2:57 it falls within YouTube’s square/tall Shorts criteria. The archived inventory records the former root paths.\n\nVerification/youtube-wide-verification.json covers the new wide video. The original production/scene reports cover the preserved square and portrait masters; their old534scene comparisons are not relabelled as wide verification. No platform posting is included.\n\nVerify files: shasum -a256 -c SHA256SUMS.txt\n`;
 writeFileSync(join(stage,'START-HERE.md'),guide);
 const old=read(join(oldStage,'Delivery-Manifest.json'));
 const files=old.files.filter((f:any)=>f.path!==`YouTube/${square}`).map((f:any)=>({...f}));
 for(const path of [`YouTube/${wide}`,'Verification/youtube-wide-verification.json','Verification/youtube-wide-authority.json',...['START-HERE.md','Delivery-Manifest.json','SHA256SUMS.txt','README.txt',square].map(f=>`${archive}/${f}`)])files.push({path,role:path.startsWith('Archive/')?'Preserved historical square delivery':'Current YouTube16:9 adaptation'});
 for(const file of files){file.sha256=hash(join(stage,file.path));file.bytes=statSync(join(stage,file.path)).size;}
 const manifest={...old,status:'verified local upload kit with corrected YouTube16:9; not posted',deliveryEdition:'YouTube16:9 aspect correction',files};
 save(join(stage,'Delivery-Manifest.json'),manifest);
 writeFileSync(join(stage,'SHA256SUMS.txt'),[...files,{path:'Delivery-Manifest.json',sha256:hash(join(stage,'Delivery-Manifest.json'))}].map(f=>`${f.sha256}  ${f.path}`).join('\n')+'\n');
 save('evidence/youtube-wide-delivery.json',{schemaVersion:1,status:'staging verified; Desktop update pending',folderLabel:'Светлое чувство — Upload Kit',stagingFolder:stage,edition:manifest.deliveryEdition,
  currentYouTubeFile:`YouTube/${wide}`,sha256:hash(output),manifestSha256:hash(join(stage,'Delivery-Manifest.json')),checksumsSha256:hash(join(stage,'SHA256SUMS.txt')),priorDeliveryReceiptSha256:hash('evidence/delivery-receipt.json'),files});
 console.log(JSON.stringify({status:'staged',files:files.length+2}));
} else if(mode==='desktop') {
 verifyAuthority();const at=process.argv.indexOf('--dest'),dest=process.argv[at+1];assert.ok(at>=0&&dest&&isAbsolute(dest));
 const receipt=read('evidence/youtube-wide-delivery.json');assert.equal(receipt.status,'staging verified; Desktop update pending');
 assert.equal(hash(join(stage,'Delivery-Manifest.json')),receipt.manifestSha256);assert.equal(hash(join(stage,'SHA256SUMS.txt')),receipt.checksumsSha256);
 // Never overwrite a user-edited delivered file. Preserve unknown additions.
 const original=read('evidence/delivery-receipt.json');
 for(const file of original.files)assert.equal(hash(join(dest,file.path)),file.sha256,`Desktop file changed: ${file.path}`);
 assert.equal(hash(join(dest,'Delivery-Manifest.json')),original.manifestSha256);assert.equal(hash(join(dest,'SHA256SUMS.txt')),original.checksumsSha256);
 assert.ok(!existsSync(join(dest,archive)));assert.ok(!existsSync(join(dest,'YouTube',wide)));
 const priorPaths=new Set([...original.files.map((file:any)=>file.path),'Delivery-Manifest.json','SHA256SUMS.txt']);
 for(const file of receipt.files)if(!priorPaths.has(file.path))assert.ok(!existsSync(join(dest,file.path)),`Preserve unknown Desktop addition: ${file.path}`);
 for(const file of receipt.files)assert.equal(hash(join(stage,file.path)),file.sha256);
 mkdirSync(join(dest,archive),{recursive:true});
 for(const file of ['START-HERE.md','Delivery-Manifest.json','SHA256SUMS.txt'])copyFileSync(join(dest,file),join(dest,archive,file));
 renameSync(join(dest,'YouTube',square),join(dest,archive,square));
 for(const file of receipt.files){const target=join(dest,file.path);mkdirSync(dirname(target),{recursive:true});copyFileSync(join(stage,file.path),target);}
 for(const file of ['Delivery-Manifest.json','SHA256SUMS.txt'])copyFileSync(join(stage,file),join(dest,file));
 for(const file of receipt.files)assert.equal(hash(join(dest,file.path)),file.sha256);
 assert.equal(hash(join(dest,'Delivery-Manifest.json')),receipt.manifestSha256);assert.equal(hash(join(dest,'SHA256SUMS.txt')),receipt.checksumsSha256);
 receipt.status='Desktop correction verified';receipt.checkedAt=new Date().toISOString();receipt.filesVerified=receipt.files.length+2;receipt.scope='Current YouTube wide file added; prior square master/inventory archived. TikTok and all unchanged companion hashes match prior delivery. Unknown Desktop additions preserved. No platform upload.';
 save('evidence/youtube-wide-delivery.json',receipt);console.log(JSON.stringify({status:'Desktop correction verified',currentYouTubeFile:receipt.currentYouTubeFile,files:receipt.filesVerified}));
} else throw Error('Use proof, render, verify, stage, or desktop --dest <authorized folder>');
