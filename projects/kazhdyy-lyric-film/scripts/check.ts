import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseData} from '../src/schema.ts';
import type {Layouts} from '../src/layout-types.ts';
import {sceneSvg,motionAt} from '../src/scene.ts';
import {palette} from '../src/palette.ts';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const d=parseData(read('src/cues.json')),layouts=read('src/layout.json') as Layouts,bands=read('public/science.json') as number[][];
const tokens=(s:string)=>s.toLowerCase().replaceAll('ё','е').match(/[\p{L}]+(?:-[\p{L}]+)*/gu)??[];
assert.deepEqual(tokens(readFileSync('source/supplied-lyrics.txt','utf8')),tokens(d.cues.flatMap(c=>c.ru.map(w=>w.text)).join(' ')),'Supplied lyric coverage');
assert.equal(d.frames,Math.ceil(d.sampleCount/d.sampleRate*d.fps));assert.ok(bands.length>=d.frames-1);
assert.equal(createHash('sha256').update(readFileSync('public/soundtrack.m4a')).digest('hex'),d.audioSha256);
assert.equal(new Set(Object.values(palette)).size,3);
let testedStates=0,checkedWords=0,maxQuantizationMs=0;const semantic=[];
for(let ci=0;ci<d.cues.length;ci++){
 const c=d.cues[ci]!,prev=d.cues[ci-1];assert.ok(c.visibleFrom<=c.startSample&&c.visibleUntil>=c.endSample);if(prev)assert.ok(prev.visibleUntil<=c.visibleFrom);
 for(let i=0;i<c.ru.length;i++){const w=c.ru[i]!,before=c.ru[i-1];if(before)assert.ok(before.endSample<=w.startSample,`source overlap ${w.id}`);assert.ok(w.reviewRequired,'Unreviewed model candidates must stay flagged');for(const s of [w.startSample,w.endSample])maxQuantizationMs=Math.max(maxQuantizationMs,Math.abs(Math.round(s/d.sampleRate*d.fps)/d.fps-s/d.sampleRate)*1000);}
 const frames=new Set(c.ru.flatMap(w=>[w.startSample,w.endSample].flatMap(s=>{const f=Math.round(s/d.sampleRate*d.fps);return [f-1,f,f+1];})));
 for(const format of ['landscape','portrait'] as const){
  const l=layouts[format],geometry=l.cues[c.id]!;assert.deepEqual(geometry.ru.map(w=>w.id),c.ru.map(w=>w.id));assert.deepEqual(geometry.en.map(w=>w.id),c.en.map(w=>w.id));
  for(const f of frames){
   const svg=sceneSvg(f,format,d,layouts,bands),visible=Math.round(f/d.fps*d.sampleRate)>=c.visibleFrom&&Math.round(f/d.fps*d.sampleRate)<c.visibleUntil;
   const colors=new Map([...svg.matchAll(/data-word="([^"]+)"[^>]*fill="([^"]+)"/g)].map(m=>[m[1]!,m[2]!]));
   for(const word of [...c.ru,...c.en]){
    if(!visible){assert.ok(!colors.has(word.id));continue;}
    const source='sourceIds'in word?c.ru.filter(w=>word.sourceIds.includes(w.id)):[word];
    const on=source.some(w=>f>=Math.round(w.startSample/d.sampleRate*d.fps)&&f<Math.round(w.endSample/d.sampleRate*d.fps));
    assert.equal(colors.get(word.id),on?palette.vermilion:palette.ivory,`${word.id}/${format}/${f}`);checkedWords++;
   }testedStates++;
  }
 }
 semantic.push({id:c.id,ru:c.ru,en:c.en.map(w=>({...w,sourceIntervals:c.ru.filter(s=>w.sourceIds.includes(s.id)).map(s=>({startSample:s.startSample,endSample:s.endSample})),highlightRule:'union, exclusive ends, no invented English times'}))});
}
for(let f=0;f<d.frames;f++){const m=motionAt(f/d.fps,bands);for(const v of [m.energy,m.chorus,m.interlude,m.intro,m.outro])assert.ok(Number.isFinite(v)&&v>=0&&v<=1);}
assert.ok(maxQuantizationMs<=1000/d.fps/2+.0001);
const result={status:'PASS',cues:d.cues.length,sourceTokens:d.cues.reduce((n,c)=>n+c.ru.length,0),targetTokensIncludingPunctuation:d.cues.reduce((n,c)=>n+c.en.length,0),testedBoundaryStatesBothFormats:testedStates,checkedVisibleWordColors:checkedWords,maxFrameQuantizationMs:maxQuantizationMs,frames:d.frames,clockSampleRate:d.sampleRate,clockSamples:d.sampleCount,meaningCoverage:'Every supplied source token and every target token mapped; semantic exceptions regression-tested',scope:'Structural, signal, timing-event and SVG color verification. Not a completed listening review or encoded-video verification.'};
writeFileSync('evidence/technical-checks.json',JSON.stringify(result,null,2)+'\n');writeFileSync('evidence/semantic-ledger.json',JSON.stringify(semantic,null,2)+'\n');console.log(result);
