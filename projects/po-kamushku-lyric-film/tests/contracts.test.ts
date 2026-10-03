import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
import {cueLayout,cueOpacity,paintScene,setSceneForProof,stoneResponse} from '../src/scene.ts';
import {sourceActive,targetActive,visibleCue,validateTimeline,type Timeline,type Target,type Word} from '../src/model.ts';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const t=read('public/timeline.json') as Timeline;
test('complete performed inventory retains spoken opening, all repeats and ending',()=>{
  validateTimeline(t);assert.equal(t.cues.length,30);assert.equal(t.cues[0]!.templateId,'intro');
  assert.equal(t.cues.filter(c=>c.templateId==='refrain-pebbles').length,4);
  assert(t.cues.at(-1)!.end>190);assert(t.cues[0]!.start>5);
});
test('unsupported early name is absent while later audible intro remains independently timed',()=>{
  const intro=t.cues[0]!;
  assert.equal(visibleCue(t,6.2),undefined);
  assert.equal(intro.words.filter(w=>w.text==='Яна,').length,1);
  assert.equal(intro.words[0]!.startSample,323165);
  assert(sourceActive(intro.words[0]!,323165/44100));
  assert(targetActive(intro.targets[0]!,intro.words,323165/44100));
  assert.equal(t.cues.reduce((n,c)=>n+c.words.length,0),163);
  assert.equal(t.cues.reduce((n,c)=>n+c.targets.length,0),206);
});
test('every English lexical token has a complete justified source anchor',()=>{
  for(const c of t.cues)for(const token of c.targets){assert(token.rationale.length>0);assert(token.focusSourceIndices.length>0);for(const i of token.focusSourceIndices)assert(c.words[i]);}
});
test('repeated sung бегу and несу have independent source events',()=>{
  for(const c of t.cues.filter(c=>['pre-run','pre-carry'].includes(c.templateId))){assert.equal(c.words.length,4);assert(new Set(c.words.slice(1).map(w=>w.startSample)).size===3);}
});
test('translated union releases through an unrelated word or genuine gap',()=>{
  const words=[{startSample:100,endSample:200,sourceIndex:0},{startSample:300,endSample:400,sourceIndex:1},{startSample:500,endSample:600,sourceIndex:2}] as Word[];
  const target={focusSourceIndices:[0,2]} as Target;
  assert(targetActive(target,words,150/44100));assert(!targetActive(target,words,350/44100));assert(!targetActive(target,words,450/44100));assert(targetActive(target,words,550/44100));
});
test('sample-boundary float multiplication cannot delay focus by a display frame',()=>{
  for(const c of t.cues)for(const w of c.words){assert(sourceActive(w,w.startSample/44100));assert(!sourceActive(w,w.endSample/44100));assert(!sourceActive(w,(w.startSample-.001)/44100));assert(sourceActive(w,(w.endSample-.001)/44100));}
});
test('word focus ends independently of neutral lyric readability',()=>{
  for(const c of t.cues){const w=c.words.at(-1)!;assert(!sourceActive(w,(w.endSample+.5)/44100));assert(c.fullOpacityEnd>=w.endSample/44100);}
});
test('every first sung word is visible at full opacity, including atomic line handoffs',()=>{
  for(const c of t.cues){
    const first=c.words[0]!,onset=first.startSample/t.sampleRate;
    assert.equal(visibleCue(t,onset)?.id,c.id,c.id);
    assert(sourceActive(first,onset),first.id);
    assert(c.targets.some(token=>targetActive(token,c.words,onset)),c.id);
    assert.equal(cueOpacity(c,onset),1,c.id);
    assert.equal(cueOpacity(c,c.visibleStart-1/t.sampleRate),0,c.id);
    for(const w of c.words)assert.equal(cueOpacity(c,(w.endSample-.25)/t.sampleRate),1,w.id);
    if(c.visibleStart===c.start){
      assert.equal(cueOpacity(c,c.start+.0005),1,c.id);
    }else{
      assert.equal(cueOpacity(c,c.visibleStart),0,c.id);
      assert(cueOpacity(c,(c.visibleStart+c.start-.012)/2)>0,c.id);
      assert(cueOpacity(c,(c.visibleStart+c.start-.012)/2)<1,c.id);
    }
  }
});
test('printed punctuation survives without becoming an invented sung token',()=>{
  const c=t.cues.find(c=>c.templateId==='v2-broken')!;
  assert(c);assert.equal(c.words.find(w=>w.text==='моя')!.punctuationAfter,'—');assert(!c.words.some(w=>w.text==='—'));
});
test('both languages fit at equal typography without covering the central figure',()=>{
  GlobalFonts.registerFromPath('public/fonts/Alegreya.ttf','Kamushku');
  const canvas=createCanvas(1080,1920);const ctx=canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
  setSceneForProof(t,read('public/audio-features.json'),read('public/stone-anchors.json').stones);
  for(const c of t.cues)for(const f of ['landscape','portrait'] as const){const l=cueLayout(ctx,c,f);assert(l.top>(f==='portrait'?1270:730));for(const s of [...l.source,...l.target]){assert(s.x>=42);assert(s.x+s.width<=1038);assert(s.y<= (f==='portrait'?1660:1030));}}
});
test('word outlines never inherit emphasis from an adjacent word in either language',()=>{
  GlobalFonts.registerFromPath('public/fonts/Alegreya.ttf','Kamushku');
  const canvas=createCanvas(1080,1920),source=createCanvas(1080,1080);
  const context=canvas.getContext('2d');
  let outlines:{text:string;shadowColor:string;shadowBlur:number}[]=[];
  const observed=new Proxy(context,{
    get(target,key){
      if(key==='strokeText')return (text:string,x:number,y:number)=>{
        outlines.push({text,shadowColor:target.shadowColor,shadowBlur:target.shadowBlur});
        target.strokeText(text,x,y);
      };
      const value=Reflect.get(target,key,target);
      return typeof value==='function'?value.bind(target):value;
    },
    set(target,key,value){return Reflect.set(target,key,value,target);}
  }) as unknown as CanvasRenderingContext2D;
  setSceneForProof(t,read('public/audio-features.json'),read('public/stone-anchors.json').stones);
  for(const c of t.cues)for(const format of ['landscape','portrait'] as const){
    outlines=[];paintScene(observed,c.start,format,source as unknown as CanvasImageSource);
    const expected=[...c.words.map(w=>sourceActive(w,c.start)),...c.targets.map(token=>targetActive(token,c.words,c.start))];
    assert.equal(outlines.length,expected.length,c.id);
    outlines.forEach((outline,index)=>{
      assert.equal(outline.shadowBlur,expected[index]?8:5,`${c.id}/${format}/${outline.text}`);
      assert.equal(outline.shadowColor,expected[index]?'rgba(218,163,118,.25)':'rgba(0,0,0,.6)',`${c.id}/${format}/${outline.text}`);
    });
  }
});
test('stone response reconstructs from measured music and stays bounded',()=>{
  const plan=read('public/stone-anchors.json');assert(plan.stones.length>=24);
  for(const s of plan.stones){assert(s.x>0&&s.x<1080&&s.y>0&&s.y<1080);assert(s.band>=0&&s.band<24);assert.equal(stoneResponse(s,Array(26).fill(0)),0);assert(stoneResponse(s,Array(26).fill(255))<=1);}
});
