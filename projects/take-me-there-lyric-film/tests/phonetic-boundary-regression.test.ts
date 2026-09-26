import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseTimeline,cueAt,wordActive} from '../src/model.ts';

const timeline=parseTimeline(JSON.parse(readFileSync(new URL('../public/timeline.json',import.meta.url),'utf8')));
function active(t:number):string[]{return cueAt(timeline,t)?.words.filter(word=>wordActive(word,t)).map(word=>word.text)??[];}
function cue(id:string){const selected=timeline.cues.find(cue=>cue.id===id);assert.ok(selected,`Missing ${id}`);return selected;}

test('First verse retains the GO release, the real rest, and one FAR consonant near19.07s',()=>{
 assert.deepEqual(active(18.05),['go']);
 assert.deepEqual(active(18.5),[]);
 assert.deepEqual(active(19.04),[]);
 assert.deepEqual(active(19.15),['far']);
 assert.deepEqual(active(19.55),['away']);
 assert.equal(cue('verse-one-a-a').words.filter(word=>word.text==='far').length,1);
 assert.equal(cue('verse-two-a-a').words.filter(word=>word.text==='far').length,2);
});

test('ROOM and ANYWHERE do not acquire early highlights from ASR padding',()=>{
 for(const t of [20.8,26.4,87.4])assert.deepEqual(active(t),[],`Unexpected padded focus at${t}s`);
 assert.deepEqual(active(21.1),['room']);
 assert.deepEqual(active(26.95),['anywhere']);
 assert.deepEqual(active(87.95),['anywhere']);
 assert.deepEqual(active(66.2),['a']);
 assert.deepEqual(active(66.5),[]);
 assert.deepEqual(active(66.9),['room']);
});

test('Late-verse pronouns and WITH follow independently corroborated boundaries',()=>{
 assert.deepEqual(active(75.2),["I'm"]);
 assert.deepEqual(active(75.25),[]);
 assert.deepEqual(active(75.3),['with']);
 assert.deepEqual(active(76.12),['you']);
 assert.deepEqual(active(91.28),['me']);
 assert.deepEqual(active(126.70),['true']);
 assert.deepEqual(active(126.78),[]);
 assert.deepEqual(active(126.90),['with']);
});

test('Repeated THERE focus respects calibrated consonant onset and separate gap',()=>{
 assert.deepEqual(active(1.45),[]);
 assert.deepEqual(active(1.515),[]);
 assert.deepEqual(active(1.55),['there']);
 for(const cue of timeline.cues){
  if(!cue.id.startsWith('intro-')&&!/^middle-[1-8]$/.test(cue.id)&&!/^final-[1-3]$/.test(cue.id))continue;
  const take=cue.words[0],there=cue.words[2];assert.ok(take&&there);
  assert.ok(Math.abs(there.start-take.start-1.033)<2/44100,`Template shift differs for${cue.id}`);
 }
 const recovered=cue('middle-extra-lead').words[2];assert.ok(recovered);
 assert.ok(Math.abs(recovered.start-45.32675736961451)<2/44100,'Local45s correction must not inherit the opening template offset');
});

test('Every selected event receives exclusive visible focus in the complete60fps scan',()=>{
 const seen=new Set<string>();
 for(let frame=0;frame<Math.ceil(timeline.duration*60);frame++){
  const t=frame/60,selected=cueAt(timeline,t),focused=selected?.words.filter(word=>wordActive(word,t))??[];
  assert.ok(focused.length<=1,`Multiple focused words at${t}`);
  for(const word of focused)seen.add(word.id);
  const all=timeline.cues.flatMap(cue=>cue.words.filter(word=>wordActive(word,t)));
  assert.deepEqual(focused.map(word=>word.id),all.map(word=>word.id),`Cue selection hides a focused word at${t}`);
 }
 const words=timeline.cues.flatMap(cue=>cue.words);
 assert.equal(words.length,225);
 assert.equal(seen.size,words.length);
 assert.deepEqual(words.filter(word=>!seen.has(word.id)).map(word=>word.id),[]);
});
