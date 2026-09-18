import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseData} from '../src/schema.ts';
import {lunarState,titleOpacity} from '../src/lunar-motion.ts';
const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8')));
const motion=JSON.parse(readFileSync('public/lunar-motion.json','utf8')) as {vocal:number[];events:{time:number;strength:number}[]};
test('Instrumental gestures leave lexical passages and their tails clear',()=>{
 assert.equal(motion.vocal.length,data.frames);
 for(const event of motion.events){
  assert.ok(event.strength>=0&&event.strength<=1);
  for(const c of data.cues){const start=c.startSample/data.sampleRate,end=c.endSample/data.sampleRate;assert.ok(event.time<start-.8||event.time>end+.8);}
 }
 for(const c of data.cues)for(let f=Math.ceil(c.startSample/data.sampleRate*60);f<=Math.floor(c.endSample/data.sampleRate*60);f++)assert.equal(lunarState(f,data).ripple.opacity,0);
});
test('Titles remain hidden throughout both lyric passages, including short line gaps',()=>{
 for(const [first,last] of [[0,6],[7,13]]){
  const start=data.cues[first!]!.visibleFrom/data.sampleRate,end=data.cues[last!]!.visibleUntil/data.sampleRate;
  for(let f=Math.ceil(start*60);f<=Math.floor(end*60);f++)assert.equal(titleOpacity(f,data),0);
 }
});
test('Moon reveal completes at the first vocal and scene closes without a periodic reset',()=>{
 const first=Math.ceil(data.cues[0]!.startSample/data.sampleRate*60);
 let previous=0;
 for(let f=0;f<data.frames;f++){
  const state=lunarState(f,data);
  assert.ok(state.reveal>=previous);previous=state.reveal;
  assert.ok(state.moonOpacity>=.78&&state.moonOpacity<=.95+1e-12);
  if(f>=first)assert.equal(state.reveal,1);
 }
 assert.ok(lunarState(data.frames-1,data).fade<.0001);
});
