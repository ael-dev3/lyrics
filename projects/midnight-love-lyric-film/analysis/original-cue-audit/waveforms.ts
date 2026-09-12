import {readFileSync,writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
type SharpFactory=(input:Buffer)=>{png:()=>{toFile:(path:string)=>Promise<unknown>}};
const sharp=createRequire(process.env.SHARP_REQUIRE_BASE??import.meta.url)('sharp') as SharpFactory;
type W={word:string;start:number;end:number;probability:number};
type E={cue:string;k:number;word:string;presented:{start:number;end:number};candidates:Record<string,W>};
const rows=JSON.parse(readFileSync('analysis/original-cue-audit/comparison.json','utf8')) as E[];
const b=readFileSync('analysis/vocals.f32'),pcm=new Float32Array(b.buffer,b.byteOffset,b.byteLength/4),sr=16000,hop=80;
if(Math.abs(pcm.length/sr-193.8535)>.01)throw Error('Wrong vocal PCM clock');
const rms:number[]=[];for(let i=0;i<pcm.length;i+=hop){let s=0;for(let j=i;j<i+hop;j++)s+=(pcm[j]??0)**2;rms.push(Math.sqrt(s/hop));}
const panels=[['L07',34.6,37.1],['L19',79.4,81.6],['L08',38.3,40.25],['L11',56,58.6],['L13',64.7,66.6],['L25',104.6,107.2],['L27',113.2,115.2],['L21',84.2,85.3]] as const;
const esc=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
for(let page=0;page<2;page++){
 const width=1500,height=1320;let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="100%" height="100%" fill="#07101f"/><style>text{font-family:Arial;font-size:15px;fill:#dce3ef}</style><text x="25" y="30">Midnight Love • isolated vocal RMS every 5 ms • blue delivered / gold mix CTC / pink English CTC</text>`;
 panels.slice(page*4,page*4+4).forEach(([id,start,end],i)=>{const y=60+i*315,x=(t:number)=>95+(t-start)/(end-start)*1370,base=y+205;const max=Math.max(...rms.slice(Math.floor(start/.005),Math.ceil(end/.005)))*1.08;
 svg+=`<text x="20" y="${y+20}">${id}</text>`;
 for(let t=Math.ceil(start*5)/5;t<end;t+=.2)svg+=`<path d="M${x(t)} ${y+50}V${base}" stroke="#263347"/><text x="${x(t)}" y="${base+25}">${t.toFixed(1)}</text>`;
 let d='';for(let k=Math.floor(start/.005);k<=Math.ceil(end/.005);k++)d+=`${d?'L':'M'}${x(k*.005).toFixed(1)},${(base-(rms[k]??0)/max*140).toFixed(1)}`;svg+=`<path d="${d}" stroke="#bdc6d3" stroke-width="1.5" fill="none"/>`;
 for(const r of rows.filter(r=>r.cue===id)){for(const [w,color,level] of [[r.presented,'#67e0ff',0],[r.candidates.mixMMS,'#ffce80',1],[r.candidates.englishCTC,'#ee91cc',2]] as const){if(!w||w.start<start||w.start>end)continue;svg+=`<path d="M${x(w.start)} ${y+45}V${base}" stroke="${color}"/><text x="${x(w.start)+3}" y="${y+14+level*16}" style="fill:${color}">${esc(r.word)}</text>`;}}
 });svg+='</svg>';writeFileSync(`analysis/original-cue-audit/waveforms-${page+1}.svg`,svg);await sharp(Buffer.from(svg)).png().toFile(`analysis/original-cue-audit/waveforms-${page+1}.png`);
}
