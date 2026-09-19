import assert from 'node:assert/strict';import {readFileSync,writeFileSync} from 'node:fs';import {createHash} from 'node:crypto';import type {SourceWord,TargetWord} from '../src/schema.ts';import type {CueLayout} from '../src/layout-types.ts';import {parseData} from '../src/schema.ts';import type {Layouts} from '../src/layout-types.ts';import {sceneSvg,spectrum} from '../src/scene.ts';import {palette} from '../src/palette.ts';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const d=parseData(read('src/cues.json')),layouts=read('src/layout.json') as Layouts,bands=read('public/science.json') as number[][];
const expected=(read('source/performed-sequence.json') as {text:string}[]).flatMap(c=>c.text.split(/\s+/));
assert.deepEqual(d.cues.flatMap(c=>c.es.map(w=>w.text)),expected,'Complete independently performed sequence');
assert.equal(d.frames,Math.ceil(d.sampleCount/d.sampleRate*d.fps));assert.equal(bands.length,d.frames);
assert.equal(createHash('sha256').update(readFileSync('public/soundtrack.m4a')).digest('hex'),d.audioSha256);
let states=0,wordColors=0,maxQuantizationMs=0;const semantic=[];
for(let ci=0;ci<d.cues.length;ci++){
 const c=d.cues[ci],prev=d.cues[ci-1];assert.ok(c);assert.ok(c.visibleFrom<=c.startSample&&c.visibleUntil>=c.endSample);if(prev)assert.ok(prev.visibleUntil<=c.visibleFrom);
 for(let i=0;i<c.es.length;i++){const w:SourceWord|undefined=c.es[i];const p:SourceWord|undefined=c.es[i-1];assert.ok(w);if(p)assert.ok(p.endSample<=w.startSample,w.id);for(const s of [w.startSample,w.endSample])maxQuantizationMs=Math.max(maxQuantizationMs,Math.abs(Math.round(s/d.sampleRate*d.fps)/d.fps-s/d.sampleRate)*1000);}
 const frames=new Set(c.es.flatMap(w=>[w.startSample,w.endSample].flatMap(s=>{const f=Math.round(s/d.sampleRate*d.fps);return [f-1,f,f+1];})));
 for(const format of ['landscape','portrait'] as const){
  const l=layouts[format];const geo:CueLayout|undefined=l.cues[c.id];assert.ok(geo);assert.deepEqual(geo.es.map(w=>w.id),c.es.map(w=>w.id));assert.deepEqual(geo.en.map(w=>w.id),c.en.map(w=>w.id));
  for(const box of [...geo.es,...geo.en])assert.ok(box.x>=l.safeX&&box.x+box.width<=l.width-l.safeX&&box.y<l.height-120);
  for(const f of frames){
   const svg=sceneSvg(f,format,d,layouts,bands),visible=Math.round(f/d.fps*d.sampleRate)>=c.visibleFrom&&Math.round(f/d.fps*d.sampleRate)<c.visibleUntil;
   const colors=new Map([...svg.matchAll(/data-word="([^"]+)"[^>]*fill="([^"]+)"/g)].map(m=>[m[1],m[2]]));
   for(const word of [...c.es,...c.en]){
    if(!visible){assert.ok(!colors.has(word.id));continue;}
    const source:SourceWord[]='sourceIds'in word?c.es.filter((w:SourceWord)=>(word as TargetWord).sourceIds.includes(w.id)):[word];
    const on:boolean=source.some((w:SourceWord)=>f>=Math.round(w.startSample/d.sampleRate*d.fps)&&f<Math.round(w.endSample/d.sampleRate*d.fps));
    assert.equal(colors.get(word.id),on?palette.active:palette.rest,word.id+'/'+format+'/'+f);wordColors++;
   }states++;
  }
 }
 semantic.push({id:c.id,es:c.es,en:c.en.map(w=>({...w,intervals:c.es.filter(s=>w.sourceIds.includes(s.id)).map(s=>({startSample:s.startSample,endSample:s.endSample})),rule:'source interval union; exclusive ends; no invented target times'}))});
}
for(let f=0;f<d.frames;f++)for(const p of [false,true])for(const v of spectrum(f,bands,p))assert.ok(Number.isFinite(v)&&v>=2&&v<=(p?54:32));
assert.ok(maxQuantizationMs<=1000/d.fps/2+.0001);
const result={status:'PASS',cues:d.cues.length,sourceWords:d.cues.reduce((n,c)=>n+c.es.length,0),targetWords:d.cues.reduce((n,c)=>n+c.en.length,0),boundaryStatesBothFormats:states,visibleWordColors:wordColors,maxFrameQuantizationMs:maxQuantizationMs,frames:d.frames,scope:'Source sequence, meaning-map coverage, geometry data, SVG colors and measured display bounds. This does not complete actual-audio review.'};
writeFileSync('evidence/technical-checks.json',JSON.stringify(result,null,2)+'\n');writeFileSync('evidence/semantic-ledger.json',JSON.stringify(semantic,null,2)+'\n');console.log(result);
