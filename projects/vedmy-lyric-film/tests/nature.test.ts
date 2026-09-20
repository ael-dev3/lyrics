import {test} from 'node:test';import assert from 'node:assert/strict';
import {paletteAt} from '../src/palette.ts';
import {natureAt,leafAt} from '../src/nature.ts';
import motion from '../public/nature-motion.json' with {type:'json'};
const luminance=(color:string)=>[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,x,i)=>n+x*([.2126,.7152,.0722][i]??0),0);
test('one woodland palette remains constant and keeps high text contrast',()=>{assert.equal(new Set([34.55,94.55,175.6].map(paletteAt).map(p=>p.name)).size,1);for(let f=0;f<12069;f++){const p=paletteAt(f/60);for(const color of [p.active,p.rest])assert.ok((luminance(color)+.05)/(luminance(p.ink)+.05)>7,'Text contrast at frame '+f);}});
test('integrated audio wind is continuous and deterministic after seeking',()=>{let prior=0;for(let f=0;f<motion.length;f++){const m=natureAt(f,motion);assert.ok(m.phase>prior&&m.phase-prior<=1.41/60);assert.ok(m.breeze>=0&&m.breeze<=1);prior=m.phase;for(const format of ['landscape','portrait'] as const){const leaf=leafAt(f%28,m,format);assert.ok(Number.isFinite(leaf.opacity)&&leaf.opacity>=0&&leaf.opacity<=.65);assert.ok(!leaf.transform.includes('NaN'));assert.deepEqual(leafAt(f%28,natureAt(f,motion),format),leaf);}}});
