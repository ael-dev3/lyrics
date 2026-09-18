import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import events from '../public/shadow-events.json' with {type:'json'};
import {shadowSeed} from '../src/shadows.ts';
export const artworkStates=[0,...events.events.flatMap(e=>[e.frame,e.frame+2,e.frame+4])].map(frame=>({frame,seed:shadowSeed(frame)}));
export const cacheHash=(path:string)=>createHash('sha256').update(readFileSync(path)).digest('hex');
export const cacheKey=()=>createHash('sha256').update(JSON.stringify(['public/artwork.png','public/shadow-events.json','src/shadows.ts','src/scene.ts','src/motion.ts','src/palette.ts','src/ArtworkCache.tsx','scripts/artwork-cache-contract.ts'].map(p=>[p,cacheHash(p)]))).update('chromium-png-panel-2x-v1').digest('hex');
export const cacheDirectory=(format:string)=>`public/render-cache/${format}`;
export function assertArtworkCache(format:string,first:number,last:number){
 const dir=cacheDirectory(format),manifest=JSON.parse(readFileSync(dir+'/manifest.json','utf8'));
 if(manifest.key!==cacheKey())throw Error('Stale artwork raster cache');
 const required=new Set(Array.from({length:last-first+1},(_,i)=>shadowSeed(i+first)));
 for(const seed of required){const name=`seed-${seed}.png`,path=dir+'/'+name;if(!existsSync(path)||manifest.files[name]!==cacheHash(path))throw Error('Missing or changed artwork raster '+name);}
 return {key:manifest.key,states:required.size};
}
