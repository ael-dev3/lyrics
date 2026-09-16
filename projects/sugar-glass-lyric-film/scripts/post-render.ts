import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
const format=process.argv[2];if(format!=='landscape'&&format!=='portrait')throw Error('Expected format');
const video=`output/Sugar-Glass-${format}-${format==='landscape'?'1920x1080':'1080x1920'}-60fps.mp4`;
const run=(script:string,args:string[])=>new Promise<void>((resolve,reject)=>{const p=spawn('node',[script,...args],{stdio:'inherit'});p.on('error',reject);p.on('close',c=>c===0?resolve():reject(Error(script+' exited '+c)));});
const capture=`evidence/production/${format}-capture.json`,deadline=Date.now()+3*60*60*1000;
while(!existsSync(capture)){if(Date.now()>deadline)throw Error('No complete capture within three hours');await new Promise(resolve=>setTimeout(resolve,10000));}
console.log('Capture/encode finished; starting final-file verification:',format);
await run('scripts/verify-production.ts',[video,format]);
await run('scripts/audit-decoded-focus.ts',[video,format]);
await run('scripts/verify-reference-segments.ts',[format]);
await run('scripts/extract-delivery-proofs.ts',[format]);
writeFileSync(`evidence/post-render-${format}.json`,JSON.stringify({status:'automated checks passed; selected final pictures await visual inspection',format,capture:JSON.parse(readFileSync(capture,'utf8')),verification:JSON.parse(readFileSync(`evidence/${video.split('/').at(-1)}.verification.json`,'utf8'))},null,2)+'\n');
console.log('Post-render automated QA complete',format);
