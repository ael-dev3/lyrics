export type Meaning={text:string;words:number[]};
export type LyricDefinition={id:string;text:string;en:Meaning[];window:[number,number];section:string};
const en=(text:string,words:number[]):Meaning=>({text,words});
const chorusTexts=[
 {text:'В пожарах рождаем',en:[en('In fires,',[0,1]),en('we create',[2])]},
 {text:'Что-то новое',en:[en('something',[0]),en('new',[1])]},
 {text:'Мы снова не знакомы',en:[en("We're",[0]),en('strangers',[2,3]),en('again',[1])]},
 {text:'Снова не знакомы',en:[en('Strangers',[1,2]),en('again',[0])]},
 {text:'В пожарах растаят нотки холода',en:[en('In fires,',[0,1]),en('the chill',[3,4]),en('melts away',[2])]},
 {text:'Нам нужен только повод',en:[en('All',[2]),en('we need',[0,1]),en('is a reason',[3])]},
 {text:'Нужен только повод',en:[en('We just need',[0,1]),en('a reason',[2])]},
];
const chorus=(id:string,windows:[number,number][]):LyricDefinition[]=>chorusTexts.map((c,i)=>({...c,id:`${id}-${i+1}`,window:windows[i]!,section:id}));
const line=(id:string,text:string,window:[number,number],en:Meaning[]):LyricDefinition=>({id,text,window,en,section:id.split('-')[0]!});
export const definitions:LyricDefinition[]=[
 ...chorus('chorus1',[[0,3.6],[3.35,6.3],[5.85,9.25],[8.9,12.25],[11.85,18.6],[18.1,21.7],[21.1,24.5]]),
 line('verse1-1','Можно опять по новой',[38.5,41.7],[en('We can',[0]),en('start all over',[2,3]),en('again',[1])]),
 line('verse1-2','Тайными знаками дойти домой',[41.3,45.0],[en('Follow',[2]),en('secret signs',[0,1]),en('to find our way home',[3])]),
 line('verse1-3','Часто укрытыми',[44.6,47.75],[en('Often',[0]),en('hidden',[1])]),
 line('verse1-4','Опавшей от скуки листвой',[47.2,51.8],[en('by leaves',[3]),en('that fell',[0]),en('out of boredom',[1,2])]),
 line('verse1-5','Знаки пропитаны',[51.3,54.3],[en('The signs',[0]),en('are steeped',[1])]),
 line('verse1-6','Мной и тобой',[53.8,56.6],[en('in me',[0]),en('and you',[1,2])]),
 line('verse1-7','Песни написаны',[57.25,59.6],[en('Songs',[0]),en('are written',[1])]),
 line('verse1-8','В них новый огонь',[59.6,62.1],[en('with',[0,1]),en('a new',[2]),en('fire inside',[3])]),
 line('verse1-9','Новый огонь',[61.95,63.32],[en('A new',[0]),en('fire',[1])]),
 ...chorus('chorus2',[[63.05,66.2],[65.9,69.2],[68.9,72.2],[71.9,75.3],[75.0,81.55],[80.9,84.35],[83.85,87.45]]),
 line('verse2-1','Искры останутся',[87.3,90.25],[en('Sparks',[0]),en('will remain',[1])]),
 line('verse2-2','Над головой',[89.8,93.05],[en('overhead',[0,1])]),
 line('verse2-3','Ты мое сердце а',[92.6,96.0],[en("You're",[0]),en('my heart',[1,2]),en('and',[3])]),
 line('verse2-4','Я твой огонь',[95.5,98.1],[en("I'm",[0]),en('your',[1]),en('fire',[2])]),
 line('verse2-5','Я твой огонь',[97.8,99.4],[en("I'm",[0]),en('your',[1]),en('fire',[2])]),
 ...chorus('chorus3',[[111.1,114.25],[113.85,117.2],[116.9,120.3],[119.9,123.3],[123.0,129.45],[128.9,132.45],[131.9,136.0]]),
];
