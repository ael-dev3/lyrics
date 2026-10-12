import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {readingWindow,validateTimeline,type Timeline,type Cue} from '../src/model.ts';
const root=new URL('../',import.meta.url),read=(p:string)=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const selected=read('source/selected-boundaries.json'),editorial=read('source/editorial-templates.json'),recording=read('source/recording.json');
assert.equal(selected.sourceSha256,recording.sourceSha256);
const cues:Cue[]=[],ledger:unknown[]=[];let id=0;
for(const group of editorial.sequence){
 const events=selected.phrases[group.phrase];let offset=0;
 for(const templateId of group.templates){
  const t=editorial.entries.find((v:any)=>v.id===templateId),slice=events.slice(offset,offset+t.sourceUnits.length);assert.equal(slice.length,t.sourceUnits.length);offset+=slice.length;
  const cueId=`WOLF-${(++id).toString().padStart(3,'0')}`;
  const words=slice.map((event:any,i:number)=>({id:`${cueId}-W${(i+1).toString().padStart(2,'0')}`,text:t.sourceUnits[i],sourceIndex:i,startSample:event.startSample,endSample:event.endSample,confidence:'diagnostic-supported preview selection; listener review pending',method:event.method}));
  const targets=t.targets.map((target:any,i:number)=>({id:`${cueId}-E${(i+1).toString().padStart(2,'0')}`,...target}));
  const start=words[0].startSample/44100,end=words.at(-1).endSample/44100;
  cues.push({id:cueId,templateId,lane:'lead',voice:'main supplied-transcript vocal',sourceLanguage:'ru',targetLanguage:'en',sourceText:t.sourceText,targetText:targets.map((w:any)=>w.text+(w.punctuationAfter??'')).join(' '),start,end,...readingWindow(start,end,recording.duration),words,targets,sourceBreaks:[],targetBreaks:[]});
  ledger.push({cueId,templateId,sourceText:t.sourceText,targetText:cues.at(-1)!.targetText,sourceEvents:words,targets});
 }
 assert.equal(offset,events.length,`Unconsumed selected events ${group.phrase}`);
}
for(let i=0;i<cues.length;i++){
 const c=cues[i]!,next=cues[i+1],prior=cues[i-1],hold=c.end+(c.templateId==='finalrace'?.24:.14);
 Object.assign(c,readingWindow(c.start,c.end,recording.duration,prior?.visibleEnd,next?.start,hold));
}
const timeline:Timeline={schemaVersion:1,revision:selected.revision,sampleRate:44100,sourceSha256:recording.sourceSha256,sourceDuration:recording.duration,cues};
validateTimeline(timeline);assert.ok(cues[0]!.start>=11.9);assert.ok(cues.at(-1)!.end>255.5&&cues.at(-1)!.end<255.8);
writeFileSync(new URL('public/timeline.json',root),JSON.stringify(timeline,null,2)+'\n');
writeFileSync(new URL('source/correspondence-ledger.json',root),JSON.stringify({schemaVersion:1,revision:timeline.revision,sourceSha256:timeline.sourceSha256,semantics:'Natural English order; every grammatical completion follows the smallest actual source meaning. No invented English acoustic times.',ledger},null,2)+'\n');
console.log(JSON.stringify({revision:timeline.revision,cues:cues.length,sourceWords:cues.reduce((n,c)=>n+c.words.length,0),targetTokens:cues.reduce((n,c)=>n+c.targets.length,0),firstVocal:cues[0]!.start,lastLexicalEnd:cues.at(-1)!.end}));
