import {bundle} from '@remotion/bundler';
import {renderFrames,selectComposition} from '@remotion/renderer';
import {resolve} from 'node:path';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const serveUrl=await bundle({entryPoint:resolve('src/index.tsx')});
for(const kind of ['YouTube','TikTok']){
 const composition=await selectComposition({serveUrl,id:'Layout'+kind});
 const rows:{cue:string;state:number;ru:number[][];en:number[][]}[]=[];
 await renderFrames({serveUrl,composition,inputProps:{},onStart:()=>{},onFrameUpdate:()=>{},outputDir:resolve('evidence/layout-'+kind),imageFormat:'png',concurrency:2,onBrowserLog:l=>{if(l.text.startsWith('LAYOUT_OK '))rows.push(JSON.parse(l.text.slice(10)));}});
 const unique=new Map(rows.map(r=>[r.cue+'-'+r.state,r]));assert.equal(unique.size,72);
 for(const r of unique.values()){const other=unique.get(r.cue+'-'+(1-r.state));assert(other);assert.deepEqual(r.ru,other.ru);assert.deepEqual(r.en,other.en);}
 writeFileSync(`evidence/layout-${kind}.json`,JSON.stringify({checkedStates:unique.size,allInsideSafeAreas:true,noGlyphMovementOnHighlight:true,rows:[...unique.values()]},null,2));console.log('LAYOUT_PASS',kind,unique.size);
}
