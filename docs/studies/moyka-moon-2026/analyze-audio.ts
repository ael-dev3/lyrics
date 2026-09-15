/** CC BY 4.0 — Ael / Lyrics workflow. Descriptive mixed-audio onset proxy. */
import {spawnSync} from 'node:child_process';
import {mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
const [source, out] = process.argv.slice(2);
if (!source || !out) throw new Error('Usage: node analyze-audio.ts SOURCE OUTPUT_DIR');
mkdirSync(out, {recursive: true});
const decoded = spawnSync('ffmpeg', ['-v','error','-i',source,'-map','0:a:0','-ac','2','-ar','48000','-c:a','pcm_f32le','-f','f32le','pipe:1'], {maxBuffer:256*1024*1024});
if (decoded.status !== 0) throw new Error(decoded.stderr.toString());
const count=decoded.stdout.length/8;
if (!Number.isInteger(count)) throw new Error('Incomplete stereo PCM');
const sum=new Float64Array(count+1), hf=new Float64Array(count+1);
let oldL=0,oldR=0;
for(let i=0;i<count;i++){
 const l=decoded.stdout.readFloatLE(i*8),r=decoded.stdout.readFloatLE(i*8+4);
 sum[i+1]=(sum[i]??0)+(l*l+r*r)/2;
 hf[i+1]=(hf[i]??0)+((l-oldL)**2+(r-oldR)**2)/2;
 oldL=l;oldR=r;
}
type Row={time:number;rmsDb:number;differenceDb:number;novelty:number};
const rows:Row[]=[]; const sr=48000,hop=480,half=480;
for(let center=0;center<count;center+=hop){
 const a=Math.max(0,center-half),b=Math.min(count,center+half);
 const db=(x:number)=>10*Math.log10(Math.max(1e-12,x));
 rows.push({time:center/sr,rmsDb:db(((sum[b]??0)-(sum[a]??0))/(b-a)),differenceDb:db(((hf[b]??0)-(hf[a]??0))/(b-a)),novelty:0});
}
for(let i=1;i<rows.length;i++){
 const current=rows[i],prev=rows[i-1];if(!current||!prev)throw new Error('Missing feature row');
 current.novelty=Math.max(0,current.rmsDb-prev.rmsDb)+Math.max(0,current.differenceDb-prev.differenceDb);
}
const candidates=rows.map((r,i)=>({i,...r})).filter(r=>r.time>0.1&&r.time<count/sr-0.1&&r.novelty>1.5).sort((a,b)=>b.novelty-a.novelty);
const selected:typeof candidates=[];
for(const c of candidates)if(selected.every(s=>Math.abs(s.time-c.time)>=0.08))selected.push(c);
selected.sort((a,b)=>a.time-b.time);
writeFileSync(join(out,'audio-features.csv'),'seconds,rms_dbfs,first_difference_db,positive_db_rise\n'+rows.map(r=>[r.time.toFixed(3),r.rmsDb.toFixed(5),r.differenceDb.toFixed(5),r.novelty.toFixed(5)].join(',')).join('\n')+'\n');
writeFileSync(join(out,'audio-summary.json'),JSON.stringify({sampleRate:sr,channels:2,presentedSamples:count,seconds:count/sr,windowSeconds:0.02,hopSeconds:0.01,centering:'centered; clipped at recording boundaries',channelCombination:'mean channel power; no mono cancellation',differenceMetric:'first temporal difference; high-frequency-sensitive proxy, not a calibrated band',novelty:'positive frame-to-frame rises in RMS dB plus first-difference dB',peakThreshold:1.5,peakSeparationSeconds:0.08,limits:'Mixed-soundtrack attack candidates, not certified beats, vocal boundaries, or evidence of the original production algorithm.',events:selected.map(({i,...r})=>r)},null,2)+'\n');
console.log(JSON.stringify({samples:count,seconds:count/sr,attackCandidates:selected.length}));
