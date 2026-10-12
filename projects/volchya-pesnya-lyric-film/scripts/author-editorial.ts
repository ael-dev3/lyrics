import {writeFileSync} from 'node:fs';
type Chunk=[string,number|number[]];
type Entry={id:string;sourceText:string;sourceUnits:string[];targets:{text:string;punctuationAfter?:string;sourceIndices:number[];focusSourceIndices:number[];relation:string;rationale:string}[]};
const entries:Entry[]=[];
function line(id:string,sourceText:string,chunks:Chunk[]):string{
 const sourceUnits=sourceText.replace(/[,.!?;—…]/g,'').split(/\s+/).filter(Boolean);
 const targets=chunks.flatMap(([text,index])=>text.split(' ').map(token=>{const sourceIndices=Array.isArray(index)?index:[index],match=/^(.+?)([,.;!?…]+)?$/.exec(token)!;return {text:match[1]!,...(match[2]?{punctuationAfter:match[2]}:{}),sourceIndices,focusSourceIndices:sourceIndices,relation:sourceIndices.length>1?'irreducible grammatical union':text.includes(' ')?'complete meaning / grammatical expansion':'individual correspondence',rationale:sourceIndices.length>1?'The English construction follows only these actual source intervals, including conditional morphology; it never fills intervening words or gaps.':`Meaning and necessary English grammar follow source word ${sourceIndices[0]}; English word order remains natural.`}}));
 for(const t of targets)for(const i of t.sourceIndices)if(!sourceUnits[i])throw Error(`Missing source index ${id}/${i}`);
 for(let i=0;i<sourceUnits.length;i++)if(!targets.some(t=>t.sourceIndices.includes(i)))throw Error(`Unmapped source meaning ${id}/${i}`);
 entries.push({id,sourceText,sourceUnits,targets});return id;
}
const e={
 useless:line('useless','Бесполезно и напрасно',[['Useless',0],['and',1],['in vain.',2]]),
 power:line('power','Волчьей песне всё подвластно',[['Everything',2],['yields',3],['to the',1],["wolf's",0],['song.',1]]),
 family:line('family','Волк тоскует без семьи',[['The wolf',0],['pines',1],['without',2],['a family.',3]]),
 powder:line('powder','Серой пудрой пыльные дни',[['Days',3],['are dusty',2],['with',1],['grey',0],['powder.',1]]),
 forgot:line('forgot','Я забыл что я искал',[['I',0],['forgot',1],['what',2],['I',3],['was seeking.',4]]),
 teeth:line('teeth','Волк покажет свой оскал',[['The wolf',0],['will show',1],['its',2],['snarl.',3]]),
 away:line('away','Прочь из дома ближе к дну',[['Away',0],['from',1],['home,',2],['closer',3],['to',4],['the bottom.',5]]),
 moon:line('moon','Волк завоет на луну',[['The wolf',0],['will howl',1],['at',2],['the moon.',3]]),
 race:line('race','Наперегонки по рельсам',[['Racing',0],['along',1],['the rails.',2]]),
 leaves:line('leaves','Шпалам, шпалам, рыжим листьям',[['Sleepers,',0],['sleepers,',1],['russet',2],['leaves.',3]]),
 snow:line('snow','Снегу талому',[['Melting',1],['snow.',0]]),
 streams:line('streams','Кубарем по горным речкам',[['Tumbling',0],['along',1],['mountain',2],['streams.',3]]),
 thickets:line('thickets','Острым скалам, мшистым чащам',[['Sharp',0],['rocks,',1],['mossy',2],['thickets.',3]]),
 pits:line('pits','Волчьим ямам убегу',[['Wolf',0],['pits,',1],["I'll run away.",2]]),
 escape:line('escape','Убегу',[["I'll run away.",0]]),
 stance:line('stance','Руки к носу, стойку крепче',[['Hands',0],['to',1],['the nose,',2],['a',3],['firmer',4],['stance.',3]]),
 bile:line('bile','Я смеюсь и пахну желчью',[['I',0],['laugh',1],['and',2],['smell',3],['of bile.',4]]),
 ailments:line('ailments','Все моих мозгов болезни',[['All',0],['the illnesses',3],['of',2],['my',1],['mind',2]]),
 bloom:line('bloom','Расцветают в волчьей песне',[['Bloom',0],['in',1],['the',3],["wolf's",2],['song.',3]]),
 brow:line('brow','Волк посмотрит исподлобья',[['The wolf',0],['will look',1],['from under its brow.',2]]),
 pain:line('pain','Волк привык, он пахнет болью',[['The wolf',0],['has grown accustomed;',1],['he',2],['smells',3],['of pain.',4]]),
 secretive:line('secretive','Нерешительно, тайком',[['Hesitantly,',0],['in secret,',1]]),
 wag:line('wag','Завиляет волк хвостом',[['The wolf',1],['will wag',0],['its tail.',2]]),
 secret:line('secret','И что если бы я тебе свой выдал секрет',[['And',0],['what',1],['if',2],['I',4],['were to',3],['reveal',7],['my own',6],['secret',8],['to you?',5]]),
 alone:line('alone','Что я волк и таких больше нет',[['That',0],["I'm",1],['a wolf,',2],['and',3],['there are no',6],['more',5],['like me.',4]]),
 alive:line('alive','Что я тёплый, кусачий и очень живой',[['That',0],["I'm",1],['warm,',2],['I bite,',3],['and',4],["I'm",6],['very much',5],['alive.',6]]),
 inside:line('inside','И живёт во мне не песня',[['And',0],['no',4],['song',5],['lives',1],['in',2],['me,',3]]),
 howl:line('howl','А жалобный вой',[['But',0],['a',2],['plaintive',1],['howl.',2]]),
 believe:line('believe','И если б ты мне поверил вдруг',[['And',0],['if',1],['you',3],['were to',2],['suddenly',6],['believe',5],['me,',4]]),
 notwolf:line('notwolf','Что ты не волк',[['That',0],["you're",1],['no',2],['wolf,',3]]),
 notfriend:line('notfriend','Не враг и не друг',[['No',0],['enemy,',1],['and',2],['no',3],['friend,',4]]),
 clock:line('clock','А главная шестерёнка моей жизни часов',[['But',0],['the',2],['main',1],['cog',2],['of',5],['my',3],["life's",4],['clock,',5]]),
 hands:line('hands','Та что крутит все стрелки',[['The one',0],['that',1],['turns',2],['all',3],['the hands',4]]),
 corners:line('corners','И дышит из всех уголков',[['And',0],['breathes',1],['from',2],['all',3],['corners.',4]]),
 keepup:line('keepup','Только ты не отставай, отставай',[['Just',0],["don't",2],['you',1],['fall behind,',3],['fall behind.',4]]),
 sing:line('sing','Волчьей песне подпевай, подпевай',[['Sing along',2],['with the',1],["wolf's",0],['song,',1],['sing along.',3]]),
 heart:line('heart','В сердце ледяной тайги',[['In',0],['the heart',1],['of the',3],['icy',2],['taiga,',3]]),
 run:line('run','Лишь беги, лишь беги',[['Just',0],['run,',1],['just',2],['run.',3]]),
 finalrace:line('finalrace','Наперегонки, наперегонки',[['Racing,',0],['racing.',1]]),
};
const chorus=[e.race,e.leaves,e.snow,e.streams,e.thickets,e.pits,e.escape];
const sequence=[
 {phrase:'P01',templates:[e.useless,e.power,e.family,e.powder]},
 {phrase:'P02',templates:[e.forgot,e.teeth]},
 {phrase:'P03',templates:[e.away,e.moon]},
 {phrase:'P04',templates:chorus},
 {phrase:'P05',templates:[e.stance,e.bile,e.ailments,e.bloom]},
 {phrase:'P06',templates:[e.brow,e.pain,e.secretive,e.wag]},
 {phrase:'P07',templates:chorus},
 {phrase:'P08',templates:[e.secret,e.alone,e.alive,e.inside,e.howl,e.believe,e.notwolf,e.notfriend,e.clock,e.hands,e.corners]},
 {phrase:'P09',templates:[...chorus,e.escape,e.escape]},
 {phrase:'P10',templates:[e.race,e.leaves,e.keepup,e.streams,e.thickets,e.sing]},
 {phrase:'P11',templates:[e.heart,e.run,e.finalrace]},
];
writeFileSync(new URL('../source/editorial-templates.json',import.meta.url),JSON.stringify({schemaVersion:1,status:'Original English translation, per-word meanings and grammatical completions; supplied wording variants retained separately.',notes:{sleepers:'Railway sleepers, in the immediately preceding rail context; repeated events remain independent.',pits:'Wolf pits are trapping pits; the translation retains the explicit pit noun.',pain:'Accustomed is absolute, preserving the unstated object of привык.',clock:'Natural English clock of my life; Russian clock hands are translated as hands, not arrows.',keepup:'The final verb is a sung echo under the preceding negation, retained in one full reading block. No unsung negator receives an invented focus time.',variants:'Завиляет and моей, plus the quiet opening В in the outro, are selected diagnostic-supported corrections awaiting listener review.'},entries,sequence},null,2)+'\n');
console.log(JSON.stringify({templates:entries.length,cues:sequence.reduce((n,s)=>n+s.templates.length,0)}));
