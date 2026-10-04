import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {buildSync} from 'esbuild';
import {readingWindow,validateTimeline,type Timeline,type Cue,type Word} from '../src/model.ts';
import {requiredPreviewInputs} from './render-gate.ts';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
const proposal=read('source/russian-timing-proposals.json');
const editorial=read('source/english-editorial-draft.json');
const recording=read('source/recording.json');
if(proposal.sourceSha256!==recording.sourceSha256||hash('public/source.mp4')!==recording.sourceSha256)throw Error('Wrong original recording');
const templates=new Map<string,any>(editorial.cues.map((c:any)=>[c.cueKey,c]));
const cues:Cue[]=[];
for(const performance of proposal.cues){
  const template=templates.get(performance.cueKey??performance.templateId);if(!template)throw Error(`Unknown performed text ${performance.id}`);
  if(performance.words.length!==template.sourceTokens.length)throw Error(`Performed/editorial count differs ${performance.id}`);
  for(const [chunkNo,chunk] of template.preferredCueChunks.entries()){
    const id=`${performance.id}-p${chunkNo+1}`,indices:number[]=chunk.chunkSourceIndices;
    const localIndex=new Map(indices.map((i,n)=>[i,n]));
    const words:Word[]=indices.map((index,n)=>{
      const w=performance.words[index];
      if(w.text.replace(/[.,!:;?—–]/g,'').toLowerCase()!==template.sourceTokens[index].replace(/[.,!:;?—–]/g,'').toLowerCase())throw Error(`Wording mismatch ${w.id}`);
      const hyphen=(template.cueKey==='hook-feeling'&&index===0)||(template.cueKey==='v2-planet'&&index===7);
      return {id:w.id,text:template.sourceTokens[index],...(hyphen?{punctuationAfter:'-'}:{}),sourceIndex:n,startSample:w.startSample,endSample:w.endSample,confidence:w.confidence??'reviewed candidate',method:w.method??'Selected source/stem evidence; perceptual review pending'};
    });
    const targets=chunk.englishTokenIndices.map((index:number,n:number)=>{
      const originals:number[]=template.englishContributors[index];
      const mapped=originals.map(i=>{const local=localIndex.get(i);if(local===undefined)throw Error(`Meaning cut at chunk boundary ${id}`);return local});
      const group=template.irreducibleConstructions.find((g:any)=>g.englishTokenIndices.includes(index));
      return {id:`${id}-e${n}`,text:template.englishTokens[index],sourceIndices:mapped,focusSourceIndices:mapped,relation:group?'irreducible construction':'individual meaning or grammatical expansion',rationale:group?.rationale??template.editorialNotes.join(' ')};
    });
    const start=words[0]!.startSample/44100,end=words.at(-1)!.endSample/44100;
    const sourceText=chunk.sourceText.replace('Самое самое','Самое-самое').replace('огромной огромной','огромной-огромной');
    const finalChunk=chunkNo===template.preferredCueChunks.length-1;
    const selectedHold=finalChunk?(performance.neutralReadingProposal?.fullOpacityEndSample??performance.neutralHoldEndSample??performance.readingHoldEndSample??Math.round(end*44100))/44100:end;
    cues.push({id,templateId:template.cueKey,sourceLanguage:'ru',targetLanguage:'en',sourceText,targetText:chunk.englishText,start,end,visibleStart:start,fullOpacityEnd:Math.max(end,selectedHold),visibleEnd:Math.max(end,selectedHold),exitMode:'vocal-handoff',words,targets,sourceBreaks:[],targetBreaks:[]});
  }
}
const sourceDuration=proposal.sourceDuration;
for(const [i,c] of cues.entries()){
  const next=cues[i+1];const hold=Math.min(next?.start??sourceDuration,Math.max(c.end+.20,c.fullOpacityEnd));
  Object.assign(c,readingWindow(c.start,c.end,sourceDuration,cues[i-1]?.visibleEnd,next?.start,hold));
}
const revision=process.argv.find(x=>x.startsWith('--revision='))?.slice('--revision='.length)??'svetloe-chuvstvo-v1-source-informed-preview';
if(!/^svetloe-chuvstvo-v\d+[a-z0-9-]*$/.test(revision))throw Error('Use a song-specific numbered preview revision');
const timeline:Timeline={schemaVersion:1,revision,sampleRate:44100,sourceSha256:recording.sourceSha256,sourceDuration,cues};
validateTimeline(timeline);writeFileSync('public/timeline.json',JSON.stringify(timeline,null,2)+'\n');
// Freeze the executable actually served to the browser, not only its source.
buildSync({entryPoints:['src/player.ts'],bundle:true,format:'esm',outfile:'review/client.js'});
const inputs=requiredPreviewInputs;
const binding={schemaVersion:1,revision:timeline.revision,sourceSha256:recording.sourceSha256,inputs:Object.fromEntries(inputs.map(p=>[p,hash(p)])),scope:'Complete preview identity, not listening completion or render approval'};
writeFileSync('evidence/preview-inputs.json',JSON.stringify(binding,null,2)+'\n');
const status={schemaVersion:1,revision:timeline.revision,timelineSha256:hash('public/timeline.json'),previewInputsSha256:hash('evidence/preview-inputs.json'),sourceSha256:recording.sourceSha256,mode:'preview-only',technicalChecks:'pending',listeningReview:{status:'pending',fullNormalSpeed:false,uncertainReducedSpeed:false,bothLayouts:false},renderApproval:{approved:false},productionAuthorized:false};
writeFileSync('evidence/review-status.json',JSON.stringify(status,null,2)+'\n');
console.log(JSON.stringify({cues:cues.length,sourceWords:cues.reduce((n,c)=>n+c.words.length,0),targetWords:cues.reduce((n,c)=>n+c.targets.length,0),revision:timeline.revision,productionAuthorized:false}));
