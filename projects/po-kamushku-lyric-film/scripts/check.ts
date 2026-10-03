import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {validateTimeline,sourceActive,targetActive,type Timeline} from '../src/model.ts';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
const timeline=read('public/timeline.json') as Timeline;validateTimeline(timeline);
const frozen=read('evidence/preview-inputs.json');
for(const [path,digest] of Object.entries(frozen.inputs))if(hash(path)!==digest)throw Error(`Stale preview binding: ${path}`);
const frames=Math.ceil(timeline.sourceDuration*60);let checks=0;
for(let frame=0;frame<frames;frame++){
  const sample=frame*735,time=sample/44100;
  for(const cue of timeline.cues){
    for(const target of cue.targets){
      const expected=target.focusSourceIndices.some(i=>sample>=cue.words[i]!.startSample&&sample<cue.words[i]!.endSample);
      // Independent rational-frame oracle includes exact integer boundaries.
      if(expected!==targetActive(target,cue.words,time))throw Error(`Wrong semantic focus ${frame}/${target.id}`);
      checks++;
    }
  }
}
const input=read('source/manifest.json');if(input.sha256!==timeline.sourceSha256||hash('public/source.mp4')!==input.sha256)throw Error('Wrong recording');
for(const c of timeline.cues)for(const w of c.words){
  if(sourceActive(w,(w.startSample-.5)/44100)||!sourceActive(w,(w.startSample+.5)/44100)||sourceActive(w,(w.endSample+.5)/44100))throw Error(`Invalid exclusive boundary ${w.id}`);
}
console.log(JSON.stringify({cueCount:timeline.cues.length,frames,semanticFrameChecks:checks,revision:timeline.revision,productionAuthorized:false}));
