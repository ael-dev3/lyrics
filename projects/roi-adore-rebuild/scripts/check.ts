import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
type Cue={id:string;lang:string;text:string;start:number;end:number;translation?:string;translationGroups?:{text:string;start:number;end:number}[];words:{text:string;start:number;end:number}[]};
const cues=JSON.parse(readFileSync('src/cues.json','utf8')) as Cue[];
let boundaries=0,maxError=0;
assert.equal(cues.length,71);
for(const c of cues){assert(c.start>=0&&c.end>c.start&&c.end<379.384);assert(c.words.length>0);for(const w of c.words){assert(w.start>=c.start-.001&&w.end<=c.end+.001&&w.end>w.start);for(const t of [w.start,w.end]){const error=Math.abs(Math.round(t*60)/60-t);assert(error<=1/120+1e-10);maxError=Math.max(maxError,error);boundaries++;}}}
for(const lang of ['fr','en']){const track=cues.filter(c=>c.lang===lang);for(let i=1;i<track.length;i++)assert((track[i-1]?.end??0)<=(track[i]?.start??0));}
assert(cues.some(c=>c.lang==='fr'&&c.start>119&&c.start<120));
assert(cues.some(c=>c.lang==='en'&&c.start>31&&c.start<32));
assert(cues.some(c=>c.lang==='fr'&&c.start>205&&c.start<207));
assert(!cues.some(c=>c.lang==='fr'&&c.start<26));
assert(cues.some(c=>c.lang==='en'&&c.start>330&&c.start<332));
const french=cues.filter(c=>c.lang==='fr');for(const c of french){assert(c.translation);assert(c.translationGroups?.length);for(const g of c.translationGroups??[]){assert(g.start>=c.start-.001&&g.end<=c.end+.001&&g.end>g.start);assert(c.words.some(w=>w.start===g.start));assert(c.words.some(w=>w.end===g.end));}}
const report={translatedFrenchCues:french.length,translationTiming:'Semantic groups inherit corresponding aligned French word boundaries',cueCount:cues.length,boundaries,maxFrameQuantizationErrorMs:maxError*1000,overlapWithinLane:false,sourceAudioOffsetSeconds:.0365,wordTiming:'bounded alignment and measured repeat shifts; uncertainty groups retained',limitations:'Computational and visual QA. No claim of human listening certification or sample-accurate word truth.'};
writeFileSync('../checks.json',JSON.stringify(report,null,2));console.log(report);
