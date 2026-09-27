import {createReadStream,statSync,writeFileSync,mkdirSync} from 'node:fs';
import {createServer} from 'node:http';
import {extname,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.ttf':'font/ttf','.glb':'model/gltf-binary','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.m4a':'audio/mp4','.webm':'audio/webm','.svg':'image/svg+xml'};
const port=Number(process.env.PORT||4392);
createServer((req,res)=>{
  if(req.method==='POST'&&req.url==='/__review/still'){
    let body='',size=0;req.on('data',chunk=>{size+=chunk.length;if(size>16*1024*1024){res.writeHead(413).end();req.destroy();return}body+=chunk});req.on('end',()=>{try{const {name,png}=JSON.parse(body);if(!/^preview-(portrait|landscape)-[\d.]+\.png$/.test(name)||typeof png!=='string'||!png.startsWith('data:image/png;base64,'))throw Error('Invalid still');const dir=resolve(root,'evidence');mkdirSync(dir,{recursive:true});writeFileSync(resolve(dir,name),Buffer.from(png.split(',')[1],'base64'));res.writeHead(200,{'Content-Type':'application/json'}).end(JSON.stringify({path:'evidence/'+name}));}catch{res.writeHead(400).end('Invalid still request')}});return;
  }
  let path;try {path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname==='/'?'/review/index.html':new URL(req.url,'http://localhost').pathname))}catch{res.writeHead(400).end();return}
  if(!path.startsWith(root+sep)){res.writeHead(403).end();return}
  let stat;try{stat=statSync(path);if(!stat.isFile())throw Error()}catch{res.writeHead(404).end('Missing local preview asset: '+req.url);return}
  res.setHeader('Content-Type',types[extname(path)]||'application/octet-stream');
  res.setHeader('Cache-Control','no-store');res.setHeader('Accept-Ranges','bytes');
  if(req.headers.range){const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);let start=m?.[1]?Number(m[1]):0,end=m?.[2]?Number(m[2]):stat.size-1;if(m&&!m[1]&&m[2]){start=Math.max(0,stat.size-Number(m[2]));end=stat.size-1}end=Math.min(end,stat.size-1);if(!m||start>end||start>=stat.size){res.writeHead(416,{'Content-Range':`bytes */${stat.size}`}).end();return}res.writeHead(206,{'Content-Length':end-start+1,'Content-Range':`bytes ${start}-${end}/${stat.size}`});if(req.method==='HEAD')res.end();else createReadStream(path,{start,end}).pipe(res);return}
  res.writeHead(200,{'Content-Length':stat.size});if(req.method==='HEAD')res.end();else createReadStream(path).pipe(res);
}).listen(port,'127.0.0.1',()=>console.log(`Leave It On — http://127.0.0.1:${port}/`));
