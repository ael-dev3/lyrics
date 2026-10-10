import {readFileSync,writeFileSync} from 'node:fs';
import {readingWindow,validateTimeline,type Cue,type Timeline} from '../src/model.ts';
const root=new URL('../',import.meta.url);
const recording=JSON.parse(readFileSync(new URL('source/recording.json',root),'utf8')) as {sourceSha256:string;sourceDuration:number};
interface Template{key:string;ru:string;en:string;map:number[][];punctuation:Record<number,string>;reason?:Record<number,string>}
const templates:Template[]=[
 {key:'a',ru:'Я тебя запомнила ты та скотина',en:"I remembered you you're that beast",map:[[0],[2],[1],[3],[4],[5]],punctuation:{2:' —'},reason:{1:'Past remember verb; natural English order keeps the explicit object independent.',3:'Russian omits the present copula; the complete English contracted copula shares ты.'}},
 {key:'b',ru:'Что поселилась внутри головы',en:'That settled inside my head',map:[[0],[1],[2],[3],[3]],punctuation:{},reason:{3:'My is the contextual head owner in the preceding first-person clause; it shares the head event, without a fabricated possessive time.'}},
 {key:'c',ru:'Будешь теперь мне вместо глицина',en:"Now you'll be my substitute for glycine",map:[[1],[0],[0],[2],[3],[3],[4]],punctuation:{},reason:{1:'The inflected future verb expands into the complete English you will be.',4:'Substitute for is a complete lexical equivalent of вместо.'}},
 {key:'d',ru:'Не сопротивляйся мы будем дружить',en:"Don't resist we will be friends",map:[[0],[1],[2],[3],[3],[4]],punctuation:{1:','},reason:{0:'Negative auxiliary follows the independently sung negation.',3:'Future auxiliary is distinct from the explicit subject we.'}},
 {key:'e',ru:'Я тебя люблю это ты то животное',en:"I love you you're that animal",map:[[0],[2],[1],[3,4],[5],[6]],punctuation:{2:' —'},reason:{3:'The Russian deictic identification это ты is a copular construction in natural English. You are follows the union of its two independently measured events, releasing over any gap.'}},
 {key:'f',ru:'Тёплое мягкое хочется трогать',en:'Warm soft I want to touch',map:[[0],[1],[2],[2],[2],[3]],punctuation:{0:',',1:' —'},reason:{2:'The impersonal desire expands into I want to; no unstated touch object is supplied.'}},
 {key:'g',ru:'Хочется чувствовать что-то особое',en:'I want to feel something special',map:[[0],[0],[0],[1],[2],[3]],punctuation:{},reason:{0:'Complete desire construction receives one source event; feel and something special retain their separate events.'}},
 {key:'h',ru:'Что-то красивее хрипов больного',en:"Something prettier than a sick person's wheezing",map:[[0],[1],[1],[3],[3],[3],[2]],punctuation:{},reason:{1:'Comparative morphology supplies than; it shares the comparative.',3:'A sick person is a singular nominalized adjective; the complete possessive span shares больного.',6:'Natural English word order places the individually timed wheezing after its possessor.'}},
];
const selections:Record<string,[number,number][]>= {
 'v1-a':[[8.12,8.55],[8.55,9.07],[9.07,10.18],[10.23,10.56],[10.57,10.84],[10.85,11.76]],
 'v1-b':[[12.055,12.34],[12.35,13.69],[13.70,14.19],[14.20,15.36]],
 'v1-c':[[15.81,16.56],[16.57,17.16],[17.17,17.53],[17.54,18.29],[18.30,19.28]],
 'v1-d':[[19.565,19.81],[19.815,21.18],[21.27,21.44],[21.45,22.15],[22.16,22.91]],
 'v1-e':[[23.21,23.60],[23.60,24.05],[24.05,24.72],[24.77,25.19],[25.20,25.53],[25.54,25.90],[25.91,27.08]],
 'v1-f':[[27.105,28.025],[28.06,28.96],[28.97,29.86],[29.87,30.70]],
 'v1-g':[[30.795,31.72],[31.73,32.75],[32.75,33.40],[33.45,34.57]],
 'v1-h':[[34.60,35.205],[35.21,36.425],[36.426,37.15],[37.151,37.88]],
 'v2-a':[[68.08,68.55],[68.55,69.06],[69.06,70.205],[70.23,70.57],[70.58,70.84],[70.85,71.77]],
 'v2-b':[[72.065,72.355],[72.365,73.70],[73.71,74.205],[74.215,75.365]],
 'v2-c':[[75.825,76.565],[76.575,77.165],[77.175,77.535],[77.545,78.295],[78.305,79.285]],
 'v2-d':[[79.565,79.815],[79.825,81.18],[81.27,81.44],[81.45,82.155],[82.165,82.915]],
 'v2-e':[[83.22,83.60],[83.60,84.05],[84.05,84.72],[84.77,85.19],[85.20,85.53],[85.54,85.90],[85.91,87.075]],
 'v2-f':[[87.105,88.03],[88.065,88.965],[88.975,89.86],[89.87,90.70]],
 'v2-g':[[90.795,91.72],[91.73,92.755],[92.755,93.41],[93.46,94.575]],
 'v2-h':[[94.60,95.215],[95.225,96.43],[96.435,97.15],[97.151,97.88]],
};
const selected:Cue[]=[];
for(const section of ['v1','v2'])for(const template of templates){
 const id=section+'-'+template.key,times=selections[id];if(!times)throw Error(id);
 const ru=template.ru.split(' '),en=template.en.split(' ');
 if(ru.length!==times.length||en.length!==template.map.length)throw Error('Token coverage '+id);
 const words=ru.map((text,i)=>{const pair=times[i];if(!pair)throw Error('No selection');return {id:id+'-s'+i,text,sourceIndex:i,startSample:Math.round(pair[0]*44100),endSample:Math.round(pair[1]*44100),confidence:'Provisional; actual-audio review pending',method:'Separately selected original/stem signal context with Whisper and MMS cores retained as competing observations',...(template.punctuation[i]?{punctuationAfter:template.punctuation[i]}:{})}});
 const englishPunctuation:Record<string,Record<number,string>>={a:{2:' —'},d:{1:';'},e:{2:' —'},f:{0:',',1:' —'}};
 const targets=en.map((text,i)=>({id:id+'-t'+i,text,sourceIndices:template.map[i]!,focusSourceIndices:template.map[i]!,relation:template.map[i]!.length>1?'copular-identification-union':template.map.filter(m=>JSON.stringify(m)===JSON.stringify(template.map[i])).length>1?'complete-grammar-expansion':'individual-meaning',rationale:template.reason?.[i]??'Individual lexical correspondence on the same source event.',...(i===en.length-1?{punctuationAfter:'.'}:englishPunctuation[template.key]?.[i]?{punctuationAfter:englishPunctuation[template.key]![i]!}:{})}));
 const first=words[0]!,last=words[words.length-1]!;
 selected.push({id,templateId:template.key,lane:'lead',voice:'lead',sourceLanguage:'ru',targetLanguage:'en',sourceText:ru.map((s,i)=>s+(template.punctuation[i]??'')).join(' '),targetText:targets.map(s=>s.text+(s.punctuationAfter??'')).join(' '),start:first.startSample/44100,end:last.endSample/44100,visibleStart:0,fullOpacityEnd:0,visibleEnd:0,exitMode:'fade',words,targets,sourceBreaks:[],targetBreaks:[]});
}
const repeatGroups:[string,number[],number[]][]=[
 ['r1-three',[38.087,39.024,39.961],[38.815,39.752,40.688]],
 ['r1-two',[40.898,41.836],[41.585,42.49]],
 ['r2-three',[98.086,99.024,100.899],[98.817,99.755,101.632]],
 ['r2-two',[102.774,104.649],[103.507,105.382]],
 ['r3-three',[105.586,106.524,108.399],[106.319,107.258,109.132]],
 ['r3-two',[110.274,111.212],[111.005,111.82]],
];
for(const [id,starts,ends] of repeatGroups){
 const words=starts.map((a,i)=>({id:id+'-s'+i,text:i===0?'Больного':'больного',punctuationAfter:i<starts.length-1?',':'',sourceIndex:i,startSample:Math.round(a*44100),endSample:Math.round(ends[i]!*44100),confidence:id==='r3-two'&&i===1?'Low; faint chopped final echo needs reduced-speed review':'Provisional filtered-repeat ownership',method:'Normalized vocal-fragment similarity and original/stem repeated harmonic context; broad forced allocations rejected'}));
 const targets=words.flatMap((s,i)=>['Someone','sick'].map((text,j)=>({id:id+'-t'+i+'-'+j,text:i===0?text:text.toLowerCase(),...(j===1?{punctuationAfter:i<words.length-1?',':'.'}:{}),sourceIndices:[i],focusSourceIndices:[i],relation:'singular-nominalized-adjective',rationale:'Complete singular sick-person meaning; the detached refrain echoes the person rather than inventing a new verb.'})));
 selected.push({id,templateId:'repeat',lane:'lead',voice:'filtered lead echo',sourceLanguage:'ru',targetLanguage:'en',sourceText:words.map(w=>w.text+w.punctuationAfter).join(' '),targetText:targets.map(w=>w.text+(w.punctuationAfter??'')).join(' '),start:words[0]!.startSample/44100,end:words[words.length-1]!.endSample/44100,visibleStart:0,fullOpacityEnd:0,visibleEnd:0,exitMode:'fade',words,targets,sourceBreaks:[],targetBreaks:[]});
}
selected.sort((a,b)=>a.start-b.start);
for(let i=0;i<selected.length;i++){
 const c=selected[i]!,next=selected[i+1],prior=selected[i-1];
 Object.assign(c,readingWindow(c.start,c.end,recording.sourceDuration,prior?.visibleEnd,next?.start,c.end+(c.templateId==='repeat'?.28:.16)));
}
const timeline:Timeline={schemaVersion:1,revision:'drug-preview-v2-natural-city',sampleRate:44100,sourceSha256:recording.sourceSha256,sourceDuration:recording.sourceDuration,cues:selected};
validateTimeline(timeline);writeFileSync(new URL('public/timeline.json',root),JSON.stringify(timeline,null,2)+'\n');
writeFileSync(new URL('source/editorial-and-correspondence.json',root),JSON.stringify({templates,repeatMeaning:'Someone sick; singular person, not plural collective',status:'Provisional translation and complete target spans; current-preview listener review pending'},null,2)+'\n');
writeFileSync(new URL('source/selected-boundaries.json',root),JSON.stringify({sourceSha256:recording.sourceSha256,sampleRate:44100,humanListening:false,status:'Preview proposals; no claim of uniquely measurable milliseconds',events:selected.flatMap(c=>c.words.map(w=>({cue:c.id,...w}))),highRisk:['Quiet Я starts at 8.12 and 68.08; neither recognition crop boundary nor late MMS core is accepted automatically.','Filtered refrain body and passive decay differ; first five and final ten supplied repeats retain individual events.','Final weak repeat at 111.212–111.820 is provisional and needs actual-audio review.'],rejected:['Whisper crop-start padding as a sung onset','MMS repeats stretched into 46–51 and 115–125 seconds','Automatic recognizer endcard/subtitle hallucinations']},null,2)+'\n');
console.log(JSON.stringify({cues:selected.length,ruWords:selected.reduce((n,c)=>n+c.words.length,0),enWords:selected.reduce((n,c)=>n+c.targets.length,0),finalVoice:selected[selected.length-1]!.end}));
