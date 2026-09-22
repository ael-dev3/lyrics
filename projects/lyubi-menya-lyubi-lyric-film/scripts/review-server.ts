import {createServer} from 'node:http';
import {createReadStream,statSync,realpathSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,extname,sep} from 'node:path';

const root=realpathSync(resolve('.'));
const port=Number(process.env.REVIEW_PORT??4324);
if(!Number.isInteger(port)||port<1024||port>65535)throw Error('Invalid review port');
const mime:Record<string,string>={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.mp4':'video/mp4','.m4a':'audio/mp4','.ttf':'font/ttf','.woff2':'font/woff2','.md':'text/plain; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg'};

createServer(async(req,res)=>{
 try{
  const url=new URL(req.url??'/',`http://127.0.0.1:${port}`);
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method==='POST'&&url.pathname==='/api/review-progress'){
   const origin=req.headers.origin;
   if(origin&&origin!==`http://127.0.0.1:${port}`&&origin!==`http://localhost:${port}`){res.writeHead(403);res.end('Local review only');return;}
   const chunks:Buffer[]=[];let size=0;
   for await(const part of req){const b=Buffer.from(part);size+=b.length;if(size>1_000_000){res.writeHead(413);res.end('Review notes too large');return;}chunks.push(b);}
   const data:unknown=JSON.parse(Buffer.concat(chunks).toString());
   if(!data||typeof data!=='object'||Array.isArray(data)||!('song'in data)||data.song!=='DBGCHjBSNzo'||!('status'in data)||data.status!=='listener-progress-only')throw Error('Invalid progress');
   mkdirSync('evidence',{recursive:true});
   writeFileSync('evidence/listener-review-progress.json',JSON.stringify(data,null,2)+'\n');
   res.writeHead(200,{'Content-Type':'application/json'});res.end('{"saved":true}');return;
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
  const route=url.pathname==='/'?'review/index.html':decodeURIComponent(url.pathname.slice(1));
  if(!['review/','public/','evidence/'].some(p=>route.startsWith(p)))throw Error('Route denied');
  const path=realpathSync(resolve(root,route));
  if(!path.startsWith(root+sep))throw Error('Path denied');
  const file=statSync(path);if(!file.isFile())throw Error('Not a file');
  const size=file.size;let start=0,end=size-1,status=200;
  const range=req.headers.range;
  res.setHeader('Content-Type',mime[extname(path)]??'application/octet-stream');
  res.setHeader('Accept-Ranges','bytes');
  if(range){
   const match=/^bytes=(\d+)-(\d*)$/.exec(range);
   if(!match){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}
   start=Number(match[1]);end=Math.min(size-1,match[2]?Number(match[2]):size-1);
   if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||end<start||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}
   status=206;res.setHeader('Content-Range',`bytes ${start}-${end}/${size}`);
  }
  res.writeHead(status,{'Content-Length':Math.max(0,end-start+1)});
  if(req.method==='HEAD'||size===0){res.end();return;}
  const stream=createReadStream(path,{start,end});stream.on('error',()=>res.destroy());stream.pipe(res);
 }catch{if(!res.headersSent)res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Preview resource unavailable. Restore the preview or restart its server.');}
}).listen(port,'127.0.0.1',()=>console.log(`Lyubi menya review: http://127.0.0.1:${port}`));
