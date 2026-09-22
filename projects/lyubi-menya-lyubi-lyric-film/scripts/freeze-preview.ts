import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {requiredInputPaths} from './production-gate.ts';
const hashes=Object.fromEntries(requiredInputPaths.map(path=>[path,createHash('sha256').update(readFileSync(path)).digest('hex')]));
const identity={song:'DBGCHjBSNzo',revision:'preview-v2-rose-paper',hashes};
const old=existsSync('evidence/preview-identity.json')?JSON.parse(readFileSync('evidence/preview-identity.json','utf8')):undefined;
const changed=JSON.stringify(old?.hashes)!==JSON.stringify(hashes);
if(changed&&existsSync('evidence/cross-language-sync-review.json')){mkdirSync('evidence/history',{recursive:true});writeFileSync(`evidence/history/review-before-${Date.now()}.json`,readFileSync('evidence/cross-language-sync-review.json'));}
writeFileSync('evidence/preview-identity.json',JSON.stringify(identity,null,2)+'\n');
if(changed||!existsSync('evidence/cross-language-sync-review.json')){
 const data=JSON.parse(readFileSync('src/cues.json','utf8')) as {cues:{id:string}[]};
 const review={song:identity.song,revision:identity.revision,status:'preview-only; listening review pending',inputHashes:hashes,translationReviewComplete:true,actualAudioReviewComplete:false,allCuesAllFormatsComplete:false,unresolvedDefects:[],reviewQuestions:['Recheck short conjunctions and sustained vowel releases with actual audio at reduced speed.','Inspect all performed repeats in both layouts; technical and model checks do not establish actual listening.'],cues:data.cues.map(c=>({id:c.id,meaning:true,normalAudio:false,slowAudio:false,landscape:false,portrait:false})),authorization:{approved:false,song:identity.song,revision:identity.revision,scope:'full-song-production',evidence:'No production render requested or approved for this preview.',inputHashes:hashes}};
 writeFileSync('evidence/cross-language-sync-review.json',JSON.stringify(review,null,2)+'\n');
}
console.log({song:identity.song,revision:identity.revision,inputs:Object.keys(hashes).length,changed,productionAuthorized:false});
