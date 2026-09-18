import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {stars,starOpacity,field,project} from '../src/stars.ts';
import {lunarState,geometry} from '../src/lunar-motion.ts';
import {palette} from '../src/palette.ts';
import {parseData} from '../src/schema.ts';
import {revision} from '../src/identity.ts';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const data=parseData(read('src/cues.json')),prior=read('evidence/history/v2/preview-identity.json').hashes;
const unchanged=['public/soundtrack.m4a','source/lyrics-fr.json','source/translation.json','src/cues.json','src/layout.json','src/focus.ts'];
const hashes=Object.fromEntries(unchanged.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]));
for(const p of unchanged)assert.equal(hashes[p],prior[p]);
for(const c of Object.values(palette))assert.ok(/^#([\dA-F]{2})\1\1$/i.test(c));
let maxMoonChange=0,maxHaloChange=0,maxStarStep=0;
for(let f=1;f<data.frames;f++){const a=lunarState(f,data),b=lunarState(f-1,data);maxMoonChange=Math.max(maxMoonChange,Math.abs(a.moonOpacity-b.moonOpacity));maxHaloChange=Math.max(maxHaloChange,Math.abs(a.haloOpacity-b.haloOpacity));}
assert.equal(maxMoonChange,0);assert.equal(maxHaloChange,0);
for(const s of new Map([...stars('landscape'),...stars('portrait')].map(s=>[s.hr,s])).values()){let previous=starOpacity(s.hr,s.opacity,0);for(let f=1;f<data.frames;f++){const now=starOpacity(s.hr,s.opacity,f);maxStarStep=Math.max(maxStarStep,Math.abs(now-previous));assert.ok(now>=s.opacity*.88-.00005&&now<=s.opacity+.00005);previous=now;}}
assert.ok(maxStarStep<.001);
const projection=Object.fromEntries((['landscape','portrait'] as const).map(format=>{const g=geometry(format==='portrait'),scale=540/Math.tan(field.shortAxisDegrees*Math.PI/360);let maxError=0;for(const s of stars(format)){const p=project(s.ra,s.dec)!;maxError=Math.max(maxError,Math.abs(s.x-g.cx-p.x*scale),Math.abs(s.y-g.cy-p.y*scale));}assert.ok(maxError<=.00051);return [format,{visibleCatalogueStars:stars(format).length,maxProjectionRoundingErrorPixels:maxError}];}));
const report={status:'PASS',revision,allFrames:data.frames,palette,unchangedTimingTextLayoutHashes:hashes,moon:{opacity:.86,haloOpacity:.07,maxMoonChange,maxHaloChange,limits:'Intro phase reveal and final scene fade remain intentional; the audio never modulates Moon illumination.'},stars:{catalogue:'Yale Bright Star Catalogue, 5th Revised Ed. (Hoffleit & Warren 1991), CDS V/50',field,projection,maxStarOpacityStepPerFrame:maxStarStep,minimumScintillationMultiplier:.88,display:'V magnitudes converted to relative flux and compressed by power 0.30; neutral point cores with soft glows; slow independent scintillation.',limits:'J2000 catalogue pattern, not a dated horizon observation. No proper-motion correction. Oversized Moon is artistic, not an ephemeris. Uniform silver styling does not claim stellar spectral colors; twinkle is an illustrative exposure treatment.'}};
if(process.argv.includes('--verify-only'))assert.deepEqual(report,read('evidence/celestial-audit.json'));else writeFileSync('evidence/celestial-audit.json',JSON.stringify(report,null,2)+'\n');console.log(report);
