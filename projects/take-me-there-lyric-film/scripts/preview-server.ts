import {createReadStream, realpathSync, statSync} from 'node:fs';
import {createServer} from 'node:http';
import {extname, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.env.PORT ?? 4328);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535');
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
  process.stdout.write(`TAKE ME THERE preview: http://127.0.0.1:${port}/\n`);
});
