/** Initial source-clock choices. Re-running never silently replaces corrections. */
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=(p:string)=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const recording=read('source/recording.json');
const plan=read('source/acoustic-crop-plan.json');
const templates=read('source/editorial-templates.json').templates as {id:string;source:string[]}[];
type Selection={id:string;templateId:string;lane:'lead'|'backing';phraseId:string;offset:number;times:number[][];note:string};
const selections:Selection[]=[];
const add=(id:string,templateId:string,phraseId:string,offset:number,times:number[][],note='Original/stem phonetic context and competing paths; direct body and held release selected separately.',lane:'lead'|'backing'='lead')=>selections.push({id,templateId,lane,phraseId,offset,times,note});
add('OBN-001','hold-yourself','verse',0,[[5.660,5.790],[5.790,7.002],[7.002,7.590],[7.590,8.078],[8.078,8.934]],'Reject the conditioned opening allocation at source zero. Quiet opening at 5.66 s; bounded recognition supports the phrase.');
add('OBN-002','fist','verse',5,[[9.002,9.074],[9.074,10.204],[10.204,10.736],[10.736,11.051],[11.051,12.058]]);
add('OBN-003','sanity','verse',10,[[12.144,12.945],[12.945,13.806],[13.806,14.247],[14.247,14.979]]);
add('OBN-004','exhaustion','verse',14,[[15.282,16.176],[16.176,16.692],[16.692,17.569],[17.569,18.552]],'Soft initial body is earlier than the strong Так core; exact ownership remains a listening question.');
add('OBN-005','reflection','verse',18,[[18.552,19.801],[19.801,20.046],[20.046,20.519],[20.519,20.607],[20.607,21.548]]);
add('OBN-006','eyes','verse',23,[[21.861,23.302],[23.302,23.591],[23.591,23.927],[23.927,24.980]]);
add('OBN-007','concrete','verse',27,[[25.548,25.694],[25.694,26.321],[26.321,27.094],[27.094,27.811],[27.811,28.023],[28.023,28.349],[28.349,28.910],[28.910,30.032]]);
add('OBN-008','hinges','pre-1',0,[[31.574,32.088],[32.088,32.514],[32.514,33.386],[33.386,33.505],[33.505,34.285]],'Reject 29 s crop-zero onset; initial sung body renews near 31.57 s. Consonant cores alone miss the connected lead-in.');
add('OBN-009','beast','pre-1',5,[[34.285,34.501],[34.501,35.254],[35.254,35.830]]);
add('OBN-010','shadow','pre-1',8,[[35.830,36.501],[36.501,36.921],[36.921,37.465]]);
add('OBN-011','wildly','pre-1',11,[[37.465,38.086],[38.086,39.065]]);
add('OBN-012','dark-run','pre-1',13,[[39.065,39.544],[39.544,39.647],[39.647,40.462]]);
add('OBN-013','cope','pre-1',16,[[40.615,40.859],[40.859,41.706],[41.706,42.261],[43.278,43.671]],'Preserve the pause before но rather than filling it with bright focus.');
add('OBN-014','you-embrace','chorus-1',0,[[44.088,46.004],[46.004,46.288],[46.288,47.699],[47.699,49.535]],'Inspect complete held vowels. Whisper allocates ты before the stressed а core of когда and обнимаешь before the prolonged меня tail; do not accept those allocations automatically.');
add('OBN-015','surrounding','chorus-1',4,[[49.535,49.722],[49.722,50.307],[51.623,52.062],[52.062,52.632],[52.632,53.298]],'Direct lead and possible filtered вся backing retain separate lanes. The gap before эта is not English anticipation.');
add('OBN-016','turns-light','chorus-1',9,[[53.298,54.794],[54.794,55.018],[55.018,55.901]],'Held свет includes its final consonant beyond the shorter Whisper release.');
add('OBN-017','i-embrace','chorus-1',12,[[56.984,58.844],[58.844,59.145],[59.145,60.526],[60.526,62.301]],'The pronoun core is short inside connected voice; follow actual lexical ownership, not the entire preceding crop pad.');
add('OBN-018','surrounding','chorus-1',16,[[62.301,62.563],[62.563,63.189],[64.340,64.846],[64.846,65.484],[65.484,66.044]]);
add('OBN-019','turns-light','chorus-1',21,[[66.044,67.855],[67.855,68.024],[68.024,69.055]],'The low-energy conjunction remains separate; focus continues through the held свет body.');
add('OBN-024','hinges','pre-2',0,[[119.540,120.105],[120.105,120.547],[120.547,121.448],[121.448,121.568],[121.568,122.290]],'Reject 111 s crop-zero onset; original renewed body near 119.54 s.');
add('OBN-025','beast','pre-2',5,[[122.290,122.531],[122.531,123.320],[123.320,123.861]]);
add('OBN-026','shadow','pre-2',8,[[123.861,124.507],[124.507,124.922],[124.922,125.495]]);
add('OBN-027','wildly','pre-2',11,[[125.495,126.054],[126.054,127.088]]);
add('OBN-028','dark-run','pre-2',13,[[127.088,127.524],[127.524,127.633],[127.633,128.467]]);
add('OBN-029','cope','pre-2',16,[[128.617,128.858],[128.858,129.740],[129.740,130.280],[131.278,131.770]],'The late forced но path runs into the next phrase; trim to the original direct body and retain a real preceding pause.');
add('OBN-030','you-embrace','chorus-2',0,[[132.086,134.012],[134.012,134.303],[134.303,135.701],[135.701,137.513]]);
add('OBN-031','surrounding','chorus-2',4,[[137.513,137.668],[137.668,138.278],[139.538,140.061],[140.061,140.687],[140.687,141.377]]);
add('OBN-032','turns-light','chorus-2',9,[[141.377,142.722],[142.722,142.950],[142.950,143.850]],'Reject stem alignment placing the tail of свет inside the next когда at 145 s; original phrase renewal is independently retained.');
add('OBN-033','i-embrace','chorus-2',12,[[144.981,146.855],[146.855,147.086],[147.086,148.497],[148.497,150.254]],'Original mix MMS supports когда near 145.05 s; stem path at 145.81 s misassigns the previous свет tail.');
add('OBN-034','surrounding','chorus-2',16,[[150.254,150.452],[150.452,151.070],[152.298,152.832],[152.832,153.438],[153.438,154.112]]);
add('OBN-035','turns-light','chorus-2',21,[[154.112,155.602],[155.602,155.850],[155.850,157.245]],'Retain the held ending beyond the shorter conditioned release; passive stem decay is a separate review question.');
add('OBN-036','embrace','post-2',0,[[158.601,160.94],[160.94,161.88]],'Processed hook: narrow alignment and original renewed body support the phrase, with uncertain internal handoff.');
add('OBN-037','embrace','post-2',2,[[164.981,167.36],[167.36,168.46]],'Second processed occurrence has independent choices; not transferred from the first post-hook.');
add('OBN-038','embrace','post-2',4,[[171.444,173.64],[173.64,174.4]],'Renewed direct body follows the previous decay; filter/stem leakage limits release confidence.');
add('OBN-040','i-embrace','outro',0,[[183.398,185.320],[185.320,185.534],[185.534,187.071],[187.071,189.060]],'Reject the 181.5 s crop-zero allocation. Quiet lead-in precedes the first strong core; individual held vowels remain visible.');
add('OBN-041','surrounding','outro',4,[[189.060,189.256],[189.256,190.119],[191.171,191.926],[191.926,192.676],[192.676,193.701]]);
add('OBN-042','becomes-light','outro',9,[[193.701,195.639],[196.977,197.873]],'Preserve the low-energy gap before final свет. The forced Whisper span begins inside the last syllable of становится; MMS finds the later renewed light-word body.');
for(const [id,phrase,start,end] of [['OBN-B01','all1-a',50.635,51.334],['OBN-B02','all1-b',63.543,64.302],['OBN-B03','all2-a',138.460,139.228],['OBN-B04','all2-b',151.187,152.077]] as const){
 add(id,'all-echo',phrase,0,[[start,end]],'Supplied filtered вся echo; independent narrow alignment remains weak. Provisional backing timing requires listening.', 'backing');
}
const compact=(base:string,id:string)=>{
 try{return read(base+id+'.json').words.map((w:{text:string;startSeconds:number;endSeconds:number;score:number})=>({text:w.text,start:w.startSeconds,end:w.endSeconds,score:w.score}));}catch{return undefined}
};
const whisper=(prefix:string,id:string)=>{
 try{return read('analysis/'+prefix+'-'+id+'.json').segments.flatMap((s:{words:{word:string;start:number;end:number;probability:number}[]})=>s.words.map(w=>({text:w.word.trim(),start:w.start,end:w.end,score:w.probability})));}catch{return undefined}
};
const observations=plan.phrases.map((p:{id:string;crop:number[];units:string[]})=>({id:p.id,crop:p.crop,conditionedUnits:p.units,mmsVocal:compact('analysis/mms-vocals/mms-',p.id),mmsMix:compact('analysis/mms-mix/mms-',p.id),whisperMix:whisper('whisper',p.id)}));
const repeats=read('source/repeat-crop-plan.json').phrases.map((p:{id:string;crop:number[]})=>({id:p.id,crop:p.crop,mmsMix:compact('analysis/mms-repeats/mms-',p.id),whisperMix:whisper('repeat-whisper',p.id)}));
const finalized=selections.map(s=>{
 const template=templates.find(t=>t.id===s.templateId)!;
 if(!template||template.source.length!==s.times.length)throw Error('Template/selection disagreement '+s.id);
 return {id:s.id,templateId:s.templateId,lane:s.lane,voice:s.lane==='lead'?'Lead vocal':'Filtered backing echo',phraseId:s.phraseId,phraseSourceOffset:s.offset,note:s.note,
  status:'Provisional source-bound selection; actual listening pending',
  words:s.times.map(([start,end],i)=>({sourceIndex:i,text:template.source[i],startSample:Math.round(start!*44100),endSample:Math.round(end!*44100),
   onsetOwnershipRangeSeconds:[start!-(s.templateId==='embrace'?.22:.045),start!+(s.templateId==='embrace'?.22:.065)],
   releaseOwnershipRangeSeconds:[end!-(s.templateId==='embrace'?.25:.060),end!+(s.templateId==='embrace'?.25:.09)],
   uncertainty:s.templateId==='embrace'||s.lane==='backing'?'High: heavily processed, poor automatic recognition':'Moderate: connected singing, selected from competing acoustic paths',
   method:'Explicit initial choice after original/stem signal and model comparison; not automatic CTC-core promotion; listening pending'}))};
});
const destination=new URL('source/selected-boundaries.json',root);
if(existsSync(destination)&&!process.argv.includes('--replace'))throw Error('Selections already exist. Edit the durable JSON or explicitly --replace the initial seed.');
writeFileSync(destination,JSON.stringify({schemaVersion:1,revision:'obnimay-preview-v2',sourceSha256:recording.sourceSha256,sampleRate:44100,sourceDuration:recording.duration,
 boundaryConvention:'inclusive start; exclusive end; integer source samples; no global anticipation',
 humanListening:false,precisionStatement:'44.1 kHz storage and 2 ms signal-view hop do not establish sample or millisecond perceptual certainty. Ownership ranges are review tolerances, not measured statistical confidence intervals.',
 cues:finalized},null,2)+'\n');
writeFileSync(new URL('source/acoustic-observations.json',root),JSON.stringify({schemaVersion:1,sourceSha256:recording.sourceSha256,
 modelFamilies:['Whisper large-v3-turbo text-conditioned attention','torchaudio MMS_FA CTC'],
 status:'Competing observations retained, not listening evidence',observations,repeats},null,2)+'\n');
console.log(JSON.stringify({cues:finalized.length,words:finalized.reduce((n,c)=>n+c.words.length,0),status:'preview choices only'}));
