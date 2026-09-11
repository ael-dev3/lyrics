import {cpSync,mkdirSync,readdirSync,writeFileSync,readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
const repo=resolve(process.env.LYRICS_REPO??'../lyrics'),dest=join(repo,'projects/pozhary-lyric-film');
mkdirSync(dest,{recursive:true});
for(const p of ['src','scripts','README.md','SOFTWARE.md','package.json','package-lock.json','tsconfig.json','source.json'])cpSync(p,join(dest,p),{recursive:true});
for(const dir of ['public','analysis','evidence','covers','publishing'])mkdirSync(join(dest,dir),{recursive:true});
for(const p of ['artist-cover.jpg','science.json','motion.json','vocal-envelope.json','Oswald-Bold.ttf','Oswald-Medium.ttf','SpaceGrotesk.ttf','Oswald-OFL.txt','SpaceGrotesk-OFL.txt'])cpSync('public/'+p,join(dest,'public',p));
for(const p of ['lyrics-user-ru.txt','windows.json','windows-tail.json','bounded-audio16.json','bounded-vocals16.json','bounded-vocals16-tail.json','mms-vocals16.json','mms-vocals16-tail.json','alignment-decisions.json','repeated-vocal-correlation.json','manifest.json','motion-manifest.json','events.json','cover-prompts.json'])cpSync('analysis/'+p,join(dest,'analysis',p));
const evidence=['youtube-16.2.png','tiktok-16.2.png','youtube-43.6.png','chorus3-handoff-spectrum.png','profile-150x200.png','profile-300x400.png','crop-stress-300x400.png','youtube-thumbnail-320x180.png','layout-contact-sheet.png','style-preview-contact-sheet.png','layout-YouTube.json','layout-TikTok.json','timing-checks.json','audio-timing-check.json','dsp-checks.log','cover-verification.json','final-verification.md','youtube-final-contact-sheet.png','tiktok-final-contact-sheet.png'];
for(const p of readdirSync('evidence'))if(evidence.includes(p)||p.endsWith('-verification.json')||p==='encoded-frame-review.json')cpSync('evidence/'+p,join(dest,'evidence',p));
for(const p of readdirSync('covers'))cpSync('covers/'+p,join(dest,'covers',p));
for(const p of readdirSync('output'))if(/\.(jpg|txt|srt|json)$/.test(p))cpSync('output/'+p,join(dest,'publishing',p));
// Public snapshots use publishing/; the complete archive additionally supplies output/.
const readme=readFileSync(join(dest,'README.md'),'utf8').replaceAll('](output/','](publishing/');
writeFileSync(join(dest,'README.md'),readme);
console.log('Staged project source and sanitized evidence.');
