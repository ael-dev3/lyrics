import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import type {ChildProcessWithoutNullStreams} from 'node:child_process';
import {rawFrames,readJson,renderClock,root,sceneTimeForOutput,sourceFrameForOutput,type SourceManifest} from './render-production.ts';
import type {Timeline} from '../src/model.ts';

// Pure clock/stream checks: no gate mutation, output, decoding or encoding.
const clock=renderClock(readJson<SourceManifest>('source/manifest.json'));
assert.equal(clock.outputFrames,15606);assert.equal(clock.sourceFrames,6501);
assert.equal(clock.audioSamples,11469824);
assert.deepEqual(Array.from({length:12},(_,n)=>sourceFrameForOutput(n,clock)),[0,0,0,1,1,2,2,2,3,3,4,4]);
const counts=new Uint8Array(clock.sourceFrames);
const timeline=readJson<Timeline>('public/timeline.json');
let normalizedFrames=0,maxTimeNormalizationSeconds=0,correctedFocusComparisons=0;
const correctedEdges:{frame:number;time:number;wordId:string;sample:number;unadjustedSample:number;expectedFocused:boolean}[]=[];
for(let n=0;n<clock.outputFrames;n++) {
  const j=sourceFrameForOutput(n,clock);counts[j]=(counts[j]??0)+1;
  // Separately derive source ownership from integer original/output periods.
  assert.equal(j,Math.min(6500,Math.floor(n*25/60)));
  if(j<6500) {assert.ok(n*25>=j*60);assert.ok(n*25<(j+1)*60);}
  const base=n/60,time=sceneTimeForOutput(n),sample=n*735;
  assert.ok(time>=base&&time-base<=2*Number.EPSILON*Math.max(1,time));
  assert.ok(time*44100>=sample&&time*44100-sample<1e-7);
  assert.equal(Math.floor(time*25),Math.floor(n*5/12),'Analysis cadence undershot exact frame');
  if(time!==base)normalizedFrames++;
  maxTimeNormalizationSeconds=Math.max(maxTimeNormalizationSeconds,time-base);
  for(const cue of timeline.cues)for(const word of cue.words) {
    const exact=sample>=word.startSample&&sample<word.endSample;
    assert.equal(time*44100>=word.startSample&&time*44100<word.endSample,exact,`Sample edge mismatch ${word.id}/${n}`);
    if((base*44100>=word.startSample&&base*44100<word.endSample)!==exact) {
      correctedFocusComparisons++;correctedEdges.push({frame:n,time:base,wordId:word.id,sample,unadjustedSample:base*44100,expectedFocused:exact});
    }
  }
}
assert.ok([...counts.subarray(0,6500)].every(count=>count===2||count===3));
assert.equal(counts[6500],6);
assert.equal(sourceFrameForOutput(15600,clock),6500);assert.equal(sourceFrameForOutput(15605,clock),6500);
assert.ok(15605/60<clock.audioEnd);assert.ok(15606/60>clock.audioEnd);
assert.throws(()=>sourceFrameForOutput(-1,clock));assert.throws(()=>sourceFrameForOutput(15606,clock));
assert.throws(()=>sourceFrameForOutput(1.5,clock));
const child=(chunks:Buffer[])=>({stdout:Readable.from(chunks)}) as unknown as ChildProcessWithoutNullStreams;
const frames:Buffer[]=[];
for await(const frame of rawFrames(child([Buffer.from([1]),Buffer.from([2,3,4,5,6,7]),Buffer.from([8])]),4)) frames.push(frame);
assert.deepEqual(frames,[Buffer.from([1,2,3,4]),Buffer.from([5,6,7,8])]);
await assert.rejects(async()=>{for await(const _frame of rawFrames(child([Buffer.from([1,2,3])]),4)) void _frame;},/truncated/);
console.log(JSON.stringify({schema:'komety/render-clock-verification/v1',status:'passed',revision:timeline.revision,sourceSha256:timeline.sourceSha256,
  rendererSha256:createHash('sha256').update(readFileSync(resolve(root,'scripts/render-production.ts'))).digest('hex'),
  frames:clock.outputFrames,sourceEvents:timeline.cues.flatMap(c=>c.words).length,
  normalizedFrames,maxTimeNormalizationSeconds,correctedFocusComparisons,
  correctedEdges,
  checks:'Exact 25→60 cadence, all canonical sample focus states, final audio-tail hold, invalid frames and fragmented/truncated streams'}));
