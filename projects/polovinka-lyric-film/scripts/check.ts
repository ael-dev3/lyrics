import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {FPS,SR,SAMPLES,FRAMES} from '../src/config.ts';
const cues=JSON.parse(readFileSync('src/cues.json','utf8')) as {id:string;startSample:number;endSample:number;ru:{text:string;startSample:number;endSample:number}[];en:{sourceWords:number[];startSample:number;endSample:number}[]}[];
const clean=(s:string)=>s.toLowerCase().replace(/ё/g,'е').replace(/[^а-я]/g,'');
assert.equal(clean(cues.flatMap(c=>c.ru.map(w=>w.text)).join(' ')),clean(readFileSync('source/lyrics-supplied-ru.txt','utf8')));
let words=0;for(const [i,c] of cues.entries()){
 assert(c.startSample>=0&&c.endSample<SAMPLES&&c.startSample<c.endSample);
 if(i)assert(c.startSample>cues[i-1]!.endSample);
 for(const [j,w]of c.ru.entries()){assert(w.startSample<w.endSample);if(j)assert(w.startSample>=c.ru[j-1]!.endSample);words++;}
 const mapped=c.en.flatMap(g=>g.sourceWords).sort((a,b)=>a-b);assert.deepEqual(mapped,c.ru.map((_,j)=>j));
 for(const g of c.en){assert.equal(g.startSample,Math.min(...g.sourceWords.map(j=>c.ru[j]!.startSample)));assert.equal(g.endSample,Math.max(...g.sourceWords.map(j=>c.ru[j]!.endSample)));}
}
const manifest=JSON.parse(readFileSync('analysis/manifest.json','utf8')),science=JSON.parse(readFileSync('public/science.json','utf8')) as number[][];
assert.equal(manifest.frames,FRAMES);assert.equal(manifest.sampleCount,SAMPLES);assert.equal(science.length,FRAMES);assert(science.every(row=>row.length===64&&row.every(x=>Number.isFinite(x)&&x<=3&&x>=-120)));
assert.equal(manifest.sourceAudioSha256,createHash('sha256').update(readFileSync('public/soundtrack.m4a')).digest('hex'));
assert.equal(FPS,60);assert.equal(SR,48000);assert.equal(words,75);
writeFileSync('evidence/timing-checks.json',JSON.stringify({passed:true,phrases:cues.length,words,frames:FRAMES,samples:SAMPLES,completeSuppliedText:true,semanticMapsComplete:true,scienceFramesMatched:true},null,2));console.log('PASS: source text, timing, semantic coverage, audio-feature identity');
