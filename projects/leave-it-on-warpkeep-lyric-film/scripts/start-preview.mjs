import {spawn} from 'node:child_process';
import {openSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const url=`http://127.0.0.1:${Number(process.env.PORT||4392)}/`;
async function running(){try{const r=await fetch(url,{signal:AbortSignal.timeout(1000)});return r.ok&&(await r.text()).includes('<title>Leave It On · Warpkeep</title>')}catch{return false}}
if(await running())console.log(`Preview already running: ${url}`);
else{
 mkdirSync(resolve(root,'output'),{recursive:true});
 const log=openSync(resolve(root,'output/preview-server.log'),'a');
 const child=spawn(process.execPath,['scripts/preview-server.mjs'],{cwd:root,detached:true,stdio:['ignore',log,log],env:process.env});child.unref();
 let ready=false;for(let i=0;i<10;i++){await new Promise(r=>setTimeout(r,300));if(await running()){ready=true;break}}
 if(!ready)throw Error('Preview did not start; check output/preview-server.log.');
 console.log(`Preview running independently (PID ${child.pid}): ${url}`);
}
