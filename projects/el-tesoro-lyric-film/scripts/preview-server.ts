import {createReadStream, statSync} from 'node:fs';
import {createServer} from 'node:http';
import {extname, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.env.PORT ?? 4327);
const mime: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.jpg': 'image/jpeg',
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
  if (!(route === '/review/index.html' || route === '/review/client.js' || route === '/src/timeline.json' || route.startsWith('/public/'))) {
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
    const stat = statSync(path);
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
  };
  const range = request.headers.range?.match(/^bytes=(\d*)-(\d*)$/);
  let start = 0;
  let end = Math.max(0, size - 1);
  let status = 200;
  if (range) {
    start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    end = range[1] && range[2] ? Math.min(size - 1, Number(range[2])) : size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) {
      response.writeHead(416, {'Content-Range': `bytes */${size}`}).end();
      return;
    }
    status = 206;
    headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
  }
  headers['Content-Length'] = end - start + 1;
  response.writeHead(status, headers);
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  createReadStream(path, {start, end}).on('error', () => response.destroy()).pipe(response);
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`El Tesoro preview: http://127.0.0.1:${port}/\n`);
});
