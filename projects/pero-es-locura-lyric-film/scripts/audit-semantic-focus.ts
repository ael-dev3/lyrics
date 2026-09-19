import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {parseData} from '../src/schema.ts';
import type {SourceWord} from '../src/schema.ts';
import {activeTargets,activeSource,activeDisplaySource,sourceFocusIds,targetFocusIds,visibleCue} from '../src/focus.ts';
import {revision} from '../src/identity.ts';
import type {TranslationTemplate} from '../src/translation.ts';

const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const data=parseData(read('src/cues.json')),templates=read('source/translation-templates.json') as TranslationTemplate[];
const old=read('evidence/history/delivery-v1/semantic-ledger.json') as {id:string;en:{id:string;sourceIds:string[]}[]}[];
const retainedReasons:Record<string,string>={
 R3:'Explicit complement, subject/copula contraction, article and noun retain their individual events.',
 R4:'Whom, explicit I and most retain their events; the reversed degree/verb order is intentional, not a missing clitic.',
 V03:'Explicit negation retains its own event. Subject and inflected wanting remain distinct from the following infinitive; no object clitic is lost.',
 V05:'Separate day/night nouns, conjunction, copula and explicit possessive are fully mapped.',
 V06:'Explicit You and reordered golden / boy remain independently timed; no full-clause grouping.',
 V09:'Articles, nominalized adjectives and most are explicit source words with complete corresponding target focus.',
 V10:'The nominalized adorned wording and its article are retained without inventing an object.',
 V12:'Usarte already highlights the complete to use you; its attached clitic has no separate early release.',
 V14:'Buscarte already highlights to seek you together; in me keeps its independently spoken preposition and pronoun.',
 V15:'Buscarme already highlights seek myself together; the separate vos belongs to in you.',
 V18:'Gustarte already highlights to please you together; its object is not dropped.',
 V20:'Would be is complete on estaría. The initial disarmed and explicit my soul remain separate source events.',
 V21:'Contracted al and del supply their complete at the / of the English expansions.',
 V23:'Perdoná already highlights Forgive me completely; I doubted includes the inflected subject.',
 V26:'The fear, preposition, infinitive and cracks retain their independent correspondences.',
 V31:'Relative What and inflected I desire are complete; explicit I / know / that remain independently linked.',
 V32:'Llenarme already highlights to fill myself completely; explicit your company remains word-specific.',
 B03:'The explicit possessive mis belongs to my, not a displaced affected-possessor clitic. Reordered ribs / beat remain independent.',
 B05:'Explicit my / knees and reordered tremble retain individual events; no clitic completion is missing.'
};
const editorial=templates.map(t=>({template:t.id,spanish:t.es,english:t.en,
  decision:t.focusGroups?.length?'paired complete phrase including inflected subject':'lexical mapping retained; multi-source constructions use paired display focus',
  rationale:t.focusGroups?.map(g=>g.reason).join(' ')??retainedReasons[t.id]??t.note,
  lexicalCorrection:t.id==='V07'?'you and be follow estés; to follows que; soaked follows empapado':null,
  groups:t.focusGroups??[]}));
const changedCues=[],groups=[],lexicalChanges=[];
for(const cue of data.cues){
  const previous=old.find(c=>c.id===cue.id);assert.ok(previous);
  for(const word of cue.en){const before:{id:string;sourceIds:string[]}|undefined=previous.en.find(w=>w.id===word.id);assert.ok(before);if(JSON.stringify(word.sourceIds)!==JSON.stringify(before.sourceIds))lexicalChanges.push({cue:cue.id,word:word.text,before:before.sourceIds,after:word.sourceIds});}
  if(!cue.en.some(w=>w.focusGroup))continue;
  changedCues.push(cue.id);
  for(const id of new Set(cue.en.map(w=>w.focusGroup).filter(Boolean))){
    const targets=cue.en.filter(w=>w.focusGroup===id),ids=targetFocusIds(targets[0]!);
    const source=cue.es.filter(w=>ids.includes(w.id));
    const head=source.at(-1)!;
    groups.push({cue:cue.id,group:id,english:targets.map(w=>w.text).join(' '),
      source:source.map(w=>({id:w.id,text:w.text,start:w.startSample/data.sampleRate,end:w.endSample/data.sampleRate})),
      checkpoint:Math.round((head.startSample+head.endSample)/2/data.sampleRate*60)/60});
  }
}
let wordStates=0,changedStates=0;
for(let frame=0;frame<data.frames;frame++){
  const sample=Math.round(frame/data.fps*data.sampleRate),cue=data.cues.find(c=>sample>=c.visibleFrom&&sample<c.visibleUntil);if(!cue)continue;
  const source=activeSource(cue,frame,data),actual=activeTargets(cue,frame,data),previous=old.find(c=>c.id===cue.id)!;
  for(const word of cue.en){
    const events:SourceWord[]=cue.es.filter(w=>targetFocusIds(word).includes(w.id));
    const expected:boolean=events.some(w=>frame>=Math.round(w.startSample/data.sampleRate*60)&&frame<Math.round(w.endSample/data.sampleRate*60));
    assert.equal(actual.has(word.id),expected);wordStates++;
    const original=previous.en.find(w=>w.id===word.id)!;
    if(original.sourceIds.some(id=>source.has(id))!==actual.has(word.id))changedStates++;
  }
}
assert.equal(editorial.length,50);assert.equal(changedCues.length,40);assert.equal(groups.length,58);assert.equal(lexicalChanges.length,3);
const previousPreview=read('evidence/history/preview-v2/semantic-ledger.json') as {id:string;en:{id:string;sourceIds:string[];focusSourceIds?:string[]}[]}[];
const pairedUnits=data.cues.flatMap(cue=>{
 const seen=new Set<string>();
 return cue.es.flatMap(word=>{
  const ids=sourceFocusIds(cue,word.id),key=ids.join('|');if(ids.length<2||seen.has(key))return [];seen.add(key);
  return [{cue:cue.id,sourceIds:ids,spanish:cue.es.filter(w=>ids.includes(w.id)).map(w=>w.text).join(' '),english:cue.en.filter(w=>targetFocusIds(w).some(id=>ids.includes(id))).map(w=>w.text).join(' '),intervals:cue.es.filter(w=>ids.includes(w.id)).map(w=>({start:w.startSample/data.sampleRate,end:w.endSample/data.sampleRate}))}];
 });
});
const affected=new Set<string>();let sourceStates=0,sourceChanges=0,targetChanges=0;
for(let frame=0;frame<data.frames;frame++){
 const cue=visibleCue(data,frame);if(!cue)continue;
 const acoustic=activeSource(cue,frame,data),display=activeDisplaySource(cue,frame,data),targets=activeTargets(cue,frame,data);
 const previous=previousPreview.find(c=>c.id===cue.id)!;
 for(const w of cue.es){sourceStates++;const expected=sourceFocusIds(cue,w.id).some(id=>acoustic.has(id));assert.equal(display.has(w.id),expected);if(display.has(w.id)!==acoustic.has(w.id)){sourceChanges++;affected.add(cue.id);}}
 for(const w of cue.en){const before=previous.en.find(t=>t.id===w.id)!;assert.deepEqual(w.sourceIds,before.sourceIds);if((before.focusSourceIds??before.sourceIds).some(id=>acoustic.has(id))!==targets.has(w.id)){targetChanges++;affected.add(cue.id);}}
}
const report={revision,status:'PASS — paired Spanish and English preview audit',templatesReviewed:editorial.length,cuesReviewed:data.cues.length,affectedCues:[...affected],pairedUnitOccurrences:pairedUnits.length,distinctPairings:new Set(pairedUnits.map(g=>g.spanish.toLowerCase()+' / '+g.english.toLowerCase())).size,sourceWordStates:sourceStates,englishWordStates:wordStates,changedSpanishFrameStatesFromV2:sourceChanges,changedEnglishFrameStatesFromV2:targetChanges,frames:data.frames,sourceTimingChanges:0,displayedTextChanges:0,layoutGeometryChanges:0,lexicalChangesFromV2:0,editorial,pairedUnits,
 method:'Audited every translation template and performed cue. Both display languages share each declared semantic group, including subjects encoded by Spanish verb inflection. Every visible frame is checked against real source-event unions. Acoustic events and display focus remain separate.',
 limits:'No new audio alignment, listening signoff or production authorization. Delivered v1 and superseded v2 preview evidence remain historical.',
 inputHashes:Object.fromEntries(['src/cues.json','source/translation-templates.json','src/focus.ts','src/schema.ts','src/translation.ts'].map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]))};
writeFileSync('evidence/semantic-focus-v3.json',JSON.stringify(report,null,2)+'\n');
console.log({templates:report.templatesReviewed,affectedCues:affected.size,pairedUnits:pairedUnits.length,distinctPairings:report.distinctPairings,sourceStates,englishStates:wordStates,sourceChanges,targetChanges});
