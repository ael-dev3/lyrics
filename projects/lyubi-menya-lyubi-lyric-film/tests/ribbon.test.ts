import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dynamics,ribbonPath,railGeometry} from '../src/scene.ts';
import {parseData} from '../src/schema.ts';
const data=parseData(JSON.parse(readFileSync('src/cues.json','utf8')));
test('ink ribbon has no independent motion in silence, anticipatory display envelope, or random drift',()=>{
 const rows=Array.from({length:200},()=>Array(64).fill(-120) as number[]);rows[100]=Array(64).fill(-20);
 const before=dynamics(99,'landscape',data,rows),attack=dynamics(100,'landscape',data,rows),release=dynamics(101,'landscape',data,rows),late=dynamics(116,'landscape',data,rows);
 assert.ok(before.values.every(v=>v===0));assert.ok(attack.values.every(v=>v===1));
 assert.ok(release.values.every(v=>v>0&&v<1));assert.ok(late.values.every(v=>v===0));
 assert.deepEqual(dynamics(100,'landscape',data,rows),attack);
 for(const format of ['landscape','portrait'] as const){
  const g=railGeometry(format),d=dynamics(100,format,data,rows),path=ribbonPath(d.values,d.barMax,format);
  assert.ok(!/NaN|Infinity/.test(path));assert.ok(g.y-d.barMax>700);assert.ok(g.y+d.barMax<(format==='landscape'?977:1850));
 }
});
