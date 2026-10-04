import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateTimeline,sourceActive,targetActive,visibleCue,type Timeline} from '../src/model.ts';
import {cueOpacity} from '../src/scene.ts';
import {checkCurrentProductionGate,assertRequiredPreviewInputs} from './render-gate.ts';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
const timeline=read('public/timeline.json') as Timeline;validateTimeline(timeline);
const binding=read('evidence/preview-inputs.json');
assertRequiredPreviewInputs(binding);
for(const [path,digest] of Object.entries(binding.inputs))if(hash(path)!==digest)throw Error(`Stale preview binding: ${path}`);
const frames=Math.ceil(timeline.sourceDuration*60);let checks=0,focusFrames=0;
for(let frame=0;frame<frames;frame++){
  const sample=frame*735,time=sample/44100;
  for(const cue of timeline.cues){
    if(cue.words.some(w=>sample>=w.startSample&&sample<w.endSample)){
      if(visibleCue(timeline,time)?.id!==cue.id||cueOpacity(cue,time)!==1)throw Error(`Hidden active voice ${frame}/${cue.id}`);focusFrames++;
    }
    for(const target of cue.targets){
      const expected=target.focusSourceIndices.some(i=>sample>=cue.words[i]!.startSample&&sample<cue.words[i]!.endSample);
      if(expected!==targetActive(target,cue.words,time))throw Error(`Wrong semantic focus ${frame}/${target.id}`);checks++;
    }
  }
}
for(const cue of timeline.cues)for(const w of cue.words){
  if(sourceActive(w,(w.startSample-.5)/44100)||!sourceActive(w,(w.startSample+.5)/44100)||sourceActive(w,(w.endSample+.5)/44100))throw Error(`Incorrect source boundary ${w.id}`);
}
let gate='authorized for the current reviewed revision';try{checkCurrentProductionGate()}catch(e){if(!(e instanceof Error)||e.message!=='Preview-only: current song has no render approval')throw e;gate=e.message}
console.log(JSON.stringify({revision:timeline.revision,cues:timeline.cues.length,sourceWords:timeline.cues.reduce((n,c)=>n+c.words.length,0),semanticFrameChecks:checks,focusFrames,productionGate:gate}));
