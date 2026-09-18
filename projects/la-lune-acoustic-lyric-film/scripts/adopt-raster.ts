import {readFileSync,writeFileSync} from 'node:fs';
const read=(p:string)=>JSON.parse(readFileSync('evidence/'+p,'utf8'));
const comparisons=['landscape','portrait'].flatMap(f=>read(f+'-raster-compositor-proof.json').results);
if(comparisons.length!==8||comparisons.some(r=>r.maxChannelDifference>16||r.meanChannelDifference>.2||r.pixelsOver4/r.pixelCount>.0001||r.pixelsOver16!==0))throw Error('Compositor differs beyond reviewed bounds');
const diagnostics=['landscape','portrait'].map(f=>read(f+'-'+f+'-raster-diagnostic.mp4.focus-verification.json'));
if(diagnostics.some(r=>r.status!=='passed'||r.wordStates!==1920||r.mismatchCount||r.ambiguous))throw Error('Encoded diagnostic failed');
const negative=read('portrait-portrait-raster-diagnostic.mp4.negative-control.focus-verification.json');if(negative.mismatchCount!==292||negative.ambiguous)throw Error('Negative control failed');
writeFileSync('evidence/raster-adoption.json',JSON.stringify({status:'PASS',revision:'preview-v3-celestial',comparisons,diagnostics,negativeControl:{offsetFrames:20,detectedMismatches:negative.mismatchCount},review:'Full 2× comparisons meet the numerical bounds above; exact values are retained for every checkpoint. The final encoder receives lossless RGBA with one Lanczos downsample. This is measured visual equivalence, not pixel identity.',limits:'Eight representative image comparisons and two encoded diagnostic intervals; full production receives an all-frame word-state audit and complete clock/audio checks. Does not establish acoustic ground truth.'},null,2)+'\n');
