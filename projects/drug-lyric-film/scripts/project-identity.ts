import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export const sceneFiles=['src/model.ts','src/scene.ts','src/player.ts','review/index.html','public/audio-features.json','public/artwork-reference.png','public/visual-contract.json','public/fonts/Oswald-Medium.ttf'];
export function projectFile(path:string):URL{return new URL('../'+path,import.meta.url)}
export function hashFile(path:string):string{return createHash('sha256').update(readFileSync(projectFile(path))).digest('hex')}
export function currentIdentity(){
 const timeline=JSON.parse(readFileSync(projectFile('public/timeline.json'),'utf8'));
 const recording=JSON.parse(readFileSync(projectFile('source/recording.json'),'utf8'));
 const source=hashFile('public/source.mp4');if(source!==recording.sourceSha256||source!==timeline.sourceSha256)throw Error('Source identity changed');
 const hash=createHash('sha256');for(const f of sceneFiles){hash.update(f+'\0');hash.update(readFileSync(projectFile(f)));hash.update('\0')}
 return {schemaVersion:1,revision:timeline.revision,sourceSha256:source,timelineSha256:hashFile('public/timeline.json'),sceneSha256:hash.digest('hex'),sceneFiles};
}
