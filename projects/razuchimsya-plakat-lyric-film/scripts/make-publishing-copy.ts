import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {root,read} from './render-production.ts';
import {parseTimeline} from '../src/model.ts';
const kit=resolve(root,'publishing-kit'),timeline=parseTimeline(read('public/timeline.json'));
for(const dir of ['YouTube','TikTok','Farcaster','Captions'])mkdirSync(resolve(kit,dir),{recursive:true});
const save=(path:string,text:string)=>writeFileSync(resolve(kit,path),text.trim()+'\n');
const source='https://www.youtube.com/watch?v=24oIDKiYaFs',title='Settlers — Разучимся плакать | Russian & English Lyrics';assert(title.length<=100);
save('YouTube/Title.txt',title);
save('YouTube/Description.txt',`«Разучимся плакать» — Settlers
Russian lyrics and an English translation with synchronized word highlighting.

A quiet room, the first light after winter, and the longing to live. The original photograph stays central, with equal bilingual lyrics and a single gentle line that follows the music.

Original recording: ${source}
Music and original source imagery belong to their respective creators. Separate photographer and composer credits have not been independently verified by this project.

AI-assisted transcription, English translation, timing analysis, lyric presentation, visualizer code, cover typography and posting copy; human-directed and reviewed. Original recording used throughout. The added lyric edition does not synthesize the vocals or replace the source photograph.

#Settlers #РазучимсяПлакать #RussianMusic #EnglishTranslation #Lyrics`);
save('TikTok/Title.txt','Settlers — Разучимся плакать');
save('TikTok/Description.txt',`Settlers — «Разучимся плакать»
Russian + English lyrics. How much I long to live.

AI-assisted translation, lyric timing, visualizer and posting text; human-directed and reviewed.
Original recording and source image: ${source}
Music and imagery belong to their creators.

#Settlers #РазучимсяПлакать #RussianMusic #EnglishTranslation #Lyrics`);
const cast=`${title}

AI-assisted translation, timing, visuals and caption. Human-directed and reviewed.
Source: https://youtu.be/24oIDKiYaFs`;assert(Buffer.byteLength(cast,'utf8')<=320);save('Farcaster/Caption.txt',cast);
save('README.txt',`SETTLERS — РАЗУЧИМСЯ ПЛАКАТЬ — UPLOAD KIT

YouTube/ — complete 1920×1080 MP4 at 60 fps, 1280×720 thumbnail, title and description.
TikTok/ — complete 1080×1920 MP4 at 60 fps, 1200×1600 portrait profile cover, title and description.
Farcaster/ — complete landscape MP4, matching thumbnail and one Caption.txt combining title, AI disclosure and source credit.
Captions/ — optional Russian, English and bilingual SRTs. The films already contain synchronized bilingual word highlighting.

Approved edition: razuchimsya-plakat-v1.1-preview. Each film contains 13,625 pictures at 60 fps (3:47.083). The complete original recording is retained; its Opus audio is encoded to high-quality 320 kb/s stereo AAC for upload compatibility, with no edits, level processing or timing shift. A single original-image crop fills each format, and the final source picture covers the short audio tail.

The YouTube composition is 16:9. TikTok's video is 9:16; its separate tall profile cover is 3:4 width:height. Use matching files for manual upload. CHECKSUMS.sha256 and DELIVERY.json identify the verified files. No social-media upload or post has been performed.`);
const stamp=(seconds:number)=>{const ms=Math.round(seconds*1000),s=Math.floor(ms/1000);return `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor(s/60%60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')},${(ms%1000).toString().padStart(3,'0')}`};
for(const language of ['Russian','English','Bilingual']){const rows=timeline.cues.map((c,i)=>`${i+1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${language==='Russian'?c.sourceText:language==='English'?c.targetText:c.sourceText+'\n'+c.targetText}`);assert.equal(rows.length,26);save(`Captions/${language}.srt`,rows.join('\n\n'))}
writeFileSync(resolve(root,'evidence/publishing-copy.json'),JSON.stringify({schemaVersion:1,source,captionCues:26,farcasterCaptionUtf8Bytes:Buffer.byteLength(cast,'utf8'),disclosure:'Visible AI assistance and original-creator/source credits. Farcaster uses one ready-to-post title/disclosure/credit file, including caption assistance.',platformUploadPerformed:false},null,2)+'\n');console.log('Posting text and optional captions prepared.');
