import {readFileSync,writeFileSync} from 'node:fs';
const root=new URL('../',import.meta.url),recording=JSON.parse(readFileSync(new URL('source/recording.json',root),'utf8'));
const ranges:[string,number,number][]=[
 ['post1-a',69.9,75.4],['post1-b',76.2,81.5],['post1-c',81.4,87.5],['post1-d',87.9,93.5],
 ['post2-a',157.9,163],['post2-b',164.3,169.4],['post2-c',170.7,175.8],['post2-d',177.1,182.1],
 ['all1-a',50.2,51.8],['all1-b',63.1,64.6],['all2-a',138.1,139.6],['all2-b',150.9,152.5],
];
writeFileSync(new URL('source/repeat-crop-plan.json',root),JSON.stringify({sourceSha256:recording.sourceSha256,phrases:ranges.map(([id,lo,hi])=>({id,crop:[lo,hi],units:id.startsWith('post')?['Обнимай','меня']:['Вся'],vocalTrack:'Narrow mixed-source observations; processed repeats and possible backing overlaps'}))},null,2)+'\n');
