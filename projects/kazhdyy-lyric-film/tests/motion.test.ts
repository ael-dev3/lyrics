import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {artworkPose} from '../src/motion.ts';
import {barHeight,vocalDrive,spectrumHeights,travelAt,emphasisAt} from '../src/visualizer.ts';
import {motionAt} from '../src/scene.ts';
const bands=JSON.parse(readFileSync('public/science.json','utf8')) as number[][];
test('picture transform is exactly constant for the full recording in both formats',()=>{
 for(const portrait of [true,false])for(let frame=0;frame<12798;frame++)assert.deepEqual(artworkPose(frame,portrait),artworkPose(0,portrait));
});
test('emphasis is confined to the exact requested sections, including boundary frames',()=>{
 for(let f=0;f<12798;f++){
  const t=f/60,e=emphasisAt(f),travel=travelAt(f);
  const medium=(t>=70&&t<88)||(t>=158&&t<175),high=t>=175&&t<190;
  if(!medium&&!high){assert.equal(travel,36);assert.deepEqual(e,{medium:0,high:0});}
  if(medium){assert.equal(e.high,0);assert.ok(travel<=108);}
  if(high)assert.ok(travel<=294);
 }
 assert.equal(travelAt(190*60),36);assert.equal(emphasisAt(175*60).medium,1);assert.equal(emphasisAt(175*60).high,0);
 assert.equal(emphasisAt(175*60+18).high,1);
});
test('vocal emphasis is bounded and never changes the measured band shape',()=>{
 assert.equal(barHeight(-120,294),3);assert.equal(barHeight(0,294),297);
 for(let frame=0;frame<12798;frame++){
  const m=motionAt(frame/60,bands),heights=spectrumHeights(frame,m.values);assert.equal(heights.length,64);assert.ok(vocalDrive(frame)>=0&&vocalDrive(frame)<=1);
  for(const h of heights)assert.ok(Number.isFinite(h)&&h>=3&&h<=297);
 }
});
