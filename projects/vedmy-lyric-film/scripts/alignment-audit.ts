import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
type Candidate={method:string;word:string;start:number;end:number;probability?:number};
type Row={id:string;text:string;startSample:number;endSample:number;candidates:Candidate[];correction?:unknown;heldVowel?:unknown};
const ledger=JSON.parse(readFileSync('analysis/boundary-ledger.json','utf8')) as Row[];
const rows=ledger.map(row=>{
 assert.equal(row.candidates.length,7);
 const start=row.startSample/44100,end=row.endSample/44100;
 const candidates=row.candidates.map(c=>{
  assert.equal(c.word.trim().toLowerCase(),row.text.toLowerCase());
  assert.ok(Number.isFinite(c.start)&&Number.isFinite(c.end)&&c.start<=c.end);
  return {method:c.method,start:c.start,end:c.end,probability:c.probability,zeroDuration:c.start===c.end,onsetDifferenceMs:(c.start-start)*1000,releaseDifferenceMs:(c.end-end)*1000};
 });
 return {id:row.id,text:row.text,selected:{start,end},candidates,correction:row.correction,heldVowelCandidate:!!row.heldVowel,actualListeningPending:true};
});
const report={
 scope:'Acoustic candidate comparison, not completed normal/slow listening. Seven configurations span two model families; configurations are not seven independent methods.',
 words:rows.length,candidateRows:rows.reduce((n,r)=>n+r.candidates.length,0),
 zeroDurationCandidates:rows.flatMap(r=>r.candidates).filter(c=>c.zeroDuration).length,
 corrections:rows.filter(r=>r.correction).map(r=>({id:r.id,text:r.text,selected:r.selected,correction:r.correction})),
 retainedCautions:[
  'Whisper may absorb leading silence or assign zero duration to a supplied short word; confident text probabilities do not certify timestamps.',
  'Wider MMS windows can move final tokens into reverberation or the next phrase. Such candidates do not automatically replace the selected map.',
  'Eight periodicity-based sustained releases require checks against neighboring consonants; stem voicing alone does not identify a word.',
  'Independent recognition varies on short words in VE-008/012, the imperative in VE-017 and the supplied wording in VE-027/028/034. Preserve the supplied reference and resolve these against the recording before production.'
 ],rows
};
writeFileSync('evidence/alignment-audit.json',JSON.stringify(report,null,2)+'\n');
console.log({words:report.words,candidateRows:report.candidateRows,zeroDurationCandidates:report.zeroDurationCandidates,corrections:report.corrections.map(c=>c.id)});
