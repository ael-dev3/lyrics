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

test('cuts and selected motion anchors stay on quarter notes inside valid footage',()=>{
 for(const m of edit.montages)for(const s of m.shots){
  const cut=m.songStart+s.startFrame/60;
  assert.ok(Math.abs((cut-.35)/.4-Math.round((cut-.35)/.4))<1e-6);
  assert.ok(s.sourceFirstFrame>=s.sourceIn&&s.sourceFirstFrame<s.sourceOut);
  if('accent' in s&&s.accent){
   assert.ok(s.accent.sourceTime>s.sourceFirstFrame&&s.accent.sourceTime<s.sourceOut);
   assert.ok(s.accent.frame>0&&s.accent.frame<s.frames);
   assert.equal(s.accent.frame%24,0);
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
