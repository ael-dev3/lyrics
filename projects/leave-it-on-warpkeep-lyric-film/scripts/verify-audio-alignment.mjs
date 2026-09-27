import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const source=resolve(root,'source/Leave It On.m4a');
const output=process.argv[2];
if(!output)throw Error('Usage: node scripts/verify-audio-alignment.mjs /absolute/path/final.mp4');
const sampleRate=48000;
function decode(path,time){const p=spawnSync('ffmpeg',['-v','error','-ss',String(time),'-i',path,'-t','1.4','-map','0:a:0','-ac','2','-ar',String(sampleRate),'-f','s16le','pipe:1'],{maxBuffer:2*1024*1024});if(p.status!==0)throw Error(p.stderr.toString());const a=new Int16Array(p.stdout.buffer,p.stdout.byteOffset,Math.floor(p.stdout.length/2));const mono=new Float32Array(Math.floor(a.length/2));for(let i=0;i<mono.length;i++)mono[i]=(a[i*2]+a[i*2+1])*.5;return mono}
function correlation(a,b,lag){let xy=0,xx=0,yy=0;const start=sampleRate*.25|0,end=Math.min(a.length,b.length)-sampleRate*.25|0;for(let i=start;i<end;i+=4){const x=a[i],y=b[i+lag];xy+=x*y;xx+=x*x;yy+=y*y}return xx&&yy?xy/Math.sqrt(xx*yy):0}
const results=[];for(const time of [10,119.6,263]){const a=decode(source,time),b=decode(output,time);let best={lag:0,correlation:-1};for(let lag=-2048;lag<=2048;lag+=8){const c=correlation(a,b,lag);if(c>best.correlation)best={lag,correlation:c}}for(let lag=best.lag-7;lag<=best.lag+7;lag++){const c=correlation(a,b,lag);if(c>best.correlation)best={lag,correlation:c}}results.push({timeSeconds:time,lagSamples:best.lag,lagMilliseconds:best.lag*1000/sampleRate,correlation:best.correlation});if(Math.abs(best.lag)>240||best.correlation<.98)throw Error('AAC source-clock alignment failed: '+JSON.stringify(results.at(-1)))}
console.log(JSON.stringify({source,output,results},null,2));
