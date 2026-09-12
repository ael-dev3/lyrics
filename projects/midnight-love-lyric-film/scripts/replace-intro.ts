// Production repair for a still-rendering PNG sequence. A normal full render
// from the finalized Film.tsx already includes this title handoff.
import {bundle} from '@remotion/bundler';
import {renderFrames,selectComposition,makeCancelSignal} from '@remotion/renderer';
import {readFileSync,writeFileSync,mkdirSync,cpSync,existsSync,renameSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const target=process.argv[2];assert(target,'Provide this production render’s landscape first-part PNG directory.');
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
const old=readFileSync('evidence/Film-before-title-handoff.txt','utf8'),current=readFileSync('src/Film.tsx','utf8');
const oldIntro='const intro=smooth(16,80,f)*(1-smooth((cues[0]?.startSample??720000)/800-45,(cues[0]?.startSample??720000)/800-12,f));';
const newIntro='const intro=smooth(16,80,f)*(1-smooth(14*FPS,14.8*FPS,f));';
const oldHeader='const headerOpacity=portrait?1:smooth(9*FPS,13*FPS,f);';
const newHeader='const headerOpacity=portrait?1:smooth(14.8*FPS,15.7*FPS,f);';
assert(old.includes(oldIntro)&&old.includes(oldHeader));assert.equal(old.replace(oldIntro,newIntro).replace(oldHeader,newHeader),current,'Changes must be confined to the two opening-title opacity expressions.');
const smooth=(a:number,b:number,x:number)=>{const q=Math.max(0,Math.min(1,(x-a)/(b-a)));return q*q*(3-2*q);};
const cueData:unknown=JSON.parse(readFileSync('src/cues.json','utf8'));assert(Array.isArray(cueData)&&cueData[0]&&typeof cueData[0].startSample==='number');
for(let f=960;f<11632;f++){
 assert.equal(smooth(9*60,13*60,f),smooth(14.8*60,15.7*60,f));
 assert.equal(1-smooth(cueData[0].startSample/800-45,cueData[0].startSample/800-12,f),1-smooth(14*60,14.8*60,f));
}
const directory=resolve(target);assert(existsSync(join(directory,'element-0960.png')));assert(existsSync(join(directory,'element-1000.png')));
const {cancelSignal,cancel}=makeCancelSignal();process.once('SIGINT',cancel);process.once('SIGTERM',cancel);
const output=resolve('evidence/intro-replacement');mkdirSync(output,{recursive:true});
if(!process.argv.includes('--apply-only')){
const serveUrl=await bundle({entryPoint:resolve('src/index.tsx')}),composition=await selectComposition({serveUrl,id:'MidnightYouTube'});let last=0;
await renderFrames({serveUrl,composition,cancelSignal,inputProps:{},outputDir:output,frameRange:[0,960],imageFormat:'png',scale:2,concurrency:3,onStart:()=>{},onFrameUpdate:f=>{if(Date.now()-last>15000){last=Date.now();console.log({frames:f,total:961});}}});
}
const frame=(dir:string,f:number)=>join(dir,`element-${String(f).padStart(dir===output?3:4,'0')}.png`);
assert.equal(hash(frame(output,960)),hash(frame(directory,960)),'First untouched frame differs from the ongoing body render.');
assert.equal(hash(frame(output,0)),hash(frame(directory,0)),'Unexpected target composition or frame origin.');
for(let f=0;f<960;f++){const source=frame(output,f),dest=frame(directory,f),temporary=dest+'.replacement';assert(existsSync(dest));cpSync(source,temporary);renameSync(temporary,dest);assert.equal(hash(dest),hash(source));}
const record={reason:'Remove the duplicate opening title/header and separate their fades.',replacementRange:[0,959],replacementFrames:960,scale:2,renderCapture:'Lossless PNG; replaced the first-part cache before encoding, with no intermediate RGB/YUV conversion.',postWindowOpacityIdentity:true,firstUntouchedFrame:960,firstUntouchedPngSha256:hash(frame(output,960)),firstUntouchedFrameByteIdentical:true,initialFilmSha256:createHash('sha256').update(old).digest('hex'),finalFilmSha256:hash('src/Film.tsx'),onlyTwoOpacityExpressionsChanged:true,portraitOutputUnchanged:'Portrait header is always opaque; the opening landscape title is not mounted in portrait.'};
writeFileSync('evidence/intro-revision.json',JSON.stringify(record,null,2));
execFileSync(process.execPath,['scripts/record-render-inputs.ts']);console.log('Opening repaired; untouched body frame matches byte for byte.');
