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
save('YouTube/Title.txt','Волчья песня — лунный бард | Russian & English Lyrics');
save('YouTube/Description.txt',`«Волчья песня» · лунный бард
Russian lyrics and an English translation with synchronized word highlighting. The original wolf illustration becomes a living printed broadside: the music moves through its knotwork, leaves and berries while the words remain clear and still.

Original video / source channel: https://www.youtube.com/watch?v=XSis8QjREr0
The complete original square artwork and soundtrack are preserved. Music and source artwork belong to their respective creators; separate performer, composer and illustrator credits are not verified by this project.

Added English translation, lyric typography and measured ink animation: this lyric-film project. AI-assisted transcription, translation and editing; code-based animation. No generated replacement artwork.

#ВолчьяПесня #лунныйбард #RussianMusic #Lyrics #EnglishTranslation`);
save('TikTok/Description.txt',`«Волчья песня» / Wolf Song · лунный бард
Russian + English lyrics. Music in the leaves, a wolf in the ink.

Original video and source channel: https://www.youtube.com/watch?v=XSis8QjREr0
Original music and artwork belong to their creators. AI-assisted transcription, translation and editing; code-based ink animation.

#ВолчьяПесня #лунныйбард #RussianMusic #Lyrics #EnglishTranslation`);
save('README.txt',`ВОЛЧЬЯ ПЕСНЯ — UPLOAD KIT

YouTube/
  Full 1920×1080 landscape MP4, 60 fps.
  1280×720 thumbnail, Title.txt and Description.txt.

TikTok/
  Full 1080×1920 vertical MP4, 60 fps.
  Portrait profile cover, 1200×1600 (3:4 width:height), and Description.txt.

Complete original recording: 4:19.592. Video clock: 4:19.600 (15,576 frames at 60 fps). Both exports contain the unmodified original AAC soundtrack, complete original square illustration and equal Russian / English word highlighting. The original wolf remains intact; musical response changes existing printed ornament. The final real source picture covers the short original audio tail.

Captions/ contains optional Russian, English and bilingual SRTs. Each has 59 readable lines. Extra platform captions are optional; the videos already show both languages. SRTs do not reproduce built-in word highlighting. Nonlexical vowel sounds remain in the recording without fabricated word events.

Use the matching video, cover and copy for manual upload. No platform upload is performed by this kit. CHECKSUMS.sha256 and DELIVERY.json identify every verified file.

Original music and artwork belong to their respective creators. Source channel: лунный бард. Separate creator credits are not verified. Added transcription, translation and typography were prepared with AI-assisted editing and code-based animation.`);
const clock=(seconds:number)=>{const ms=Math.round(seconds*1000),s=Math.floor(ms/1000);return `${Math.floor(s/3600).toString().padStart(2,'0')}:${Math.floor(s/60%60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')},${(ms%1000).toString().padStart(3,'0')}`};
const counts:Record<string,number>={};
for(const language of ['Russian','English','Bilingual']){
 const rows=timeline.cues.map((c,i)=>`${i+1}\n${clock(c.start)} --> ${clock(c.end)}\n${language==='Russian'?c.sourceText:language==='English'?c.targetText:c.sourceText+'\n'+c.targetText}`);
 assert.equal(rows.length,59);save(`Captions/${language}.srt`,rows.join('\n\n'));counts[language]=rows.length;
}
writeFileSync(resolve(root,'evidence/publishing-copy.json'),JSON.stringify({schemaVersion:1,sourceUrl:'https://www.youtube.com/watch?v=XSis8QjREr0',sourceChannel:'лунный бард',separateCreatorCredits:'Not verified; no guessed attribution.',captionCues:counts,disclosure:'AI-assisted transcription, translation and editing; code-based ornament animation; original artwork retained.',platformUploadPerformed:false},null,2)+'\n');
console.log(JSON.stringify({status:'copy and captions prepared',captionCues:counts}));
