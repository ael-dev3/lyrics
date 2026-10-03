import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readingWindow,validateTimeline, type Cue, type Timeline, type Target, type Word} from '../src/model.ts';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const read=(p:string)=>JSON.parse(readFileSync(resolve(root,p),'utf8'));
interface Template {id:string;sourceLanguage:string;targetLanguage:string;sourceText:string;targetText:string;sourceTokens:{index:number;id:string;text:string;punctuationAfter?:string}[];targetTokens:Target[];sourceLineBreaksAfterIndices:number[];targetLineBreaksAfterIndices:number[];}
interface Candidate {id:string;templateId:string;start:number;end:number;words:{sourceIndex:number;text:string;startSample:number;endSample:number;confidence?:number|string;method?:string}[];}
interface VisibilityPlan {schemaVersion:number;sourceSha256:string;timingSha256:string;sampleRate:number;cues:{id:string;holdThroughSample:number;reason:string}[];}
const editorial=read('source/lyrics-editorial.json') as {templates:Template[]};
const acoustic=read('source/timing-candidate.json') as {sampleRate:number;sourceClockOffset:number;sourceSha256:string;editorialSha256:string;onsetReview:{revision:string};cues:Candidate[]};
const manifest=read('source/manifest.json');
const visibility=read('source/line-visibility.json') as VisibilityPlan;
if(acoustic.sampleRate!==44100 || acoustic.sourceClockOffset!==0)throw Error('Expected original source sample clock');
if(acoustic.sourceSha256!==manifest.sha256)throw Error('Timing candidate belongs to a different source');
if(acoustic.editorialSha256!==createHash('sha256').update(readFileSync(resolve(root,'source/lyrics-editorial.json'))).digest('hex'))throw Error('Timing candidate uses stale lyrics/meaning mapping');
if(visibility.schemaVersion!==1 || visibility.sampleRate!==44100 || visibility.sourceSha256!==manifest.sha256 || visibility.timingSha256!==createHash('sha256').update(readFileSync(resolve(root,'source/timing-candidate.json'))).digest('hex'))throw Error('Line visibility review uses stale source/timing');
if(visibility.cues.length!==acoustic.cues.length || new Set(visibility.cues.map(c=>c.id)).size!==acoustic.cues.length)throw Error('Incomplete line visibility review');
const cues:Cue[]=[];
for(const [i,candidate] of acoustic.cues.entries()) {
  const template=editorial.templates.find(t=>t.id===candidate.templateId);
  if(!template || template.sourceTokens.length!==candidate.words.length)throw Error(`Text/timing coverage mismatch ${candidate.id}`);
  const words:Word[]=candidate.words.map((w,index)=>{
    if(w.sourceIndex!==index)throw Error(`Word index mismatch ${candidate.id}`);
    const token=template.sourceTokens[index]!;
    const normalize=(s:string)=>s.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu,'').replaceAll('ё','е');
    if(normalize(token.text)!==normalize(w.text))throw Error(`Word mismatch ${candidate.id}:${token.text} / ${w.text}`);
    return {id:`${candidate.id}:${token.id}`,text:token.text,...(token.punctuationAfter?{punctuationAfter:token.punctuationAfter.trim()}:{}),sourceIndex:index,startSample:w.startSample,endSample:w.endSample,confidence:w.confidence??0,method:w.method??'bounded-model-candidate'};
  });
  const start=words[0]!.startSample/44100,end=words.at(-1)!.endSample/44100;
  const next=acoustic.cues[i+1];
  const hold=visibility.cues.find(c=>c.id===candidate.id);
  if(!hold || !hold.reason || !Number.isSafeInteger(hold.holdThroughSample) || hold.holdThroughSample<words.at(-1)!.endSample)throw Error(`Missing sustained line review ${candidate.id}`);
  // Derive neighboring vocal bounds from sample events, not cue metadata.
  // Previous *presentation* clear time controls the incoming reading window.
  const window=readingWindow(start,end,manifest.audio.decodedDurationSeconds,cues.at(-1)?.visibleEnd,next?next.words[0]!.startSample/44100:undefined,hold.holdThroughSample/44100);
  cues.push({id:candidate.id,templateId:template.id,sourceLanguage:template.sourceLanguage,targetLanguage:template.targetLanguage,sourceText:template.sourceText,targetText:template.targetText,start,end,...window,words,targets:template.targetTokens.map(t=>({...t,id:`${candidate.id}:${t.id}`})),sourceBreaks:template.sourceLineBreaksAfterIndices,targetBreaks:template.targetLineBreaksAfterIndices});
}
const timeline:Timeline={schemaVersion:1,revision:acoustic.onsetReview.revision,sampleRate:44100,sourceSha256:manifest.sha256,sourceDuration:manifest.audio.decodedDurationSeconds,cues};
validateTimeline(timeline);
writeFileSync(resolve(root,'public/timeline.json'),JSON.stringify(timeline,null,2)+'\n');
const hash=(p:string)=>createHash('sha256').update(readFileSync(resolve(root,p))).digest('hex');
const files=['public/source.mp4','public/timeline.json','public/audio-features.json','public/stone-anchors.json','public/material-reference.png','public/fonts/Alegreya.ttf','source/lyrics-editorial.json','source/timing-candidate.json','source/line-visibility.json','src/model.ts','src/scene.ts','src/player.ts'];
writeFileSync(resolve(root,'evidence/preview-inputs.json'),JSON.stringify({schemaVersion:1,project:'po-kamushku-lyric-film',revision:timeline.revision,inputs:Object.fromEntries(files.map(p=>[p,hash(p)])),cueCount:cues.length,cueIds:cues.map(c=>c.id),sourceWordCount:cues.reduce((n,c)=>n+c.words.length,0),targetWordCount:cues.reduce((n,c)=>n+c.targets.length,0)},null,2)+'\n');
console.log(`Prepared ${cues.length} paired cues; preview only, review and authorization remain pending.`);
