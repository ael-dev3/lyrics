import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {sampleToFrame,displayWindow} from '../src/timing.ts';
import type {Cue} from '../src/schema.ts';
const cues=JSON.parse(readFileSync('src/cues.json','utf8')) as Cue[];
let last=0,error=0,wordCount=0,groupCount=0;
for(const [n,c] of cues.entries()){
 assert(c.startSample>=last&&c.endSample>c.startSample&&c.endSample<=7200648,c.id);
 last=c.endSample;let wordEnd=c.startSample;
 for(const w of c.words){assert(Number.isInteger(w.startSample)&&Number.isInteger(w.endSample));assert(w.startSample>=wordEnd&&w.endSample>w.startSample,c.id+' '+w.text);assert(w.endSample<=c.endSample);wordEnd=w.endSample;for(const s of [w.startSample,w.endSample])error=Math.max(error,Math.abs(sampleToFrame(s)*800-s)/48);wordCount++;}
 const groups=c.groups.flat().sort((a,b)=>a-b);assert.deepEqual(groups,c.words.map((_,i)=>i));
 const meanings=new Set(c.en.flatMap(e=>e.words));assert.deepEqual([...meanings].sort((a,b)=>a-b),c.words.map((_,i)=>i));
 const d=displayWindow(c,cues[n-1],cues[n+1]);assert(d.start<=d.settled&&d.settled<=c.startSample&&d.end>=c.endSample);if(cues[n+1])assert(d.end<=displayWindow(cues[n+1]!,c,cues[n+2]).start);
 groupCount+=c.groups.length;
}
assert(error<=1000/120+1e-9);
for(const f of ['science','motion','vocal-envelope'])assert.equal(JSON.parse(readFileSync(`public/${f}.json`,'utf8')).length,9001);
const expected=readFileSync('analysis/lyrics-user-ru.txt','utf8').toLowerCase().replace(/[()]/g,'').split(/\s+/).filter(Boolean);
const actual=cues.flatMap(c=>c.echo?Array(4).fill('пожар'):c.words.map(w=>w.text.toLowerCase()));assert.deepEqual(actual,expected,'User text must be retained, with four echoed words represented by the documented persistent motif.');
const result={cues:cues.length,sourceWords:expected.length,displayWords:wordCount,highlightGroups:groupCount,maxFrameRoundingErrorMs:error,timingAuthority:'48,000 Hz integer samples',userTextCoverage:true,positiveOrderedIntervals:true,meaningCoverage:true,stablePresentationWindows:true,featureFrames:9001,limits:'Frame rounding is not a bound on inferred acoustic timing. Chopped/reverberant bridge uses one sustained bilingual motif, not independently aligned echo copies.'};
writeFileSync('evidence/timing-checks.json',JSON.stringify(result,null,2));console.log(result);
