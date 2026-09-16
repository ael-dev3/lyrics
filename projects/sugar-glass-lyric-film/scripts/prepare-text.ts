import {writeFileSync} from 'node:fs';
type Row={id:string;section:string;text:string;translation:string;start:number;end:number;layer:'main'|'backing';targets:{text:string;sourceIndices:number[];rationale:string}[]};
const rows:Row[]=[];
// Each target span declares one-based source token indices. Word order stays natural.
// Multi-token source spans are reserved for grammatical constructions or idioms.
function row(section:string,start:number,end:number,text:string,map:string,layer:'main'|'backing'='main'){
 const words=text.split(/\s+/),parts=map.split('|').map(part=>{const [span,indices]=part.split('@');if(!span||!indices)throw Error('Invalid semantic map '+part);const ids=indices.split(',').map(Number);if(ids.some(n=>!Number.isInteger(n)||n<1||n>words.length))throw Error('Source index '+text+' '+part);return {text:span,sourceIndices:ids.map(i=>i-1),rationale:ids.length===1?'Direct correspondence; Russian morphology or necessary grammatical completion shares the source event.':'Minimal grammatical or idiomatic construction; participating source intervals are unioned without filling gaps.'};});
 const coverage=new Set(parts.flatMap(p=>p.sourceIndices));if(coverage.size!==words.length)throw Error('Unmapped source: '+text+' '+words.filter((_,i)=>!coverage.has(i)));
 rows.push({id:`SG-${String(rows.length+1).padStart(3,'0')}`,section,text,translation:parts.map(p=>p.text).join(' '),start,end,layer,targets:parts});
}
row('Verse 1',6.4,10.12,"Damn I'm still waiting for you to text me","Чёрт,@1|я@2|всё ещё@3|жду,@4,5|что ты@6|напишешь@7,8|мне@9");
row('Verse 1',10.12,13.16,"It's been a while since I called you my ex","Прошло@1,2|немало времени@3,4|с тех пор, как@5|я@6|назвала@7|тебя@8|своим@9|бывшим@10");
row('Verse 1',13.16,16.75,"And it's time we walk our ways","И@1|пора@2,3|нам@4|идти@5|своими@6|дорогами@7");
row('Verse 1',19.4,22.90,"How'd something genuine sacred and pretty","Как@1|что-то@2|искреннее,@3|святое@4|и@5|прекрасное@6");
row('Verse 1',22.90,26.04,"Turn into fights every day? It's a pity","Превратилось в@1,2|ссоры@3|каждый@4|день?@5|Как жаль@6,7,8");
row('Verse 1',26.04,29.30,"My heart's a mess in many ways","В моём@1|сердце@2|хаос@3,4|во@5|многих@6|смыслах@7");
row('Refrain 1',30.9,33.3,"But I'm in love","Но@1|я@2|влюблена@3,4");
row('Refrain 1',34.2,36.6,"I'm in love","Я@1|влюблена@2,3");
row('Refrain 1',37.4,39.7,"I'm in love","Я@1|влюблена@2,3");
row('Refrain 1',40.1,42.0,"Still in love","Всё ещё@1|влюблена@2,3");
row('Verse 2',44.65,48.35,"My feeling's never deceiving me baby","Моё@1|чувство@2|никогда не@3|обманывает@4|меня,@5|милый@6");
row('Verse 2',48.35,51.60,"At first I chose to be blind to it maybe","Поначалу@1,2|я@3|решила@4|закрыть глаза на@5,6,7,8|это,@9|наверное@10");
row('Verse 2',51.60,54.8,"That's why we seemed so flawless then","Вот почему@1,2|мы@3|казались@4|такими@5|безупречными@6|тогда@7");
row('Verse 2',57.1,61.1,"I've never felt this good with anybody","Мне@1|никогда не@2|было@3|так@4|хорошо@5|ни с кем@6,7");
row('Verse 2',61.1,64.5,"How can I let it go call you a buddy","Как@1|могу@2|я@3|отпустить@4,6|это,@5|назвать@7|тебя@8|приятелем?@9,10");
row('Verse 2',64.5,67.8,"So many things went wrong again","Так@1|много@2|всего@3|пошло не так@4,5|снова@6");
row('Refrain 2',68.65,71.65,"Oh I'm in love","О,@1|я@2|влюблена@3,4");
row('Refrain 2',72.5,74.65,"I'm in love","Я@1|влюблена@2,3");
row('Refrain 2',75.6,77.8,"I'm in love","Я@1|влюблена@2,3");
row('Refrain 2',78.65,80.15,"I'm in love","Я@1|влюблена@2,3");
row('Refrain 2',80.15,82.62,"But baby this is not enough","Но,@1|милый,@2|этого@3,4|недостаточно@5,6");
function chorus(start:number,section:string){
 const add=(a:number,b:number,en:string,ru:string)=>row(section,start+a,start+b,en,ru);
 add(0,1.56,"And it's morning for you","А@1|у тебя@4,5|утро@2,3");
 add(1.56,3.16,"As I talk in my sleep","Пока@1|я@2|разговариваю@3|во сне@4,5,6");
 add(3.16,4.76,"Then I'm writing my tune","Потом@1|я@2|пишу@3|свою@4|мелодию@5");
 add(4.76,6.36,"As you snore in your sleeve","Пока@1|ты@2|храпишь,@3|уткнувшись в@4|свой@5|рукав@6");
 add(6.36,7.96,"First I'm talking to you","Сначала@1|я@2|говорю@3|с тобой@4,5");
 add(7.96,9.56,"It's like you know me best","Кажется,@1,2|ты@3|знаешь@4|меня@5|лучше всех@6");
 add(9.56,11.15,"But then I speak again","Но@1|потом@2|я@3|говорю@4|снова@5");
 add(11.15,12.76,"And words just go right past","И@1|слова@2|просто@3|пролетают@4|мимо@5,6");
 add(12.76,14.36,"First it's nice and sweet","Сначала@1|всё@2|приятно@3|и@4|сладко@5");
 add(14.36,15.96,"Then it cuts so deep","Потом@1|это@2|ранит@3|так@4|глубоко@5");
 add(15.96,19.16,"You're my favorite flavor I don't get to keep","Ты@1|мой@2|любимый@3|вкус,@4|который я@5|не могу@6,7|сохранить@8,9");
 add(19.16,20.76,"I'll lose all my nerves","Я@1|истреплю@2|все@3|свои@4|нервы@5");
 add(20.76,22.36,"I'll try to make it last","Я@1|попытаюсь@2|сделать так, чтобы@3,4|это@5|продлилось@6");
 add(22.36,23.96,"Now I'm staying feels like dancing","Теперь@1|я@2|остаюсь —@3|будто@4,5|танцую@6");
 add(23.96,27.0,"On the shards of sugar glass","На@1|осколках@2,3|сахарного@4,5|стекла@6");
}
chorus(82.78,'Chorus 1');
row('Bridge',113.7,119.2,"I wish I listened to you then","Жаль,@1,2|я@3|не послушала@4|тебя@5,6|тогда@7");
row('Bridge',120.2,125.6,"And left the airport as a friend","И@1|не уехала@2|из аэропорта@3,4|как@5|подруга@6,7");
row('Bridge',126.5,130.12,"I know I'm the one you'd hate to lose","Я@1|знаю:@2|я@3|та,@4,5|кого ты бы@6|не хотел@7|потерять@8,9");
row('Bridge',130.12,133.24,"But not the one you'd truly choose","Но@1|не@2|та,@3,4|кого ты бы@5|по-настоящему@6|выбрал@7");
row('Bridge',133.05,138.3,"No matter what you think and say","Неважно,@1,2|что@3|ты@4|думаешь@5|и@6|говоришь@7");
row('Bridge',138.3,144.1,"I knew you'd stay in USA","Я@1|знала:@2|ты@3|останешься@4|в@5|США@6");
chorus(146.70,'Chorus 2');
function sugar(a:number,b:number,ending:string,section='Post-chorus'){
 row(section,a,b,`Sugar glass glass sugar sugar glass ${ending}`,`Сахарное@1|стекло,@2|стекло,@3|сахар,@4|сахарное@5|стекло,@6|${ending==='woah oh'?'о-о@7|о@8':'о@7|нет@8'}`);
}
sugar(173.8,177.6,'woah oh');
row('Post-chorus',177.6,179.6,'Sugar sugar glass','Сахарное,@1|сахарное@2|стекло@3');
sugar(179.6,184.2,'woah oh');
row('Backing refrain',183.7,186.0,"Oh I'm in love","О,@1|я@2|влюблена@3,4",'backing');
sugar(185.4,190.3,'oh no');
row('Backing refrain',187.3,189.4,"I'm in love","Я@1|влюблена@2,3",'backing');
sugar(192.0,195.6,'oh no');
row('Backing refrain',189.5,192.1,"I'm in love","Я@1|влюблена@2,3",'backing');
row('Backing refrain',195.45,198.05,"But baby this is not enough","Но,@1|милый,@2|этого@3,4|недостаточно@5,6",'backing');
row('Outro',198.05,203.4,"Why do I feel so good","Почему@1|я@2,3|чувствую себя@4|так@5|хорошо@6");
row('Outro',203.35,209.8,"Without the one I loved the most","Без@1|того,@2,3|кого я@4|любила@5|больше всех?@6,7");
row('Outro',210.05,215.4,"Oh why do I feel so good","О,@1|почему@2|я@3,4|чувствую себя@5|так@6|хорошо@7");
row('Outro',215.4,222.8,"Without the one I thought I loved the most","Без@1|того,@2,3|кого,@5|как мне@4|казалось,@5|я@6|любила@7|больше всех?@8,9");
row('Outro',223.0,226.5,"I loved the most","Я@1|любила@2|больше всех@3,4");
writeFileSync('source/text-and-mapping.json',JSON.stringify({sourceLanguage:'en',targetLanguage:'ru',translationStatus:'Meaning draft reviewed by the assistant; user listening and wording review pending.',rows},null,2)+'\n');
writeFileSync('source/original.txt',rows.map(r=>r.text).join('\n')+'\n');
writeFileSync('analysis/line-windows.json',JSON.stringify(rows.map(r=>({id:r.id,start:r.start,end:r.end,text:r.text})),null,2)+'\n');
writeFileSync('analysis/post-windows.json',JSON.stringify([
 {id:'post-main',start:173.5,end:196.0,text:rows.filter(r=>r.section==='Post-chorus').map(r=>r.text).join(' ')},
 {id:'post-backing',start:183.5,end:198.1,text:rows.filter(r=>r.layer==='backing').map(r=>r.text).join(' ')}
],null,2)+'\n');
console.log({cues:rows.length,sourceWords:rows.reduce((n,r)=>n+r.text.split(' ').length,0)});
