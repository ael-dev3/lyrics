import {writeFileSync} from 'node:fs';

interface Window {id: string; start: number; end: number; text: string; leadStart: number; echoCount: number; note: string}
const windows: Window[] = [];
const groups: ReadonlyArray<{id: string; starts: readonly number[]; end: number}> = [
  {id: 'intro', starts: [0.492,4.278,8.089], end: 11.898},
  {id: 'middle', starts: [31,34.77,38.57,42.38,46.22,50,53.815,57.626], end: 62.3},
  {id: 'final', starts: [91.966,95.737,99.552,103.361], end: 107.206},
];
for (const group of groups) {
  for (const [index, leadStart] of group.starts.entries()) {
    const next = group.starts[index + 1] ?? group.end;
    for (const echoCount of [5,6]) {
      windows.push({id: `${group.id}-${index + 1}-echoes-${echoCount}`, start: leadStart-.08, end: next-.06, leadStart, echoCount,
        text: `Take me there ${Array.from({length:echoCount},()=> 'there').join(' ')}`,
        note: 'Independent waveform-correspondence phrase window. Echo count is a forced candidate to compare, not a verified performed count.'});
    }
  }
}
windows.push({id:'intro-last-lead-only',start:11.818,end:13.85,text:'Take me there',leadStart:11.898,echoCount:0,note:'Lead only; final intro echo coverage remains unresolved.'});
writeFileSync('mms-local-hook-windows.json',JSON.stringify(windows,null,2)+'\n');
