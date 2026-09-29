import {createReadStream, realpathSync, statSync} from 'node:fs';
import {createServer} from 'node:http';
import {extname, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

// Local review server (127.0.0.1 only). Serves the page, the compiled client,
// public/ (source video with byte ranges, data, fonts) and exactly one file
// from source/: the user's local lyric text, which never leaves this machine.
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.env.PORT ?? 4331);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('PORT must be an integer from 1 to 65535');
const mime: Record<string, string> = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.mp4': 'video/mp4', '.bin': 'application/octet-stream', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg'};
const allowed = (route: string): boolean => route === '/review/index.html' || route === '/review/client.js' || route === '/source/lyrics.local.txt' || route.startsWith('/public/');

createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {response.writeHead(405).end(); return;}
  let route: string;
  try {route = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);} catch {response.writeHead(400).end(); return;}
  if (route === '/') route = '/review/index.html';
  if (!allowed(route)) {response.writeHead(404).end('Unavailable'); return;}
  const path = resolve(root, `.${route}`);
  let size: number;
  try {
    const real = realpathSync(path);
    if (!(real.startsWith(root + sep)) || !allowed('/' + real.slice(root.length + 1).split(sep).join('/'))) throw Error('outside');
    const stat = statSync(real); if (!stat.isFile()) throw Error('not a file'); size = stat.size;
  } catch {response.writeHead(404).end('Unavailable'); return;}
  const headers: Record<string, string | number> = {'Content-Type': mime[extname(path)] ?? 'application/octet-stream', 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes', 'X-Content-Type-Options': 'nosniff'};
  const range = request.headers.range?.match(/^bytes=(\d*)-(\d*)$/u);
  if (request.headers.range && (!range || (!range[1] && !range[2]))) {response.writeHead(416, {'Content-Range': `bytes */${size}`}).end(); return;}
  let start = 0, end = Math.max(0, size - 1), code = 200;
  if (range) {
    start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    end = range[1] && range[2] ? Math.min(size - 1, Number(range[2])) : size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) {response.writeHead(416, {'Content-Range': `bytes */${size}`}).end(); return;}
    code = 206; headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
  }
  headers['Content-Length'] = size === 0 ? 0 : end - start + 1;
  response.writeHead(code, headers);
  if (request.method === 'HEAD' || size === 0) {response.end(); return;}
  const stream = createReadStream(path, {start, end});
  response.on('close', () => stream.destroy());
  stream.on('error', () => response.destroy()).pipe(response);
}).listen(port, '127.0.0.1', () => process.stdout.write(`Let You Down review preview: http://127.0.0.1:${port}/\n`));
