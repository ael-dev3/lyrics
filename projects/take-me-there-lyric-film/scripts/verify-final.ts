import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createReadStream, existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {basename, dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {SHOTS} from '../src/shots.ts';
import {geometry, shotAt} from '../src/scene.ts';

// Independent checks on the *encoded* films. The picture comparison deliberately
// uses decoded output frames, not the renderer's in-memory canvas or receipt.
const root = fileURLToPath(new URL('../', import.meta.url));
const sourcePath = resolve(root, 'public/source.mp4');
const sourceSha256 = '954ce98a308937e81a167ab740381cd46195abbad3279f3bc57319fa48bbd73c';
const sourceAacSha256 = 'cad0e9b829c5bc0b6dcf426ff2e8b8f5aab6938b14f09fb0d12d4c984fc96726';
const sourcePcmSha256 = '17dcb6b92c81f4ae830d7d9c38e40d8932e0d549ae5e70488468cdab0c718fc0';
const FPS = 60, FRAMES = 8096, SOURCE_FRAMES = 8093, DURATION = FRAMES / FPS;
const SOURCE_DURATION = 134.931156;
const SAMPLE_WIDTH = 640, SAMPLE_HEIGHT = 360, PORTRAIT_WIDTH = 203;
type Format = 'landscape' | 'portrait';
type Json = Record<string, unknown>;
type BlackInterval = {start: number; end: number};

function option(name: string): string | undefined {
  const at = process.argv.indexOf(name);
  return at < 0 ? undefined : process.argv[at + 1];
}
function command(program: string, args: string[], limit = 128 * 1024 * 1024): {stdout: Buffer; stderr: string} {
  const result = spawnSync(program, args, {maxBuffer: limit});
  if (result.error || result.status !== 0) {
    const detail = result.stderr?.toString('utf8').slice(-1200)
      .replaceAll(root, '<project>').replaceAll(dirname(root), '<checkout>') ?? '';
    throw Error(`${program} failed (${result.status ?? result.error?.message}): ${detail}`);
  }
  return {stdout: result.stdout, stderr: result.stderr.toString('utf8')};
}
function jsonCommand(program: string, args: string[]): Json {
  return JSON.parse(command(program, args, 24 * 1024 * 1024).stdout.toString('utf8')) as Json;
}
function probe(path: string): Json {
  return jsonCommand('ffprobe', ['-v','error','-show_entries',
    'format=duration,size:stream=index,codec_type,codec_name,pix_fmt,width,height,sample_aspect_ratio,avg_frame_rate,r_frame_rate,start_time,duration,nb_frames,sample_rate,channels,color_primaries,color_transfer,color_space,color_range',
    '-of','json',path]);
}
function stream(data: Json, kind: string): Json {
  const matches = (data.streams as Json[] | undefined)?.filter(item => item.codec_type === kind) ?? [];
  assert.equal(matches.length, 1, `Expected exactly one ${kind} stream`);
  return matches[0] as Json;
}
function hashStream(path: string, codec: 'copy' | 'pcm_s32le'): string {
  const value = command('ffmpeg',['-v','error','-i',path,'-map','0:a:0','-c:a',codec,
    '-f','hash','-hash','sha256','-']).stdout.toString('utf8').trim();
  assert.match(value,/^SHA256=[a-f0-9]{64}$/u);
  return value.slice(7);
}
async function fileHash(path: string): Promise<string> {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk as Buffer);
  return hash.digest('hex');
}
function frameTimes(path: string): number[] {
  const lines = command('ffprobe',['-v','error','-select_streams','v:0','-show_frames',
    '-show_entries','frame=best_effort_timestamp_time','-of','csv=p=0',path],32 * 1024 * 1024)
    .stdout.toString('utf8').trim().split(/\r?\n/u);
  // FFprobe may append H.264 SEI side-data text after the first timestamp.
  // Read only the leading numeric field from each decoded frame row.
  return lines.map(value => {
    const match = /^\s*([+-]?\d+(?:\.\d+)?)/u.exec(value);
    assert.ok(match, `Missing decoded-frame timestamp: ${value.slice(0,100)}`);
    return Number(match[1]);
  });
}
function blackIntervals(stderr: string): BlackInterval[] {
  const pattern = /black_start:([\d.]+)\s+black_end:([\d.]+)\s+black_duration:[\d.]+/gu;
  return [...stderr.matchAll(pattern)].map(hit => ({start: Number(hit[1]),end:Number(hit[2])}));
}
function strictDecodeAndBlack(path: string): BlackInterval[] {
  const output = command('ffmpeg',['-hide_banner','-nostats','-loglevel','info','-xerror',
    '-err_detect','explode','-i',path,'-map','0:v:0','-map','0:a:0',
    '-vf','blackdetect=d=0:pix_th=0.02:pic_th=0.98','-f','null','-'],12 * 1024 * 1024);
  return blackIntervals(output.stderr);
}
function compareBlack(source: BlackInterval[], rendered: BlackInterval[]): Json {
  const unexpected = rendered.filter(black => {
    if (black.start >= 134.75 && black.end <= DURATION + 1 / FPS) return false;
    return !source.some(original => black.start >= original.start - 2 / FPS
      && black.end <= original.end + 2 / FPS);
  });
  assert.deepEqual(unexpected, [], 'New black-picture interval in the encoded film');
  return {sourceIntervals: source, renderedIntervals: rendered, unexpectedIntervals: unexpected,
    method: 'Strict full audio/video decode plus FFmpeg blackdetect at zero minimum duration; only source-equivalent dark intervals and the source ending are accepted.'};
}
function sampledGray(path: string, width: number): Buffer[] {
  const filter = `select=not(mod(n\\,60)),scale=${width}:${SAMPLE_HEIGHT}:flags=area,format=gray`;
  const bytes = command('ffmpeg',['-v','error','-xerror','-i',path,'-an','-vf',filter,
    '-fps_mode','passthrough','-f','rawvideo','-pix_fmt','gray','-'],48 * 1024 * 1024).stdout;
  const size = width * SAMPLE_HEIGHT;
  assert.equal(bytes.length % size, 0, 'Incomplete sampled grayscale frame');
  return Array.from({length:bytes.length / size},(_,i)=>bytes.subarray(i * size,(i + 1) * size));
}
function expectedPortrait(source: Buffer, time: number): Uint8Array {
  const shot = SHOTS.find(item => time >= item.start && time < item.end) ?? SHOTS.at(-1);
  assert.ok(shot, 'No portrait crop at sampled time');
  const cropWidth = 1080 * 9 / 16;
  const cropLeft = Math.max(0,Math.min(1920-cropWidth,shot.portraitCenter*1920-cropWidth/2));
  const out = new Uint8Array(PORTRAIT_WIDTH * SAMPLE_HEIGHT);
  for (let y = 0; y < SAMPLE_HEIGHT; y++) for (let x = 0; x < PORTRAIT_WIDTH; x++) {
    const sx = (cropLeft + (x+.5)*cropWidth/PORTRAIT_WIDTH)/1920*SAMPLE_WIDTH-.5;
    const left = Math.max(0,Math.min(SAMPLE_WIDTH-1,Math.floor(sx)));
    const right = Math.min(SAMPLE_WIDTH-1,left+1), blend=Math.max(0,Math.min(1,sx-left));
    const a=source[y*SAMPLE_WIDTH+left] ?? 0,b=source[y*SAMPLE_WIDTH+right] ?? 0;
    out[y*PORTRAIT_WIDTH+x] = Math.round(a*(1-blend)+b*blend);
  }
  return out;
}
function pearson(a: Uint8Array, b: Uint8Array, width: number, height: number, format: Format, second: number): {r:number;sourceMean:number;sourceStd:number} {
  assert.equal(a.length,b.length);
  const x0=Math.round(width*.04),x1=Math.round(width*.96),y0=Math.round(height*.04),y1=Math.round(height*.75);
  const g=geometry(format,shotAt(second));
  const reading=g.reading;
  let n=0,sa=0,sb=0,saa=0,sbb=0,sab=0;
  for(let y=y0;y<y1;y++) for(let x=x0;x<x1;x++){
    // The intended large lyric layer can dominate a smooth source close-up.
    // Compare uncovered picture pixels, keeping a generous glyph/glow gutter.
    const nativeX=(x+.5)/width*g.w,nativeY=(y+.5)/height*g.h;
    if(nativeX>=reading.x-80&&nativeX<=reading.x+reading.w+80
      &&nativeY>=reading.y-80&&nativeY<=reading.y+reading.h+80)continue;
    const index=y*width+x,u=a[index]??0,v=b[index]??0;
    n++;sa+=u;sb+=v;saa+=u*u;sbb+=v*v;sab+=u*v;
  }
  assert.ok(n>1000,`Too little uncovered ${format} source area at ${second}s`);
  const varianceA=saa-sa*sa/n,varianceB=sbb-sb*sb/n;
  const denominator=Math.sqrt(Math.max(0,varianceA)*Math.max(0,varianceB));
  return {r:denominator>0?(sab-sa*sb/n)/denominator:0,
    sourceMean:sa/n,sourceStd:Math.sqrt(Math.max(0,varianceA)/n)};
}
function median(values: number[]): number {
  const ordered=[...values].sort((a,b)=>a-b),middle=Math.floor(ordered.length/2);
  return ordered.length%2 ? ordered[middle]??0 : ((ordered[middle-1]??0)+(ordered[middle]??0))/2;
}
function pictureContinuity(format: Format, source: Buffer[], rendered: Buffer[]): Json {
  assert.equal(source.length,135,'Unexpected source one-second sample count');
  assert.equal(rendered.length,135,'Unexpected rendered one-second sample count');
  const width=format==='landscape'?SAMPLE_WIDTH:PORTRAIT_WIDTH;
  const checks: {second:number;r:number}[]=[];
  for(let second=0;second<135;second++){
    const original=source[second] as Buffer,actual=rendered[second] as Buffer;
    const expected=format==='landscape'?original:expectedPortrait(original,second);
    const score=pearson(expected,actual,width,SAMPLE_HEIGHT,format,second);
    if(score.sourceMean<10||score.sourceStd<7) continue; // Native dark/flat source moment.
    checks.push({second,r:Number(score.r.toFixed(4))});
  }
  assert.ok(checks.length>=90,'Too few useful picture-continuity samples');
  const typical=median(checks.map(check=>check.r));
  const low=checks.filter(check=>check.r<.42);
  const consecutive=low.some((item,index)=>index>1 && item.second-(low[index-2]?.second??-100)===2);
  assert.ok(typical>=.67 && low.length<=Math.ceil(checks.length*.18) && !consecutive,
    `Source picture continuity failed (${format}): median ${typical.toFixed(3)}, low ${low.length}, samples ${JSON.stringify(low.slice(0,8))}`);
  return {sampleRateHz:1,testableSamples:checks.length,medianCorrelation:Number(typical.toFixed(4)),
    lowSimilaritySamples:low,method:'Decoded one-second grayscale samples compared with native full-frame source (landscape) or the shot-map 9:16 crop (portrait). Sampled picture pixels exclude the lyric reading box with an 80-pixel gutter and the fixed lower spectrum. Pearson correlation checks source continuity, not overlay parity.'};
}
function verifyVideoMetadata(data: Json, format: Format): Json {
  const video=stream(data,'video'), audio=stream(data,'audio');
  const [width,height]=format==='landscape'?[1920,1080]:[1080,1920];
  assert.equal(video.codec_name,'h264');
  assert.equal(video.width,width);assert.equal(video.height,height);
  assert.equal(video.avg_frame_rate,'60/1');assert.equal(video.r_frame_rate,'60/1');
  assert.equal(video.nb_frames,String(FRAMES));
  assert.equal(video.sample_aspect_ratio,'1:1');
  assert.equal(video.pix_fmt,'yuv420p');
  assert.equal(video.color_primaries,'bt709');assert.equal(video.color_transfer,'bt709');
  assert.equal(video.color_space,'bt709');
  assert.ok(Math.abs(Number(video.start_time))<.001);
  assert.ok(Math.abs(Number(video.duration)-DURATION)<.001);
  assert.equal(audio.codec_name,'aac');assert.equal(audio.sample_rate,'44100');
  assert.equal(audio.channels,2);
  assert.ok(Math.abs(Number(audio.start_time))<.001);
  assert.ok(Math.abs(Number(audio.duration)-SOURCE_DURATION)<.001);
  return {width,height,framesPerSecond:FPS,frameCount:FRAMES,videoDurationSeconds:Number(video.duration),
    audioDurationSeconds:Number(audio.duration),videoCodec:video.codec_name,audioCodec:audio.codec_name,
    pixelFormat:video.pix_fmt,colorPrimaries:video.color_primaries,colorTransfer:video.color_transfer,colorSpace:video.color_space};
}
async function main(): Promise<void> {
  if(process.argv.includes('--help')){
    console.log('Usage: node scripts/verify-final.ts --landscape PATH --portrait PATH [--report PATH]');
    return;
  }
  const files={landscape:option('--landscape'),portrait:option('--portrait')};
  assert.ok(files.landscape&&files.portrait,'Pass both --landscape and --portrait files');
  const report=resolve(option('--report')??resolve(root,'evidence/final-verification.json'));
  assert.ok(existsSync(sourcePath),'Locked source.mp4 is required for final verification');
  assert.equal(await fileHash(sourcePath),sourceSha256,'Original source identity changed');
  const sourceProbe=probe(sourcePath),sourceVideo=stream(sourceProbe,'video');
  assert.equal(sourceVideo.nb_frames,String(SOURCE_FRAMES));
  const sourceAac=hashStream(sourcePath,'copy'),sourcePcm=hashStream(sourcePath,'pcm_s32le');
  assert.equal(sourceAac,sourceAacSha256);assert.equal(sourcePcm,sourcePcmSha256);
  const sourceBlack=strictDecodeAndBlack(sourcePath);
  const sourceSamples=sampledGray(sourcePath,SAMPLE_WIDTH);
  const results: Record<Format,Json>={landscape:{},portrait:{}};
  for(const format of ['landscape','portrait'] as const){
    const file=files[format];assert.ok(file);
    const path=resolve(file);
    assert.ok(existsSync(path),`Missing ${format} film`);
    const metadata=verifyVideoMetadata(probe(path),format);
    const times=frameTimes(path);
    assert.equal(times.length,FRAMES,`Decoded ${format} frame count differs`);
    let maximumTimestampErrorSeconds=0;
    for(let i=0;i<times.length;i++){
      const error=Math.abs((times[i]??NaN)-i/FPS);
      assert.ok(Number.isFinite(error)&&error<.001,`Non-CFR ${format} timestamp at frame ${i}: ${error}`);
      maximumTimestampErrorSeconds=Math.max(maximumTimestampErrorSeconds,error);
    }
    const packetSha256=hashStream(path,'copy'),pcmSha256=hashStream(path,'pcm_s32le');
    assert.equal(packetSha256,sourceAacSha256,`${format} AAC packet bytes differ from original`);
    assert.equal(pcmSha256,sourcePcmSha256,`${format} decoded audio differs from original`);
    const blacks=compareBlack(sourceBlack,strictDecodeAndBlack(path));
    const picture=pictureContinuity(format,sourceSamples,sampledGray(path,format==='landscape'?SAMPLE_WIDTH:PORTRAIT_WIDTH));
    results[format]={file:basename(path),sha256:await fileHash(path),metadata,
      maximumTimestampErrorSeconds,packetSha256,pcmSha256,strictFullDecode:true,
      blackPicture:blacks,sourcePicture:picture};
  }
  const receipt={schema:'lyric-film/final-verification/v1',song:'CPznmfSbAiE',
    revision:'source-integrated-preview-v2',status:'passed',verifiedAt:new Date().toISOString(),
    source:{file:basename(sourcePath),sha256:sourceSha256,aacPacketSha256:sourceAacSha256,
      decodedPcmS32leSha256:sourcePcmSha256,videoFrameCount:SOURCE_FRAMES,
      finalFramePolicy:'Source frame held through the original audio tail'},
    formats:results,
    limits:'Encoded-frame checks do not establish lyric transcription, perceptual timing, visual artistry or complete overlay pixel parity with the browser preview; inspect the final films with sound in both formats.'};
  mkdirSync(dirname(report),{recursive:true});writeFileSync(report,JSON.stringify(receipt,null,2)+'\n');
  console.log(JSON.stringify({status:'passed',report:basename(report),landscape:results.landscape.file,portrait:results.portrait.file}));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
