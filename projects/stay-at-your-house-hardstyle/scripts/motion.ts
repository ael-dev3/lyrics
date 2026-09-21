import {readFileSync,writeFileSync} from 'node:fs';
import {strengthAt,clamp} from '../src/score.ts';
const bands:number[][]=JSON.parse(readFileSync('public/science.json','utf8'));
const pulses: {time:number;flux:number}[]=JSON.parse(readFileSync('public/beat-pulses.json','utf8'));
let last=0,held=0;
const data=bands.map((b,i)=>{
 const bass=clamp((b.slice(4,18).reduce((a,x)=>a+x,0)/14+52)/24);
 const attack=Math.max(0,bass-last);last=bass;held=Math.max(attack*5.5,held*.84);
 const t=i/60,strength=strengthAt(t),pulse=pulses.reduce((best,p)=>{const age=t-p.time;return age>=0&&age<.16?Math.max(best,clamp(p.flux/.35)*Math.exp(-age/.045)):best;},0);
 return {bass:+bass.toFixed(4),kick:+clamp(Math.max(held,pulse)).toFixed(4),strength:+strength.toFixed(4)};
});
writeFileSync('public/motion.json',JSON.stringify(data));
writeFileSync('evidence/motion-method.json',JSON.stringify({clock:'Original audio at 60 Hz',bass:'Mean measured 64-band dBFS bins 4–17, normalized from -52 to -28 dBFS for presentation',kick:'Maximum of bass-envelope rise and a 45 ms decay from measured broadband attack events; not a vocal detector',assetTime:'Edited trailer seconds equal original music seconds minus the edit start; no variable-speed runtime phase',scope:'Trailer edit, spectrum intensity and lyric events share the original audio clock; their editorial decisions remain separate',strongest:[[102.55,128.55],[179.55,211.6]],source:'src/score.ts'},null,2)+'\n');
