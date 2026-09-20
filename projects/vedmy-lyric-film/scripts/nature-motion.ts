import {readFileSync,writeFileSync} from 'node:fs';
const bands=JSON.parse(readFileSync('public/science.json','utf8')) as number[][];
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const average=(row:number[],a:number,b:number)=>row.slice(a,b).reduce((s,v)=>s+v,0)/(b-a);
let breeze=0,phase=0,glow=0,prior=-90;const frames:number[][]=[];
for(const row of bands){
 // Air-band energy moves the canopy. Positive spectral change adds a soft gust.
 const air=average(row,42,59),energy=clamp((air+73)/39),flux=clamp((air-prior-1)/9);prior=air;
 const target=clamp(energy*.76+flux*.24),tau=target>breeze?.32:1.25;
 breeze+=(target-breeze)*(1-Math.exp(-1/60/tau));glow=Math.max(flux,glow*Math.exp(-1/60/.45));
 phase+=(.62+breeze*.78)/60;
 frames.push([+phase.toFixed(6),+breeze.toFixed(5),+glow.toFixed(5)]);
}
writeFileSync('public/nature-motion.json',JSON.stringify(frames));
writeFileSync('analysis/nature-motion.json',JSON.stringify({fps:60,frames:frames.length,fields:['integrated wind phase in seconds','smoothed air-band energy','positive-flux gust'],bands:[42,59],attackSeconds:.32,releaseSeconds:1.25,gustDecaySeconds:.45,phaseVelocity:[.62,1.4],scope:'Artistic woodland movement driven by measured original-mix bands; not bird-call identification or physical wind measurement. Integration prevents particle jumps when energy changes. Full range, including intro and outro, is retained.'},null,2)+'\n');
