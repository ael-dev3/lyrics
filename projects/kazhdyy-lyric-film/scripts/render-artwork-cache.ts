import {bundle} from '@remotion/bundler';
import {renderFrames,selectComposition} from '@remotion/renderer';
import {readFileSync,writeFileSync,mkdirSync,existsSync,copyFileSync,mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {assertProductionGate} from './production-contract.ts';
import {artworkStates,cacheKey,cacheDirectory,cacheHash} from './artwork-cache-contract.ts';
import {shadowSeed} from '../src/shadows.ts';
assertProductionGate();
const format=process.argv[2];if(format!=='landscape'&&format!=='portrait')throw Error('Expected format');
const start=Number(process.argv[3]??0),end=Number(process.argv[4]??12797),needed=new Set(Array.from({length:end-start+1},(_,i)=>shadowSeed(i+start)));
const dir=cacheDirectory(format),key=cacheKey();mkdirSync(dir,{recursive:true});
let manifest:{key:string;scale:number;files:Record<string,string>}={key,scale:2,files:{}};
if(existsSync(dir+'/manifest.json')){const prior=JSON.parse(readFileSync(dir+'/manifest.json','utf8'));if(prior.key===key)manifest=prior;}
const indices=artworkStates.flatMap((s,i)=>needed.has(s.seed)&&(!existsSync(`${dir}/seed-${s.seed}.png`)||manifest.files[`seed-${s.seed}.png`]!==cacheHash(`${dir}/seed-${s.seed}.png`))?[i]:[]);
if(indices.length){
 const publicDir=mkdtempSync(join(tmpdir(),'kazhdyy-artwork-public-'));copyFileSync('public/artwork.png',join(publicDir,'artwork.png'));
 const serveUrl=await bundle({entryPoint:'src/ArtworkCache.tsx',publicDir}),composition=await selectComposition({serveUrl,id:format});let tick=0;
 // Reopen Chromium between small batches so discarded SVG filter surfaces do
 // not accumulate across the complete shadow inventory. Existing hashes resume safely.
 for(let at=0;at<indices.length;at+=24){const batch=indices.slice(at,at+24);
 await renderFrames({serveUrl,composition,inputProps:{format},outputDir:null,frames:batch,scale:2,imageFormat:'png',concurrency:2,onStart:()=>console.log(`${format}: batch ${Math.floor(at/24)+1}/${Math.ceil(indices.length/24)} (${indices.length} remaining states)`),onFrameUpdate:(n)=>{if(Date.now()-tick>10000){tick=Date.now();console.log(`${format}: ${at+n}/${indices.length} artwork states`);}},onFrameBuffer:(buffer,index)=>{const name=`seed-${artworkStates[index]!.seed}.png`;writeFileSync(dir+'/'+name,buffer);manifest.files[name]=createHash('sha256').update(buffer).digest('hex');writeFileSync(dir+'/manifest.json',JSON.stringify(manifest,null,2)+'\n');}});
 }
}
console.log(`${format}: artwork cache ready (${needed.size} required states)`);
