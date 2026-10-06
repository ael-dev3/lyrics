import {createReadStream, readFileSync, realpathSync, statSync} from 'node:fs';
import {createServer} from 'node:http';
import {createHash} from 'node:crypto';
import {extname, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateTimeline} from '../src/model.ts';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.env.PORT ?? 4334);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535');
const sourcePath=resolve(root,'public/source.mp4');
const sourceIdentity=JSON.parse(readFileSync(resolve(root,'source/recording.json'),'utf8'));
const sourceHash=createHash('sha256').update(readFileSync(sourcePath)).digest('hex');
if(sourceHash!==sourceIdentity.sourceSha256 || ['public/timeline.json','public/audio-features.json'].some(path=>JSON.parse(readFileSync(resolve(root,path),'utf8')).sourceSha256!==sourceHash))throw Error('The complete preview requires its exact original recording and matching timing/features.');
const sourceStamp=statSync(sourcePath);
const probe=JSON.parse(readFileSync(resolve(root,'source/probe.json'),'utf8'));
const picture=probe.streams.find((stream:{codec_type:string})=>stream.codec_type==='video');
const audio=probe.streams.find((stream:{codec_type:string})=>stream.codec_type==='audio');
if(!picture || !audio)throw Error('The complete preview requires both source picture and audio streams.');
const [fpsNumerator,fpsDenominator]=String(picture.avg_frame_rate).split('/').map(Number);
const sampleRate=Number(audio.sample_rate),width=Number(picture.width),height=Number(picture.height);
const timeline=JSON.parse(readFileSync(resolve(root,'public/timeline.json'),'utf8'));
validateTimeline(timeline);
if(!fpsNumerator || !fpsDenominator || !Number.isSafeInteger(sampleRate) || sampleRate<=0 ||
   !width || !height || sourceIdentity.sampleRate!==sampleRate || timeline.sampleRate!==sampleRate)
  throw Error('Recording, timeline and probed source clocks must match.');
const declaredPicture=sourceIdentity.picture;
if(!declaredPicture || declaredPicture.width!==width || declaredPicture.height!==height ||
   declaredPicture.frameRate?.numerator!==fpsNumerator || declaredPicture.frameRate?.denominator!==fpsDenominator ||
   Math.abs(timeline.sourceDuration-Number(probe.format.duration))>1/sampleRate)
  throw Error('Frozen picture dimensions, rational cadence and full audio extent must match the complete preview.');
const featureIdentity=JSON.parse(readFileSync(resolve(root,'public/audio-features.json'),'utf8'));
if(featureIdentity.analysis?.frameRate?.numerator!==fpsNumerator || featureIdentity.analysis?.frameRate?.denominator!==fpsDenominator)
  throw Error('Measured response must use the probed source cadence.');
const previewIdentity={schemaVersion:1,sourceSha256:sourceHash,sampleRate,width,height,
  frameRate:{numerator:fpsNumerator,denominator:fpsDenominator},
  pictureDuration:Number(picture.duration),sourceDuration:Number(probe.format.duration)};
const identityBytes=Buffer.from(JSON.stringify(previewIdentity));
const mime: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.m4a': 'audio/mp4',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.bin': 'application/octet-stream',
  '.ttf': 'font/ttf',
};

const server = createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405).end();
    return;
  }
  let route: string;
  try {
    route = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end();
    return;
  }
  if(route==='/preview-identity.json') {
    response.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Content-Length':identityBytes.length,'X-Content-Type-Options':'nosniff'});
    response.end(request.method==='HEAD'?undefined:identityBytes);return;
  }
  if (route === '/') route = '/review/index.html';
  if (!(route === '/review/index.html' || route === '/review/client.js' || route.startsWith('/public/'))) {
    response.writeHead(404).end('File unavailable');
    return;
  }
  const path = resolve(root, `.${route}`);
  if (!path.startsWith(root + sep)) {
    response.writeHead(403).end();
    return;
  }
  let size: number;
  try {
    const realPath = realpathSync(path);
    const allowedRealPath = realPath === resolve(root, 'review/index.html') || realPath === resolve(root, 'review/client.js') || realPath.startsWith(resolve(root, 'public') + sep);
    if (!allowedRealPath) throw Error('unavailable path');
    const stat = statSync(realPath);
    if (!stat.isFile()) throw Error('not a file');
    if(realPath===sourcePath && (stat.size!==sourceStamp.size || stat.mtimeMs!==sourceStamp.mtimeMs || stat.ino!==sourceStamp.ino))throw Error('source changed; restart after identity verification');
    size = stat.size;
  } catch {
    response.writeHead(404).end('File unavailable');
    return;
  }
  const headers: Record<string, string | number> = {
    'Content-Type': mime[extname(path)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
    'Accept-Ranges': 'bytes',
    'X-Content-Type-Options': 'nosniff',
  };
  if(path===sourcePath)headers['X-Source-SHA256']=sourceHash;
  const range = request.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
  if (request.headers.range && (!range || (!range[1] && !range[2]))) {
    response.writeHead(416, {'Content-Range': `bytes */${size}`}).end();
    return;
  }
  let start = 0;
  let end = Math.max(0, size - 1);
  let status = 200;
  if (range) {
    start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    end = range[1] && range[2] ? Math.min(size - 1, Number(range[2])) : size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size || (!range[1] && Number(range[2]) === 0)) {
      response.writeHead(416, {'Content-Range': `bytes */${size}`}).end();
      return;
    }
    status = 206;
    headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
  }
  headers['Content-Length'] = size === 0 ? 0 : end - start + 1;
  response.writeHead(status, headers);
  if (request.method === 'HEAD' || size === 0) {
    response.end();
    return;
  }
  const stream = createReadStream(path, {start, end});
  response.on('close', () => stream.destroy());
  stream.on('error', () => response.destroy()).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`Phantom Liberty preview: http://127.0.0.1:${port}/\n`);
});
