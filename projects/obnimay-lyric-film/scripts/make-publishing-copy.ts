import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {root,read} from './render-production.ts';
import {checkCurrentProductionAuthorization} from './production-authorization.ts';
import {parseTimeline} from '../src/model.ts';

checkCurrentProductionAuthorization();
const kit=resolve(root,'publishing-kit'),timeline=parseTimeline(read('public/timeline.json'));
for(const dir of ['YouTube','TikTok','Captions'])mkdirSync(resolve(kit,dir),{recursive:true});
const save=(p:string,text:string)=>writeFileSync(resolve(kit,p),text.trim()+'\n');
save('YouTube/Title.txt','Элли на маковом поле — Обнимай | Russian & English Lyrics');
save('YouTube/Description.txt',`Элли на маковом поле — «Обнимай»
Russian lyrics with an English translation, synchronized word by word. Music becomes light inside the original photograph’s carnations: silver in the shadows, warm ivory in the refrains.

Original recording: https://www.youtube.com/watch?v=sCbyEiBZyEo
Artist / co-producer: Элли на маковом поле
Composer and lyricist: Трунова Виктория Андреевна
Label: МТС Лейбл · Provided by ONErpm
Music and original release artwork belong to their respective creators. A separate photographer is not identified in the source metadata.

Added lyric typography, English translation and audio-reactive lighting: this lyric-film project, made with AI-assisted editing and code-based animation. The original photograph and soundtrack are preserved.

#ЭллиНаМаковомПоле #Обнимай #Lyrics #EnglishTranslation`);
save('TikTok/Description.txt',`Элли на маковом поле — «Обнимай» / Hold me.
Russian + English lyrics. A little light in the flowers when the darkness becomes light.

Original music and artwork: Элли на маковом поле / their respective creators. Source: https://www.youtube.com/watch?v=sCbyEiBZyEo
AI-assisted English translation and editing; code-based floral lighting.

#Обнимай #ЭллиНаМаковомПоле #RussianMusic #Lyrics #EnglishTranslation`);
save('README.txt',`ОБНИМАЙ — ЭЛЛИ НА МАКОВОМ ПОЛЕ

YouTube/
  Full 1920×1080 landscape video, 60 fps.
  1280×720 thumbnail, Title.txt and Description.txt.

TikTok/
  Full 1080×1920 vertical video, 60 fps.
  Portrait profile cover, 1200×1600 (3:4 width:height), and Description.txt.

Both videos run 3:20.600, retain the original soundtrack, and include Russian and English word highlighting. The original square portrait is preserved in both formats. The 1:11–1:21 instrumental interval contains no lyrics.

Captions/ contains optional Russian, English and bilingual SRT files. The videos already show both languages; extra captions are optional and do not reproduce the built-in word highlighting. Separate backing echoes remain separate subtitle lines.

Use the platform-specific video, matching cover and text files for manual upload. This kit does not record an actual platform upload. CHECKSUMS.sha256 and DELIVERY.json identify the verified files.

Music and original artwork belong to their respective creators. Added translation, typography and floral lighting were prepared with AI-assisted editing and code-based animation.`);

const bounds=[...new Set(timeline.cues.flatMap(c=>[c.start,c.end]))].sort((a,b)=>a-b);
const clock=(seconds:number)=>{const ms=Math.round(seconds*1000),s=Math.floor(ms/1000);return `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor(s/60%60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')},${(ms%1000).toString().padStart(3,'0')}`};
const counts:Record<string,number>={};
for(const language of ['Russian','English','Bilingual']){
 const rows:{start:number;end:number;text:string}[]=[];
 for(let i=0;i<bounds.length-1;i++){
  const start=bounds[i]!,end=bounds[i+1]!,middle=(start+end)/2;
  const cues=timeline.cues.filter(c=>middle>=c.start&&middle<c.end).sort((a,b)=>a.lane===b.lane?0:a.lane==='lead'?-1:1);
  if(!cues.length)continue;
  assert.ok(end<=71||start>=81,'Caption entered the known instrumental interval.');
  const text=cues.flatMap(c=>{const decorate=(s:string)=>c.lane==='backing'?`(${s})`:s;return language==='Russian'?[decorate(c.sourceText)]:language==='English'?[decorate(c.targetText)]:[decorate(c.sourceText),decorate(c.targetText)]}).join('\n');
  const last=rows.at(-1);if(last&&last.end===start&&last.text===text)last.end=end;else rows.push({start,end,text});
 }
 save(`Captions/${language}.srt`,rows.map((r,i)=>`${i+1}\n${clock(r.start)} --> ${clock(r.end)}\n${r.text}`).join('\n\n'));
 counts[language]=rows.length;
}
console.log(JSON.stringify({status:'publishing copy and optional captions prepared',captionCues:counts}));
