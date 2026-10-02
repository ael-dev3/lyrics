import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {sourceActive,targetActive,type Timeline} from '../src/model.ts';

const timeline=JSON.parse(readFileSync(new URL('../public/timeline.json',import.meta.url),'utf8')) as Timeline;

test('quiet leading vowels receive both language focuses before the rejected late cores',()=>{
  // Independent acoustic review points inside newly owned vowels. These are
  // recorded regressions, not synthetic times calculated from renderer logic.
  for(const [id,index,time,meaning] of [
    ['KOM-005',1,45.300,'eagle'],['KOM-005',3,48.600,'eagle'],
    ['KOM-007',3,62.300,'fire'],['KOM-013',1,132.400,'eagle'],
    ['KOM-013',3,135.760,'eagle'],['KOM-015',3,149.560,'fire'],
    ['KOM-021',1,180.450,'eagle'],['KOM-021',3,183.800,'eagle'],
  ] as const) {
    const cue=timeline.cues.find(c=>c.id===id)!;
    assert.equal(sourceActive(cue.words[index]!,time),true,`${id} leading vowel`);
    assert.equal(sourceActive(cue.words[index-1]!,time),false,`${id} previous word ownership`);
    const targets=cue.targets.filter(t=>t.text.toLowerCase().replace(/[,!.?]/g,'')===meaning && t.focusSourceIndices.includes(index));
    assert.equal(targets.length,1,`${id} independent ${meaning}`);
    assert.equal(targetActive(targets[0]!,cue.words,time),true,`${id} complete translated focus`);
  }
});

test('second refrain eagle owns its quiet vowel and complete English expansion',()=>{
  const cue=timeline.cues.find(c=>c.id==='KOM-013')!;
  // Original harmonic change132.28–132.33 precedes the stronger vowel and r.
  // At132.25 the prior final vowel still owns focus; at132.40 the new vowel does.
  assert.equal(sourceActive(cue.words[0]!,132.250),true);
  assert.equal(sourceActive(cue.words[1]!,132.250),false);
  assert.equal(sourceActive(cue.words[0]!,132.400),false);
  assert.equal(sourceActive(cue.words[1]!,132.400),true);
  const translated=cue.targets.filter(t=>t.focusSourceIndices.includes(1));
  assert.deepEqual(translated.map(t=>t.text),['an','eagle,']);
  for(const word of translated)assert.equal(targetActive(word,cue.words,132.400),true);
});

test('critical second fire switches at its quiet vowel, before the internal consonant closure',()=>{
  const cue=timeline.cues.find(c=>c.id==='KOM-007')!;
  const word=cue.words[3]!,prior=cue.words[2]!;
  assert.equal(word.startSample,2741256); // reviewed62.160 s, not old63.073 or g-like62.425
  assert.equal(prior.endSample,word.startSample);
  assert.equal(sourceActive(word,62.16-1/44100),false);
  assert.equal(sourceActive(prior,62.16-1/44100),true);
  assert.equal(sourceActive(word,62.16+1/44100),true);
  assert.equal(sourceActive(prior,62.16+1/44100),false);
});

test('second eagle repetition includes its quiet prefix and complete translated meaning',()=>{
  const cue=timeline.cues.find(c=>c.id==='KOM-013')!;
  // Recorded quiet body135.66–135.75, before the old135.850 stronger core.
  assert.equal(sourceActive(cue.words[2]!,135.600),true);
  assert.equal(sourceActive(cue.words[3]!,135.600),false);
  assert.equal(sourceActive(cue.words[2]!,135.760),false);
  assert.equal(sourceActive(cue.words[3]!,135.760),true);
  const translated=cue.targets.filter(t=>t.focusSourceIndices.includes(3));
  assert.deepEqual(translated.map(t=>t.text),['an','eagle']);
  for(const word of translated)assert.equal(targetActive(word,cue.words,135.760),true);
});

test('quiet nasal and trill beginnings activate before their former strong cores',()=>{
  for(const [id,index,time] of [['KOM-002',1,17.150],['KOM-003',5,27.100],['KOM-003',6,27.940]] as const) {
    const cue=timeline.cues.find(c=>c.id===id)!;
    assert.equal(sourceActive(cue.words[index]!,time),true);
    assert.equal(sourceActive(cue.words[index-1]!,time),false);
    const owned=cue.targets.filter(t=>t.focusSourceIndices.includes(index));
    assert(owned.length>0);
    for(const target of owned)assert.equal(targetActive(target,cue.words,time),true);
  }
});

test('second refrain fire includes its quiet prefix before the internal consonant closure',()=>{
  const cue=timeline.cues.find(c=>c.id==='KOM-015')!;
  // Recorded changed quiet body149.44–149.50 precedes the later g-like closure.
  assert.equal(sourceActive(cue.words[2]!,149.400),true);
  assert.equal(sourceActive(cue.words[3]!,149.400),false);
  assert.equal(sourceActive(cue.words[2]!,149.560),false);
  assert.equal(sourceActive(cue.words[3]!,149.560),true);
  const translated=cue.targets.filter(t=>t.focusSourceIndices.includes(3));
  assert.deepEqual(translated.map(t=>t.text),['fire']);
  assert.equal(targetActive(translated[0]!,cue.words,149.560),true);
  assert.equal(targetActive(cue.targets.find(t=>t.text==='like')!,cue.words,149.560),false);
});


test('final refrain second eagle includes the quiet leading vowel in both language lanes',()=>{
  const cue=timeline.cues.find(c=>c.id==='KOM-021')!;
  // Source narrowing183.53–.61 precedes the changed quiet body183.69–.80.
  assert.equal(sourceActive(cue.words[2]!,183.640),true);
  assert.equal(sourceActive(cue.words[3]!,183.640),false);
  assert.equal(sourceActive(cue.words[2]!,183.800),false);
  assert.equal(sourceActive(cue.words[3]!,183.800),true);
  const translated=cue.targets.filter(t=>t.focusSourceIndices.includes(3));
  assert.deepEqual(translated.map(t=>t.text),['an','eagle']);
  for(const word of translated)assert.equal(targetActive(word,cue.words,183.800),true);
  assert.equal(targetActive(cue.targets.find(t=>t.text==='like')!,cue.words,183.800),false);
});


test('final refrain first eagle receives its quiet opening and complete English article',()=>{
  const cue=timeline.cues.find(c=>c.id==='KOM-021')!;
  // The changed quiet body180.33–.43 precedes the rejected180.550 stronger boundary.
  assert.equal(sourceActive(cue.words[0]!,180.280),true);
  assert.equal(sourceActive(cue.words[1]!,180.280),false);
  assert.equal(sourceActive(cue.words[0]!,180.450),false);
  assert.equal(sourceActive(cue.words[1]!,180.450),true);
  const translated=cue.targets.filter(t=>t.focusSourceIndices.includes(1));
  assert.deepEqual(translated.map(t=>t.text),['an','eagle,']);
  for(const word of translated)assert.equal(targetActive(word,cue.words,180.450),true);
  assert.equal(targetActive(cue.targets.find(t=>t.text==='Like')!,cue.words,180.450),false);
});
