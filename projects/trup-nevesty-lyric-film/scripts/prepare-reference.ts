import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

const root=fileURLToPath(new URL('..',import.meta.url));
const save=(path:string,data:unknown)=>writeFileSync(resolve(root,path),JSON.stringify(data,null,2)+'\n');
type Group={text:string;source:number[];rationale:string};
const g=(text:string,source:number|number[],rationale='Corresponding lexical meaning; any required English article, tense or copula shares this source event.'):Group=>({text,source:Array.isArray(source)?source:[source],rationale});
const idiom='Irreducible grammatical construction. Each target word follows the union of these source events, without filling intervening gaps or inventing new timestamps.';
const anatomy='The speaker’s anatomy is implied by the clause. The necessary English possessive shares the noun event; it is not an independently timed word.';
const rows:{ru:string;groups:Group[];crop:[number,number]}[]=[
 {ru:'Разрывая землю, пальцы в кровь сотру',crop:[10.2,17.7],groups:[g('Digging up',0),g('the earth,',1),g("I'll scrape",5),g('my fingers',2,anatomy),g('bloody.',[3,4],idiom)]},
 {ru:'Леса гробовую тишину прерву',crop:[17.1,23.3],groups:[g("I'll break",3),g("the forest's",0),g('deathly',1),g('silence.',2)]},
 {ru:'Ветер жутко воет, зов твой мне несёт',crop:[22.3,28.6],groups:[g('The wind',0),g('howls',2),g('dreadfully,',1),g('bearing',6),g('your',4),g('call',3),g('to me.',5)]},
 {ru:'В этот раз, я верю, точно повезёт',crop:[27.8,33.6],groups:[g('This',[0,1],idiom),g('time,',2),g('I',3),g('believe,',4),g('luck will come',6,'Impersonal future good fortune, with no guessed recipient.'),g('for sure.',5)]},
 {ru:'Не пугайся, милый, суженый родной',crop:[33.3,39.0],groups:[g("Don't",0),g('be afraid,',1),g('darling,',2),g('beloved',4),g('betrothed.',3)]},
 {ru:'Жизнь не разлучит нас, не беги, постой!',crop:[38.7,44.5],groups:[g('Life',0),g("won't",1),g('part',2),g('us;',3),g("don't",4),g('run—',5),g('wait!',6)]},
 {ru:'От меня не скрыться, как и от судьбы',crop:[44.0,49.8],groups:[g('There is no',2,'Negative impersonal construction; existential English grammar is carried by the negation event.'),g('hiding',3),g('from',0),g('me,',1),g('any more than',[4,5],idiom),g('from',6),g('fate.',7)]},
 {ru:'Бог услышал с преисподней мои мольбы',crop:[49.4,55.2],groups:[g('God',0),g('heard',1),g('my',4),g('pleas',5),g('from',2),g('the underworld.',3)]},
 {ru:'Чувство, будто снова в груди бьётся сердце',crop:[54.8,60.9],groups:[g('It feels',0),g('as though',1),g('a heart',6),g('beats',5),g('in',3),g('my chest',4,anatomy),g('again.',2)]},
 {ru:'Я тебе открою смерти нежной дверцу',crop:[60.0,65.8],groups:[g('I',0),g('will open',2),g('the little door',5),g('to',3,'The death noun is a genitive destination; the English preposition shares the death event.'),g('gentle',4,'Нежной modifies смерти, not дверцу: gentle death, not a gentle door.'),g('death',3),g('for you.',1)]},
 {ru:'Мы покинем мир живых, нам здесь не место',crop:[65.3,71.0],groups:[g('We',0),g('will leave',1),g('the world',2),g('of the living;',3),g('there is',7,'Necessary English existential grammar follows место, while explicit negation remains independently mapped.'),g('no',6),g('place',7),g('for us',4),g('here.',5)]},
 {ru:'Ты — живой жених, я — мёртвая невеста',crop:[70.5,76.2],groups:[g("You're",0),g('a living',1),g('bridegroom;',2),g("I'm",3),g('a dead',4),g('bride.',5)]},
 {ru:'Отчего лицо твоё печальное?',crop:[87.3,93.2],groups:[g('Why',0),g('is',3,'English predicate copula shares the adjective event, with no independent timestamp.'),g('your',2),g('face',1),g('sad?',3)]},
 {ru:'Ведь на мне колечко обручальное',crop:[92.9,98.8],groups:[g('After all,',0),g("I'm wearing",[1,2],idiom),g('a',3),g('wedding',4),g('ring.',3)]},
 {ru:'Может, не по нраву тело бледное',crop:[98.5,104.3],groups:[g('Perhaps',0),g('the',4),g('pale',5),g('body',4),g("isn't",1),g('to',2),g('your liking?',3,'The addressee is implied by the question; the English possessive shares the liking event.') ]},
 {ru:'Или ты влюблён во что-то смертное?',crop:[103.8,109.8],groups:[g('Or',0),g('are',2),g('you',1),g('in love',2),g('with',3),g('something',4),g('mortal?',5)]},
 {ru:'Разве ты не клялся мне в верности и любви',crop:[109.6,115.4],groups:[g('Did',0,'English question auxiliary carries the rhetorical question particle.'),g('you',1),g('not',2),g('swear',3),g('fidelity',[5,6],idiom),g('and',7),g('love',8),g('to me?',4)]},
 {ru:'Пусть мне боль не страшна, и нет во мне живой крови',crop:[115.0,120.8],groups:[g('Though',0),g('pain',2),g("doesn't",3),g('scare',4),g('me,',1),g('and',5),g("there's no",6),g('living',9),g('blood',10),g('in',7),g('me.',8)]},
 {ru:'Почему же больно пустоте внутри',crop:[120.2,125.6],groups:[g('Why,',0),g('then,',1),g('does',2),g('the emptiness',3),g('inside',4),g('hurt?',2)]},
 {ru:'Есть во мне остаток горьких слёз, смотри!',crop:[125.3,130.9],groups:[g("There's",0),g('a remnant',3),g('of bitter',4),g('tears',5),g('in',1),g('me—',2),g('look!',6)]},
 {ru:'Чувство, будто снова в груди рвётся сердце',crop:[130.6,136.8],groups:[g('It feels',0),g('as though',1),g('a heart',6),g('is breaking',5),g('in',3),g('my chest',4,anatomy),g('again.',2)]},
 {ru:'Я тебе открою смерти верной дверцу',crop:[135.4,141.4],groups:[g('I',0),g('will open',2),g('the little door',5),g('to',3),g('certain',4,'Верной modifies смерти: certain death, preserving the changed refrain.'),g('death',3),g('for you.',1)]},
 {ru:'Ты покинешь мир живых, твоё здесь место',crop:[141.0,146.6],groups:[g('You',0),g('will leave',1),g('the world',2),g('of the living;',3),g('your',4),g('place is',6),g('here.',5)]},
 {ru:'Ты — лишь мой жених, а я — твоя невеста!',crop:[146.1,151.8],groups:[g("You're",0),g('only',1),g('my',2),g('bridegroom,',3),g('and',4),g("I'm",5),g('your',6),g('bride!',7)]},
 {ru:'Чувство, будто снова в груди нету сердца',crop:[174.5,181.15],groups:[g('It feels',0),g('as though',1),g("there's no",5),g('heart',6),g('in',3),g('my chest',4,anatomy),g('again.',2)]},
 {ru:'Навсегда закрыта моя счастья дверца',crop:[181.1,187.0],groups:[g('My',2,'Моя agrees with дверца; it does not modify счастья.'),g('little door',4),g('to happiness',3),g('is closed',1),g('forever.',0)]},
 {ru:'Я покину мир живых, мне нет здесь места',crop:[186.35,192.2],groups:[g('I',0),g('will leave',1),g('the world',2),g('of the living;',3),g("there's no",5),g('place',7),g('for me',4),g('here.',6)]},
 {ru:'Ты — живой жених, я — мёртвая невеста…',crop:[192.1,198.3],groups:[g("You're",0),g('a living',1),g('bridegroom;',2),g("I'm",3),g('a dead',4),g('bride…',5)]},
];
const tokenPattern=/[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu;
function tokens(text:string){
 const matches=Array.from(text.matchAll(tokenPattern));
 return matches.map((m,i)=>({text:m[0],punctuationAfter:text.slice(m.index!+m[0].length,matches[i+1]?.index??text.length).trim(),startCharacter:m.index!}));
}
mkdirSync(resolve(root,'public'),{recursive:true});mkdirSync(resolve(root,'analysis'),{recursive:true});
const source=readFileSync(resolve(root,'public/source.mp4'));
const sourceSha256=createHash('sha256').update(source).digest('hex');
const probe=spawnSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',resolve(root,'public/source.mp4')],{encoding:'utf8'});
if(probe.status!==0)throw Error(probe.stderr);
const media=JSON.parse(probe.stdout),video=media.streams.find((s:{codec_type:string})=>s.codec_type==='video'),audio=media.streams.find((s:{codec_type:string})=>s.codec_type==='audio');
const pcm=readFileSync(resolve(root,'analysis/stereo44100.f32'));
const metadata=JSON.parse(readFileSync(resolve(root,'public/source.info.json'),'utf8'));
const recording={schemaVersion:1,sourceUrl:'https://www.youtube.com/watch?v=1CT57xZoYVg',title:metadata.title,artist:metadata.uploader,uploadDate:metadata.upload_date,sourceSha256,sourceBytes:source.length,containerDurationSeconds:Number(media.format.duration),picture:{width:video.width,height:video.height,codec:video.codec_name,frameRate:video.avg_frame_rate,frames:Number(video.nb_frames),startSeconds:Number(video.start_time),durationSeconds:Number(video.duration),artwork:'Original official-recording illustration; no independent artist credit supplied.'},audio:{codec:audio.codec_name,channels:audio.channels,sampleRate:Number(audio.sample_rate),startSeconds:Number(audio.start_time),streamDurationSeconds:Number(audio.duration),decodedSamples:pcm.length/8,decodedDurationSeconds:pcm.length/8/44100,decodedPcmSha256:createHash('sha256').update(pcm).digest('hex'),sourceClockOffsetSeconds:0},status:'Preview only; production rendering is not authorized.'};
save('source/recording.json',recording);
const editorial=rows.map((row,i)=>{
 const id=`TN-${String(i+1).padStart(3,'0')}`,sourceTokens=tokens(row.ru).map((t,j)=>({...t,id:`${id}-s${j}`,sourceIndex:j}));
 let targetCharacter=0;
 const targetTokens=row.groups.flatMap(group=>{const result=tokens(group.text).map(t=>({...t,startCharacter:t.startCharacter+targetCharacter,sourceIndices:group.source,focusSourceIndices:group.source,relation:group.source.length>1?'semantic-union':'lexical-correspondence',rationale:group.rationale}));targetCharacter+=group.text.length+1;return result;}).map((t,j)=>({...t,id:`${id}-e${j}`}));
 const covered=new Set(targetTokens.flatMap(t=>t.sourceIndices));
 if(sourceTokens.some(t=>!covered.has(t.sourceIndex))||targetTokens.some(t=>t.sourceIndices.some(j=>!sourceTokens[j])))throw Error(`Incomplete mapping ${id}`);
 return {id,sourceLanguage:'ru',targetLanguage:'en',sourceText:row.ru,targetText:row.groups.map(x=>x.text).join(' '),sourceTokens,targetTokens};
});
save('source/lyrics-editorial.json',{schemaVersion:1,sourceSha256,authority:'Official recording description and supplied text. Acoustic variants remain open to evidence, never automatic ASR correction.',editorialChanges:['Standard ё accents and sentence punctuation.','От чего is normalized to the standard why form Отчего.','The poetic inversion моя счастья дверца is retained; моя agrees with дверца.','The final refrain displays нету: both full alternate recognition and bounded canonical recognition identify the additional у vowel, also visible after the т consonant in the vocal-estimate spectrum. The supplied text remains preserved separately.',
'All three refrain variants remain distinct: beats / breaks / no heart; gentle / certain death; our / your / my place.'],cues:editorial});
save('analysis/phrases.private.json',{sourceSha256,phrases:rows.map((row,i)=>({id:editorial[i]!.id,crop:row.crop,units:editorial[i]!.sourceTokens.map(w=>w.text),vocalTrack:'single lead vocal'}))});
console.log(JSON.stringify({sourceSha256,decodedSamples:recording.audio.decodedSamples,cues:editorial.length,sourceWords:editorial.reduce((n,x)=>n+x.sourceTokens.length,0),englishWords:editorial.reduce((n,x)=>n+x.targetTokens.length,0)}));
