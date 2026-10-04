import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderClock,sourceFrameForOutput,sceneTimeForOutput} from '../scripts/render-production.ts';
import {validateCfrTimestamps,compareAudioPackets} from '../scripts/verify-final.ts';
test('source decoder retains native picture cadence and final picture through audio tail',()=>{
 const clock=renderClock(JSON.parse(readFileSync('source/recording.json','utf8')));
 assert.equal(clock.outputFrames,10608);
 assert.deepEqual([0,1,2,3,4,5,11,12].map(n=>sourceFrameForOutput(n,clock)),[0,0,0,1,1,2,4,5]);
 assert.equal(sourceFrameForOutput(10603,clock),4417);
 for(let n=10604;n<10608;n++)assert.equal(sourceFrameForOutput(n,clock),4418);
 assert.equal(sceneTimeForOutput(60),1);assert.equal(sceneTimeForOutput(1950),32.5);
 assert.throws(()=>sourceFrameForOutput(10608,clock),/outside locked duration/);
});
test('encoded checks reject a missing frame timestamp or altered AAC priming',()=>{
 const pts=[0,1000,2000].map((n,i)=>({best_effort_timestamp:n,best_effort_timestamp_time:(i/60).toFixed(6)}));
 assert.doesNotThrow(()=>validateCfrTimestamps(pts,'1/60000',3));
 assert.throws(()=>validateCfrTimestamps([pts[0],pts[2]],'1/60000',2),/non-CFR PTS/);
 const packets=[{pts:-1600,dts:-1600,duration:1024,size:5,data_hash:'SHA256:example',side_data_list:[{skip_samples:1600}]}];
 assert.doesNotThrow(()=>compareAudioPackets(packets,structuredClone(packets)));
 assert.throws(()=>compareAudioPackets(packets,[{...packets[0],pts:0}]),/changed at packet/);
});
