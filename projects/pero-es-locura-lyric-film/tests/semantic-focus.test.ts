import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseData} from '../src/schema.ts';
import {activeTargets,activeSource,activeDisplaySource,sourceFocusIds,targetFocusIds,frameAt} from '../src/focus.ts';

const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const data=parseData(read('src/cues.json'));
const clean=(s:string)=>s.toLowerCase().replace(/[.,!?]/g,'');
const phrases=['love you','to tell you','inspires me','add to me','expand me','make me','separate us','my heart','be soaked'];

test('Complete English predicates and displaced possession survive each contributing source event',()=>{
  let occurrences=0,oldMappingFailures=0;
  for(const cue of data.cues)for(const phrase of phrases){
    const tokens=phrase.split(' ');
    for(let i=0;i<=cue.en.length-tokens.length;i++){
      if(!tokens.every((text,j)=>clean(cue.en[i+j]!.text)===text))continue;
      occurrences++;const words=cue.en.slice(i,i+tokens.length);
      const sourceIds=new Set(words.flatMap(w=>w.sourceIds));
      for(let frame=frameAt(cue.startSample,data.sampleRate,60)-1;frame<=frameAt(cue.endSample,data.sampleRate,60)+1;frame++){
        const source=activeSource(cue,frame,data),target=activeTargets(cue,frame,data);
        const expected=[...sourceIds].some(id=>source.has(id));
        for(const word of words){
          assert.equal(target.has(word.id),expected,`${cue.id}/${phrase}/${word.text}/${frame}`);
          if(word.sourceIds.some(id=>source.has(id))!==expected)oldMappingFailures++;
        }
      }
    }
  }
  assert.equal(occurrences,58,'Every performed repeat must receive the correction');
  assert.ok(oldMappingFailures>1000,'The previous lexical-only implementation must fail this semantic regression');
});

test('Wanting to tell someone is distinct from loving them; gaps never keep an unrelated predicate lit',()=>{
  for(const cue of data.cues){
    const want=cue.en.find(w=>clean(w.text)==='want'),tell=cue.en.find(w=>clean(w.text)==='tell'),love=cue.en.find(w=>clean(w.text)==='love');
    if(!want||!tell||!love)continue;
    const source=cue.es.find(w=>want.sourceIds.includes(w.id))!;
    for(let f=frameAt(source.startSample,data.sampleRate,60);f<frameAt(source.endSample,data.sampleRate,60);f++){
      const active=activeTargets(cue,f,data);assert.ok(active.has(want.id));assert.ok(!active.has(tell.id));assert.ok(!active.has(love.id));
    }
  }
});

test('Subjunctive subject and copula follow estés; the complement marker does not fabricate a you event',()=>{
  const cue=data.cues.find(c=>c.es.some(w=>clean(w.text)==='empapado'))!;
  const source=(text:string)=>cue.es.find(w=>clean(w.text)===text)!.id;
  const target=(text:string)=>cue.en.find(w=>clean(w.text)===text)!;
  assert.deepEqual(target('you').sourceIds,[source('estés')]);
  assert.deepEqual(target('to').sourceIds,[source('que')]);
  assert.deepEqual(target('be').sourceIds,[source('estés')]);
  assert.deepEqual(target('soaked').sourceIds,[source('empapado')]);
});

test('Revision changes no source timestamps, visible wording, layout geometry or audio clock',()=>{
  const baseline=read('evidence/history/delivery-v1/invariants.json');
  const projection={clock:Object.fromEntries(['sampleRate','sampleCount','duration','fps','frames','audioSha256'].map(k=>[k,data[k as keyof typeof data]])),cues:data.cues.map(c=>({id:c.id,section:c.section,es:c.es,startSample:c.startSample,endSample:c.endSample,visibleFrom:c.visibleFrom,visibleUntil:c.visibleUntil,en:c.en.map(w=>({id:w.id,text:w.text}))}))};
  assert.deepEqual(projection,baseline.projection);
  const layouts=read('src/layout.json');
  const geometry=Object.fromEntries(Object.entries(layouts).map(([format,raw])=>{
    const l=raw as Record<string,any>;
    return [format,{...Object.fromEntries(Object.entries(l).filter(([k])=>k!=='cues')),cues:Object.fromEntries(Object.entries(l.cues).map(([id,raw])=>{
      const cue=raw as Record<string,Record<string,unknown>[]>;
      return [id,Object.fromEntries(['es','en'].map(lang=>[lang,cue[lang]!.map(w=>Object.fromEntries(['id','text','x','y','width'].map(k=>[k,w[k]])))]))];
    }))}];
  }));
  assert.deepEqual(geometry,baseline.geometry);
});

test('Focus metadata rejects orphaned words, unrelated source events and inconsistent group members',()=>{
  for(const defect of ['missing-source','unrelated-source','different-member']){
    const copy=structuredClone(data),cue=copy.cues.find(c=>c.en.some(w=>w.focusGroup))!;
    const member=cue.en.find(w=>w.focusGroup)!,group=cue.en.filter(w=>w.focusGroup===member.focusGroup);
    if(defect==='missing-source')member.focusSourceIds=['not-a-source-id'];
    if(defect==='unrelated-source')for(const w of group)w.focusSourceIds=[...w.focusSourceIds!,cue.es[0]!.id];
    if(defect==='different-member')member.focusSourceIds=[member.sourceIds[0]!];
    assert.throws(()=>parseData(copy));
  }
});


test('Te quiero and its complete English phrase share every source event in both directions',()=>{
 let pairs=0,spanishFailuresUnderV2=0;
 for(const cue of data.cues)for(let index=0;index<cue.es.length-1;index++){
  const te=cue.es[index]!,quiero=cue.es[index+1]!;
  if(clean(te.text)!=='te'||clean(quiero.text)!=='quiero')continue;
  // The opening te quiero decir means wanting to tell; only affection predicates qualify.
  const love=cue.en.find(w=>clean(w.text)==='love'&&w.sourceIds.includes(quiero.id));if(!love)continue;
  pairs++;const you=cue.en.find(w=>clean(w.text)==='you'&&w.sourceIds.includes(te.id))!;
  const impliedI=cue.en.find(w=>clean(w.text)==='i'&&w.sourceIds.includes(quiero.id));
  for(let frame=frameAt(te.startSample,data.sampleRate,60)-1;frame<=frameAt(quiero.endSample,data.sampleRate,60)+1;frame++){
   const acoustic=activeSource(cue,frame,data),expected=acoustic.has(te.id)||acoustic.has(quiero.id);
   const es=activeDisplaySource(cue,frame,data),en=activeTargets(cue,frame,data);
   for(const word of [te,quiero]){assert.equal(es.has(word.id),expected);if(acoustic.has(word.id)!==expected)spanishFailuresUnderV2++;}
   for(const word of [love,you,...(impliedI?[impliedI]:[])])assert.equal(en.has(word.id),expected,`${cue.id}/${word.text}/${frame}`);
  }
 }
 assert.equal(pairs,20);assert.ok(spanishFailuresUnderV2>500);
});

test('Every paired unit contains all corresponding words, without a one-sided grammatical fragment',()=>{
 for(const cue of data.cues)for(const target of cue.en){
  const unit=sourceFocusIds(cue,targetFocusIds(target)[0]!);
  assert.deepEqual([...targetFocusIds(target)].sort(),[...unit].sort(),`${cue.id}: incomplete target ${target.text}`);
  for(let frame=frameAt(cue.startSample,data.sampleRate,60)-1;frame<=frameAt(cue.endSample,data.sampleRate,60)+1;frame++){
   const expected=activeTargets(cue,frame,data).has(target.id),es=activeDisplaySource(cue,frame,data);
   for(const source of unit)assert.equal(es.has(source),expected,`${cue.id}/${target.text}/${source}/${frame}`);
  }
 }
});

test('Source grouping preserves unrelated querer, stole, explicit yo, held aún, negation and golden/boy',()=>{
 const check=(cueId:string,sourceId:string,expected:string[])=>{const cue=data.cues.find(c=>c.id===cueId)!;assert.deepEqual(sourceFocusIds(cue,sourceId).map(id=>clean(cue.es.find(w=>w.id===id)!.text)),expected);};
 const opening=data.cues[0]!;
 check(opening.id,opening.es[3]!.id,['quiero']); // wanting, not the subsequent affection predicate
 const heart=data.cues.find(c=>c.es.some(w=>clean(w.text)==='robó'))!;
 check(heart.id,heart.es.find(w=>clean(w.text)==='robó')!.id,['robó']);
 for(const cue of data.cues)for(const word of cue.es)if(['aún','yo','no','dorado','muchacho'].includes(clean(word.text)))check(cue.id,word.id,[clean(word.text)]);
});
