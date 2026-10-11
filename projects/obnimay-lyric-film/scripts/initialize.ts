import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';

const root=new URL('../',import.meta.url);
const read=(p:string)=>readFileSync(new URL(p,root));
const write=(p:string,v:unknown)=>writeFileSync(new URL(p,root),JSON.stringify(v,null,2)+'\n');
const sha=(p:string)=>createHash('sha256').update(read(p)).digest('hex');
const probe=JSON.parse(read('source/probe.json').toString());
const pcm=read('analysis/stereo44100.f32');
write('source/recording.json',{
 schemaVersion:1,sourceUrl:'https://www.youtube.com/watch?v=sCbyEiBZyEo',title:'Обнимай',artist:'Элли на маковом поле',
 sourceSha256:sha('public/source.mp4'),sourceBytes:read('public/source.mp4').length,duration:200.6,
 picture:{width:1080,height:1080,frameRate:[25,1],frames:5015},
 audio:{sampleRate:44100,channels:2,startTime:0,decodedSamples:pcm.length/8,decodedDuration:pcm.length/8/44100,containerDuration:200.6},
 soundtrack:'Original AAC; no gain, retiming, replacement or cuts.',
 creators:{provider:'ONErpm',label:'МТС Лейбл',composerLyricist:'Трунова Виктория Андреевна',coProducer:'Элли на маковом поле',releaseDate:'2025-11-25',separateArtworkAuthor:'Not identified in supplied recording metadata'},
 sourceProbe:probe.streams.map((s:Record<string,unknown>)=>({codec:s.codec_name,type:s.codec_type,duration:s.duration,start:s.start_time})),
 preparation:{ffmpeg:execFileSync('ffmpeg',['-version']).toString().split('\n')[0],sourceReferenceSha256:sha('public/artwork-reference.png')},
 distributionClearance:'Not established; original media stays local and excluded from Git.',
});

type Part={text:string;sourceIndices:number[];rationale:string};
type Template={id:string;source:string[];sourcePunctuation:Record<number,string>;targets:Part[];translation:string};
const templates:Template[]=[];
function add(id:string,source:string,parts:[string,number|number[],string?][],punctuation:Record<number,string>={}):void{
 const units=source.split(' ');
 const targets=parts.flatMap(([text,anchor,reason])=>text.split(' ').map(word=>({text:word,sourceIndices:typeof anchor==='number'?[anchor]:anchor,rationale:reason??'Direct word correspondence; required English grammar shares the performed source event.'})));
 const t={id,source:units,sourcePunctuation:punctuation,targets,translation:targets.map(p=>p.text).join(' ')};
 const mapped=new Set(targets.flatMap(p=>p.sourceIndices));
 units.forEach((_,i)=>{if(!mapped.has(i))throw Error(`Unmapped source ${id} ${i}`)});
 templates.push(t);
}
add('hold-yourself','В руках держи себя слышишь',[['Keep',2],['yourself',3],['together,',[0,1],'В руках is the idiomatic complement of держи себя: together; the union keeps the two sung words separate.'],['do you hear?',4]],{3:',',4:'?'});
add('fist','В кулак собери что осталось',[['Gather',2],['what',3],['remains',4],['into',0],['a fist.',1]],{2:','});
add('sanity','Так медленно едет крыша',[['So',0],['slowly,',1],['sanity',3,'Крыша is the idiomatic mind/sanity, not the literal roof.'],['slips away.',2,'Едет is translated within the losing-sanity idiom; no invented I or you.']]);
add('exhaustion','Так быстро приходит усталость',[['So',0],['quickly,',1],['exhaustion',3],['arrives.',2]]);
add('reflection','Себя не узнать в отражении',[['Can\'t',1,'Не узнать expresses inability to recognize in this context; negation remains separate from the verb.'],['recognize',2],['myself',0],['in',3],['the reflection.',4]]);
add('eyes','Сияет тьма под глазами',[['Darkness',1],['shines',0],['beneath',2],['the eyes.',3,'No added possessive; the source has no explicit my.']]);
add('concrete','И мир бетоном своим на мои плечи давит',[['And',0],['the world',1],['weighs',7],['on',4],['my',5],['shoulders',6],['with',2,'Instrumental-case completion belongs to бетоном.'],['its',3],['concrete.',2]]);
add('hinges','И я срываюсь с петель',[['And',0],['I',1],['am coming',2],['off',3],['the hinges.',4]]);
add('beast','Я загнанный зверь',[['I\'m',0,'The Russian subject supplies the necessary English copula.'],['a',2],['cornered',1],['beast.',2]]);
add('shadow','Боясь свою тень',[['Fearing',0],['my own',1,'Reflexive свою refers back to the first-person agent in the surrounding clause.'],['shadow,',2]]);
add('wildly','Бегу оголтело',[['I run',0,'First-person verbal inflection supplies the English subject.'],['wildly.',1]]);
add('dark-run','Бегу в темноте',[['I run',0],['in',1],['the dark.',2]]);
add('cope','Не справиться мне но',[['I',2],['can\'t',0],['cope,',1],['but…',3]],{2:','});
add('you-embrace','Когда ты меня обнимаешь',[['When',0],['you',1],['hold',3,'Hold means staying in an embrace in romantic English; it preserves the sustained comfort of обнимать in this refrain.'],['me,',2]]);
add('i-embrace','Когда я тебя обнимаю',[['When',0],['I',1],['hold',3],['you,',2]]);
add('surrounding','То вся эта тьма вокруг',[['Then',0],['all',1],['this',2],['surrounding',4,'Вокруг becomes surrounding in natural English; the reordered word keeps its own source anchor.'],['darkness',3]]);
add('turns-light','Превращается в свет',[['turns',0],['into',1],['light.',2]]);
add('embrace','Обнимай меня',[['Hold',0],['me.',1]]);
add('all-echo','Вся',[['All.',0]]);
add('becomes-light','Становится свет',[['becomes',0],['light.',1]]);
write('source/editorial-templates.json',{schemaVersion:1,sourceSha256:sha('public/source.mp4'),method:'New meaning-based English translation for this recording; no pronunciation layer.',templates});
console.log(JSON.stringify({sourceSha256:sha('public/source.mp4'),templates:templates.length,decodedSamples:pcm.length/8}));
