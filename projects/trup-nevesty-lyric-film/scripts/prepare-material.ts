import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createCanvas,loadImage} from '@napi-rs/canvas';

const recording=JSON.parse(readFileSync('source/recording.json','utf8'));
const image=await loadImage('public/material-reference.png');
const canvas=createCanvas(1080,1080),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);
const pixels=ctx.getImageData(0,0,1080,1080).data;
const light=(x:number,y:number)=>{const i=(y*1080+x)*4;return Math.min(pixels[i]!,pixels[i+1]!,pixels[i+2]!);};
function peak(x:number,predicted:number){
 let sum=0,weight=0;
 for(let y=Math.max(0,Math.round(predicted)-8);y<=Math.min(1079,Math.round(predicted)+8);y++){
  const w=Math.max(0,light(x,y)-170)**2;
  sum+=y*w;weight+=w;
 }
 return weight>0?sum/weight:predicted;
}
const guesses=[869,911,952,994,1036,1078];
const strings=guesses.map((intercept,index)=>{
 // Fit both visible portions. Extrapolating a short left-hand segment alone
 // makes tiny codec/shadow differences produce a large error at the right edge.
 const columns=[...Array.from({length:18},(_,i)=>12+i*14),...Array.from({length:20},(_,i)=>730+i*12)];
 let best=-Infinity,zero=intercept,slope=-.209;
 for(let b=intercept-5;b<=intercept+7;b+=.25)for(let m=-.235;m<=-.190;m+=.0005){
  let score=0;
  for(const x of columns){const y=Math.round(b+m*x);let top=0;for(let j=-1;j<=1;j++)if(y+j>=0&&y+j<1080)top=Math.max(top,light(x,y+j));score+=Math.max(0,top-190)**2;}
  if(score>best){best=score;zero=b;slope=m;}
 }
 const samples=columns.map(x=>({x,y:peak(x,zero+slope*x)}));
 return {id:`painted-string-${index+1}`,index,start:{x:0,y:zero},end:{x:1080,y:zero+slope*1080},sourceTraceSamples:samples,width:3.1,bandIndices:Array.from({length:4},(_,j)=>index*4+j)};
});
const hand=[{x:366,y:577},{x:515,y:518},{x:635,y:594},{x:674,y:735},{x:689,y:876},{x:679,y:929},{x:648,y:952},{x:622,y:901},{x:611,y:831},{x:602,y:821},{x:622,y:956},{x:609,y:1012},{x:570,y:1025},{x:540,y:1006},{x:524,y:947},{x:495,y:864},{x:479,y:851},{x:465,y:910},{x:485,y:971},{x:471,y:1003},{x:436,y:1015},{x:411,y:975},{x:390,y:920},{x:379,y:883},{x:378,y:846},{x:379,y:780},{x:374,y:764},{x:359,y:783},{x:337,y:804},{x:295,y:803},{x:281,y:776},{x:296,y:710},{x:312,y:658},{x:339,y:623}];
// These are existing painted veil beads, sampled from the source, not invented stars.
const beads:{x:number;y:number;radius:number;phase:number}[]=[];
for(let y=12;y<651;y+=8)for(let x=665;x<1070;x+=8){
 if(y>Math.max(45,x*.5-220)&&light(x,y)>213&&light(x-2,y-2)<185){
  if(!beads.some(p=>Math.hypot(p.x-x,p.y-y)<26))beads.push({x,y,radius:2.2,phase:((x*73+y*29)%1000)/1000*Math.PI*2});
 }
}
const plan={schemaVersion:1,sourceSha256:recording.sourceSha256,referenceSha256:createHash('sha256').update(readFileSync('public/material-reference.png')).digest('hex'),coordinates:'Original 1080×1080 illustration pixels. Full image is preserved in both delivery layouts.',palette:{ink:'#07101c',cloth:'#5d6573',guitar:'#806365',ivory:'#f0eee8',gold:'#f1cd82'},strings,handOcclusion:hand,ring:{center:{x:556,y:784},angle:-.18,rx:34,ry:9},veilBeads:beads.slice(0,48),response:'Six measured groups of full-mix spectral power drive bounded motion along the six painted strings. This is an artistic display mapping, not a literal instrument-pitch measurement.'};
writeFileSync('public/material-anchors.json',JSON.stringify(plan,null,2)+'\n');
mkdirSync('analysis/material',{recursive:true});
ctx.strokeStyle='#eea54a';ctx.lineWidth=2;
for(const s of strings){ctx.beginPath();ctx.moveTo(s.start.x,s.start.y);ctx.lineTo(s.end.x,s.end.y);ctx.stroke();}
ctx.strokeStyle='#58cfad';ctx.beginPath();hand.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.stroke();
for(const p of beads.slice(0,48)){ctx.strokeStyle='#58cfad';ctx.beginPath();ctx.arc(p.x,p.y,6,0,Math.PI*2);ctx.stroke();}
ctx.strokeStyle='#58cfad';ctx.beginPath();ctx.ellipse(556,784,34,9,-.18,0,Math.PI*2);ctx.stroke();
writeFileSync('analysis/material/anchors-diagnostic.png',canvas.toBuffer('image/png'));

const decode=spawnSync('ffmpeg',['-v','error','-nostdin','-i','public/source.mp4','-vf','fps=1,scale=96:96:flags=area','-an','-pix_fmt','rgb24','-f','rawvideo','pipe:1'],{maxBuffer:16*1024*1024});
if(decode.status!==0)throw Error(decode.stderr.toString());
const frameBytes=96*96*3,frames=Math.floor(decode.stdout.length/frameBytes);
const metrics=[];let maximum=0;
for(let f=1;f<frames;f++){let d=0;for(let i=0;i<frameBytes;i++)d+=Math.abs(decode.stdout[f*frameBytes+i]!-decode.stdout[i]!);d/=frameBytes;maximum=Math.max(maximum,d);metrics.push(d);}
writeFileSync('evidence/source-picture-study.json',JSON.stringify({sourceSha256:recording.sourceSha256,method:'One actual decoded picture each second across the complete recording, downscaled to 96×96 RGB for a content check. Native PTS and all pictures are verified separately in the player.',sampledFrames:frames,maximumMeanAbsoluteChannelChange:maximum,meanMeanAbsoluteChannelChange:metrics.reduce((a,b)=>a+b,0)/metrics.length,conclusion:maximum<3?'The official recording uses a held illustration; small changes are codec noise. Static subject matter does not excuse stalled decoding.':'Picture changes require detailed motion inspection.',humanListening:false},null,2)+'\n');
console.log(JSON.stringify({strings:strings.map(s=>({id:s.id,start:s.start,end:s.end})),beads:plan.veilBeads.length,sourcePictureSamples:frames,maximumMeanChannelDifference:maximum}));
