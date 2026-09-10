import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {displayWindow,sampleToFrame,SPF} from '../src/timing.ts';
type Cue={id:string;startSample:number;endSample:number;part:number;line:number;groups:number[][];words:{text:string;startSample:number;endSample:number}[];en:{text:string;words:number[]}[]};
const cues=JSON.parse(readFileSync('src/cues.json','utf8')) as Cue[];
const sampleCount=readFileSync('../prygay-source/analysis.f32').length/8;
let maxError=0,contacts=0,legacyTruncations=0;
for(const [i,c] of cues.entries()){
 assert(c.startSample>=0&&c.endSample<=sampleCount&&c.endSample>c.startSample);
 const win=displayWindow(c,cues[i-1],cues[i+1]);assert(win.start<=c.startSample);assert(win.end>=c.endSample,'Last word must not be hidden by the next entrance');
 if(cues[i+1]){const nextWin=displayWindow(cues[i+1]!,c,cues[i+2]);assert(win.end<=nextWin.start);if(c.endSample>cues[i+1]!.startSample-11520)legacyTruncations++;}
 for(const [j,w] of c.words.entries()){
  assert(Number.isInteger(w.startSample)&&Number.isInteger(w.endSample));assert(w.endSample>w.startSample);assert(w.startSample>=c.startSample&&w.endSample<=c.endSample);
  if(j)assert(c.words[j-1]!.endSample<=w.startSample);
  for(const s of [w.startSample,w.endSample]){const error=Math.abs(sampleToFrame(s)*SPF-s)/48;assert(error<=1000/120+1e-9);maxError=Math.max(maxError,error);contacts++;}
  assert(c.en.some(g=>g.words.includes(j)),'Every source word maps to English');
 }
 assert.deepEqual(c.groups.flat().sort((a,b)=>a-b),c.words.map((_,i)=>i));
 for(const g of c.en)assert(g.words.every(x=>x>=0&&x<c.words.length));
}
assert.equal(cues.length,21);assert.equal(cues.flatMap(c=>c.words).length,71);assert.equal(cues.filter(c=>c.line===1).length,5);
assert(cues.at(-1)!.startSample/48000>122.7,'Reject crop-edge outro drift');
assert(legacyTruncations>0,'Regression fixture exercises premature old handoffs');
const report={cues:cues.length,sourceWords:71,highlightUnits:50,checkedBoundaries:contacts,maxFrameQuantizationErrorMs:maxError,legacyTruncationsPrevented:legacyTruncations,sourceSampleCount:sampleCount,translation:'Meaning-linked groups use exactly the same start/end frames as Russian groups',display:'All word ends remain visible; adaptive lead shortens in tight gaps',limitations:'Frame quantization bound is not a claim about true vocal-boundary accuracy.'};
writeFileSync('evidence/timing-checks.json',JSON.stringify(report,null,2));console.log(report);
