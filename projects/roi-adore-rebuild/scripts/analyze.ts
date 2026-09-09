import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {bands,measure,SR} from './dsp.ts';
const bytes=readFileSync('../analysis-master.f32'),pcm=new Float32Array(bytes.buffer,bytes.byteOffset,bytes.byteLength/4),frames=Math.ceil(pcm.length/2/SR*60),data=new Float32Array(frames*64),start=Date.now();
for(let i=0;i<64;i++){const values=measure(pcm,bands[i]!);values.forEach((v,f)=>{data[f*64+i]=v;});if(i%8===7)console.log({bands:i+1,seconds:(Date.now()-start)/1000});}
const raw=Buffer.from(data.buffer);writeFileSync('analysis/bands-dbfs.f32',raw);
// JSON is a 0.01 dB presentation copy; unrounded Float32 measurements are retained separately.
writeFileSync('public/science.json',JSON.stringify(Array.from({length:frames},(_,f)=>Array.from(data.subarray(f*64,f*64+64),x=>Math.round(x*100)/100))));
const hash=(b:Uint8Array)=>createHash('sha256').update(b).digest('hex');
writeFileSync('analysis/manifest.json',JSON.stringify({version:2,sourceAudioSha256:hash(readFileSync('public/soundtrack.m4a')),pcmSha256:hash(bytes),sampleRate:SR,sampleCount:pcm.length/2,frames,fps:60,raw:{path:'bands-dbfs.f32',format:'Float32 little endian',shape:[frames,64],sha256:hash(raw)},unit:'dBFS RMS: 10log10(mean((L_filtered^2+R_filtered^2)/2)); full-scale centered sine = -3.0103 dBFS',algorithm:'64 unique prewarped band-pass biquads, forward-backward zero phase; 0 dB center gain and exact -3 dB composite edges; reflected endpoint padding',timeSupport:'Frequency-dependent filter impulse response plus centered max(25ms,4 center-frequency cycles) RMS window; no causal group delay; edge windows shortened and reflected filter padding',bands,display:'Fixed -60 to 0 dBFS scale; no spatial smoothing, per-band gain, transient extension or per-frame renormalization',reference:'https://www.w3.org/TR/audio-eq-cookbook/'},null,2));
