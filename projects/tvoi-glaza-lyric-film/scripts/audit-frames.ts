import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {parseData} from '../src/schema.ts';
import {activeSource,activeTargets,frameAt,visibleCue} from '../src/focus.ts';
const d=parseData(JSON.parse(readFileSync('src/cues.json','utf8'))),hits=new Map<string,number>(),gaps=[];
let maximumQuantizationMs=0;
for(const cue of d.cues){
 for(let i=0;i<cue.ru.length;i++){
  const w=cue.ru[i]!;const previous=cue.ru[i-1];
  assert.ok(frameAt(w.endSample,d.sampleRate,d.fps)>frameAt(w.startSample,d.sampleRate,d.fps),'Zero-frame word '+w.id);
  if(previous){assert.ok(previous.endSample<=w.startSample,'Overlapping source events '+w.id);if(w.startSample>previous.endSample)gaps.push({after:previous.id,before:w.id,milliseconds:(w.startSample-previous.endSample)/d.sampleRate*1000});}
  for(const s of [w.startSample,w.endSample])maximumQuantizationMs=Math.max(maximumQuantizationMs,Math.abs(frameAt(s,d.sampleRate,d.fps)/d.fps-s/d.sampleRate)*1000);
 }
}
for(let frame=0;frame<d.frames;frame++){
 const visible=visibleCue(d,frame);
 for(const cue of d.cues){const ru=activeSource(cue,frame,d),en=activeTargets(cue,frame,d);
  if(ru.size||en.size)assert.equal(visible?.id,cue.id,'Active word hidden at '+frame);
  for(const id of [...ru,...en])hits.set(id,(hits.get(id)??0)+1);
 }
}
for(const cue of d.cues)for(const word of [...cue.ru,...cue.en])assert.ok((hits.get(word.id)??0)>0,'Word never highlighted '+word.id);
const result={status:'passed',framesChecked:d.frames,sourceWords:d.cues.reduce((n,c)=>n+c.ru.length,0),targetWords:d.cues.reduce((n,c)=>n+c.en.length,0),zeroFrameWords:0,hiddenActiveWords:0,unhighlightedWords:0,sourceOverlaps:0,maximumQuantizationMs,minimumHighlightFrames:Math.min(...hits.values()),interpretation:'Measured gaps in frozen acoustic events are retained; no automatic silence filling or fabricated word timing.',acousticGaps:gaps};
writeFileSync('evidence/frame-audit.json',JSON.stringify(result,null,2));console.log(JSON.stringify({...result,acousticGaps:gaps.length},null,2));
