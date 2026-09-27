import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createReadStream, existsSync, mkdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildIdentity, LOCKED_SOURCE_SHA256, PREVIEW_REVISION, PROJECT_ID} from './render-gate.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const format = process.argv[process.argv.indexOf('--format') + 1];
if (!['landscape','portrait'].includes(format)) throw Error('Usage: node scripts/verify-production.mjs --format landscape|portrait');
const dimensions = format === 'portrait' ? [1080,1920] : [1920,1080];
const stem = `Leave-It-On-Warpkeep-${format === 'portrait' ? 'TikTok-1080x1920' : 'YouTube-1920x1080'}-60fps`;
const output = join(root,'output');
const final = join(output,stem+'.mp4');
const archive = join(output,stem+'.source-opus.mkv');
const original = join(root,'source/Leave It On.m4a');
const receipt = JSON.parse(readFileSync(final+'.json','utf8'));
const current = await buildIdentity(root);
const assert = (condition,message) => {if (!condition) throw Error(message);};
const rendererInputs = ['review/render.html','scripts/render-production.mjs'];
const sourceHash = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const rendererDigest = createHash('sha256').update(rendererInputs.map(path => `${path}\0${sourceHash(join(root,path))}`).join('\n')).digest('hex');
const parity = JSON.parse(readFileSync(join(root,'review/render-parity.json'),'utf8'));
assert(receipt.rendererDigest === rendererDigest && parity.rendererDigest === rendererDigest && parity.inputDigest === current.inputDigest && parity.approved === true && parity.formats?.includes(format), 'Output renderer differs from the reviewed browser parity proof.');
const run = (command,args,maxBuffer=16*1024*1024) => {
  const result = spawnSync(command,args,{cwd:root,encoding:'utf8',maxBuffer});
  if (result.status !== 0) throw Error(`${command} failed (${result.status}): ${result.stderr.slice(-5000)}`);
  return result.stdout;
};
const shaFile = path => new Promise((resolveHash,rejectHash) => {
  const h = createHash('sha256'),stream = createReadStream(path);
  stream.on('data',chunk=>h.update(chunk)); stream.on('error',rejectHash); stream.on('end',()=>resolveHash(h.digest('hex')));
});
const probe = path => JSON.parse(run('ffprobe',['-v','error','-count_frames','-show_entries','format=duration:stream=index,codec_type,codec_name,width,height,sample_aspect_ratio,avg_frame_rate,nb_read_frames,pix_fmt,color_range,color_space,color_transfer,color_primaries,sample_rate,channels,start_time,duration','-of','json',path]));
const packetDigest = path => {
  const lines = run('ffprobe',['-v','error','-select_streams','a:0','-show_packets','-show_data_hash','sha256','-show_entries','packet=data_hash','-of','csv=p=0',path]).trim().split('\n').filter(Boolean);
  return {packets:lines.length,sha256:createHash('sha256').update(lines.join('\n')).digest('hex')};
};

assert(receipt.projectId===PROJECT_ID&&receipt.previewRevision===PREVIEW_REVISION&&receipt.inputDigest===current.inputDigest,'Output receipt is stale or belongs to another approved preview.');
assert((await shaFile(original))===LOCKED_SOURCE_SHA256,'Original recording changed.');
for (const [file,claimed] of [[final,receipt.postingMp4],[archive,receipt.sourceOpusArchive]]) {
  assert(existsSync(file),`Missing final output: ${file}`);
  assert((await shaFile(file))===claimed.sha256,`Final output hash differs from encoder receipt: ${file}`);
}
const expectedFrames = Math.ceil(273.56*60);
assert(receipt.frames===expectedFrames&&receipt.firstFrame===0&&receipt.fps===60,'Receipt does not describe the complete 60 fps source-clocked film.');
const finalInfo = probe(final),archiveInfo = probe(archive);
const video = finalInfo.streams.find(stream=>stream.codec_type==='video');
const audio = finalInfo.streams.find(stream=>stream.codec_type==='audio');
const archiveAudio = archiveInfo.streams.find(stream=>stream.codec_type==='audio');
assert(video?.codec_name==='h264'&&video.width===dimensions[0]&&video.height===dimensions[1]&&video.avg_frame_rate==='60/1'&&Number(video.nb_read_frames)===expectedFrames,'Posting video codec, geometry, cadence or frame count is wrong.');
assert(video.sample_aspect_ratio==='1:1'&&video.pix_fmt==='yuv420p'&&video.color_range==='tv'&&video.color_space==='bt709'&&video.color_transfer==='bt709'&&video.color_primaries==='bt709','Posting video pixel aspect or color metadata is wrong.');
assert(audio?.codec_name==='aac'&&audio.sample_rate==='48000'&&audio.channels===2,'Posting audio is not stereo AAC at 48 kHz.');
assert(Number(video.start_time)===0&&Number(audio.start_time)===0,'Posting video/audio streams do not share a zero source-time start.');
assert(archiveAudio?.codec_name==='opus'&&archiveAudio.sample_rate==='48000'&&archiveAudio.channels===2,'Archive audio is not original stereo Opus.');
assert(Math.abs(Number(video.duration)-expectedFrames/60)<.001,'Video duration does not match the exact frame count.');
assert(Math.abs(Number(audio.duration)-273.56)<.06,'AAC duration diverges from original recording.');
const sourcePackets=packetDigest(original),archivedPackets=packetDigest(archive);
assert(JSON.stringify(sourcePackets)===JSON.stringify(archivedPackets),'Archival Opus packet payloads differ from the original recording.');
run('ffmpeg',['-hide_banner','-v','error','-xerror','-i',final,'-map','0:v:0','-map','0:a:0','-f','null','-']);
run('ffmpeg',['-hide_banner','-v','error','-xerror','-i',archive,'-map','0:v:0','-map','0:a:0','-f','null','-']);
const stillDir=join(output,`verified-${format}-stills`);
mkdirSync(stillDir,{recursive:true});
const stills=[];
for (const time of [0,67,105,119.6,180,215,242,266,268.2,273.55]) {
  const path=join(stillDir,`${time.toFixed(3)}.png`);
  run('ffmpeg',['-hide_banner','-v','error','-y','-ss',String(time),'-i',final,'-frames:v','1',path]);
  assert(existsSync(path)&&statSync(path).size>20000,`Missing/empty decoded QA still at ${time}s`);
  stills.push({timeSeconds:time,path,sha256:await shaFile(path),bytes:statSync(path).size});
}
const report={projectId:PROJECT_ID,previewRevision:PREVIEW_REVISION,inputDigest:current.inputDigest,format,dimensions,fps:60,frames:expectedFrames,videoDuration:Number(video.duration),containerDuration:Number(finalInfo.format.duration),aacDuration:Number(audio.duration),postingMp4:{path:final,sha256:await shaFile(final),bytes:statSync(final).size},sourceOpusArchive:{path:archive,sha256:await shaFile(archive),bytes:statSync(archive).size},sourceOpusPackets:sourcePackets,archiveOpusPackets:archivedPackets,decodedCompletely:true,geometryCadenceColorAndAudioVerified:true,stills,limits:'Packet identity applies to the archival Opus stream. The posting AAC is intentionally re-encoded for platform compatibility. Decoding and metadata checks do not independently certify every audible lyric boundary.'};
const reportPath=join(output,`verification-${format}.json`);
writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({verified:format,frames:expectedFrames,videoDuration:report.videoDuration,aacDuration:report.aacDuration,packetIdentity:true,report:reportPath}));
