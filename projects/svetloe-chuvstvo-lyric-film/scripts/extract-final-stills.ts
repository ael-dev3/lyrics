import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {checkCurrentProductionGate} from './render-gate.ts';
import {fileHash} from './render-production.ts';
checkCurrentProductionGate();
const verification=JSON.parse(readFileSync('evidence/production-verification.json','utf8'));
if(verification.status!=='passed')throw Error('Complete encoded files must pass verification first');
const stills=[];
for(const format of ['landscape','portrait']){
 const film=verification.formats[format],file=`renders/${film.file}`;
 if(await fileHash(file)!==film.sha256)throw Error('Changed delivery film');
 const output=`evidence/final-${format==='landscape'?'native':'portrait'}-32.500.jpg`;
 execFileSync('ffmpeg',['-hide_banner','-v','error','-nostdin','-i',file,'-vf','select=eq(n\\,1950)','-frames:v','1','-q:v','2','-update','1','-y',output]);
 stills.push({path:output,sha256:await fileHash(output),film:film.file,filmSha256:film.sha256,outputFrame:1950,
  outputPtsSeconds:32.5,nativeSourceFrame:812,nativeSourcePtsSeconds:32.48,dimensions:format==='landscape'?[1080,1080]:[1080,1920],
  focus:{russian:['светлое'],english:['brightest']},scope:'Frame decoded from the verified v3 delivery MP4; not a browser screenshot or promotional cover.'});
}
writeFileSync('evidence/final-stills.json',JSON.stringify({schemaVersion:1,revision:verification.revision,sourceSha256:verification.sourceSha256,
 sourceUrl:'https://www.youtube.com/watch?v=UANr7uyRZ3w',artist:'Settlers',makerSha256:await fileHash('scripts/extract-final-stills.ts'),stills},null,2)+'\n');
console.log(JSON.stringify({status:'passed',stills:stills.length}));
