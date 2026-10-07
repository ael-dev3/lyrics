/** Explicit per-word acoustic proposals. Values are not listening attestations. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readingWindow,validateTimeline,type Cue,type Timeline} from '../src/model.ts';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const hash=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
// Each pair was selected separately against the bounded original/vocal panels,
// native CTC character centers and conditioned Whisper proposals. No common
// anticipation offset, fixed extension, or crop/frame-ratio stretching is used.
// Sustained single-letter words are often poorly located by a single CTC core.
const edges:number[][][]=[
 [[11.995,13.255],[13.295,14.335],[14.685,15.84],[15.84,15.93],[15.93,16.25],[16.305,17.135]],
 [[17.355,17.945],[17.945,19.985],[20.045,21.735],[21.75,22.39]],
 [[22.795,23.455],[23.455,24.115],[24.135,25.43],[25.57,26.15],[26.15,26.74],[26.74,27.20],[27.20,28.065]],
 [[28.23,28.365],[28.365,28.865],[28.875,29.245],[29.285,29.535],[29.55,30.67],[30.82,32.11],[32.235,33.38]],
 [[33.625,33.985],[33.985,35.00],[35.00,36.075],[36.215,38.10],[38.10,38.88]],
 [[39.025,39.715],[39.715,39.855],[39.855,41.07],[41.075,41.6],[41.82,42.535],[42.535,43.465],[43.52,44.24]],
 [[44.60,44.86],[44.86,45.59],[45.59,45.79],[45.79,46.99],[47.245,47.82],[47.97,48.635],[48.635,48.87],[48.87,49.55]],
 [[49.92,50.38],[50.385,51.16],[51.16,51.325],[51.325,53.65],[53.65,54.31],[54.31,54.99]],
 [[55.315,56.09],[56.09,56.565],[56.565,57.225],[57.225,57.325],[57.325,57.895],[57.895,59.13],[59.285,60.24]],
 [[60.24,60.935],[60.97,61.565],[61.565,62.53],[62.55,63.35],[63.35,64.38],[64.665,65.815]],
 [[65.855,66.245],[66.255,67.265],[67.265,67.555],[67.555,68.32],[68.32,68.495],[68.495,69.295],[69.295,69.78],[69.94,71.12]],
 [[71.265,71.58],[71.58,72.22],[72.225,72.9],[72.91,73.08],[73.08,74.22],[74.47,75.985]],
 [[88.06,89.235],[89.235,90.095],[90.095,91.445],[91.655,93.265]],
 [[93.62,94.035],[94.035,94.245],[94.245,94.68],[94.71,96.095],[96.49,98.855]],
 [[99.185,99.895],[99.895,100.20],[100.20,100.41],[100.41,101.73],[101.975,103.22],[103.22,104.465]],
 [[104.77,105.33],[105.33,105.53],[105.53,106.775],[106.775,107.21],[107.31,108.44],[108.60,109.865]],
 [[110.065,110.795],[110.795,111.15],[111.15,111.36],[111.36,111.965],[111.965,112.405],[112.755,112.81],[112.81,114.30],[114.30,114.45],[114.45,115.12]],
 [[115.375,115.755],[115.755,116.065],[116.065,116.41],[116.41,116.57],[116.57,117.875],[117.875,118.03],[118.03,118.38],[118.38,118.535],[118.535,119.055],[119.055,119.615],[119.62,120.38]],
 [[120.675,121.595],[121.595,121.93],[121.93,122.925],[123.235,124.725],[124.725,125.395]],
 [[125.825,126.17],[126.17,126.31],[126.31,126.775],[126.775,128.345],[128.42,129.525],[129.525,129.985],[129.985,130.67]],
 [[130.975,131.69],[131.69,132.135],[132.135,132.80],[132.80,132.9],[132.9,133.41],[133.41,134.81],[134.855,135.77]],
 [[135.77,136.43],[136.465,137.075],[137.075,138.005],[138.055,138.80],[138.80,139.795],[140.04,141.31]],
 [[141.43,141.715],[141.715,142.755],[142.755,143.09],[143.09,143.715],[143.715,144.455],[144.455,145.16],[145.305,146.595]],
 [[146.70,147.015],[147.015,147.35],[147.35,147.695],[147.695,148.43],[148.43,148.62],[148.62,148.90],[148.90,149.765],[149.80,151.39]],
 [[175.36,176.15],[176.15,176.76],[176.76,177.53],[177.53,177.63],[177.63,178.375],[178.375,179.79],[179.885,181.10]],
 [[181.47,182.485],[182.485,183.48],[183.48,184.15],[184.155,185.295],[185.55,186.58]],
 [[186.68,187.195],[187.38,188.35],[188.35,188.68],[188.68,189.355],[189.355,189.65],[189.65,190.255],[190.255,190.95],[191.09,192.29]],
 [[192.425,192.73],[192.73,193.47],[193.47,194.18],[194.18,194.47],[194.47,195.565],[195.82,197.68]],
];
const editorial=read('source/lyrics-editorial.json'),recording=read('source/recording.json');
const saved=existsSync('source/word-boundary-proposals.json')?read('source/word-boundary-proposals.json'):undefined;
const rate=44100;
const decisions:{id:string;text:string;startSample:number;endSample:number;observations:unknown;rationale:string;reviewStatus:string}[]=[];
const cues:Cue[]=editorial.cues.map((c:any,i:number)=>{
 if(c.sourceTokens.length!==edges[i]!.length)throw Error(`Word-count mismatch ${c.id}`);
 const paths=[`analysis/mms-original/mms-${c.id}.json`,`analysis/mms-vocals/mms-${c.id}.json`,`analysis/whisper/align-${c.id}.json`];
 const raw=paths.every(existsSync);
 const original=raw?read(paths[0]!):undefined,vocal=raw?read(paths[1]!):undefined,whisper=raw?read(paths[2]!).segments.flatMap((s:any)=>s.words):undefined;
 const words=c.sourceTokens.map((w:any,j:number)=>{
  const edge=edges[i]![j]!,startSample=Math.round(edge[0]!*rate),endSample=Math.round(edge[1]!*rate);
  const prior=saved?.decisions.find((d:any)=>d.id===w.id);
  if(!raw&&(!prior||saved.sourceSha256!==recording.sourceSha256||prior.text!==w.text))throw Error(`Missing or stale acoustic evidence ${w.id}. Re-run the locked-recording analysis; do not fabricate observations.`);
  const om=original?.words[j],vm=vocal?.words[j],asr=whisper?.[j];
  if(raw&&(om.text!==w.text||vm.text!==w.text))throw Error(`Stale acoustic text ${w.id}`);
  const observations=raw?{originalCTC:{firstCenterSeconds:om.startSeconds,lastCenterSeconds:om.endSeconds,score:om.score},vocalCTC:{firstCenterSeconds:vm.startSeconds,lastCenterSeconds:vm.endSeconds,score:vm.score},conditionedWhisper:{start:asr.start,end:asr.end},files:{originalSha256:hash(paths[0]!),vocalSha256:hash(paths[1]!),whisperSha256:hash(paths[2]!)}}:prior.observations;
  const rationale=j===0?'The crop boundary is not a vocal onset. Select the quiet entrance and the complete vocal body from the bounded acoustic panel.':'Keep this word’s entrance, complete vowels and final consonants separate from the neighboring word and from reverberation. CTC cores and gap-filled Whisper intervals are observations, not complete ownership.';
  decisions.push({id:w.id,text:w.text,startSample,endSample,observations,rationale,reviewStatus:'Acoustic proposal; normal/slow listening review remains pending'});
  return {id:w.id,text:w.text,punctuationAfter:w.punctuationAfter,sourceIndex:j,startSample,endSample,confidence:'Uncalibrated acoustic proposal; no human listening attestation',method:'Per-word original/vocal spectrogram and envelope reconciliation of independent model-family observations'};
 });
 return {id:c.id,templateId:c.id,sourceLanguage:'ru',targetLanguage:'en',sourceText:c.sourceText,targetText:c.targetText,start:words[0].startSample/rate,end:words.at(-1).endSample/rate,visibleStart:0,fullOpacityEnd:0,visibleEnd:0,exitMode:'fade',words,targets:c.targetTokens,sourceBreaks:[],targetBreaks:[]} satisfies Cue;
});
let prior=0;
for(let i=0;i<cues.length;i++){
 const c=cues[i]!;
 // Neutral reading persistence is explicitly separate from a gold word event.
 // Long wordless spaces give the final line a short readable rest, then the
 // illustration and string response carry the music alone.
 const hold=c.end+((cues[i+1]?.start??recording.containerDurationSeconds)-c.end>1?.30:0);
 Object.assign(c,readingWindow(c.start,c.end,recording.containerDurationSeconds,prior,cues[i+1]?.start,hold));prior=c.visibleEnd;
}
const revision='trup-nevesty-preview-v1-acoustic';
const timeline:Timeline={schemaVersion:1,revision,sampleRate:rate,sourceSha256:recording.sourceSha256,sourceDuration:recording.containerDurationSeconds,cues};
validateTimeline(timeline);
writeFileSync('public/timeline.json',JSON.stringify(timeline,null,2)+'\n');
writeFileSync('source/word-boundary-proposals.json',JSON.stringify({schemaVersion:1,revision,sourceSha256:recording.sourceSha256,sampleRate:rate,timeRepresentation:'Original audio samples; inclusive start and exclusive end. Integer precision is storage precision, not an accuracy claim.',method:'Separately selected word edges; no global lead or fixed tail. Independent Whisper/MMS families, original/vocal comparison, original audio remains authority.',limits:['Model agreement does not establish perception.','Stem estimates may smear consonants or retain instrument leakage.','Short words and connected/sustained vowels need normal/slow listening review in both formats.'],humanListening:false,decisions},null,2)+'\n');
writeFileSync('source/coverage-inventory.json',JSON.stringify({sourceSha256:recording.sourceSha256,lexicalCues:cues.length,sourceWords:decisions.length,targetWords:cues.reduce((n,c)=>n+c.targets.length,0),wordlessVocalCandidates:[{approximateInterval:[76,88],evidence:'Full unprompted recognition identifies repeated wordless syllables; not additional lexical lyrics.'},{approximateInterval:[151.5,175.3],evidence:'Wordless refrain and instrumental transition; no unsupplied words invented.'}],closingVariantReview:{cue:'TN-025',suppliedWord:'нет',displayedWord:'нету',evidence:'Full alternate-recording and bounded canonical large-v3-turbo recognition both identify нету. An additional vowel after the т consonant is visible in the vocal-estimate spectrum and aligned by MMS on both original and estimated vocals.',limits:'The two recognitions use the same model family. The small model returned no text, which provides no support or contradiction. Listener review remains pending.'},status:'Complete recording preview; listening completeness pending'},null,2)+'\n');
console.log(JSON.stringify({revision,cues:cues.length,sourceWords:decisions.length,targetWords:cues.reduce((n,c)=>n+c.targets.length,0),firstWord:cues[0]!.start,lastWord:cues.at(-1)!.end}));
