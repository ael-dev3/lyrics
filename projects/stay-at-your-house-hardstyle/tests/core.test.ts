import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseFrame} from '../src/frame-deck.ts';
import edit from '../source/trailer-edit.json' with {type:'json'};

test('choose a decoded picture at or before the soundtrack, including gaps and unordered arrivals',()=>{
 const frames=[{time:2/60,id:2},{time:0,id:0},{time:1/60,id:1},{time:4/60,id:4}];
 assert.equal(chooseFrame(frames,-.01),undefined);
 assert.equal(chooseFrame(frames,0)?.id,0);
 assert.equal(chooseFrame(frames,.025)?.id,1);
 assert.equal(chooseFrame(frames,3/60)?.id,2);
 assert.equal(chooseFrame(frames,4/60)?.id,4);
 assert.equal(chooseFrame([],1),undefined);
});

test('cuts and action anchors stay on measured quarter/eighth notes inside valid footage',()=>{
 for(const m of edit.montages)for(const s of m.shots){
  const cut=m.songStart+s.startFrame/60;
  assert.ok(Math.abs((cut-.35)/.4-Math.round((cut-.35)/.4))<1e-6);
  assert.ok(s.sourceFirstFrame>=s.sourceIn&&s.sourceFirstFrame<s.sourceOut);
  const accents='accents' in s?s.accents:('accent' in s&&s.accent?[s.accent]:[]);
  let previousSource=s.sourceFirstFrame,previousFrame=0;
  for(const a of accents){
   assert.ok(a.sourceTime>previousSource&&a.sourceTime<s.sourceOut);
   assert.ok(a.frame>previousFrame&&a.frame<s.frames);
   assert.equal(a.frame%12,0,'quarter- or eighth-note movement accent');
   previousSource=a.sourceTime;previousFrame=a.frame;
  }
 }
});

test('paused and overlapping seeks can capture native frame timestamps without a compositor callback',async()=>{
 const {FrameDeck}=await import('../src/frame-deck.ts');
 const original=Object.getOwnPropertyDescriptor(globalThis,'VideoFrame');
 class FakeVideo extends EventTarget{
  readyState=4;videoWidth=1920;videoHeight=1080;duration=26.8;seeking=false;paused=true;ended=false;playbackRate=1;private clock=0;
  get currentTime(){return this.clock;}
  set currentTime(t:number){this.clock=t;this.seeking=true;queueMicrotask(()=>{this.seeking=false;this.dispatchEvent(new Event('seeked'));});}
  pause(){this.paused=true;}
  requestVideoFrameCallback(){return 1;}cancelVideoFrameCallback(){}
 }
 class FakeFrame{timestamp:number;constructor(v:FakeVideo){this.timestamp=Math.round(Math.floor(v.currentTime*60)/60*1e6);}close(){}}
 Object.defineProperty(globalThis,'VideoFrame',{configurable:true,value:FakeFrame});
 try{
  const video=new FakeVideo(),deck=new FrameDeck(video as unknown as HTMLVideoElement,()=>{});
  await deck.prime(.109,false);
  assert.ok(Math.abs(deck.picture(.109)!.time-.1)<1e-6,'use native frame PTS, not requested seek time');
  await Promise.all([deck.prime(2,false),deck.prime(0,false)]);
  assert.equal(deck.picture(0)!.time,0);
  deck.clear();
 }finally{if(original)Object.defineProperty(globalThis,'VideoFrame',original);else Reflect.deleteProperty(globalThis,'VideoFrame');}
});

// Different imagery must survive future timing edits and refactors.
test('the second edit contains no recycled source ranges or repeated shots',()=>{
 const [first,second]=edit.montages;
 assert.equal(new Set(second!.shots.map(s=>s.name)).size,second!.shots.length);
 const overlap=(a:{sourceIn:number;sourceOut:number},b:{sourceIn:number;sourceOut:number})=>Math.max(0,Math.min(a.sourceOut,b.sourceOut)-Math.max(a.sourceIn,b.sourceIn));
 for(const [i,s] of second!.shots.entries()){
  for(const prior of first!.shots)assert.equal(overlap(s,prior),0,s.name+' repeats the first edit');
  for(const prior of second!.shots.slice(0,i))assert.equal(overlap(s,prior),0,s.name+' repeats within the second edit');
 }
});


test('playback onset audit measures late pictures once and excludes events before a seek',async()=>{
 const {PlaybackAudit}=await import('../src/playback-audit.ts');
 const audit=new PlaybackAudit([{id:'cut',time:10,montage:'one',kind:'cut'},{id:'hit',time:10.4,montage:'one',kind:'action'}]);
 audit.begin(9.9);audit.sample(10.01,9.99,'one');assert.equal(audit.observations.length,0);
 audit.sample(10.02,10,'one');audit.sample(10.03,10,'one');
 assert.equal(audit.observations.length,1);assert.ok(Math.abs(audit.observations[0]!.delayMs-20)<1e-6);
 audit.begin(10.2);audit.sample(10.401,10.4,'one');
 assert.deepEqual(audit.observations.map(x=>x.id),['hit']);
 audit.begin(10.5);audit.sample(10.6,10.6,'one');assert.equal(audit.observations.length,0);
});

test('raw frame input handles arbitrary pipe chunks and rejects a truncated final frame',async()=>{
 const {Readable}=await import('node:stream');const {rawFrames}=await import('../scripts/frame-io.ts');
 const frames=[];for await(const frame of rawFrames(Readable.from([Buffer.from([1]),Buffer.from([2,3,4,5]),Buffer.from([6])]),3))frames.push([...frame]);
 assert.deepEqual(frames,[[1,2,3],[4,5,6]]);
 await assert.rejects(async()=>{for await(const frame of rawFrames(Readable.from([Buffer.from([1,2,3,4])]),3))void frame;},/Truncated/);
});
