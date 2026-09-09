import {readFileSync,writeFileSync} from 'node:fs';
type Group={text:string;from:number;to:number};
type MapEntry={index:number;groups:Group[]};
const maps:MapEntry[]=[
{index:4,groups:[{text:'I',from:0,to:1},{text:'search for',from:2,to:3},{text:'you',from:1,to:2},{text:'in',from:3,to:4},{text:'my dreams;',from:4,to:6},{text:'I',from:6,to:7},{text:'chase',from:8,to:9},{text:'you',from:7,to:8},{text:'through',from:9,to:10},{text:'my dreams.',from:10,to:12}]},
{index:5,groups:[{text:'At dawn or in my shadow,',from:0,to:6},{text:'wandering in vain upon your lips.',from:6,to:11}]},
{index:6,groups:[{text:'Tearing at the depths',from:0,to:3},{text:'of my scarlet heart.',from:3,to:7}]},
{index:7,groups:[{text:'You are the one fixed point',from:0,to:6},{text:'in my scattered dreams.',from:6,to:10}]},
{index:8,groups:[{text:'Love me',from:0,to:1},{text:'in',from:1,to:2},{text:'the snow,',from:2,to:4},{text:'love me',from:4,to:5},{text:'under the sun.',from:5,to:7}]},
{index:9,groups:[{text:'Love me',from:0,to:1},{text:'with my',from:1,to:2},{text:'beige',from:3,to:4},{text:'skin',from:2,to:3},{text:'among',from:4,to:5},{text:'the',from:5,to:6},{text:'crimson',from:7,to:9},{text:'flowers.',from:6,to:7}]},
{index:10,groups:[{text:'I see people running naked;',from:0,to:6},{text:'I see people smiling at me.',from:6,to:11}]},
{index:11,groups:[{text:'But I drift through the street,',from:0,to:6},{text:'through your eyes,',from:6,to:9},{text:'beneath the rain.',from:9,to:12}]},
{index:12,groups:[{text:'And I remain the spirit',from:0,to:4},{text:'of your distant memories.',from:4,to:8}]},
{index:13,groups:[{text:'In my buried dreams:',from:0,to:4},{text:'your tears,',from:4,to:6},{text:'your laughter.',from:6,to:8}]},
{index:14,groups:[{text:'You are my iconic woman,',from:0,to:5},{text:'my ruby, my sapphire.',from:5,to:10}]},
{index:15,groups:[{text:'I am your lyrical rose;',from:0,to:5},{text:'I am all those who admire you.',from:5,to:11}]},
{index:16,groups:[{text:'Love me',from:0,to:1},{text:'in',from:1,to:2},{text:'the snow,',from:2,to:4},{text:'love me',from:4,to:5},{text:'under the sun.',from:5,to:8}]},
{index:20,groups:[{text:'For days on end.',from:0,to:3}]},
{index:21,groups:[{text:'Fleeing the night,',from:0,to:3},{text:'I roam across your skin.',from:3,to:6}]},
{index:22,groups:[{text:'I roam the city.',from:0,to:3}]},
{index:23,groups:[{text:'The sweet smoke from your mouth',from:0,to:6},{text:'drifts away, day after day.',from:6,to:12}]},
{index:24,groups:[{text:'When I ride through the night,',from:0,to:6},{text:'I am alone with my vices.',from:6,to:12}]},
{index:25,groups:[{text:'I love you when it rains;',from:0,to:5},{text:'you are the nymph of my wishes.',from:5,to:12}]},
{index:26,groups:[{text:'I kiss you in my dreams',from:0,to:5},{text:'and love you on the tips of my lips.',from:5,to:12}]},
{index:27,groups:[{text:'I hate the cloying taste',from:0,to:5},{text:'of their mouths,',from:5,to:8},{text:'of their dreams.',from:8,to:11}]},
{index:28,groups:[{text:'In the night you look at me;',from:0,to:6},{text:'beneath the clouds, I drift.',from:6,to:11}]},
{index:29,groups:[{text:'With you,',from:0,to:2},{text:'I am king.',from:2,to:5}]},
{index:30,groups:[{text:'With you,',from:0,to:1},{text:'I am king.',from:1,to:4}]},
{index:37,groups:[{text:'I am a boy of the night;',from:0,to:6},{text:'I leave the girls behind.',from:6,to:12}]},
{index:38,groups:[{text:'I love only your fishnet stockings',from:0,to:6},{text:'that crackle in my thoughts.',from:6,to:11}]}
];
const source=JSON.parse(readFileSync('../french-lines.json','utf8')) as string[];
const norm=(s:string)=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z]/g,'');
type Word={text:string;start:number;end:number};type Cue={id:string;lang:string;text:string;start:number;end:number;words:Word[];translation?:string;translationGroups?:Word[]};
const cues=JSON.parse(readFileSync('src/cues.json','utf8')) as Cue[];
for(const c of cues.filter(c=>c.lang==='fr')){
 const map=maps.find(m=>norm(source[m.index]??'')===norm(c.text));if(!map)throw Error('Translation missing '+c.id);
 const tokens=(source[map.index]??'').split(/\s+/).map(norm);const starts:number[]=[];let pos=0;for(const tok of tokens){starts.push(pos);pos+=tok.length;}starts.push(pos);
 let wp=0;const ranges=c.words.map(w=>{const start=wp;wp+=norm(w.text).length;return {word:w,start,end:wp};});
 if(wp!==pos)throw Error('Source-token mismatch '+c.id);
 c.translationGroups=map.groups.map(g=>{const a=starts[g.from]??0,b=starts[g.to]??pos;const hits=ranges.filter(r=>r.start<b&&r.end>a);if(!hits.length)throw Error('Empty mapping '+c.id);return {text:g.text,start:Math.min(...hits.map(h=>h.word.start)),end:Math.max(...hits.map(h=>h.word.end))};});
 c.translation=c.translationGroups.map(g=>g.text).join(' ');
}
writeFileSync('src/cues.json',JSON.stringify(cues,null,2));
writeFileSync('../translation-map.json',JSON.stringify({method:'Natural English order; each semantic group inherits the interval of its corresponding aligned French words. Shared uncertainty groups activate together.',maps},null,2));
console.log('Translated French cues:',cues.filter(c=>c.translation).length);
