import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {parseTimeline} from '../../src/model.ts';
import type {Timeline} from '../../src/model.ts';

const project=new URL('../../',import.meta.url);
const before=readFileSync(new URL('analysis/transcription-pass-a/timeline-before-gap-correction.json',project));
const after=readFileSync(new URL('public/timeline.json',project));
const regions=[{id:'intro',start:.492,end:16.7},{id:'middle-hooks',start:30.9885,end:62.3},{id:'final-hooks-and-chops',start:91.96575,end:121.464126}];
function scan(timeline:Timeline){
 const words=timeline.cues.flatMap(q=>q.words).sort((a,b)=>a.start-b.start);
 return regions.flatMap(region=>{
  let cursor=region.start;
  const gaps:{region:string;start:number;end:number;duration:number;classification:string}[]=[];
  function gap(start:number,end:number):void{
   if(end-start<=.2)return;
   const classification=start>=13&&end<=16.71?'unresolved intro vocal/reverb tail':start>=109?'unresolved processed late-vocal span':start>=105.9&&end<=107.3?'weak fourth chopped-pair hypothesis near 106.17 seconds':start>=43.6&&end<=46.3?'intermediate lead region; compare recovered cue and bounded evidence':'timing rest or unverified gap; duration alone is not proof of a missing word';
   gaps.push({region:region.id,start,end,duration:end-start,classification});
  }
  for(const word of words){if(word.end<=region.start||word.start>=region.end)continue;gap(cursor,Math.max(region.start,word.start));cursor=Math.max(cursor,Math.min(word.end,region.end));}
  gap(cursor,region.end);return gaps;
 });
}
const original=parseTimeline(JSON.parse(before.toString())),current=parseTimeline(JSON.parse(after.toString()));
const omittedStart=original.cues.find(q=>q.id==='hook-anywhere')?.end,omittedEnd=original.cues.find(q=>q.id==='middle-5')?.start;
if(omittedStart===undefined||omittedEnd===undefined)throw Error('Missing pre-correction cue boundaries');
const beforeGaps=scan(original),afterGaps=scan(current);
const output={
 status:'Complete interval-gap scan in requested hook regions; listening review remains pending',
 beforeTimelineSha256:createHash('sha256').update(before).digest('hex'),afterTimelineSha256:createHash('sha256').update(after).digest('hex'),
 thresholdSeconds:.2,regions,beforeGaps,afterGaps,beforeUnfocusedSecondsInListedGaps:beforeGaps.reduce((sum,gap)=>sum+gap.duration,0),afterUnfocusedSecondsInListedGaps:afterGaps.reduce((sum,gap)=>sum+gap.duration,0),
 correction:{cue:'middle-extra-lead',previousEmptyInterval:[omittedStart,omittedEnd],selectedWords:current.cues.find(q=>q.id==='middle-extra-lead')?.words,
  reason:'The special anywhere branch ended after one phrase and bypassed the intermediate lead at about 44.29 seconds. Bounded unprompted mixed-audio recognition detects Take/me independently; whole-phrase and separate Take/me/there waveform candidates support this local sequence.',
  uncertainty:'The recognizer disagrees on the final word, returning back in the wider crop and unrelated words in the short crop. The supplied refrain there is retained as a listening candidate; neither recognition confidence nor forced alignment proves the lexical reading.',
  evidence:['analysis/transcription-pass-a/large-v3-turbo-mix-gap-forty-five.json','analysis/transcription-pass-a/large-v3-turbo-vocals-gap-forty-five.json','analysis/transcription-pass-a/mms-gap-candidates-mix.json','analysis/transcription-pass-a/mms-gap-candidates-vocals.json','analysis/repetition-evidence.json']},
 unresolved:[
  {window:[13.33,16.7],finding:'The vocal stem remains active, but bounded recognition returns only the preceding lead and template matching supplies no reliable new there events. Source separation leakage/reverb cannot establish extra words; no evenly spaced echoes were invented.'},
  {window:[58,62.8],finding:'Existing candidates cover the repeated hook through 61.458 seconds. Targeted ASR is inconsistent; the tail gap before the next verse was not automatically filled.'},
  {window:[105.97,107.21],finding:'A fourth chopped-pair template candidate near 106.17 is weak. The user transcript supplies three pairs; it remains unresolved instead of being appended as a fourth word pair.'},
  {window:[109.06,121.464],finding:'Late me-like nuclei and activity persist, but bounded recognitions are lexical failures. Existing supplied-text hypotheses stay explicitly uncertain; no additional full phrases were asserted from energy alone.'},
 ],
 limits:'A gap between acoustic focus events is different from a missing line: words can remain visible without focus, and reverb/instrumental sound can continue without another sung token. This audit identifies gaps and evidence; it does not certify listening coverage.'
};
writeFileSync(new URL('evidence/missing-vocal-audit.json',project),JSON.stringify(output,null,2)+'\n');
console.log(`Scanned ${regions.length} regions: ${output.beforeGaps.length} previous gaps; ${output.afterGaps.length} current gaps over .2s.`);
