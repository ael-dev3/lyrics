import {spawn} from 'node:child_process';
import {readFileSync,existsSync,createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {assertProductionGate,inputHashes} from './production-contract.ts';
import {verifyCache} from './raster-contract.ts';
const args=process.argv.slice(2),production=args.includes('--production');
const run=()=>new Promise<void>((ok,fail)=>{const child=spawn(process.execPath,['--expose-gc','--import','./scripts/memory-guard.ts','scripts/production-gate.ts',...args,'--one-segment'],{stdio:'inherit'});child.on('error',fail);child.on('close',code=>code===0?ok():fail(Error('Isolated render worker exited '+code)));});
if(!production){await run();}else{
 assertProductionGate();const format=args[args.indexOf('--format')+1];if(format!=='landscape'&&format!=='portrait')throw Error('Explicit format required');
 const cache=verifyCache(format),fingerprint=createHash('sha256').update(JSON.stringify(inputHashes())).update(JSON.stringify(cache)).update('lossless-Chromium-layers-RGBA-2x-Lanczos-HEVC17-v1').digest('hex'),capture=`evidence/production/${format}-capture.json`;
 let completed=false;
 for(let worker=0;worker<16;worker++){
  await run();
  if(existsSync(capture)){const r=JSON.parse(readFileSync(capture,'utf8'));if(r.fingerprint===fingerprint){const h=createHash('sha256');for await(const bytes of createReadStream(r.output))h.update(bytes);if(h.digest('hex')!==r.sha256)throw Error('Final output changed');completed=true;break;}}
 }
 if(!completed)throw Error('No complete output after 16 isolated workers');
}
