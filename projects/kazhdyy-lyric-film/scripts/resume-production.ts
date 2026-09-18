import {spawn} from 'node:child_process';
import {closeSync,existsSync,openSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {assertProductionGate} from './production-contract.ts';

// Recovery changes process lifetime only. The renderer still verifies every
// cached segment against the frozen recipe, frame range and encoded-file hash.
const format=process.argv[2];
if(format!=='landscape'&&format!=='portrait')throw Error('Usage: node scripts/resume-production.ts landscape|portrait');
assertProductionGate();
const directory=resolve('evidence/production');
const journal=resolve(directory,`${format}-recovery.json`);
type Attempt={attempt:number;startedAt:string;status:'running'|'complete'|'interrupted';finishedAt?:string;exitCode?:number|null;reason?:string};
const attempts:Attempt[]=existsSync(journal)?JSON.parse(readFileSync(journal,'utf8')).attempts:[];
for(const entry of attempts)if(entry.status==='running'){
 entry.status='interrupted';entry.finishedAt=new Date().toISOString();entry.reason='Previous supervisor did not record completion';
}
const save=()=>writeFileSync(journal,JSON.stringify({format,attempts},null,2)+'\n');
const pause=(ms:number)=>new Promise<void>(done=>setTimeout(done,ms));
for(let retry=1;retry<=8;retry++){
 assertProductionGate();
 const attempt=attempts.length+1,log=resolve(directory,`${format}-recovery-${attempt}.log`),fd=openSync(log,'w');
 // A distinct process group limits termination to this exact owned attempt.
 const child=spawn(process.execPath,['scripts/production-gate.ts','--production','--format',format],{stdio:['ignore',fd,fd],detached:true});closeSync(fd);
 if(!child.pid)throw Error('Could not start renderer');
 const group=child.pid,entry:Attempt={attempt,startedAt:new Date().toISOString(),status:'running'};attempts.push(entry);save();
 console.log(format,'attempt',attempt,'started');
 let failed=false;
 while(child.exitCode===null&&child.signalCode===null){
  await pause(15000);
  if(/PRODUCTION BLOCKED:|FATAL ERROR:/.test(readFileSync(log,'utf8'))){failed=true;break;}
 }
 if(failed){
  try{process.kill(-group,'SIGKILL');}catch(error){if((error as NodeJS.ErrnoException).code!=='ESRCH')throw error;}
  // Reap the attempt before starting another writer for the same format.
  if(child.exitCode===null&&child.signalCode===null)await new Promise<void>(done=>child.once('close',()=>done()));
 }
 entry.finishedAt=new Date().toISOString();entry.exitCode=child.exitCode;
 const state=JSON.parse(readFileSync(resolve(directory,`${format}-status.json`),'utf8'));
 entry.status=!failed&&child.exitCode===0&&state.phase==='Rendered; verification pending'?'complete':'interrupted';save();
 console.log(format,'attempt',attempt,entry.status);
 if(entry.status==='complete')break;
 if(retry===8)throw Error('Stopped after eight failed attempts; inspect the logs and host state');
 await pause(3000);
}
