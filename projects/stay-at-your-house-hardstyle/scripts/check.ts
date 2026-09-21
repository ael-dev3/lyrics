import {readFileSync,writeFileSync} from 'node:fs';import assert from 'node:assert/strict';import {parseData} from '../src/schema.ts';import {frameAt} from '../src/focus.ts';import type {Layouts} from '../src/layout-types.ts';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));const d=parseData(read('src/cues.json')),layouts=read('src/layout.json') as Layouts;
let previousEnd=0,states=0;const short:string[]=[];
for(const c of d.cues){assert.ok(c.visibleFrom>=previousEnd,c.id+' cue overlap');previousEnd=c.visibleUntil;assert.ok(c.visibleFrom<=c.startSample);assert.ok(c.visibleUntil>=c.endSample,c.id+' clipped hold');
 for(let i=0;i<c.source.length;i++){const w=c.source[i]!;if(i)assert.ok(w.startSample>=c.source[i-1]!.endSample,w.id+' overlap');if(frameAt(w.endSample,d.sampleRate,d.fps)<=frameAt(w.startSample,d.sampleRate,d.fps))short.push(w.id);
 for(const format of ['landscape','portrait'] as const){const l=layouts[format],box=l.cues[c.id]!.source.find(b=>b.id===w.id)!;assert.ok(box);assert.ok(box.x>=60&&box.x+box.width<=l.width-60,w.id+' unsafe horizontal geometry');assert.ok(box.y>=400&&box.y<=l.height-160,w.id+' unsafe vertical geometry');states++;}
 }
}
assert.deepEqual(short,[],'Words lost during frame quantization');
for(const p of ['public/science.json','public/motion.json'])assert.equal(read(p).length,d.frames,p+' incomplete');
const report={status:'passed',scope:'Structural and geometric checks; listening review remains pending',cues:d.cues.length,words:d.cues.flatMap(c=>c.source).length,wordLayoutStates:states,frames:d.frames,duration:d.duration,unresolvedWords:d.cues.flatMap(c=>c.source).filter(w=>w.reviewRequired).length};writeFileSync('evidence/structural-check.json',JSON.stringify(report,null,2)+'\n');console.log(report);
