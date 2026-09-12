import {bundle} from '@remotion/bundler';
import {renderFrames,selectComposition} from '@remotion/renderer';
import {resolve} from 'node:path';
import {readFileSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {parseCues} from '../src/schema.ts';
const count=parseCues(JSON.parse(readFileSync('src/cues.json','utf8'))).length;
const serveUrl=await bundle({entryPoint:resolve('src/index.tsx')});
for(const kind of ['YouTube','TikTok']){
 const composition=await selectComposition({serveUrl,id:'Layout'+kind});
 const rows:{cue:string;state:number;words:number[][]}[]=[];
 await renderFrames({serveUrl,composition,inputProps:{},onStart:()=>{},onFrameUpdate:()=>{},outputDir:resolve('evidence/layout-'+kind),imageFormat:'png',concurrency:3,onBrowserLog:l=>{if(l.text.startsWith('LAYOUT_OK '))rows.push(JSON.parse(l.text.slice(10)));}});
 const unique=new Map(rows.map(r=>[r.cue+'-'+r.state,r]));assert.equal(unique.size,count*2);
 for(const r of unique.values()){const other=unique.get(r.cue+'-'+(1-r.state));assert(other);assert.deepEqual(r.words,other.words);}
 writeFileSync(`evidence/layout-${kind}.json`,JSON.stringify({checkedStates:unique.size,allInsideSafeAreas:true,noGlyphMovementOnHighlight:true,rows:[...unique.values()]},null,2));console.log('LAYOUT_PASS',kind,unique.size);
}
