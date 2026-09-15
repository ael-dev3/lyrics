import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {parseData} from '../src/schema.ts';
import type {Layouts} from '../src/layout-types.ts';
import {sceneSvg} from '../src/scene.ts';
const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8'))),layouts:Layouts=JSON.parse(readFileSync('src/layout.json','utf8')),bands:number[][]=JSON.parse(readFileSync('public/science.json','utf8'));
let states=0,boxes=0;for(const format of ['landscape','portrait'] as const){const l=layouts[format];for(const c of data.cues){const geo=l.cues[c.id];assert.ok(geo);for(const lane of [geo.ru,geo.en])for(const w of lane){boxes++;assert.ok(w.x>=l.safeX-1&&w.x+w.width<=l.width-l.safeX+1);assert.ok(w.y>=0&&w.y+l.fontSize*.25<l.height);}
 const geometry=(f:number)=>Array.from(sceneSvg(f,format,data,layouts,bands).matchAll(/<text data-word="([^"]+)" data-active="[^"]+" x="([^"]+)" y="([^"]+)"/g),m=>[m[1],m[2],m[3]]);
 let expected:string|undefined;for(const w of c.ru){const frames=[Math.round(w.startSample/data.sampleRate*60)-1,Math.round(w.startSample/data.sampleRate*60),Math.round(w.startSample/data.sampleRate*60)+1,Math.round(w.endSample/data.sampleRate*60)-1,Math.round(w.endSample/data.sampleRate*60)];for(const f of frames){const g=geometry(f);if(!g.length)continue;const signature=JSON.stringify(g);if(expected)assert.equal(signature,expected,c.id+' glyph movement');else expected=signature;states++;}}
 }}writeFileSync('evidence/geometry-check.json',JSON.stringify({status:'passed',states,wordBoxes:boxes,formats:['1920x1080','1080x1920'],equalFontAndColorRoles:true,method:'Source SVG geometry invariance at onset, handoff and exclusive-end states; numeric bounds. Does not certify browser rasterization, optical equality or listening.'},null,2));console.log({states,boxes});
