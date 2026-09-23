import {createReadStream, statSync} from 'node:fs';
import {createServer} from 'node:http';
import {extname, resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.mp4':'video/mp4','.png':'image/png','.jpg':'image/jpeg'};
const port=Number(process.env.PORT||4325);
const server=createServer((req,res)=>{
  const pathname=new URL(req.url||'/',`http://${req.headers.host||'127.0.0.1'}`).pathname;
  const rel=decodeURIComponent(pathname==='/'?'/review/index.html':pathname);
  const path=resolve(root,'.'+rel);
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end('Forbidden');return}
  let stat;try{stat=statSync(path)}catch{res.writeHead(404);res.end('Not found');return}
  if(!stat.isFile()){res.writeHead(404);res.end('Not found');return}
  const type=mime[extname(path)]||'application/octet-stream';
  res.setHeader('Content-Type',type);res.setHeader('Accept-Ranges','bytes');res.setHeader('Cache-Control','no-store');
  const range=req.headers.range;
  if(range){const m=/bytes=(\d*)-(\d*)/.exec(range);if(!m){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return}let start=m[1]?Number(m[1]):0,end=m[2]?Number(m[2]):stat.size-1;if(!m[1]&&m[2]){const suffix=Number(m[2]);start=Math.max(0,stat.size-suffix);end=stat.size-1}if(start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`});res.end();return}end=Math.min(end,stat.size-1);res.writeHead(206,{'Content-Length':end-start+1,'Content-Range':`bytes ${start}-${end}/${stat.size}`});if(req.method==='HEAD'){res.end();return}createReadStream(path,{start,end}).pipe(res);return}
  res.writeHead(200,{'Content-Length':stat.size});if(req.method==='HEAD'){res.end();return}createReadStream(path).pipe(res);
});
server.listen(port,'127.0.0.1',()=>console.log(`Preview server ready at http://127.0.0.1:${port}/`));
server.on('error',e=>{console.error(e);process.exitCode=1});
