import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {sampleToFrame,displayWindow,buildCueFrames,cueStateAtFrame} from '../src/timing.ts';
import {parseCues} from '../src/schema.ts';
import {FRAMES,SAMPLE_COUNT,SR,FPS} from '../src/config.ts';
const cues=parseCues(JSON.parse(readFileSync('src/cues.json','utf8')));
let last=0,error=0,wordCount=0,groupCount=0;
for(const [n,c] of cues.entries()){
 assert(c.startSample>=last&&c.endSample>c.startSample&&c.endSample<=SAMPLE_COUNT,c.id);last=c.endSample;
 assert.equal(c.startSample,c.words[0]?.startSample);assert.equal(c.endSample,c.words.at(-1)?.endSample);
 let wordEnd=c.startSample;
 for(const w of c.words){assert(w.startSample>=wordEnd&&w.endSample>w.startSample,c.id+' '+w.text);assert(w.endSample<=c.endSample);wordEnd=w.endSample;for(const s of [w.startSample,w.endSample])error=Math.max(error,Math.abs(sampleToFrame(s)*SR/FPS-s)/SR*1000);wordCount++;}
 const groups=c.groups.flat().sort((a,b)=>a-b);assert.deepEqual(groups,c.words.map((_,i)=>i));
 for(const g of c.groups){assert(g.length>0);const start=Math.min(...g.map(i=>c.words[i]?.startSample??Infinity)),end=Math.max(...g.map(i=>c.words[i]?.endSample??0));assert(sampleToFrame(end)>sampleToFrame(start),c.id+' invisible focus group');}
 const next=cues[n+1],d=displayWindow(c,cues[n-1],next);assert(d.start<=d.settled&&d.settled<=c.startSample&&d.end>=c.endSample);if(next)assert(d.end<=displayWindow(next,c,cues[n+2]).start);
 groupCount+=c.groups.length;
}
assert(error<=1000/(FPS*2)+1e-9);
for(const feature of ['science','motion']){const data:unknown=JSON.parse(readFileSync(`public/${feature}.json`,'utf8'));assert(Array.isArray(data)&&data.length===FRAMES);assert(data.every(row=>Array.isArray(row)&&row.every(x=>typeof x==='number'&&Number.isFinite(x))));}
const expected=readFileSync('analysis/lyrics-user-en.txt','utf8').toLowerCase().trim().split(/\s+/),actual=cues.flatMap(c=>c.words.map(w=>w.text.toLowerCase()));assert.deepEqual(actual,expected);
const plan=buildCueFrames(cues,{sampleRate:SR,fps:FPS});let fullyVisibleFirstFocusContacts=0;
for(const c of plan)for(const g of c.groups){const state=cueStateAtFrame(plan,g.startFrame);assert.equal(state?.index,c.index);assert.equal(state?.opacity,1,'Focus must be fully visible on its first frame');for(const w of g.wordIndices)assert(state?.activeWordIndices.has(w));const end=cueStateAtFrame(plan,g.endFrame);if(end?.index===c.index)for(const w of g.wordIndices)assert(!end.activeWordIndices.has(w));fullyVisibleFirstFocusContacts++;}
const result={fullyVisibleFirstFocusContacts,cues:cues.length,sourceWords:expected.length,displayWords:wordCount,highlightGroups:groupCount,maxFrameRoundingErrorMs:error,timingAuthority:'48,000 Hz integer samples',userTextCoverage:true,positiveOrderedIntervals:true,groupCoverage:true,stablePresentationWindows:true,featureFrames:FRAMES,originalLanguage:'English',translationLane:'Not needed: source lyrics already English',limits:'Frame rounding is not acoustic accuracy. Model disagreement, short vowels and sustained endings remain documented; no repeated-section timestamp transfer.'};
writeFileSync('evidence/timing-checks.json',JSON.stringify(result,null,2));console.log(result);
