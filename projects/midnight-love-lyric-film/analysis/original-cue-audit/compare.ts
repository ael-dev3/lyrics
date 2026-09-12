import {readFileSync,writeFileSync} from 'node:fs';
type Word={word:string;start:number;end:number;probability:number};
type Entry={cue:string;word:string;selected:{start:number;end:number};selection:string;candidates:Record<string,Word>;candidateOnsetSpreadMs:number};
type Cue={id:string;startSample:number;endSample:number;words:{text:string;startSample:number;endSample:number;confidence:number}[];groups:number[][]};
const audit=JSON.parse(readFileSync('../midnight-love/analysis/alignment-decisions.json','utf8')) as {words:Entry[]};
const cues=JSON.parse(readFileSync('../midnight-love/src/cues.json','utf8')) as Cue[];
const rows=audit.words.map((w,i)=>{const c=cues.find(c=>c.id===w.cue);if(!c)throw Error('Cue missing');const previous=audit.words.slice(0,i).filter(x=>x.cue===w.cue).length;const token=c.words[previous];if(!token)throw Error('Word missing');return {...w,k:previous,presented:{start:token.startSample/48000,end:token.endSample/48000},group:c.groups.find(g=>g.includes(previous))};});
writeFileSync('analysis/original-cue-audit/comparison.json',JSON.stringify(rows,null,2));
let output='Original delivered source-word timing vs candidates; times in seconds. Order: delivered | vocal MMS | mix MMS | English CTC | bounded attention.\n';
for(const c of cues){output+='\n'+c.id+' '+c.words.map(w=>w.text).join(' ')+'\n';for(const r of rows.filter(r=>r.cue===c.id)){const candidates=['vocalMMS','mixMMS','englishCTC','boundedAttention'].map(k=>r.candidates[k]);output+=`${r.k} ${r.word.padEnd(14)} ${r.presented.start.toFixed(3)}–${r.presented.end.toFixed(3)} | `+candidates.map(w=>w?`${w.start.toFixed(3)}–${w.end.toFixed(3)}(${w.probability.toFixed(2)})`:'missing').join(' | ')+` group ${r.group?.join(',')}\n`;}}
writeFileSync('analysis/original-cue-audit/comparison.txt',output);console.log(output);
