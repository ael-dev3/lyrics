import {readFileSync,writeFileSync} from 'node:fs';
import {parseData} from '../src/schema.ts';
// Always refine the immutable model-core draft, never a previously extended release.
const data=parseData(JSON.parse(readFileSync('analysis/core-cues.json','utf8')));
const bytes=readFileSync('analysis/vocals16.f32'),pcm=new Float32Array(bytes.buffer,bytes.byteOffset,bytes.length/4),sr=16000,hop=160;
const rms=Array.from({length:Math.ceil(pcm.length/hop)},(_,j)=>{let power=0,n=0;for(let i=Math.max(0,j*hop-240);i<Math.min(pcm.length,j*hop+240);i++){power+=(pcm[i]??0)**2;n++;}return Math.sqrt(power/Math.max(1,n));});
const observations:unknown[]=[];
for(let ci=0;ci<data.cues.length;ci++){
 const cue=data.cues[ci]!;
 for(let wi=0;wi<cue.ru.length;wi++){
  const word=cue.ru[wi]!;
  if(wi!==cue.ru.length-1&&!/^столе/u.test(word.text))continue;
  const nextWord=cue.ru[wi+1]??data.cues[ci+1]?.ru[0];
  const start=word.startSample/data.sampleRate,end=word.endSample/data.sampleRate,next=nextWord?nextWord.startSample/data.sampleRate:Infinity;
  const limit=Math.min(data.duration,end+1,Number.isFinite(next)?next-.045:data.duration);
  const peak=Math.max(...rms.slice(Math.floor(Math.max(start,end-.25)*100),Math.ceil(end*100)));
  const threshold=Math.max(.007,peak*.22);let release=end;
  for(let j=Math.ceil(end*100);j<Math.floor(limit*100);j++){
   if([0,1,2,3].every(k=>(rms[j+k]??0)<threshold))break;
   release=(j+1)/100;
  }
  const automaticRelease=release;
  // Spectrogram review found the long automatic caps entering diffuse tail energy.
  // Keep a conservative harmonic-tail endpoint; neither is a listening attestation.
  const spectralOverride:Record<string,number>={'KB-014-s07':83.92,'KB-025-s07':153.86};
  if(spectralOverride[word.id]!==undefined)release=spectralOverride[word.id]!;
  if(release>end+.06){word.endSample=Math.round(release*data.sampleRate);word.candidateSpreadMs=Math.max(word.candidateSpreadMs,(automaticRelease-end)*1000);observations.push({id:word.id,text:word.text,coreEndSeconds:end,automaticReleaseSeconds:automaticRelease,releaseCandidateSeconds:release,addedMs:Math.round((release-end)*1000),peakRms:peak,threshold,capped:automaticRelease>=limit-.02,spectralOverride:spectralOverride[word.id]!==undefined,method:'30 ms isolated-vocal RMS support, 10 ms hop; four low windows stop extension; next source onset minus 45 ms and 1 second cap. Two capped tails shortened after harmonic-envelope inspection.',status:'signal-supported preview candidate; voiced sustain vs reverb still needs actual-audio review'});}
 }
 cue.endSample=Math.max(...cue.ru.map(w=>w.endSample));
}
const vocal=JSON.parse(readFileSync('analysis/mms-vocals-vocalisation.json','utf8')).segments[0].words[0] as {start:number;end:number};
const vocalId='KB-025-vocalisation',vocalStart=Math.round(vocal.start*data.sampleRate),vocalEnd=Math.round(vocal.end*data.sampleRate);
data.cues.push({id:vocalId,section:'Vocalisation',ru:[{id:vocalId+'-s01',text:'У-у-у',startSample:vocalStart,endSample:vocalEnd,candidateSpreadMs:1000,reviewRequired:true}],en:[{id:vocalId+'-e01',text:'Ooh',sourceIds:[vocalId+'-s01']}],startSample:vocalStart,endSample:vocalEnd,visibleFrom:vocalStart,visibleUntil:vocalEnd});
data.cues.sort((a,b)=>a.startSample-b.startSample);
for(let i=0;i<data.cues.length;i++){
 const c=data.cues[i]!,prev=data.cues[i-1],next=data.cues[i+1];
 c.visibleFrom=Math.max(0,c.startSample-Math.round(.22*data.sampleRate),prev?Math.round((prev.endSample+c.startSample)/2):0);
 c.visibleUntil=Math.min(data.sampleCount,c.endSample+Math.round(.3*data.sampleRate),next?Math.round((c.endSample+next.startSample)/2):data.sampleCount);
}
data.frames=Math.ceil(data.duration*data.fps);
parseData(data);
writeFileSync('src/cues.json',JSON.stringify(data,null,2)+'\n');
writeFileSync('analysis/release-candidates.json',JSON.stringify({status:'preview candidates — listening required',methodLimit:'Stem energy can include reverberation and separation artifacts. These endpoints are not claimed as exact acoustic truth.',observations,vocalisation:{id:vocalId,source:'supplied (У-у-у)',start:vocal.start,end:vocal.end,method:'Bounded MMS observation, corroborating vocal-region energy; lexical recognizers return no words. Timing is provisional.'}},null,2)+'\n');
console.log(observations);
