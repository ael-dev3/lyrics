/** Preserve small, source-bound observations without private media/cache paths. */
import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const read=(path:string)=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const sourceSha256=read('source/recording.json').sourceSha256;
const whisper=read('analysis/conditioned-whisper-all.json').map((r:any)=>({
 phraseId:r.phraseId,crop:r.provenance.crop,conditioningText:r.provenance.conditioningText,
 model:r.provenance.model,words:r.segments.flatMap((s:any)=>s.words.map((w:any)=>({text:w.word.trim(),start:w.start,end:w.end,score:w.probability}))),
}));
const mms=['original','vocals'].map(input=>{
 const r=read(`analysis/mms-${input}/mms-all.json`);
 return {input,model:r.model,torch:r.torch,torchaudio:r.torchaudio,records:r.records.map((p:any)=>({
  phraseId:p.phraseId,crop:p.crop,conditioningText:p.conditionedUnits,
  words:p.words.map((w:any)=>({sourceIndex:w.sourceIndex,text:w.text,start:w.startSeconds,end:w.endSeconds,score:w.score})),
  encoder:{strideSamples:p.emission.encoderStrideSamples,receptiveFieldSamples:p.emission.encoderReceptiveFieldSamples,centerOffsetSamples:p.emission.encoderCenterOffsetSamples},
  humanListening:false,
 }))};
});
const repeats=readFileSync(new URL('analysis/repeat-observations.log',root),'utf8').split('\n').flatMap(line=>{try{return [JSON.parse(line)]}catch{return []}});
const record={schemaVersion:1,sourceSha256,status:'Competing conditioned model cores and relative signal observations; not selected truth or a listening log.',humanListening:false,
 limitations:['Conditioned paths can manufacture coverage.','Whisper crop-start padding and late MMS consonant/vowel cores need original-signal ownership review.','Separated vocals retain instruments and may smear attacks.','Relative repeat similarity cannot establish absolute lexical identity.'],
 vocalEstimate:read('analysis/demucs-native-provenance.json'),whisper,mms,repeats};
writeFileSync(new URL('source/acoustic-observations.json',root),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({sourceSha256,whisperPhrases:whisper.length,mmsInputs:mms.length,repeatDiagnostics:repeats.length}));
