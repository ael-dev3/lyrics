import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {parseData} from '../src/schema.ts';
import type {ProductionData} from '../src/schema.ts';
import type {Layouts} from '../src/layout-types.ts';
import {lyricMarkup,palette} from '../src/scene.ts';

const normalize=(s:string)=>s.toLowerCase().replace(/[.,!?;:]+$/u,'');
// Editorial exceptions, independent of the encoded correspondence indices.
const exceptions:Record<string,{english:string;reason:string}>={
 'любит':{english:'has loved',reason:'One Russian verb carries the continuing-duration English verb expression.'},
 'не':{english:'but not',reason:'The contrasting negation has no separate sung conjunction.'},
 'вслух':{english:'out loud',reason:'One Russian adverb requires a complete English expression.'},
 'жарким':{english:'with blazing',reason:'Instrumental grammar enters at the inflected adjective; fire retains its own noun event.'},
 'сердце':{english:'the heart',reason:'The necessary article belongs with its noun.'},
 'улетай':{english:'fly away',reason:'The complete phrasal verb translates one Russian verb.'},
 'умоляю':{english:'am begging',reason:'The auxiliary belongs to the verb; explicitly sung I stays separate.'},
};

export function auditWordGranularity(data:ProductionData,layouts:Layouts){
 const groups=new Map<string,{source:string;english:string;reason:string;events:string[]}>();
 const expectedByWord=new Map<string,string[]>();
 let singleEnglishEvents=0;
 for(const cue of data.cues){
  for(const target of cue.en){
   const focus=target.focusSourceIds??target.sourceIds;
   assert.equal(focus.length,1,`${target.id}: display must follow one performed Russian word`);
   assert.ok(cue.ru.some(word=>word.id===focus[0]),`${target.id}: missing source event`);
  }
  for(const source of cue.ru){
   const targets=cue.en.filter(word=>(word.focusSourceIds??word.sourceIds)[0]===source.id);
   assert.ok(targets.length>0,`${source.id}: no highlighted English meaning`);
   expectedByWord.set(source.id,targets.map(word=>word.id));
   if(targets.length===1){singleEnglishEvents++;continue;}
   const text=targets.map(word=>normalize(word.text)).join(' '),exception=exceptions[normalize(source.text)];
   assert.equal(text,exception?.english,`${source.id}: unnecessary or unreviewed English grouping`);
   const key=normalize(source.text)+' / '+text;
   const group=groups.get(key)??{source:source.text,english:text,reason:exception!.reason,events:[]};
   group.events.push(source.id);groups.set(key,group);
  }
 }
 const reached=new Set<string>();let wordStates=0,emptyFrames=0;
 const round=(sample:number)=>Math.round(sample/data.sampleRate*data.fps);
 for(let frame=0;frame<data.frames;frame++){
  const sample=Math.round(frame/data.fps*data.sampleRate);
  const cue=data.cues.find(cue=>sample>=cue.visibleFrom&&sample<cue.visibleUntil);
  const active=cue?.ru.filter(word=>frame>=round(word.startSample)&&frame<round(word.endSample))??[];
  assert.ok(active.length<=1,`Frame ${frame}: overlapping Russian word events`);
  const expected=new Set(active.flatMap(word=>[word.id,...expectedByWord.get(word.id)!]));
  for(const id of expected)reached.add(id);
  if(!cue)emptyFrames++;
  for(const format of ['landscape','portrait'] as const){
   const markup=lyricMarkup(frame,format,data,layouts);
   const glyphs=[...markup.matchAll(/<text data-word="([^"]+)" data-language="(?:ru|en)"[^>]* fill="([^"]+)"/g)];
   assert.deepEqual(glyphs.map(glyph=>glyph[1]).sort(),cue?[...cue.ru,...cue.en].map(word=>word.id).sort():[],`${format} frame ${frame}: incomplete displayed text`);
   for(const glyph of glyphs){
    assert.equal(glyph[2],expected.has(glyph[1]!)?palette.active:palette.rest,`${format} frame ${frame} ${glyph[1]}: wrong focus color`);
    wordStates++;
   }
  }
 }
 const allIds=data.cues.flatMap(cue=>[...cue.ru,...cue.en].map(word=>word.id));
 assert.deepEqual([...reached].sort(),allIds.sort(),'Every displayed word must receive focus during the recording');
 return {cues:data.cues.length,russianWords:data.cues.flatMap(cue=>cue.ru).length,englishWords:data.cues.flatMap(cue=>cue.en).length,
  russianWordsAlwaysIndependent:true,singleEnglishEvents,necessaryEnglishPairs:[...groups.values()],
  presentationFrames:data.frames,formats:2,wordColorStatesChecked:wordStates,emptyFramesPerFormat:emptyFrames,
  skippedWords:0,unnecessaryGroups:0,focusColorMismatches:0};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
 const identity=read('evidence/preview-identity.json');
 for(const [path,hash] of Object.entries(identity.hashes))assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'),hash,`Stale preview input: ${path}`);
 const result=auditWordGranularity(parseData(read('src/cues.json')),read('src/layout.json') as Layouts);
 const evidence={revision:identity.revision,status:'PASS',inputIdentitySha256:createHash('sha256').update(readFileSync('evidence/preview-identity.json')).digest('hex'),
  method:'Independent sample-to-frame windows and an explicit editorial exception list checked against both formats of shared lyric SVG markup.',...result,
  limits:'This verifies word granularity, complete focus coverage and generated colors. It is not an encoded-file pixel audit or a new human listening attestation. The two revised duration cues retain their pending listening status.',
  productionInputsChanged:false,filmRendered:false};
 writeFileSync('evidence/word-granularity-audit.json',JSON.stringify(evidence,null,2)+'\n');
 console.log(JSON.stringify(evidence,null,2));
}
