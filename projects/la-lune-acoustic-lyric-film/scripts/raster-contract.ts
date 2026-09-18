import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {identityPaths} from '../src/identity.ts';
export const rasterPaths=[...identityPaths,'src/raster-inventory.ts','src/RasterCache.tsx','scripts/raster-cache.ts','scripts/raster-compose.ts'] as const;
const sha=(bytes:Buffer|string)=>createHash('sha256').update(bytes).digest('hex');
export const rasterInputs=()=>Object.fromEntries(rasterPaths.map(p=>[p,sha(readFileSync(p))]));
export function verifyCache(format:string){
 const root='output/raster-cache/'+format,manifest=JSON.parse(readFileSync(root+'/contract.json','utf8'));
 if(JSON.stringify(manifest.inputs)!==JSON.stringify(rasterInputs()))throw Error('Raster input identity changed');
 if(manifest.inventorySha256!==sha(readFileSync(root+'/inventory.json')))throw Error('Raster inventory changed');
 const inventory=JSON.parse(readFileSync(root+'/inventory.json','utf8'));
 if(inventory.format!==format||inventory.scale!==2||inventory.entries.length!==69)throw Error('Raster inventory incomplete');
 for(const entry of inventory.entries)if(sha(readFileSync(root+'/'+entry.file))!==entry.sha256)throw Error('Raster layer changed: '+entry.file);
 return manifest;
}
if(process.argv.includes('--bind'))for(const format of ['landscape','portrait']){
 const root='output/raster-cache/'+format,inventory=JSON.parse(readFileSync(root+'/inventory.json','utf8'));
 for(const entry of inventory.entries)if(sha(readFileSync(root+'/'+entry.file))!==entry.sha256)throw Error('Invalid cached layer');
 writeFileSync(root+'/contract.json',JSON.stringify({format,inputs:rasterInputs(),inventorySha256:sha(readFileSync(root+'/inventory.json')),method:'Approved Chromium SVG layers, 2× lossless PNG, labels repaired before proof',createdAt:new Date().toISOString()},null,2)+'\n');
 verifyCache(format);
}
