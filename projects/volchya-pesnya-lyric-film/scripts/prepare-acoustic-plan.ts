import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
const recording=JSON.parse(readFileSync(new URL('source/recording.json',root),'utf8'));
const chorus='Наперегонки по рельсам шпалам шпалам рыжим листьям снегу талому Кубарем по горным речкам острым скалам мшистым чащам волчьим ямам убегу убегу';
const bridge='И что если бы я тебе свой выдал секрет что я волк и таких больше нет что я тёплый кусачий и очень живой и живёт во мне не песня а жалобный вой И если б ты мне поверил вдруг что ты не волк не враг и не друг а главная шестерёнка моих жизни часов та что крутит все стрелки и дышит из всех уголков';
const last='Наперегонки по рельсам шпалам шпалам рыжим листьям только ты не отставай отставай Кубарем по горным речкам острым скалам мшистым чащам волчьей песне подпевай подпевай';
const rows:[string,[number,number],string][]=[
 ['P01',[11.2,29.3],'Бесполезно и напрасно волчьей песне всё подвластно Волк тоскует без семьи серой пудрой пыльные дни'],
 ['P02',[30.4,39.0],'Я забыл что я искал Волк покажет свой оскал'],
 ['P03',[40.1,48.1],'Прочь из дома ближе к дну Волк завоет на луну'],
 ['P04',[48.0,70.5],chorus],
 ['P05',[74.0,94.8],'Руки к носу стойку крепче Я смеюсь и пахну желчью Все моих мозгов болезни расцветают в волчьей песне'],
 ['P06',[95.0,114.1],'Волк посмотрит исподлобья Волк привык он пахнет болью Нерешительно тайком Завиляет волк хвостом'],
 ['P07',[115.5,137.2],chorus],
 ['P08',[145.2,168.1],bridge],
 ['P09',[172.2,195.6],chorus+' убегу убегу'],
 ['P10',[201.0,224.0],last],
 ['P11',[232.2,259.58],'Сердце ледяной тайги лишь беги лишь беги Наперегонки наперегонки'],
];
const plan={schemaVersion:1,sourceSha256:recording.sourceSha256,status:'Conditioned proposals only. Supplied transcript preserved separately; Zavilyaet is an explicit lexical hypothesis requiring unconstrained and original-signal checks.',phrases:rows.map(([id,crop,text])=>({id,crop,units:text.split(' '),vocalTrack:'original-mix'}))};
writeFileSync(new URL('source/acoustic-crop-plan.json',root),JSON.stringify(plan,null,2)+'\n');
console.log(JSON.stringify({phrases:rows.length,units:plan.phrases.reduce((n,p)=>n+p.units.length,0)}));
