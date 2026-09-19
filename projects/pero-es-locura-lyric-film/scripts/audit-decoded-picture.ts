import {spawn} from 'node:child_process';
import {readFileSync,writeFileSync,createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {basename} from 'node:path';
import {parseData} from '../src/schema.ts';
import {revision} from '../src/identity.ts';

const file=process.argv[2],format=process.argv[3];
if(!file||(format!=='landscape'&&format!=='portrait'))throw Error('Usage: final.mp4 landscape|portrait');
const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8')));
const hash=async(path:string)=>{const h=createHash('sha256');for await(const b of createReadStream(path))h.update(b);return h.digest('hex');};
// The same source region in both layouts. It avoids text, portrait edge masks and
// the stronger landscape reading shade; landscape shading here stays below 4%.
const sourceCrop='crop=1536:128:192:288';
const deliveredCrop=format==='landscape'?sourceCrop:'crop=864:72:108:472';
async function strip(path:string,filter:string){
 const child=spawn('ffmpeg',['-v','error','-threads','2','-i',path,'-an','-vf',filter+',scale=64:8:flags=area,format=gray','-fps_mode','passthrough','-f','rawvideo','pipe:1']);
 const chunks:Buffer[]=[];let error='';child.stderr.on('data',b=>error+=b);
 const closed=new Promise<number|null>((ok,fail)=>{child.on('error',fail);child.on('close',ok);});
 for await(const b of child.stdout)chunks.push(Buffer.from(b));
 if(await closed!==0)throw Error('Picture decode failed: '+error);
 const bytes=Buffer.concat(chunks);if(bytes.length!==data.frames*512)throw Error('Picture frame count mismatch');return bytes;
}
const [source,delivered]=await Promise.all([
 strip('public/source.mp4',`fps=60:round=up,tpad=stop_mode=clone:stop_duration=0.2,trim=end_frame=${data.frames},${sourceCrop}`),
 strip(file,deliveredCrop)
]);
let largestMeanAbsoluteError=0,darkSourceFrames=0,nonblackSourceFrames=0;const failures:{frame:number;sourceMean:number;deliveredMean:number;meanAbsoluteError:number}[]=[];
for(let frame=0;frame<data.frames;frame++){
 let sourceSum=0,deliveredSum=0,difference=0;
 for(let x=0;x<512;x++){const i=frame*512+x,a=source[i]!,b=delivered[i]!;sourceSum+=a;deliveredSum+=b;difference+=Math.abs(a-b);}
 const sourceMean=sourceSum/512,deliveredMean=deliveredSum/512,meanAbsoluteError=difference/512;
 largestMeanAbsoluteError=Math.max(largestMeanAbsoluteError,meanAbsoluteError);
 if(sourceMean<8)darkSourceFrames++;else nonblackSourceFrames++;
 if(meanAbsoluteError>15||(sourceMean>=8&&deliveredMean<Math.max(2,sourceMean*.65)))failures.push({frame,sourceMean,deliveredMean,meanAbsoluteError});
}
const report={status:failures.length?'FAIL':'PASS',revision,format,inputFile:basename(file),inputSha256:await hash(file),sourceSha256:await hash('public/source.mp4'),scriptSha256:await hash('scripts/audit-decoded-picture.ts'),frames:data.frames,nonblackSourceFrames,darkSourceFrames,largestMeanAbsoluteError,failureCount:failures.length,failures:failures.slice(0,30),method:'Compare a common text-free picture strip in every decoded delivery frame against the original source at its sample-and-hold timestamp. Reduce each strip to 64×8 grayscale; allow up to 15 mean absolute levels for scaling, compression and the light landscape shade, and require at least 65% of source mean brightness when the source is nonblack.',limits:'Detects absent, substantially wrong or mis-timed sampled picture content. This strip check is not full-frame pixel equivalence and cannot establish physical-browser or audio latency. Separate decoded-frame inspection covers the complete composition.'};
writeFileSync(`evidence/${format}-decoded-picture.json`,JSON.stringify(report,null,2)+'\n');
console.log(report);if(failures.length)process.exitCode=1;
