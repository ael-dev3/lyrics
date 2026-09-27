import {createHash, randomBytes} from 'node:crypto';
import {createServer} from 'node:http';
import {spawn, spawnSync} from 'node:child_process';
import {once} from 'node:events';
import {createReadStream, existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync} from 'node:fs';
import {extname, join, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildIdentity, LOCKED_SOURCE_SHA256, PREVIEW_REVISION, PROJECT_ID} from './render-gate.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const source = join(root, 'source/Leave It On.m4a');
const fps = 60;
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.ttf':'font/ttf','.glb':'model/gltf-binary','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};
const args = process.argv.slice(2);
const has = flag => args.includes(flag);
const option = (flag, fallback) => {const at = args.indexOf(flag); return at < 0 ? fallback : args[at + 1];};
const mode = ['--proof-still', '--diagnostic', '--production'].filter(has);
if (mode.length !== 1) throw Error('Select exactly one of --proof-still, --diagnostic, --production.');
if (args.some((arg, index) => arg.startsWith('--') && !['--proof-still','--diagnostic','--production','--format','--at','--seconds'].includes(arg))) throw Error('Unknown render option.');
const format = option('--format', 'landscape');
if (!['landscape', 'portrait'].includes(format)) throw Error('Use --format landscape or --format portrait.');
const dimensions = format === 'portrait' ? [1080, 1920] : [1920, 1080];
const [width, height] = dimensions;
const production = mode[0] === '--production';
const still = mode[0] === '--proof-still';
const atSeconds = Number(option('--at', '119.6'));
const seconds = Number(option('--seconds', '2'));
if ((!production && (!Number.isFinite(atSeconds) || atSeconds < 0)) ||
    (!production && !still && (!Number.isFinite(seconds) || seconds <= 0 || seconds > 15))) throw Error('Invalid diagnostic range.');

const hash = data => createHash('sha256').update(data).digest('hex');
const shaFile = path => hash(readFileSync(path));
const readJson = path => JSON.parse(readFileSync(path, 'utf8'));
const probe = path => {
  const result = spawnSync('ffprobe', ['-v','error','-show_entries','format=duration:stream=index,codec_name,codec_type,width,height,avg_frame_rate,sample_aspect_ratio,sample_rate,channels,start_time,duration,pix_fmt,color_range,color_primaries,color_transfer,color_space','-of','json',path], {encoding:'utf8',maxBuffer:8*1024*1024});
  if (result.status !== 0) throw Error(`ffprobe failed for ${path}: ${result.stderr}`);
  return JSON.parse(result.stdout);
};
const runFfmpeg = command => {
  const result = spawnSync('ffmpeg', ['-hide_banner','-v','warning','-y',...command], {encoding:'utf8',maxBuffer:16*1024*1024});
  if (result.status !== 0) throw Error(`ffmpeg failed (${result.status}): ${result.stderr.slice(-5000)}`);
};
const packetDigest = path => {
  const result = spawnSync('ffprobe', ['-v','error','-select_streams','a:0','-show_packets','-show_data_hash','sha256','-show_entries','packet=data_hash','-of','csv=p=0',path], {encoding:'utf8',maxBuffer:16*1024*1024});
  if (result.status !== 0) throw Error(`Could not inspect audio packets in ${path}: ${result.stderr}`);
  const packets = result.stdout.trim().split('\n').filter(Boolean);
  return {packets: packets.length, dataHashListSha256: hash(packets.join('\n'))};
};

const sourceHash = shaFile(source);
if (sourceHash !== LOCKED_SOURCE_SHA256) throw Error('Original recording differs from the approved source hash.');
const sourceInfo = probe(source);
const duration = Number(sourceInfo.format.duration);
if (!(duration > 273.5 && duration < 273.6) || sourceInfo.streams.find(stream => stream.codec_type === 'audio')?.codec_name !== 'opus') throw Error('Unexpected original audio duration or codec.');
const totalFrames = Math.ceil(duration * fps);
const first = production ? 0 : Math.round(atSeconds * fps);
const count = production ? totalFrames : still ? 1 : Math.round(seconds * fps);
if (first < 0 || first + count > totalFrames) throw Error('Requested diagnostic extends beyond the song.');

const rendererInputs = ['review/render.html','scripts/render-production.mjs'];
const rendererDigest = hash(rendererInputs.map(path => `${path}\0${shaFile(join(root,path))}`).join('\n'));
const current = await buildIdentity(root);
if (current.files['source/Leave It On.m4a']?.sha256 !== sourceHash) throw Error('Source hash changed during identity check.');

if (production) {
  const frozen = readJson(join(root, 'review/preview-identity.json'));
  if (frozen.projectId !== PROJECT_ID || frozen.previewRevision !== PREVIEW_REVISION || frozen.inputDigest !== current.inputDigest || JSON.stringify(frozen.files) !== JSON.stringify(current.files)) throw Error('Frozen reviewed preview identity is absent or stale.');
  const accepted = readJson(join(root, 'review/owner-acceptance.json'));
  if (accepted.projectId !== PROJECT_ID || accepted.previewRevision !== PREVIEW_REVISION || accepted.inputDigest !== current.inputDigest || accepted.accepted !== true || accepted.scope !== 'both-aspect-production-render' || !accepted.authorizationId || !Number.isFinite(Date.parse(accepted.authorizedAt))) throw Error('Current preview owner acceptance/production authorization is absent or stale.');
  const parity = readJson(join(root, 'review/render-parity.json'));
  if (parity.inputDigest !== current.inputDigest || parity.rendererDigest !== rendererDigest || parity.approved !== true || !['landscape','portrait'].every(item => parity.formats?.includes(item)) || !parity.evidence) throw Error('Both-format renderer parity evidence is absent or stale.');
}

const out = join(root, 'output');
mkdirSync(out, {recursive:true});
const stem = `Leave-It-On-Warpkeep-${format === 'portrait' ? 'TikTok-1080x1920' : 'YouTube-1920x1080'}-60fps`;
const finalPath = join(out, `${stem}.mp4`);
const videoPath = join(out, `${stem}.video.mp4`);
const archivePath = join(out, `${stem}.source-opus.mkv`);
const proofPath = join(out, `proof-${format}-${(first/fps).toFixed(3)}.${still ? 'png' : 'mp4'}`);
const capturePath = still ? proofPath : production ? videoPath : proofPath;
const partialCapture = still ? capturePath : capturePath.replace(/\.mp4$/, '.partial.mp4');
const token = randomBytes(16).toString('hex');
let encoder = null, encoderClosed = null, expected = first, pageReady = false, pageDone = false, lastProgress = Date.now(), browserError = null;
let complete, fail;
const completed = new Promise((resolveCompletion, rejectCompletion) => {complete = resolveCompletion; fail = rejectCompletion;});
const maxFrameBytes = 32 * 1024 * 1024;
const started = Date.now();

function startEncoder() {
  if (still) return;
  const command = ['-hide_banner','-v','warning','-y','-f','image2pipe','-framerate',String(fps),'-c:v','png','-i','pipe:0','-an','-vf','setsar=1','-c:v','libx264','-preset','medium','-crf','17','-threads','6','-pix_fmt','yuv420p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-color_range','tv','-x264-params','colorprim=bt709:transfer=bt709:colormatrix=bt709','-video_track_timescale','60000','-frames:v',String(count),'-movflags','+faststart',partialCapture];
  encoder = spawn('ffmpeg', command, {cwd:root,stdio:['pipe','ignore','pipe']});
  let tail = '';
  encoder.stderr.on('data', bytes => {tail = (tail + bytes.toString()).slice(-5000);});
  encoderClosed = new Promise((resolveClosed, rejectClosed) => {
    encoder.on('error', rejectClosed);
    encoder.on('close', code => code === 0 ? resolveClosed() : rejectClosed(Error(`Video encoder exited ${code}: ${tail}`)));
  });
  encoder.stdin.on('error', error => {browserError = error; fail(error);});
}

function staticFile(req, res, pathname) {
  const path = resolve(root, '.' + (pathname === '/' ? '/review/render.html' : pathname));
  if (!path.startsWith(root + sep)) {res.writeHead(403).end(); return;}
  let stat;
  try {stat = statSync(path); if (!stat.isFile()) throw Error();}
  catch {res.writeHead(404).end('Missing render input'); return;}
  res.writeHead(200, {'Content-Type':mime[extname(path)] || 'application/octet-stream','Content-Length':stat.size,'Cache-Control':'no-store'});
  if (req.method === 'HEAD') res.end(); else createReadStream(path).pipe(res);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1');
  if (req.method === 'GET' || req.method === 'HEAD') {staticFile(req, res, decodeURIComponent(url.pathname)); return;}
  if (req.method !== 'POST' || url.searchParams.get('token') !== token || !url.pathname.startsWith('/__production/')) {res.writeHead(403).end(); return;}
  const route = url.pathname.slice('/__production/'.length);
  const chunks = [];
  let bytes = 0;
  try {
    for await (const chunk of req) {
      bytes += chunk.length;
      if (bytes > maxFrameBytes) throw Error('Oversized render frame');
      chunks.push(chunk);
    }
    const body = Buffer.concat(chunks);
    if (route === 'error') {
      browserError = Error(`Browser renderer: ${body.toString().slice(0,5000)}`);
      fail(browserError);
      res.writeHead(200).end();
      return;
    }
    if (route === 'ready') {
      if (pageReady) throw Error('Duplicate render ready');
      pageReady = true;
      startEncoder();
      lastProgress = Date.now();
      console.log(`Scene ready: ${format} ${width}x${height}; frames ${first}..${first+count-1}`);
      res.writeHead(200).end();
      return;
    }
    if (route.startsWith('frame/')) {
      const index = Number(route.slice(6));
      if (!pageReady || pageDone || index !== expected || body.subarray(0,8).toString('hex') !== '89504e470d0a1a0a') throw Error(`Invalid or out-of-order PNG frame ${index}; expected ${expected}`);
      if (still) writeFileSync(partialCapture, body);
      else if (!encoder.stdin.write(body)) await once(encoder.stdin, 'drain');
      expected++;
      lastProgress = Date.now();
      if ((expected-first)%300===0 || expected===first+count) console.log(`${format}: ${expected-first}/${count} frames, ${(Date.now()-started)/1000|0}s elapsed`);
      res.writeHead(200).end();
      return;
    }
    if (route === 'done') {
      if (!pageReady || expected !== first+count || pageDone) throw Error(`Incomplete render: ${expected-first}/${count}`);
      pageDone = true;
      if (encoder) encoder.stdin.end();
      complete();
      res.writeHead(200).end();
      return;
    }
    throw Error('Unknown render route');
  } catch (error) {
    browserError = error;
    fail(error);
    res.writeHead(400).end(error.message);
  }
});

await new Promise((resolveListen, rejectListen) => {server.once('error', rejectListen); server.listen(0,'127.0.0.1',resolveListen);});
const port = server.address().port;
const url = `http://127.0.0.1:${port}/review/render.html?format=${format}&first=${first}&count=${count}&fps=${fps}&token=${token}`;
const chromePath = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!existsSync(chromePath)) throw Error(`Chrome executable is missing: ${chromePath}`);
const profile = join(out, `.chrome-render-${process.pid}-${format}`);
const chrome = spawn(chromePath, ['--headless=new','--no-first-run','--no-default-browser-check','--disable-extensions','--disable-background-networking','--disable-popup-blocking','--enable-webgl','--enable-unsafe-swiftshader',`--user-data-dir=${profile}`,'--window-size=1920,1080',url], {cwd:root,stdio:['ignore','ignore','pipe']});
let chromeTail = '';
chrome.stderr.on('data', bytes => {chromeTail = (chromeTail + bytes.toString()).slice(-5000);});
chrome.on('error', error => fail(error));
chrome.on('close', code => {if (!pageDone) fail(Error(`Chrome exited ${code}: ${chromeTail}`));});
const watchdog = setInterval(() => {if (Date.now()-lastProgress > 180000) fail(Error(`Renderer stalled at frame ${expected}: ${chromeTail}`));}, 5000);
try {
  await completed;
  if (encoderClosed) await encoderClosed;
  if (!still) renameSync(partialCapture, capturePath);
} finally {
  clearInterval(watchdog);
  chrome.kill('SIGTERM');
  server.close();
}
if (browserError) throw browserError;

if (production) {
  const partialMp4 = finalPath.replace(/\.mp4$/, '.partial.mp4');
  const partialArchive = archivePath.replace(/\.mkv$/, '.partial.mkv');
  runFfmpeg(['-i',videoPath,'-i',source,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','320k','-ar','48000','-ac','2','-movflags','+faststart','-metadata:s:a:0','language=eng',partialMp4]);
  renameSync(partialMp4, finalPath);
  runFfmpeg(['-i',videoPath,'-i',source,'-map','0:v:0','-map','1:a:0','-c','copy',partialArchive]);
  renameSync(partialArchive, archivePath);
  const srcPackets = packetDigest(source), archivePackets = packetDigest(archivePath);
  if (JSON.stringify(srcPackets) !== JSON.stringify(archivePackets)) throw Error('Archival Opus packet identity check failed.');
}

const videoInfo = probe(production ? finalPath : capturePath);
if (!still) {
  const video = videoInfo.streams.find(stream => stream.codec_type === 'video');
  if (video?.width !== width || video?.height !== height || video.codec_name !== 'h264' || video.avg_frame_rate !== '60/1' || video.sample_aspect_ratio !== '1:1' || video.pix_fmt !== 'yuv420p' || video.color_range !== 'tv' || video.color_primaries !== 'bt709' || video.color_transfer !== 'bt709' || video.color_space !== 'bt709') throw Error('Rendered dimensions, codec, cadence, square pixels or BT.709 color metadata failed verification.');
  if (production && videoInfo.streams.find(stream => stream.codec_type === 'audio')?.codec_name !== 'aac') throw Error('Posting MP4 does not contain AAC audio.');
}
const receipt = {
  projectId:PROJECT_ID, previewRevision:PREVIEW_REVISION, inputDigest:current.inputDigest, rendererDigest,
  mode:mode[0].slice(2), format, width, height, fps, firstFrame:first, frames:count,
  sourceTimePolicy:'Frame n is rendered from approved scene at n/60 seconds; video frame count is ceil(original container duration × 60).',
  sourceAudio:{sha256:sourceHash,codec:'opus',containerDuration:duration},
  capture:{path:capturePath,sha256:shaFile(capturePath),bytes:statSync(capturePath).size},
  postingMp4:production?{path:finalPath,sha256:shaFile(finalPath),bytes:statSync(finalPath).size,audioCodec:'aac 320k'}:null,
  sourceOpusArchive:production?{path:archivePath,sha256:shaFile(archivePath),bytes:statSync(archivePath).size,audioPackets:packetDigest(archivePath)}:null,
  durationSeconds:Number(videoInfo.format.duration),elapsedSeconds:Math.round((Date.now()-started)/1000),
  verified:{dimensionsAndCodec:!still,originalOpusPackets:production,fullDecodedVideo:false,visualParity:production}
};
const receiptPath = production ? finalPath+'.json' : proofPath+'.json';
writeFileSync(receiptPath, JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({receipt:receiptPath,format,frames:count,elapsedSeconds:receipt.elapsedSeconds,postingMp4:receipt.postingMp4?.path||null}));
