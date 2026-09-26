import {readFileSync,writeFileSync} from 'node:fs';

interface Word {word: string; start: number; end: number; score: number}
interface Segment {id: string; start: number; end: number; words: Word[]}
function record(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error('Expected object');
  return value as Record<string, unknown>;
}
function number(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Expected finite number');
  return value;
}
function string(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Expected string');
  return value;
}
function segments(file: string): Segment[] {
  const result = record(JSON.parse(readFileSync(file,'utf8')));
  if (!Array.isArray(result.segments)) throw new Error('Missing segments');
  return result.segments.map((value: unknown) => {
    const segment = record(value);
    if (!Array.isArray(segment.words)) throw new Error('Missing words');
    return {id:string(segment.id),start:number(segment.start),end:number(segment.end),words:segment.words.map((value: unknown) => {
      const word=record(value);
      return {word:string(word.word),start:number(word.start),end:number(word.end),score:number(word.score)};
    })};
  });
}
const round=(value:number)=>Math.round(value*1000000)/1000000;
const results = ['mix','vocals'].map(audio=>({audio, segments:segments(`mms-local-hooks-${audio}.json`).map(segment=>{
  const words=segment.words.map((word,index)=>({ ...word,duration:round(word.end-word.start), flags:[
    ...(word.end-word.start<=.001?['zero-or-negative-duration']:[]),
    ...(word.end-word.start<.08?['short-word-under-80ms']:[]),
    ...(index>=3 && word.end-word.start>.65?['long-echo-over-650ms']:[]),
    ...(word.score<.02?['low-internal-score-under-0.02']:[]),
    ...(word.start-segment.start<.035?['touches-window-start']:[]),
    ...(segment.end-word.end<.035?['touches-window-end']:[]),
    ...(index>=3 && Math.abs(word.start-(segment.words[index-1]?.end ?? -100))<.001?['echo-shares-boundary-with-previous']:[]),
  ]}));
  const echoes=words.slice(3);
  return {id:segment.id,start:segment.start,end:segment.end,submittedEchoCount:echoes.length,
    meanWordScore:round(words.reduce((sum,w)=>sum+w.score,0)/words.length),
    meanEchoScore:echoes.length?round(echoes.reduce((sum,w)=>sum+w.score,0)/echoes.length):null,
    minimumScore:round(Math.min(...words.map(w=>w.score))),
    flaggedWordCount:words.filter(w=>w.flags.length).length,
    words};
})}));
writeFileSync('mms-local-hooks-comparison.json',JSON.stringify({
  purpose:'Compare five versus six forced delay-echo words inside independently measured lead-restart windows.',
  limitations:'MMS internal scores are not word-presence probabilities. These thresholds are diagnostic flags only. A higher score or a plausible forced path does not establish the echo count. No candidate has been selected as final.',
  results,
},null,2)+'\n');
for(const result of results)for(const segment of result.segments)console.log(result.audio,segment.id,segment.meanWordScore,segment.meanEchoScore,segment.flaggedWordCount,segment.words.map(w=>`${w.word}:${w.start.toFixed(3)}-${w.end.toFixed(3)}`).join(' '));
