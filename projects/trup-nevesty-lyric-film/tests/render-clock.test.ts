import test from 'node:test';
import assert from 'node:assert/strict';
import {read,renderClock,sourceFrameForOutput,type Recording} from '../scripts/render-production.ts';
test('60 fps output covers the original sound and every native picture without drift',()=>{
 const clock=renderClock(read<Recording>('source/recording.json'));
 assert.equal(clock.outputFrames,12318);assert.equal(clock.sourceFrames,5131);
 const used=new Set<number>();for(let n=0;n<clock.outputFrames;n++){const actual=sourceFrameForOutput(n,clock.sourceFrames);assert.equal(actual,Math.min(5130,Math.floor(n*25/60)));used.add(actual)}
 assert.equal(used.size,5131);assert.ok(clock.outputFrames/60>=clock.audioEnd);assert.ok(clock.outputFrames/60-clock.audioEnd<1/60);
 assert.equal(sourceFrameForOutput(12317,clock.sourceFrames),5130);
});
