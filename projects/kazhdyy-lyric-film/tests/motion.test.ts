import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {artworkPose,impactAt,impactEvents} from '../src/motion.ts';
test('one measured hit reaches its apex on the matching video frame',()=>{
 for(const e of impactEvents){
  const isolated=[e];assert.equal(impactAt(e.frame,isolated),e.weight);
  assert.equal(impactAt(e.frame-1,isolated),0);assert.equal(impactAt(e.frame+11,isolated),0);
  for(let f=e.frame+1;f<e.frame+11;f++)assert.ok(impactAt(f,isolated)<e.weight);
  assert.ok(Math.abs(e.frame/60-e.time)<=1/120+1e-10);
 }
});
test('no free-running movement or added decoration when no hit is active',()=>{
 for(const portrait of [true,false])assert.deepEqual(artworkPose(60,portrait),artworkPose(120,portrait));
 const scene=readFileSync('src/scene.ts','utf8');assert.doesNotMatch(scene,/Math\.sin|Math\.cos|rotate\(|<ellipse|const eye=|const threads=/);
 assert.match(scene,/artInk=p\.ink,artPaper=p\.ivory/);
});
test('picture movement is bounded and preserves the visual anchor',()=>{
 for(const portrait of [true,false])for(let frame=0;frame<12798;frame++){
  const p=artworkPose(frame,portrait),base=portrait?1.06:1.10;
  assert.ok(p.scale>=base&&p.scale<=base+.012001);
  assert.ok(Math.abs(p.x+500*p.scale-(portrait?1080:910)*.48)<1e-8);
  assert.ok(Math.abs(p.y+500*p.scale-(portrait?630:550))<1e-8);
 }
});
