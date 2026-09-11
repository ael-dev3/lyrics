import {spawn,type ChildProcess} from 'node:child_process';
import {openSync,closeSync,writeFileSync} from 'node:fs';
const children=new Set<ChildProcess>(),grouped=process.platform!=='win32';
const stop=()=>{for(const child of children){if(!child.pid)continue;try{if(grouped)process.kill(-child.pid,'SIGINT');else child.kill('SIGINT');}catch{}}};
process.once('SIGINT',stop);process.once('SIGTERM',stop);
const run=(cmd:string,args:string[],log:string)=>new Promise<void>((resolve,reject)=>{
 const fd=openSync(log,'w'),child=spawn(cmd,args,{stdio:['ignore',fd,fd],detached:grouped});closeSync(fd);children.add(child);
 child.once('error',error=>{children.delete(child);stop();reject(error);});
 child.once('exit',code=>{children.delete(child);if(code===0)resolve();else{stop();reject(Error(`${cmd} exited ${code}; see ${log}`));}});
});
const together=async(jobs:Promise<void>[])=>{const results=await Promise.allSettled(jobs);const failed=results.find(r=>r.status==='rejected');if(failed?.status==='rejected')throw failed.reason;};
await together(['youtube','tiktok'].flatMap(kind=>[1,2].map(part=>run(process.execPath,['scripts/render.ts',`--part=${part}`,...(kind==='tiktok'?['--portrait']:[])],`evidence/${kind}-part-${part}.log`))));
for(const kind of ['youtube','tiktok']){
 writeFileSync(`evidence/${kind}-concat.txt`,`file '${kind}-part-1.mkv'\nfile '${kind}-part-2.mkv'\n`);
 await run('ffmpeg',['-y','-v','warning','-f','concat','-safe','0','-i',`evidence/${kind}-concat.txt`,'-map','0:v','-c','copy',`evidence/${kind}-master-lossless.mkv`],`evidence/${kind}-concat.log`);
}
await together(['youtube','tiktok'].map(kind=>run(process.execPath,['scripts/encode.ts',...(kind==='tiktok'?['--portrait']:[])],`evidence/${kind}-encode.log`)));
console.log('Both lossless renders and delivery encodes completed.');
