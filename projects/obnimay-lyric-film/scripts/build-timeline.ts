import {readFileSync,writeFileSync} from 'node:fs';
import {readingWindow,validateTimeline,type Cue,type Timeline} from '../src/model.ts';
const root=new URL('../',import.meta.url),read=(p:string)=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
interface Template {id:string;source:string[];sourcePunctuation:Record<number,string>;targets:{text:string;sourceIndices:number[];rationale:string}[]}
interface Selected {id:string;templateId:string;lane:'lead'|'backing';voice:string;note:string;words:{sourceIndex:number;text:string;startSample:number;endSample:number;uncertainty:string;method:string}[]}
const selected=read('source/selected-boundaries.json'),templates=read('source/editorial-templates.json').templates as Template[];
const coverage=read('source/coverage-review.json') as {revision:string;sourceSha256:string;knownLyricFreeWindows:{id:string;startSample:number;endSample:number}[];withheldCandidates:{id:string}[]};
if(coverage.revision!==selected.revision||coverage.sourceSha256!==selected.sourceSha256)throw Error('Coverage review differs from the selected recording/revision');
const withheld=new Set(coverage.withheldCandidates.map(c=>c.id));
for(const c of selected.cues as Selected[])if(withheld.has(c.id))throw Error('Unsupported supplied candidate was restored: '+c.id);
const cues:Cue[]=(selected.cues as Selected[]).map(s=>{
 const t=templates.find(x=>x.id===s.templateId);if(!t)throw Error('Missing template '+s.id);
 const words=s.words.map((w,i)=>({id:`${s.id}-s${String(i).padStart(2,'0')}`,text:w.text,sourceIndex:i,startSample:w.startSample,endSample:w.endSample,confidence:w.uncertainty,method:w.method,...(t.sourcePunctuation[i]?{punctuationAfter:t.sourcePunctuation[i]}:{})}));
 const targets=t.targets.map((v,i)=>({id:`${s.id}-t${String(i).padStart(2,'0')}`,text:v.text,sourceIndices:v.sourceIndices,focusSourceIndices:v.sourceIndices,relation:v.sourceIndices.length>1?'documented semantic union':'individual source word / necessary grammatical completion',rationale:v.rationale}));
 const start=words[0]!.startSample/44100,end=words.at(-1)!.endSample/44100;
 return {id:s.id,templateId:s.templateId,lane:s.lane,voice:s.voice,sourceLanguage:'ru',targetLanguage:'en',sourceText:words.map(w=>w.text+(w.punctuationAfter??'')).join(' '),targetText:targets.map(v=>v.text).join(' '),start,end,visibleStart:start,fullOpacityEnd:end,visibleEnd:end,exitMode:'vocal-handoff',words,targets,sourceBreaks:[],targetBreaks:[]} satisfies Cue;
}).sort((a,b)=>a.start-b.start);
for(const lane of ['lead','backing'] as const){
 const group=cues.filter(c=>c.lane===lane);
 for(let i=0;i<group.length;i++){
  const c=group[i]!,next=group[i+1]?.start,prior=group[i-1]?.visibleEnd;
  // A short neutral reading hold follows actual bright focus. Music gaps are
  // not filled with active words; adjoining phrases replace atomically.
  const hold=c.end+(c.templateId==='embrace'?.18:c.templateId.endsWith('light')?.20:.10);
  Object.assign(c,readingWindow(c.start,c.end,selected.sourceDuration,prior,next,hold));
 }
}
const timeline:Timeline={schemaVersion:1,revision:selected.revision,sampleRate:44100,sourceSha256:selected.sourceSha256,sourceDuration:selected.sourceDuration,cues};
validateTimeline(timeline);
for(const window of coverage.knownLyricFreeWindows)for(const cue of cues){
 const start=window.startSample/44100,end=window.endSample/44100;
 if(cue.visibleStart<end&&cue.visibleEnd>start)throw Error(`Lyric line crosses recording-reviewed music interval ${window.id}: ${cue.id}`);
}
writeFileSync(new URL('public/timeline.json',root),JSON.stringify(timeline,null,2)+'\n');
writeFileSync(new URL('source/correspondence-ledger.json',root),JSON.stringify({schemaVersion:1,sourceSha256:selected.sourceSha256,revision:selected.revision,translationMethod:'New English translation; all focus follows performed Russian sample intervals, including grammatical completions and reordered meanings.',cues:cues.map(c=>({id:c.id,sourceText:c.sourceText,targetText:c.targetText,sourceWords:c.words.map(w=>({id:w.id,text:w.text,sourceIndex:w.sourceIndex})),targets:c.targets}))},null,2)+'\n');
console.log(JSON.stringify({revision:timeline.revision,cues:cues.length,sourceWords:cues.reduce((n,c)=>n+c.words.length,0),englishWords:cues.reduce((n,c)=>n+c.targets.length,0)}));
