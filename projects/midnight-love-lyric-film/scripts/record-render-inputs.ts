import {createHash} from 'node:crypto';
import {createReadStream,writeFileSync,readdirSync} from 'node:fs';
const paths=[...readdirSync('src').map(p=>'src/'+p),'public/science.json','public/motion.json','public/soundtrack.m4a','public/source-video.webm','public/SpaceGrotesk.ttf','public/CormorantGaramond-Semibold.ttf','public/CormorantGaramond-Italic.ttf','package-lock.json','scripts/render-cinematic.ts','scripts/encode.ts','scripts/check.ts','scripts/layout.ts','evidence/layout-YouTube.json','evidence/layout-TikTok.json','evidence/timing-checks.json'];
const inputs=[];
for(const path of paths.sort()){const h=createHash('sha256');for await(const b of createReadStream(path))h.update(b);inputs.push({path,sha256:h.digest('hex')});}
writeFileSync('evidence/render-inputs.json',JSON.stringify({inputs,purpose:'Frozen composition, media and dependency inputs; delivery verification rejects any mismatch.'},null,2));
