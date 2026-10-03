import assert from 'node:assert/strict';
import test from 'node:test';
import {mkdtempSync,readFileSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {compareAudioPackets,compareBlack,comparePicturePresence,fastStart,outputFrameCount,validateCfrTimestamps,type Manifest} from '../scripts/verify-final.ts';
import {decodedSceneParity,independentFrameTime,independentOpacity,selectedFrames,sourcePictureIndex} from '../scripts/verify-decoded-scene.ts';
import type {Timeline} from '../src/model.ts';
const manifest=JSON.parse(readFileSync(new URL('../source/manifest.json',import.meta.url),'utf8')) as Manifest;
const timeline=JSON.parse(readFileSync(new URL('../public/timeline.json',import.meta.url),'utf8')) as Timeline;

test('delivered cadence rejects a delayed start, duplicate, missing or reordered decoded frame',()=>{
  const rows=Array.from({length:8},(_,n)=>({best_effort_timestamp:n*1000,best_effort_timestamp_time:(n/60).toFixed(6)}));
  validateCfrTimestamps(rows,'1/60000',8);
  const shifted=structuredClone(rows);shifted[0]!.best_effort_timestamp=1000;
  assert.throws(()=>validateCfrTimestamps(shifted,'1/60000',8),/non-CFR PTS/);
  const duplicated=structuredClone(rows);duplicated[4]!.best_effort_timestamp=3000;
  assert.throws(()=>validateCfrTimestamps(duplicated,'1/60000',8),/non-CFR PTS/);
  assert.throws(()=>validateCfrTimestamps(rows.slice(1),'1/60000',8),/decoded frame count/);
  const reorder=structuredClone(rows);[reorder[3],reorder[4]]=[reorder[4]!,reorder[3]!];
  assert.throws(()=>validateCfrTimestamps(reorder,'1/60000',8),/non-CFR PTS/);
  const seconds=structuredClone(rows);seconds[4]!.best_effort_timestamp_time='0.070000';
  assert.throws(()=>validateCfrTimestamps(seconds,'1/60000',8),/timestamp disagreement/);
});

test('AAC stream copy audit rejects lost 1600-sample priming, changed payload or packet sequence',()=>{
  const first={pts:-1600,dts:-1600,duration:1024,size:'396',data_hash:'SHA256:'+'a'.repeat(64),side_data_list:[{side_data_type:'Skip Samples',skip_samples:1600,discard_padding:0,skip_reason:0,discard_reason:0}]};
  const rows=[first,{pts:-576,dts:-576,duration:1024,size:'22',data_hash:'SHA256:'+'b'.repeat(64)}];
  compareAudioPackets(rows,structuredClone(rows));
  const priming=structuredClone(rows);(priming[0] as typeof first).side_data_list[0]!.skip_samples=1024;
  assert.throws(()=>compareAudioPackets(rows,priming),/side data changed/);
  const payload=structuredClone(rows);payload[1]!.data_hash='SHA256:'+'c'.repeat(64);
  assert.throws(()=>compareAudioPackets(rows,payload),/payload\/PTS/);
  assert.throws(()=>compareAudioPackets(rows,[rows[1]!,rows[0]!]),/changed at packet 0/);
  assert.throws(()=>compareAudioPackets(rows,rows.slice(0,1)),/packet count/);
});

test('authored black interval cannot authorize an unrelated blank ending or a long extra blackout',()=>{
  const source={intervals:[{start:100,end:101}],finalPictureBlack:false,boundaryEvents:2};
  const output={intervals:[{start:100,end:101.03}],finalPictureBlack:false,boundaryEvents:2};
  compareBlack(source,output,manifest,12530);
  assert.throws(()=>compareBlack(source,{...output,intervals:[{start:100,end:101.2}]},manifest,12530),/New black-picture interval/);
  assert.throws(()=>compareBlack(source,{...output,intervals:[{start:208.75,end:208.816667}]},manifest,12530),/New black-picture interval/);
  const authoredEnding={intervals:[{start:208.7,end:208.8}],finalPictureBlack:true,boundaryEvents:1};
  compareBlack(authoredEnding,{...authoredEnding,intervals:[{start:208.7,end:208.816667}]},manifest,12530);
  assert.throws(()=>compareBlack({intervals:[],finalPictureBlack:false,boundaryEvents:0},authoredEnding,manifest,12530),/New black-picture interval/);
});

test('source-picture presence checks every frame and rejects a one-frame missing or displaced picture',()=>{
  const original=Array.from({length:5220},(_,j)=>j%2?190:185);
  const delivered=Array.from({length:12530},(_,n)=>original[Math.min(5219,Math.floor(n*5/12))]!+1);
  comparePicturePresence(original,delivered,12530);
  const blank=delivered.slice();blank[12345]=16;
  assert.throws(()=>comparePicturePresence(original,blank,12530),/output frame 12345/);
  const shifted=delivered.slice();shifted[0]=150;
  assert.throws(()=>comparePicturePresence(original,shifted,12530),/output frame 0/);
  assert.throws(()=>comparePicturePresence(original,delivered.slice(0,-1),12530),/ROI frame count/);
});

test('MP4 atom inventory rejects slow-start and truncated containers while handling 64-bit atoms',async()=>{
  const directory=mkdtempSync(join(tmpdir(),'kamushku-mp4-atoms-'));
  const atom=(type:string,payload=Buffer.alloc(0),wide=false)=>{const header=Buffer.alloc(wide?16:8);header.writeUInt32BE(wide?1:header.length+payload.length);header.write(type,4,'ascii');if(wide)header.writeBigUInt64BE(BigInt(header.length+payload.length),8);return Buffer.concat([header,payload]);};
  try{
    const fast=join(directory,'fast.mp4');writeFileSync(fast,Buffer.concat([atom('ftyp'),atom('moov',Buffer.alloc(8),true),atom('mdat',Buffer.alloc(16))]));
    assert.equal((await fastStart(fast)).fastStart,true);
    const slow=join(directory,'slow.mp4');writeFileSync(slow,Buffer.concat([atom('ftyp'),atom('mdat',Buffer.alloc(16)),atom('moov')]));
    await assert.rejects(fastStart(slow),/moov must precede/);
    const broken=join(directory,'broken.mp4');writeFileSync(broken,Buffer.concat([atom('moov'),Buffer.from([0,0,0])]));
    await assert.rejects(fastStart(broken),/Truncated MP4 atom header/);
  }finally{rmSync(directory,{recursive:true,force:true});}
});

test('integer decoded extent requires 12530 frames, keeps all four final-picture holds and every focus boundary',()=>{
  assert.equal(outputFrameCount(manifest),12530);
  assert.notEqual(manifest.audio.containerDurationSeconds,manifest.audio.decodedDurationSeconds);
  const frames=new Set(selectedFrames(timeline,manifest));
  for(const n of [12526,12527,12528,12529]){assert.ok(frames.has(n));assert.equal(sourcePictureIndex(n),5219);}
  for(const cue of timeline.cues)for(const word of cue.words){
    const first=Math.ceil(word.startSample/735),off=Math.ceil(word.endSample/735);
    for(const n of [first-1,first,off-1,off])assert.ok(frames.has(n),`${word.id} boundary frame ${n} omitted`);
  }
  for(let n=0;n<12530;n++){
    const t=independentFrameTime(n);
    assert.ok(t*44100>=n*735);
    assert.ok(t-n/60<1e-12,'Normalization changed the intended frame time');
    assert.equal(sourcePictureIndex(n),Math.min(5219,Math.floor(n*5/12)));
  }
});

test('incoming vocal handoffs are opaque and final reading holds remain neutral after acoustic release',()=>{
  for(const cue of timeline.cues){
    const first=cue.words[0]!;
    assert.equal(independentOpacity(cue,first.startSample/44100),1,`${cue.id} first voiced glyph hidden`);
    if(cue.visibleStart>=cue.start-.012)assert.equal(independentOpacity(cue,cue.visibleStart),1);
    assert.equal(independentOpacity(cue,cue.visibleEnd),0);
    assert.equal(independentOpacity(cue,cue.visibleStart-1e-6),0);
  }
  const last=timeline.cues.at(-1)!;
  assert.ok(201.2>last.words.at(-1)!.endSample/44100);
  assert.equal(independentOpacity(last,201.2),1);
});

test('decoded whole-scene parity accepts bounded compression but rejects missing source and prominent geometry changes',()=>{
  const expected=Buffer.alloc(400*4,180),mild=Buffer.alloc(400*4,183);
  assert.equal(decodedSceneParity(expected,mild).meanAbsoluteRgbError,3);
  const blank=Buffer.alloc(400*4,0);
  assert.throws(()=>decodedSceneParity(expected,blank),/scene parity failed/);
  const displaced=Buffer.from(expected);displaced.fill(0,0,Math.floor(displaced.length*.2));
  assert.throws(()=>decodedSceneParity(expected,displaced),/scene parity failed/);
});
