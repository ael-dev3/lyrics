import test from 'node:test';import assert from 'node:assert/strict';
import {assertProductionReady,type Review,type Authorization} from '../src/gate.ts';
import {mixAt} from '../src/score.ts';import {montages,shotAt,montageAt} from '../src/trailer.ts';
const identity={song:'stay-hardstyle',revision:'trailer-preview-v2',inputsSha256:'test-identity'};
const review:Review={...identity,complete:true,normalSpeed:true,uncertainAtReducedSpeed:true,landscape:true,portrait:true};
const auth:Authorization={...identity,approved:true,scope:'full-song-production'};
test('reject absent, incomplete, stale, wrong-song and non-production approvals',()=>{
 assert.throws(()=>assertProductionReady(undefined,undefined,identity));
 for(const key of ['complete','normalSpeed','uncertainAtReducedSpeed','landscape','portrait'] as const)assert.throws(()=>assertProductionReady({...review,[key]:false},auth,identity));
 for(const key of ['song','revision','inputsSha256'] as const){assert.throws(()=>assertProductionReady({...review,[key]:'other'},auth,identity));assert.throws(()=>assertProductionReady(review,{...auth,[key]:'other'},identity));}
 assert.throws(()=>assertProductionReady(review,{...auth,approved:false},identity));assert.throws(()=>assertProductionReady(review,{...auth,scope:'preview'},identity));
 assert.doesNotThrow(()=>assertProductionReady(review,auth,identity));
});
test('every frame of each edit resolves to one shot; cuts preserve song time',()=>{
 for(const m of montages){let end=0;for(const s of m.shots){assert.equal(s.startFrame,end);assert.ok(s.sourceOut>s.sourceIn);assert.ok(s.frames>0);end+=s.frames;}assert.equal(end,m.frames);
 for(let f=0;f<m.frames;f++){const t=m.songStart+(f+.01)/60;assert.equal(montageAt(t)?.id,m.id);assert.ok(shotAt(t));}
 }
});
test('trailer layers stay confined to commissioned hard sections',()=>{
 for(const t of [0,50,77,100,130,159,170,175,214,227])assert.equal(mixAt(t),0);
 for(const t of [103,110,125,180,190,210])assert.equal(mixAt(t),1);
});
