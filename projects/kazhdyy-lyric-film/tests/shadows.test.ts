import {test} from 'node:test';
import assert from 'node:assert/strict';
import raw from '../public/shadow-events.json' with {type:'json'};
import {shadowSeed} from '../src/shadows.ts';

test('shadow changes stay confined to five-frame vocal-event bursts',()=>{
 const changes=new Set(raw.events.flatMap(e=>[e.frame,e.frame+2,e.frame+4]));
 assert.equal(raw.events.length,384);
 for(let frame=1;frame<12798;frame++){
  assert.equal(shadowSeed(frame)!==shadowSeed(frame-1),changes.has(frame));
 }
 for(let i=1;i<raw.events.length;i++)assert.ok(raw.events[i]!.frame-raw.events[i-1]!.frame>=14);
 assert.equal(shadowSeed(0),1);
});
