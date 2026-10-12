import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('../',import.meta.url),source=JSON.parse(readFileSync(new URL('source/recording.json',root),'utf8')).sourceSha256;
const rows:[string,[number,number],string][]=[
 ['OPENING',[11.5,17.6],'Бесполезно и напрасно Волчьей песне всё подвластно'],
 ['POSSESSIVE',[160.9,164.1],'а главная шестерёнка моей жизни часов'],
 ['HEART',[230.9,236.25],'В сердце ледяной тайги'],
 ['OUTRO-RUN',[236.3,244.0],'лишь беги лишь беги'],
 ['OUTRO-RACE',[243.4,252.2],'Наперегонки наперегонки'],
];
writeFileSync(new URL('source/acoustic-refinement-plan.json',root),JSON.stringify({schemaVersion:1,sourceSha256:source,status:'Separate refinement observations; original conditioned records retained unchanged.',phrases:rows.map(([id,crop,text])=>({id,crop,units:text.split(' '),vocalTrack:'original-mix'}))},null,2)+'\n');
