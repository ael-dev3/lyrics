import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,rmSync,symlinkSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import test from 'node:test';
import {assertGate,sha,SONG,REVISION,APPROVED_FONT,PREVIEW_INPUTS,PRODUCTION_INPUTS,previewFiles} from './render-gate.mjs';

// Tiny fixtures exercise identity failures without real media, authorization
// edits, renderer initialization or an encode.
function fixture(t) {
  const root=mkdtempSync(join(tmpdir(),'sunburn-render-gate-'));
  t.after(()=>rmSync(root,{recursive:true,force:true}));
  const write=(path,value)=>{
    mkdirSync(dirname(join(root,path)),{recursive:true});
    writeFileSync(join(root,path),typeof value==='string'?value:JSON.stringify(value,null,2)+'\n');
  };
  for(const path of new Set([...PREVIEW_INPUTS,...PRODUCTION_INPUTS]))write(path,'fixture '+path+'\n');
  const authorization={song:SONG,revision:REVISION,productionAuthorized:true,currentPreviewReview:'owner-attested-complete',previewHashes:Object.fromEntries(PREVIEW_INPUTS.map(path=>[path,sha(join(root,path))]))};
  const saveAuthorization=()=>write('evidence/render-authorization.json',authorization);
  saveAuthorization();
  const adoption={status:'PASS',song:SONG,revision:REVISION,authorizationSha256:sha(join(root,'evidence/render-authorization.json')),inputHashes:Object.fromEntries(PRODUCTION_INPUTS.map(path=>[path,sha(join(root,path))]))};
  const saveAdoption=()=>write('evidence/production-adoption.json',adoption);
  saveAdoption();
  return {root,write,authorization,adoption,saveAuthorization,saveAdoption,gate:(production=true,env={})=>assertGate(production,{root,env})};
}

test('only complete current approval and adapter proof permit production',t=>{
  const f=fixture(t);assert.equal(f.gate().song,SONG);assert.equal(f.gate(false).revision,REVISION);
  assert.deepEqual(previewFiles(),PREVIEW_INPUTS);
  assert(previewFiles().includes('public/audio-features.bin'));
  const mutable=previewFiles();mutable.pop();assert.equal(previewFiles().length,15);
});
test('missing approval blocks diagnostics and production',t=>{
  const f=fixture(t);rmSync(join(f.root,'evidence/render-authorization.json'));
  for(const production of [false,true])assert.throws(()=>f.gate(production),/authorization is missing or invalid/);
});
test('another song/revision, incomplete review or absent authorization blocks production',t=>{
  const f=fixture(t),original=structuredClone(f.authorization);
  for(const patch of [{song:'different-song'},{revision:'earlier-preview'},{currentPreviewReview:'pending'},{currentPreviewReview:undefined},{productionAuthorized:false},{productionAuthorized:undefined}]) {
    Object.assign(f.authorization,original,patch);f.saveAuthorization();
    assert.throws(()=>f.gate(),/Current song, preview review and render authorization required/);
  }
});
test('empty/partial preview hashes cannot omit media, binary features or an effect',t=>{
  const f=fixture(t),hashes=structuredClone(f.authorization.previewHashes);
  for(const path of [null,'public/source.mp4','public/audio-features.bin','src/damage.js']) {
    f.authorization.previewHashes=path?{...hashes}:{};if(path)delete f.authorization.previewHashes[path];f.saveAuthorization();
    assert.throws(()=>f.gate(false),/Approved preview omits required input/);
  }
});
test('changed approved picture, timing or effect invalidates diagnostic capture too',t=>{
  const f=fixture(t);
  for(const path of ['public/source.mp4','src/timeline.json','src/sunfire.js']) {
    const original=readFileSync(join(f.root,path));f.write(path,'changed bytes');
    assert.throws(()=>f.gate(false),/Approved preview changed/);writeFileSync(join(f.root,path),original);
  }
});
test('missing adoption blocks production but permits approved proof capture',t=>{
  const f=fixture(t);rmSync(join(f.root,'evidence/production-adoption.json'));
  assert.throws(()=>f.gate(),/Production adapter proof is missing or invalid/);assert.doesNotThrow(()=>f.gate(false));
});
test('failed, foreign or stale adoption cannot certify this renderer',t=>{
  const f=fixture(t),original=structuredClone(f.adoption);
  for(const patch of [{status:'pending'},{status:undefined},{song:'different-song'},{revision:'old'},{authorizationSha256:'0'.repeat(64)}]) {
    Object.assign(f.adoption,original,patch);f.saveAdoption();assert.throws(()=>f.gate(),/adapter proof/);
  }
});
test('changing authorization after adoption requires a fresh proof binding',t=>{
  const f=fixture(t);f.authorization.scope='changed approved scope';f.saveAuthorization();
  assert.throws(()=>f.gate(),/different authorization/);
});
test('empty/partial adapter hashes cannot omit renderer, layout, font or dependencies',t=>{
  const f=fixture(t),hashes=structuredClone(f.adoption.inputHashes);
  for(const path of [null,'scripts/render-production.mjs','scripts/render-gate.mjs','src/production-layout.json',APPROVED_FONT,'package-lock.json']) {
    f.adoption.inputHashes=path?{...hashes}:{};if(path)delete f.adoption.inputHashes[path];f.saveAdoption();
    assert.throws(()=>f.gate(),/Production adapter omits required input/);
  }
});
test('edited renderer, geometry, font or dependency lock invalidates production proof',t=>{
  const f=fixture(t);
  for(const path of ['scripts/production-scene.mjs','src/production-layout.json',APPROVED_FONT,'package-lock.json']) {
    const original=readFileSync(join(f.root,path));f.write(path,'changed renderer input');
    assert.throws(()=>f.gate(),/Production adapter changed/);writeFileSync(join(f.root,path),original);
  }
});
test('malformed maps and hashes fail closed',t=>{
  const f=fixture(t),original=f.authorization.previewHashes;
  for(const hashes of [undefined,null,[],'hashes']) {
    f.authorization.previewHashes=hashes;f.saveAuthorization();assert.throws(()=>f.gate(false),/input hashes required/);
  }
  f.authorization.previewHashes={...original,'src/player.js':'not-a-sha'};f.saveAuthorization();
  assert.throws(()=>f.gate(false),/invalid SHA-256/);
});
test('declared hash paths cannot traverse outside the project',t=>{
  const f=fixture(t),original=structuredClone(f.authorization.previewHashes);
  for(const path of ['../outside','/etc/hosts','src/../outside','src\\outside','src//player.js']) {
    f.authorization.previewHashes={...original,[path]:'0'.repeat(64)};f.saveAuthorization();
    assert.throws(()=>f.gate(false),/Unsafe project-relative input path/);
  }
});
test('a hashed symlink escaping the project is rejected',t=>{
  const f=fixture(t),outside=mkdtempSync(join(tmpdir(),'sunburn-gate-outside-'));
  t.after(()=>rmSync(outside,{recursive:true,force:true}));
  const target=join(outside,'payload');writeFileSync(target,'external');symlinkSync(target,join(f.root,'external-payload'));
  f.authorization.previewHashes['external-payload']=sha(target);f.saveAuthorization();
  assert.throws(()=>f.gate(false),/inside the project/);
});
test('an environment font override cannot bypass the approved font hash',t=>{
  const f=fixture(t);f.write('output/runtime/other-font.ttf','other font');
  assert.throws(()=>f.gate(true,{LYRIC_FONT:'output/runtime/other-font.ttf'}),/approved production font/);
  assert.doesNotThrow(()=>f.gate(true,{LYRIC_FONT:APPROVED_FONT}));
  assert.doesNotThrow(()=>f.gate(true,{LYRIC_FONT:join(f.root,APPROVED_FONT)}));
});
