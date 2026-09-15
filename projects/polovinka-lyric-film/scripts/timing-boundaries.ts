import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {cues,frameAt,wordActive,cueAt} from '../src/timing.ts';
let boundaries=0;for(const c of cues){for(const w of [...c.ru,...c.en]){const a=frameAt(w.startSample),b=frameAt(w.endSample);assert(!wordActive(w,a-1));assert(wordActive(w,a));assert(!wordActive(w,b));assert(b>a);assert.equal(cueAt(a)?.cue.id,c.id);assert.equal(cueAt(a)?.opacity,1);boundaries+=3;}}
writeFileSync('evidence/timing-boundary-checks.json',JSON.stringify({passed:true,boundaries,clock:'48000 samples/60 fps',policy:'first frame at or after acoustic onset, exclusive end; maximum quantization delay less than 16.667ms',limitation:'Quantization verification does not certify the underlying acoustic estimates.'},null,2));console.log('PASS',boundaries,'focus boundaries');
