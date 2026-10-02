import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
import {validateTimeline,sourceActive,targetActive,visibleCue,type Timeline,type FeatureData,type FramingSpan} from '../src/model.ts';
import {cueLayout,setSceneForProof,response,cueOpacity} from '../src/scene.ts';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const read=<T>(p:string):T=>JSON.parse(readFileSync(resolve(root,p),'utf8')) as T;
const timeline=read<Timeline>('public/timeline.json'),features=read<FeatureData>('public/audio-features.json'),spans=read<FramingSpan[]>('public/portrait-framing.json');
const report:{check:string;status:string;detail:unknown}[]=[];
const pass=(check:string,detail:unknown)=>report.push({check,status:'pass',detail});
validateTimeline(timeline);pass('sample-indexed source and target coverage',{cues:timeline.cues.length,words:timeline.cues.reduce((n,c)=>n+c.words.length,0),targets:timeline.cues.reduce((n,c)=>n+c.targets.length,0)});
const hash=createHash('sha256').update(readFileSync(resolve(root,'public/source.mp4'))).digest('hex');assert.equal(hash,timeline.sourceSha256);assert.equal(hash,features.sourceSha256);pass('locked source identity',hash);
assert.equal(features.rows.length,6503);assert(features.rows.every(r=>r.length===26&&r.every(n=>Number.isInteger(n)&&n>=0&&n<=255)));pass('full soundtrack feature coverage',{rows:features.rows.length,cadence:25});
assert.equal(spans[0]!.start,0);assert(spans.at(-1)!.end>=timeline.sourceDuration-1/44100);for(let i=1;i<spans.length;i++)assert(Math.abs(spans[i]!.start-spans[i-1]!.end)<.00001);assert(spans.filter(s=>s.start>=234).every(s=>s.mode==='wide'));pass('contiguous portrait plan and preserved endcards',{spans:spans.length});
let transitions=0;
for(const cue of timeline.cues)for(const word of cue.words) {
  const start=word.startSample/44100,end=word.endSample/44100;
  assert.equal(sourceActive(word,start-1/44100),false);assert.equal(sourceActive(word,start+1/44100),true);assert.equal(sourceActive(word,end+1/44100),false);
  assert.equal(cueOpacity(cue,start+1/44100),1,`Visible active onset ${word.id}`);assert.equal(cueOpacity(cue,end-1/44100),1,`Visible active release ${word.id}`);
  for(const target of cue.targets)assert.equal(targetActive(target,cue.words,start+1/44100),target.focusSourceIndices.includes(word.sourceIndex));
  transitions++;
}
pass('all source onsets, releases and target focus states',transitions);
const visibility=read<{sourceSha256:string;timingSha256:string;cues:{id:string;holdThroughSample:number;reason:string}[]}>('source/line-visibility.json');
assert.equal(visibility.sourceSha256,hash);
assert.equal(visibility.timingSha256,createHash('sha256').update(readFileSync(resolve(root,'source/timing-candidate.json'))).digest('hex'));
const readingChecks=[];
for(const [index,cue] of timeline.cues.entries()) {
  const reviewed=visibility.cues.find(v=>v.id===cue.id);assert(reviewed?.reason);
  const next=timeline.cues[index+1];
  const requiredHold=Math.min(reviewed.holdThroughSample/44100,next?.start??timeline.sourceDuration);
  assert(cue.fullOpacityEnd>=requiredHold-1/44100,`Sustained line hold ${cue.id}`);
  let samples=0;
  for(let t=cue.end;t<cue.fullOpacityEnd;t+=1/60) {
    assert.equal(visibleCue(timeline,t)?.id,cue.id);assert.equal(cueOpacity(cue,t),1,`Full line at ${t}: ${cue.id}`);samples++;
  }
  if(cue.exitMode==='vocal-handoff' && next) {
    assert.equal(cue.visibleEnd,next.start);assert.equal(next.visibleStart,cue.visibleEnd);
    assert.equal(visibleCue(timeline,next.start-1/44100)?.id,cue.id);
    assert.equal(visibleCue(timeline,next.start)?.id,next.id);assert.equal(cueOpacity(next,next.start),1);
  }
  readingChecks.push({cue:cue.id,wordEnd:cue.end,reviewedHold:reviewed.holdThroughSample/44100,fullOpacityEnd:cue.fullOpacityEnd,clearAt:cue.visibleEnd,mode:cue.exitMode,checkedTailStates:samples});
}
pass('source-bound sustained line holds and uninterrupted vocal handoffs',readingChecks);
GlobalFonts.registerFromPath(resolve(root,'public/fonts/CormorantGaramond-Semibold.ttf'),'Komety');setSceneForProof(timeline,features,spans);
const boxes=[];
for(const format of ['landscape','portrait'] as const) {
  const canvas=createCanvas(format==='landscape'?1920:1080,format==='landscape'?796:1920);const ctx=canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
  for(const cue of timeline.cues) {
    const l=cueLayout(ctx,cue,format);const all=[...l.source,...l.target];
    assert(all.every(w=>w.x>=70&&w.x+w.width<=canvas.width-70),`Horizontal clearance ${format}:${cue.id}`);
    assert(l.top>100&&l.bottom<canvas.height-(format==='landscape'&&cue.start>=234?8:70),`Vertical clearance ${format}:${cue.id}`);
    assert.equal(l.source.length,cue.words.length);assert.equal(l.target.length,cue.targets.length);
    ctx.font=`600 ${l.size}px Komety`;
    if(cue.start<234) {
      const glyphBottom=Math.max(...all.map(w=>w.y+ctx.measureText(w.text).actualBoundingBoxDescent));
      const ribbonHighest=format==='landscape'?760-8-42*1.15-42*.18:1780-8-76*1.15-76*.18;
      assert(ribbonHighest-glyphBottom>=20,`Reserved peak spectrum/letter gap ${format}:${cue.id}`);
    }
    if(format==='landscape'&&cue.start>=234) {
      assert(Math.min(...all.map(w=>w.y-ctx.measureText(w.text).actualBoundingBoxAscent))>=695,'Late caption avoids original Film Gods lettering');
      assert(Math.max(...all.map(w=>w.y+ctx.measureText(w.text).actualBoundingBoxDescent))<=791,'Late caption descenders inside source frame');
    }
    const highest=Math.max(...all.map(w=>w.y));assert(highest<(format==='portrait'?1660:cue.start>=234?788:720));
    boxes.push({format,cue:cue.id,size:l.size,top:l.top,bottom:l.bottom,sourceRows:new Set(l.source.map(w=>w.y)).size,targetRows:new Set(l.target.map(w=>w.y)).size});
  }
}
pass('equal face/size and complete reserved bilingual geometry',boxes);
const quiet=response(Array(26).fill(0));assert.equal(quiet.level,0);assert(quiet.bands.every(b=>b===0));
const soft=response([190,20,...Array(24).fill(185)]),loud=response([241,90,...Array(24).fill(221)]);assert(loud.level>soft.level+.25);pass('quiet gate and unsaturated musical headroom',{soft:soft.level,loud:loud.level});
const gate=spawnSync(process.execPath,['scripts/render-production.ts','--check-gate'],{cwd:root,encoding:'utf8'});
const accepted=existsSync(resolve(root,'evidence/sync-review.json'))&&existsSync(resolve(root,'evidence/production-authorization.json'));
if(accepted){assert.equal(gate.status,0,gate.stderr);pass('read-only production gate check','current input-bound review and authorization accepted; no capture launched');}
else{assert.notEqual(gate.status,0);assert.match(gate.stderr,/Production blocked/);pass('read-only production gate refuses before any capture','review/authorization absent');}
mkdirSync(resolve(root,'evidence'),{recursive:true});writeFileSync(resolve(root,'evidence/technical-checks.json'),JSON.stringify({status:'passed',scope:'technical validation; listening acceptance is recorded separately in input-bound review evidence',checks:report},null,2)+'\n');console.log(`${report.length} technical groups passed; ${transitions} word events checked in both language lanes.`);
