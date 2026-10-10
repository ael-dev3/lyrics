import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';

export const sceneFiles = [
  'src/model.ts', 'src/scene.ts', 'src/player.ts', 'review/index.html',
  'public/material-anchors.json', 'public/material-reference.png',
  'public/audio-features.json', 'public/fonts/RoomSerif.ttf',
];
export function projectFile(path:string):URL{return new URL('../'+path,import.meta.url)}
export function hashFile(path:string):string{return createHash('sha256').update(readFileSync(projectFile(path))).digest('hex')}
export function currentIdentity(){
 const timeline=JSON.parse(readFileSync(projectFile('public/timeline.json'),'utf8'));
 const recording=JSON.parse(readFileSync(projectFile('source/recording.json'),'utf8'));
 const actualSource=hashFile('public/source.mp4');
 if(actualSource!==recording.sourceSha256||actualSource!==timeline.sourceSha256)throw Error('The current source differs from the selected recording.');
 const hash=createHash('sha256');
 for(const file of sceneFiles){hash.update(file+'\0');hash.update(readFileSync(projectFile(file)));hash.update('\0')}
 return {schemaVersion:1,revision:timeline.revision,sourceSha256:actualSource,timelineSha256:hashFile('public/timeline.json'),sceneSha256:hash.digest('hex'),sceneFiles};
}
