/** Separately selected acoustic proposals; all listening acceptance remains pending. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';import {createHash} from 'node:crypto';
import {readingWindow,validateTimeline,type Cue,type Timeline} from '../src/model.ts';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
const edges:Record<string,number[][]>={
 'GT-001':[[5.045,7.32]],
 'GT-002':[[14.669,14.883],[14.883,15.513],[15.513,16.032],[16.438,18.177],[18.213,18.378],[18.378,18.859],[18.963,20.165]],
 'GT-003':[[20.887,21.750],[21.750,22.657],[22.674,23.030],[23.030,23.942],[23.942,24.791],[24.791,25.749],[26.145,26.313],[26.313,27.184],[27.184,27.884]],
 'GT-004':[[29.951,31.386],[31.386,31.498],[31.498,31.942],[31.942,32.681],[32.681,33.412],[33.412,34.349],[34.349,35.410]],
 'GT-005':[[36.353,36.868],[36.868,37.414],[37.414,38.089],[38.089,38.752],[38.752,39.708],[39.708,39.797],[39.797,40.532],[40.532,42.627],[42.627,43.515]],
 'GT-006':[[44.657,44.943],[45.062,46.059],[46.059,46.987],[46.987,47.261],[47.261,47.875],[47.875,49.586]],
 'GT-007':[[49.587,49.973],[49.973,50.728],[50.728,51.437],[51.437,52.060]],
 'GT-008':[[52.480,52.707],[52.707,53.361],[53.361,54.796],[54.796,55.045],[55.045,55.696],[55.696,55.903],[55.903,56.562],[56.562,57.759]],
 'GT-009':[[58.523,59.010],[59.010,59.491],[59.491,60.113],[60.541,60.758],[60.758,61.574],[61.574,61.713],[61.713,62.721]],
 'GT-010':[[62.866,64.034],[64.034,64.618],[64.618,65.366]],
 'GT-011':[[66.742,66.945],[66.945,67.599],[67.599,68.012],[68.012,68.173],[68.173,69.155],[69.155,70.414],[70.414,71.961]],
 'GT-012':[[74.076,74.823],[74.963,75.405]],
 'GT-013':[[75.939,78.320],[79.564,81.145],[81.145,82.384],[82.384,82.955],[83.066,84.131],[84.131,85.705]],
 'GT-014':[[86.038,86.301],[86.301,88.061],[88.061,88.340],[88.340,89.177],[89.177,90.035]],
 'GT-015':[[90.047,90.492],[90.492,91.012],[91.012,91.707],[91.707,91.949],[91.949,93.036]],
 'GT-016':[[93.303,93.559],[93.559,93.954],[93.954,95.544],[95.544,96.586]],
 'GT-017':[[96.790,97.260],[97.260,98.514],[98.891,100.070]],
 'GT-018':[[100.274,100.822],[100.822,101.531],[101.531,103.644]],
 'GT-019':[[104.478,105.215],[105.215,107.653]],
 'GT-020':[[116.013,116.684],[116.684,117.069],[117.069,118.277],[118.277,118.680],[118.680,120.045],[120.045,120.749],[120.749,122.119]],
 'GT-021':[[122.528,123.288],[123.288,123.537],[123.537,123.775],[123.775,124.573],[124.573,125.190],[125.190,126.176]],
 'GT-022':[[126.267,126.967],[127.340,127.946],[127.946,128.159],[128.159,129.010]],
 'GT-023':[[129.347,129.747],[130.042,130.485],[131.004,131.986],[131.986,132.800],[132.800,133.373],[133.373,133.986],[133.986,134.230],[134.230,134.819]],
 'GT-024':[[135.159,135.407],[135.407,136.224],[136.224,137.000],[137.000,137.713],[137.713,137.861],[137.861,138.616]],
 'GT-025':[[138.616,138.841],[138.841,139.471],[139.781,140.635],[141.744,143.362]],
 'GT-026':[[143.566,143.954],[144.411,145.062],[145.062,145.815],[145.967,146.955]],
 'GT-027':[[147.205,148.615],[149.779,150.449],[150.449,152.025]],
 'GT-028':[[153.169,153.440],[153.440,154.226],[154.226,154.912],[154.912,155.371],[155.371,156.558]],
 'GT-029':[[156.754,157.058],[157.058,157.829],[157.829,158.589],[158.589,158.747],[158.747,160.061]],
 'GT-030':[[158.771,160.364],[160.364,161.574],[161.574,162.187],[162.278,163.331],[163.331,164.916]],
 'GT-031':[[165.220,165.491],[165.491,167.265],[167.265,167.547],[167.547,168.372],[168.372,169.231]],
 'GT-032':[[169.247,169.683],[169.683,170.213],[170.213,170.896],[170.896,171.147],[171.147,172.273]],
 'GT-033':[[172.511,172.804],[172.804,173.168],[173.168,174.744],[174.744,175.813]],
 'GT-034':[[176.058,176.485],[176.485,177.722],[178.079,179.271]],
 'GT-035':[[179.587,180.049],[180.049,180.751],[180.751,182.907]],
 'GT-036':[[183.684,184.401],[184.401,186.596]],
 'GT-037':[[179.483,179.956],[179.956,181.239],[181.239,185.208]],
 'GT-038':[[186.008,187.791],[187.853,190.036]],
 'GT-039':[[192.105,193.426],[194.395,195.078]],
 'GT-040':[[10.568,13.960]],
};
const editorial=read('source/lyrics-editorial.json'),recording=read('source/recording.json'),rate=44100;
const prior=existsSync('source/word-boundary-proposals.json')?read('source/word-boundary-proposals.json'):undefined;
const decisions:any[]=[];
const cues:Cue[]=editorial.cues.map((c:any)=>{
 const pair=edges[c.id];if(!pair||pair.length!==c.sourceTokens.length)throw Error(`Word-count mismatch ${c.id}`);
 const mixPath=c.id==='GT-013'?'analysis/mms-context-original/mms-CHORUS-CONTEXT.json':`analysis/mms-original/mms-${c.id}.json`,vocPath=`analysis/mms-vocals/mms-${c.id}.json`,whisperPath=`analysis/whisper/align-${c.id}.json`;
 const mix=existsSync(mixPath)?read(mixPath):undefined,voc=existsSync(vocPath)?read(vocPath):undefined,w=existsSync(whisperPath)?read(whisperPath)?.segments?.flatMap((s:any)=>s.words):undefined;
 const priority=['GT-001','GT-013','GT-029','GT-031','GT-037','GT-038','GT-039','GT-040'].includes(c.id);
 const words=c.sourceTokens.map((token:any,i:number)=>{
  const [a,b]=pair[i]!,startSample=Math.round(a!*rate),endSample=Math.round(b!*rate),retained=prior?.decisions.find((v:any)=>v.id===token.id);
  if(!mix&&c.id!=='GT-040'&&(!retained||prior.sourceSha256!==recording.sourceSha256))throw Error(`Missing evidence ${token.id}`);
  const observation=(data:any)=>data?{firstCenterSeconds:data.startSeconds,lastCenterSeconds:data.endSeconds,score:data.score}:null;
  const observations=mix||c.id==='GT-040'?{originalCTC:observation(mix?.words[i]),vocalCTC:c.id==='GT-013'?null:observation(voc?.words[i]),conditionedWhisper:c.id==='GT-013'?null:(w?.[i]?{start:w[i].start,end:w[i].end}:null),files:{originalSha256:existsSync(mixPath)?hash(mixPath):null,vocalSha256:existsSync(vocPath)?hash(vocPath):null,whisperSha256:existsSync(whisperPath)?hash(whisperPath):null},signalPanel:priority?('GT-001'===c.id||'GT-040'===c.id?'intro':c.id==='GT-013'?'first-chorus':c.id==='GT-029'?'answer':c.id==='GT-031'?'final-chorus':'final-backing'):c.crop}:retained.observations;
  const rationale=c.id==='GT-013'&&i===0?'Retain supplied Когда: wide-context original unforced k/o and later k/t/a support the stretched onset. Recognition omitted it; the crop is not the onset.':c.id==='GT-040'?'Second wordless Ah body is supported by original and estimated-vocal spectral activity near 10.6–14.0 s. No extra lexical lyric is invented.':c.lane==='backing'?'Independent singer ownership, not a copy of the male lead. Quiet overlapping words remain priority listening candidates; conditioned CTC can lock onto the louder voice.':i===0?'Quiet original onset selected independently of the crop. First word is fully visible at its event.':'Separate connected entrance, held body and final consonant from the next word and from neutral line persistence. Raw CTC cores are not complete word bodies.';
  decisions.push({id:token.id,cueId:c.id,text:token.text,startSample,endSample,observations,rationale,reviewPriority:priority?'high':'normal',reviewStatus:'Acoustic/editorial proposal; current-revision normal/slow listening pending'});
  return {...token,startSample,endSample,confidence:priority?'Priority listening candidate; not calibrated confidence':'Acoustic proposal; not calibrated confidence',method:'Independent original/vocal CTC character observations, Whisper comparison and bounded original/vocal spectral review; individually selected source-sample edges'};
 });
 return {id:c.id,templateId:c.id,lane:c.lane,voice:c.voice,sourceLanguage:'ru',targetLanguage:'en',sourceText:c.sourceText,targetText:c.targetText,start:words[0].startSample/rate,end:words.at(-1).endSample/rate,visibleStart:0,fullOpacityEnd:0,visibleEnd:0,exitMode:'fade',words,targets:c.targetTokens,sourceBreaks:[],targetBreaks:[]} satisfies Cue;
}).sort((a: Cue,b: Cue)=>a.start-b.start);
for(const lane of ['lead','backing']){
 const lines=cues.filter(c=>c.lane===lane);let priorVisible=0;
 for(let i=0;i<lines.length;i++){const c=lines[i]!,next=lines[i+1]?.start,hold=c.end+((next??recording.containerDurationSeconds)-c.end>1?.28:0);Object.assign(c,readingWindow(c.start,c.end,recording.containerDurationSeconds,priorVisible,next,hold));priorVisible=c.visibleEnd}
}
const revision='gde-ty-preview-v1-chandelier';
const t:Timeline={schemaVersion:1,revision,sampleRate:rate,sourceSha256:recording.sourceSha256,sourceDuration:recording.containerDurationSeconds,cues};validateTimeline(t);
writeFileSync('public/timeline.json',JSON.stringify(t,null,2)+'\n');
writeFileSync('source/word-boundary-proposals.json',JSON.stringify({schemaVersion:1,revision,sourceSha256:recording.sourceSha256,sampleRate:rate,humanListening:false,timeRepresentation:'Inclusive/exclusive original 44.1 kHz sample events. Sample storage precision is not a millisecond accuracy claim.',method:'Individually selected edges, independent model families and original/stem signal comparisons; no global anticipation or common fixed extension.',limits:['Singing, quiet vowels and simultaneous singers remain perceptually ambiguous.','CTC emission stride is 20 ms; spectrogram windows smear edges. Estimated stems can suppress quiet speech or smear consonants.','Model omission is not evidence of silence; conditioned paths are not evidence that a word is audible.','Closing female phrases and the quiet introductory sample are priority listening candidates.'],decisions},null,2)+'\n');
writeFileSync('source/coverage-inventory.json',JSON.stringify({sourceSha256:recording.sourceSha256,cues:cues.length,sourceWords:decisions.length,targetWords:cues.reduce((s,c)=>s+c.targets.length,0),independentFemaleCues:cues.filter(c=>c.lane==='backing').map(c=>c.id),firstVocal:cues[0]!.start,lastVocal:cues.at(-1)!.end,recognitionDisagreements:[{cue:'GT-001',issue:'Forced Whisper placed Когда on the opening instruments. Wider CTC and source/vocal spectral evidence select the quiet first vocal body near 5 seconds; listening remains pending.'},{cue:'GT-013',issue:'Unprompted recognition omitted Когда; wider unforced consonants support retention.'},{cue:'GT-029',issue:'Female reply overlaps the male entry; separate reading lane preserves both complete meanings.'},{cues:['GT-037','GT-038','GT-039'],issue:'Quiet backing voice omitted by both unprompted models. Supplied text retained provisionally with independent samples; listening needed for ownership and last question.'}],wordlessOpening:{cue:'GT-040',source:'А-а…',target:'Ah…',issue:'Measured second vocalization preserved, not guessed lexical text.'},status:'Complete-source preview with disclosed priority candidates; listening review and rendering pending'},null,2)+'\n');
console.log(JSON.stringify({revision,cues:cues.length,sourceWords:decisions.length,targetWords:cues.reduce((s,c)=>s+c.targets.length,0)}));
