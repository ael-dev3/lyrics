import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
import {parseTimeline,cueAt,cueSlots} from '../src/model.ts';
import {SHOTS} from '../src/shots.ts';
import {layoutCue,geometry,shotAt} from '../src/scene.ts';
const timeline=parseTimeline(JSON.parse(readFileSync(new URL('../public/timeline.json',import.meta.url),'utf8')));
const font=new URL('../public/fonts/SpaceGrotesk.ttf',import.meta.url);
assert.ok(GlobalFonts.registerFromPath(font.pathname,'SpaceGrotesk'));
// Only the standards-compatible font-measurement surface crosses engines here.
// Actual moving-picture and font rasterization are checked in the browser.
const ctx=createCanvas(1920,1080).getContext('2d') as unknown as CanvasRenderingContext2D;
test('All reviewed shot hosts fit every visible cue in both source-video compositions',()=>{
 const times=new Set<number>();
 for(const q of timeline.cues){times.add(q.start);times.add((q.start+q.end)/2);times.add(q.end-1/44100);}
 for(const s of SHOTS){times.add(s.start+.001);times.add(s.end-.001);}
 let samples=0;
 for(const t of times){const cue=cueAt(timeline,t);if(!cue)continue;for(const format of ['landscape','portrait'] as const){
  const shot=shotAt(t),g=geometry(format,shot),layout=layoutCue(ctx,cue,format,shot);
  assert.equal(layout.length,cueSlots(cue).length);
  for(const p of layout){assert.ok(p.x>=g.reading.x-.01&&p.x+p.width<=g.reading.x+g.reading.w+.01,`${cue.id}/${shot.id}: horizontal overflow`);assert.ok(p.y-p.size*.85>=g.reading.y-1&&p.y<=g.reading.y+g.reading.h+1,`${cue.id}/${shot.id}: vertical overflow`);assert.ok(p.size>=34,`${cue.id}: excessively small words`);}
  samples++;
 }}
 assert.ok(samples>100);
});
test('Source shot map is contiguous and every environmental region stays inside the source',()=>{
 assert.equal(SHOTS[0]?.start,0);assert.ok(Math.abs((SHOTS.at(-1)?.end??0)-timeline.duration)<.0001);
 for(let i=0;i<SHOTS.length;i++){const s=SHOTS[i];assert.ok(s);assert.ok(s.end>s.start);if(i)assert.equal(SHOTS[i-1]?.end,s.start);for(const r of s.regions){assert.ok(r.polygon.length>=3);for(const [x,y]of r.polygon)assert.ok(x>=0&&x<=1&&y>=0&&y<=1);}}
});
test('Spectrum position and dimensions remain fixed through every source shot in each format',()=>{
 const first=SHOTS[0];assert.ok(first);
 for(const format of ['landscape','portrait'] as const){
  const initial=geometry(format,first),reference=initial.spectrum;
  const bloom=format==='landscape'?18:21;
  assert.ok(reference.y>initial.h*.70,'Spectrum must remain in the lower screen region, clear of the source credit');
  assert.ok(reference.x-bloom>=0&&reference.x+reference.w+bloom<=initial.w,'Spectrum bloom exceeds the frame horizontally');
  assert.ok(reference.y-bloom>=0&&reference.y+reference.h+bloom<=initial.h,'Spectrum bloom exceeds the frame vertically');
  for(const shot of SHOTS){
   const g=geometry(format,shot);
   assert.deepEqual(g.spectrum,reference,`${format}/${shot.id}: source edit relocated or resized the spectrum`);
   assert.ok(g.reading.y>=0&&g.reading.y+g.reading.h<reference.y,`${format}/${shot.id}: lyric host intersects fixed spectrum`);
  }
 }
});
test('Visible glyphs retain a clear gutter after lyric and spectrum bloom are allowed for',()=>{
 const times=new Set<number>();
 for(const q of timeline.cues){times.add(Math.max(0,q.start-.219));times.add(q.start);times.add((q.start+q.end)/2);times.add(q.end-1/44100);times.add(Math.min(timeline.duration,q.end+.299));}
 for(const shot of SHOTS){times.add(shot.start+.001);times.add(shot.end-.001);}
 let samples=0;
 for(const time of times){
  const cue=cueAt(timeline,time);if(!cue)continue;
  for(const format of ['landscape','portrait'] as const){
   const shot=shotAt(time),g=geometry(format,shot),spectrumBloom=format==='landscape'?18:21;
   const placements:ReturnType<typeof layoutCue>=layoutCue(ctx,cue,format,shot);
   for(const word of placements){
    ctx.font=`700 ${word.size}px SpaceGrotesk`;
    const metrics=ctx.measureText(word.text.toUpperCase());
    // Use actual font descenders rather than assuming the baseline is the ink
    // bottom. These are explicit visual-clearance budgets, not blur-kernel proof.
    const glyphBottom:number=word.y+metrics.actualBoundingBoxDescent;
    const letteringBloom=25,clearGutter:number=g.spectrum.y-spectrumBloom-glyphBottom-letteringBloom;
    assert.ok(clearGutter>=8,`${format}/${shot.id}/${cue.id}/${word.text}: bloom clearance ${clearGutter.toFixed(2)}px is below8px`);
   }
   samples++;
  }
 }
 assert.ok(samples>100,'Clearance audit did not cover the real cue/shot combinations');
});
