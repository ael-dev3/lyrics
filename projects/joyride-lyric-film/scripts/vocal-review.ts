import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
type SharpFactory=(input:Buffer)=>{png:()=>{toFile:(path:string)=>Promise<unknown>}};
const sharp=createRequire(process.env.SHARP_REQUIRE_BASE??import.meta.url)('sharp') as SharpFactory;
type W={word:string;start:number;end:number;probability?:number};type S={id:string;text:string;words:W[]};
const read=(n:string)=>(JSON.parse(readFileSync(`analysis/${n}.json`,'utf8')) as {segments:S[]}).segments;
const v=read('mms-vocals16'),m=read('mms-audio16'),e=read('wav2vec-vocals16');
const b=readFileSync('analysis/vocals.f32'),pcm=new Float32Array(b.buffer,b.byteOffset,b.byteLength/4),sr=48000,hop=240;
const rms:number[]=[];for(let i=0;i<pcm.length;i+=hop){let energy=0;for(let j=i;j<Math.min(i+hop,pcm.length);j++)energy+=(pcm[j]??0)**2;rms.push(Math.sqrt(energy/hop));}
writeFileSync('analysis/vocal-rms-5ms.json',JSON.stringify({sampleRate:sr,hopSamples:hop,rms}));
const ranges:{id:string;start:number;end:number}[]=[];
for(const [base,shift] of [[0,0],[16,45.18],[36,90.36]] as const)for(const [n,a,z] of [[1,12.1,13.3],[2,14.7,16.1],[3,17.75,18.7],[4,20.3,21.7],[5,23.3,24.5],[6,26.2,27.4],[7,28.95,30],[8,31.6,33]] as const)ranges.push({id:`L${String(base+n).padStart(2,'0')}`,start:a+shift,end:z+shift});
for(const [n,a,z] of [[26,82.6,83.6],[27,84,85],[30,89.7,90.7],[33,95.3,96.5],[35,99.3,100.5]] as const)ranges.push({id:`L${n}`,start:a,end:z});
const esc=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
for(let page=0;page<Math.ceil(ranges.length/8);page++){
 const rows=ranges.slice(page*8,page*8+8),width=1500,height=80+rows.length*195;
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#08101d"/><style>text{fill:#ddd;font-family:Arial;font-size:14px}</style><text x="25" y="28">Vocal RMS every 5 ms • cyan vocal MMS / gold mix MMS / pink English encoder • first two words</text>`;
 rows.forEach((r,row)=>{const y=60+row*195,x=(t:number)=>120+(t-r.start)/(r.end-r.start)*1350,ys=y+130,max=Math.max(...rms.slice(Math.floor(r.start/.005),Math.ceil(r.end/.005)))*1.12;
  svg+=`<text x="20" y="${y+16}">${r.id}</text>`;
  for(let t=Math.ceil(r.start*10)/10;t<r.end;t+=.1)svg+=`<path d="M${x(t)} ${y+25}V${ys}" stroke="#293449"/><text x="${x(t)}" y="${ys+20}">${t.toFixed(1)}</text>`;
  let d='';for(let i=Math.floor(r.start/.005);i<=Math.ceil(r.end/.005);i++)d+=`${d?'L':'M'}${x(i*.005).toFixed(1)},${(ys-(rms[i]??0)/max*100).toFixed(1)}`;svg+=`<path d="${d}" fill="none" stroke="#a5adbb" stroke-width="1.4"/>`;
  for(const [z,color,index] of [[v,'#46d7ed',0],[m,'#ffcf77',1],[e,'#ff87d5',2]] as const){const s=z.find(s=>s.id===r.id);for(const w of s?.words.slice(0,2)??[]){if(w.start>=r.start&&w.start<=r.end)svg+=`<path d="M${x(w.start)} ${y+25}V${ys}" stroke="${color}" stroke-width="2"/><text x="${x(w.start)+3}" y="${y+18+index*18}" style="fill:${color}">${esc(w.word)}</text>`;}}
 });svg+='</svg>';writeFileSync(`evidence/vocal-onsets-${page+1}.svg`,svg);await sharp(Buffer.from(svg)).png().toFile(`evidence/vocal-onsets-${page+1}.png`);
}
