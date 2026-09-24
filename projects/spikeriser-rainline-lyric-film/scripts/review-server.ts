import {createServer} from 'node:http';
import {createReadStream, existsSync, mkdirSync, statSync, writeFileSync} from 'node:fs';
import {extname, relative, resolve, sep} from 'node:path';

const root = resolve('.');
const port = Number(process.env.REVIEW_PORT ?? 4388);
const mime: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
};

if (!existsSync(resolve(root, 'public/soundtrack.m4a'))) {
  throw new Error('Missing public/soundtrack.m4a. Restore the locked soundtrack before starting the preview.');
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`);
    if (req.method === 'POST' && url.pathname === '/api/review-progress') {
      const chunks: Buffer[] = [];
      let size = 0;
      for await (const chunk of req) {
        const bytes = Buffer.from(chunk);
        size += bytes.byteLength;
        if (size > 1_000_000) throw new Error('Review record too large');
        chunks.push(bytes);
      }
      const value: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid review record');
      mkdirSync(resolve(root, 'evidence'), {recursive: true});
      writeFileSync(resolve(root, 'evidence/local-review-progress.json'), JSON.stringify(value, null, 2) + '\n');
      res.writeHead(200, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'});
      res.end('{"saved":true}');
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405);
      res.end();
      return;
    }

    const route = url.pathname === '/' ? 'review/index.html' : decodeURIComponent(url.pathname.slice(1));
    if (!['review/', 'public/', 'evidence/'].some(prefix => route.startsWith(prefix))) throw new Error('Route denied');
    const path = resolve(root, route);
    if (path !== root && !path.startsWith(root + sep)) throw new Error('Path denied');
    if (relative(root, path).startsWith('..')) throw new Error('Path denied');
    const size = statSync(path).size;
    const range = req.headers.range;
    res.setHeader('Content-Type', mime[extname(path)] ?? 'application/octet-stream');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-store');
    if (range) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range);
      if (!match) throw new Error('Invalid range');
      const start = Number(match[1]);
      const end = Math.min(size - 1, match[2] ? Number(match[2]) : size - 1);
      if (start < 0 || end < start || start >= size) {
        res.writeHead(416);
        res.end();
        return;
      }
      res.writeHead(206, {'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': end - start + 1});
      if (req.method === 'HEAD') res.end(); else createReadStream(path, {start, end}).pipe(res);
    } else {
      res.writeHead(200, {'Content-Length': size});
      if (req.method === 'HEAD') res.end(); else createReadStream(path).pipe(res);
    }
  } catch (error) {
    res.writeHead(404, {'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store'});
    res.end('Unavailable: ' + String(error));
  }
}).listen(port, '127.0.0.1', () => console.log(`Rainline review preview: http://127.0.0.1:${port}/`));
