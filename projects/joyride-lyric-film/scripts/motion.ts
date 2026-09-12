import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const sr=48000,fps=60;
const clamp=(x:number)=>Math.min(1,Math.max(0,x));
const smooth=(a:number,b:number,x:number)=>{const q=clamp((x-a)/Math.max(1e-9,b-a));return q*q*(3-2*q);};
const percentile=(a:number[],p:number)=>{const sorted=[...a].sort((x,y)=>x-y);return sorted[Math.floor((sorted.length-1)*p)]??0;};
type Event={sample:number;strength:number;confidence:string;uncertaintyMs:number};
function transients(pcm:Float32Array):Event[]{
 const n=pcm.length/2,hop=48,blocks=Math.ceil(n/hop),power=new Float64Array(blocks),peaks=new Int32Array(blocks),novelty=new Float64Array(blocks);
 for(let i=0;i<blocks;i++){let max=-1;for(let k=i*hop;k<Math.min(n,(i+1)*hop);k++){const p=((pcm[k*2]??0)**2+(pcm[k*2+1]??0)**2)/2;power[i]=(power[i]??0)+p/hop;if(p>max){max=p;peaks[i]=k;}}}
 for(let i=1;i<blocks;i++){let prior=0;for(let k=Math.max(0,i-25);k<i;k++)prior+=power[k]??0;prior/=Math.min(25,i);novelty[i]=Math.max(0,(power[i]??0)-prior);}
 const threshold=percentile(Array.from(novelty).filter(x=>x>1e-10),.80),raw:Event[]=[];
 for(let i=2;i<blocks-2;i++){const v=novelty[i]??0;if(v>=Math.max(1e-8,threshold)&&v>=(novelty[i-1]??0)&&v>(novelty[i+1]??0))raw.push({sample:peaks[i]??0,strength:v,confidence:'short-energy novelty with local sample-peak refinement',uncertaintyMs:12});}
 raw.sort((a,b)=>b.strength-a.strength);const chosen:Event[]=[];for(const e of raw)if(chosen.every(c=>Math.abs(c.sample-e.sample)>=sr*.18))chosen.push(e);return chosen.sort((a,b)=>a.sample-b.sample);
}
const fixture=new Float32Array(sr*2);for(const p of [4801,24113,43127]){fixture[p*2]=1;fixture[p*2+1]=1;}const hits=transients(fixture);for(const p of [4801,24113,43127])assert(hits.some(h=>Math.abs(h.sample-p)<=48));
const b=readFileSync('analysis/audio-delivery.f32'),pcm=new Float32Array(b.buffer,b.byteOffset,b.byteLength/4),n=pcm.length/2,frames=Math.ceil(n/sr*fps),prefix=new Float64Array(n+1);
for(let i=0;i<n;i++)prefix[i+1]=(prefix[i]??0)+((pcm[i*2]??0)**2+(pcm[i*2+1]??0)**2)/2;
const sustained=Array.from({length:frames},(_,f)=>{const c=Math.round(f*sr/fps),a=Math.max(0,c-9600),z=Math.min(n,c+9600);return 10*Math.log10(Math.max(1e-12,((prefix[z]??0)-(prefix[a]??0))/Math.max(1,z-a)));});
const events=transients(pcm),strengths=events.map(e=>e.strength),p80=percentile(strengths,.8),p99=percentile(strengths,.99),active=sustained.filter(x=>x>-70),p60=percentile(active,.60),p96=percentile(active,.96),p995=percentile(active,.995);
const science=JSON.parse(readFileSync('public/science.json','utf8')) as number[][];
const low= science.map(row=>row.slice(0,23).reduce((a,v)=>a+10**(v/10),0));const low50=percentile(low,.50),low95=percentile(low,.95);
const motion:number[][]=[];let previousPressure=0;
for(let f=0;f<frames;f++){
 const t=f/fps,target=smooth(p60,p96,sustained[f]??-120)**1.35,alpha=1-Math.exp(-1/(fps*(target>previousPressure?.075:.32)));const pressure=previousPressure+(target-previousPressure)*alpha;previousPressure=pressure;
 let impact=0;for(const e of events){const apex=Math.round(e.sample/sr*fps)/fps,dt=t-apex;if(dt<-.033334||dt>.24)continue;const strength=smooth(p80,p99,e.strength)**1.7;const envelope=dt<=0?smooth(-2/fps,0,dt):Math.exp(-dt/.055)*(1-smooth(.16,.24,dt));impact=Math.max(impact,strength*envelope);}
 const lowEnd=smooth(low50,low95,low[f]??0),row=science[f]??[],total=row.reduce((a,v)=>a+10**(v/10),0),high=row.slice(45).reduce((a,v)=>a+10**(v/10),0),brightness=clamp(high/Math.max(1e-10,total)*5);
 const hero=smooth(p96,p995,sustained[f]??-120)*impact,reach=Math.max(pressure**1.45,.72*impact**1.8),width=2*Math.round((680+820*reach+250*hero)/2);
 motion.push([pressure,impact,lowEnd,brightness,hero,width,2+Math.round(2*lowEnd)].map(x=>Math.round(x*10000)/10000));
}
const json=JSON.stringify(motion);writeFileSync('public/motion.json',json);writeFileSync('analysis/events.json',JSON.stringify(events));
const heroFraction=motion.filter(r=>(r[5]??0)>=1650).length/frames;assert(heroFraction<.02);assert(motion.every(r=>r.every(Number.isFinite)&&(r[5]??0)<=1750));
writeFileSync('analysis/motion-manifest.json',JSON.stringify({sourcePcmSha256:createHash('sha256').update(b).digest('hex'),fps,fields:['pressure','impact','lowEnd','brightness','hero','lineWidthPx','coreThicknessPx'],sustained:'Centered 400ms stereo RMS, dBFS; track-relative P60/P96; 75ms attack, 320ms release artistic smoothing',thresholds:{p60,p96,p995,p80,p99,low50,low95},transients:'1ms stereo-energy blocks; novelty against prior25ms; local sample-peak refinement;180ms exclusion; stored real-music uncertainty12ms is detector scope, not perceptual certainty',impact:'Apex on nearest60fps frame; 33.333ms anticipation;55ms exponential decay, zero by240ms',heroFraction,syntheticImpulseMaxErrorMs:Math.max(...[4801,24113,43127].map(p=>Math.min(...hits.map(h=>Math.abs(h.sample-p)))))/sr*1000,eventCount:events.length,sha256:createHash('sha256').update(json).digest('hex'),separation:'Artistic controls never modify raw measured band levels'},null,2));console.log({events:events.length,heroFraction,frames,p60,p96});
