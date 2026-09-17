import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const sr=48000,hop=240;
const bytes=readFileSync('analysis/drums48.f32'),pcm=new Float32Array(bytes.buffer,bytes.byteOffset,bytes.length/4),count=pcm.length/2;
const prefix=new Float64Array(count+1);
for(let i=0;i<count;i++)prefix[i+1]=prefix[i]!+((pcm[i*2]??0)**2+(pcm[i*2+1]??0)**2)/2;
const power=(start:number,end:number)=>{const a=Math.max(0,Math.round(start)),b=Math.min(count,Math.round(end));return Math.max(0,(prefix[b]!-prefix[a]!)/Math.max(1,b-a));};
const energy=Array.from({length:Math.ceil(count/hop)},(_,i)=>power(i*hop-sr*.004,i*hop+sr*.004));
const flux=energy.map((v,i)=>Math.max(0,v-power(i*hop-sr*.045,i*hop-sr*.012)));
const candidates:{sample:number;time:number;strength:number;power:number}[]=[];
for(let i=12;i<flux.length-12;i++){
 const value=flux[i]!;if(value<.00003||energy[i]!<.0001)continue;
 if(flux.slice(i-12,i+13).some((x,j)=>x>value||(x===value&&j<12)))continue;
 // Locate the attack apex more finely in the raw stem around the 5 ms candidate.
 let sample=i*hop,best=-1;
 for(let s=sample-sr*.006;s<=i*hop+sr*.006;s+=24){const v=power(s-sr*.004,s+sr*.004)-power(s-sr*.045,s-sr*.012);if(v>best){best=v;sample=s;}}
 candidates.push({sample:Math.round(sample),time:sample/sr,strength:best,power:energy[i]!});
}
const sorted=candidates.map(e=>e.strength).sort((a,b)=>a-b);
const percentile=(p:number)=>sorted[Math.floor((sorted.length-1)*p)]??1;
const lower=percentile(.62),upper=percentile(.98);
const chosen:typeof candidates=[];
for(const event of candidates.filter(e=>e.strength>=lower).sort((a,b)=>b.strength-a.strength))if(chosen.every(e=>Math.abs(e.time-event.time)>=.32))chosen.push(event);
chosen.sort((a,b)=>a.time-b.time);
const mixBytes=readFileSync('analysis/audio-delivery.f32'),mix=new Float32Array(mixBytes.buffer,mixBytes.byteOffset,mixBytes.length/4);
const mixPower=(s:number,ms:number)=>{let value=0,n=0;for(let i=Math.round(s-ms*sr/2000);i<Math.round(s+ms*sr/2000);i++){value+=(mix[i*2]??0)**2+(mix[i*2+1]??0)**2;n+=2;}return value/n;};
const corroboration=chosen.map(e=>{let best=-Infinity,at=e.sample;for(let s=e.sample-1200;s<=e.sample+1200;s+=24){const value=mixPower(s,8)-mixPower(s-sr*.0285,33);if(value>best){best=value;at=s;}}return {drumSample:e.sample,mixSample:at,shiftMs:(at-e.sample)/48,mixFlux:best,accepted:best>0&&Math.abs(at-e.sample)<=sr*.02};});
const events=chosen.flatMap((e,i)=>{const match=corroboration[i]!;if(!match.accepted)return [];return [{...e,drumSample:e.sample,sample:match.mixSample,time:match.mixSample/sr,id:`hit-${String(i+1).padStart(3,'0')}`,frame:Math.round(match.mixSample/sr*60),weight:Number((.35+.65*Math.min(1,Math.max(0,(e.strength-lower)/(upper-lower)))).toFixed(5))}];});
writeFileSync('analysis/mix-impact-corroboration.json',JSON.stringify({scope:'Selected drum attacks corroborated and anchored to original-mix 8 ms positive power contrast. Search ±25 ms; reject nonpositive or more than 20 ms disagreement. No soundtrack or lyric offset applied.',selected:chosen.length,accepted:events.length,rejected:chosen.length-events.length,rows:corroboration},null,2)+'\n');
const sha=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex');
const data={version:1,sampleRate:sr,fps:60,duration:count/sr,events};
writeFileSync('public/motion.json',JSON.stringify(data,null,2)+'\n');
writeFileSync('analysis/motion-manifest.json',JSON.stringify({sourceAudioSha256:sha(readFileSync('public/soundtrack.m4a')),drumPcmSha256:sha(bytes),source:'Demucs htdemucs percussion stem, analysis only; delivery audio unchanged',method:'Stereo 8 ms centered power minus preceding 33 ms mean (12–45 ms before candidate); 5 ms search hop and 0.5 ms apex refinement; local 120 ms nonmaximum suppression. Selected hits anchored to corroborating original-mix attacks; disagreements over 20 ms omitted.',candidateCount:candidates.length,selectedHits:events.length,uncorroboratedHitsOmitted:chosen.length-events.length,thresholds:{minimumPower:.0001,minimumPositiveFlux:.00003,candidateP62:lower,candidateP98:upper,minimumStemCandidateSpacingSeconds:.32},display:{onlySelectedHitsMovePicture:true,attackFrames:1,releaseFrames:11,maximumScaleAddition:.012,apex:'Nearest 60 fps frame to original-mix attack sample; no arbitrary timer, beat-grid transfer or global lyric offset'},limitation:'A drum stem can leak other instruments. These are acoustic attack candidates, not a claim of human beat annotation or exact hardware audiovisual latency.'},null,2)+'\n');
console.log({candidates:candidates.length,selected:events.length,nearChorus:events.filter(e=>e.time>68&&e.time<73),first:events.slice(0,8)});
