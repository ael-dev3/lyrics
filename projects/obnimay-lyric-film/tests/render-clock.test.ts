import test from 'node:test';
import assert from 'node:assert/strict';
import {read,renderClock,sourceFrameForOutput,type Recording} from '../scripts/render-production.ts';

test('every 60 fps picture selects the correct original 25 fps picture, with complete coverage',()=>{
 const clock=renderClock(read<Recording>('source/recording.json')),seen=new Map<number,number>();
 assert.equal(clock.outputFrames,12036);assert.equal(clock.sourceFrames,5015);
 for(let n=0;n<clock.outputFrames;n++){
  const k=sourceFrameForOutput(n);
  // Independent 300 Hz common timebase: output tick=5n, source tick=12k.
  assert.ok(k*12<=n*5&&(k+1)*12>n*5,`Wrong source picture at ${n}`);
  assert.equal(n*735/44100,n/60,`Audio sample clock at ${n}`);
  seen.set(k,(seen.get(k)??0)+1);
 }
 assert.equal(seen.size,5015);assert.ok([...seen.values()].every(n=>n===2||n===3));
 assert.equal(sourceFrameForOutput(12035),5014);
 assert.throws(()=>sourceFrameForOutput(-1));assert.throws(()=>sourceFrameForOutput(1.5));
});
