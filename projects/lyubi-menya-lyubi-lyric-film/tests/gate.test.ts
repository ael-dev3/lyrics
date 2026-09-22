import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {checkGate,assertProductionGate,requiredInputPaths} from '../scripts/production-gate.ts';

const identity={song:'DBGCHjBSNzo',revision:'test-only',hashes:Object.fromEntries(requiredInputPaths.map(path=>[path,createHash('sha256').update(path).digest('hex')]))},current={...identity.hashes};
const complete=(bound=identity)=>({song:bound.song,revision:bound.revision,inputHashes:{...bound.hashes},authorization:{approved:true,song:bound.song,revision:bound.revision,scope:'full-song-production',evidence:'Test fixture, not listening evidence',inputHashes:{...bound.hashes}},unresolvedDefects:[] as string[],actualAudioReviewComplete:true,translationReviewComplete:true,allCuesAllFormatsComplete:true,cues:[{id:'fixture',meaning:true,normalAudio:true,slowAudio:true,landscape:true,portrait:true}]});

test('current complete review and explicit approval are separate required records',()=>{
 assert.equal(checkGate(complete(),identity,current,['fixture']),true);
 assert.throws(()=>checkGate(undefined,identity,current,['fixture']));
 const unapproved=complete();unapproved.authorization.approved=false;
 assert.throws(()=>checkGate(unapproved,identity,current,['fixture']));
 const incomplete=complete();incomplete.cues[0]!.slowAudio=false;
 assert.throws(()=>checkGate(incomplete,identity,current,['fixture']));
 const noListening=complete();noListening.actualAudioReviewComplete=false;
 assert.throws(()=>checkGate(noListening,identity,current,['fixture']));
});
test('approval cannot cross song, revision, input identity or an omitted cue',()=>{
 assert.throws(()=>checkGate(complete(),{...identity,song:'another-song'},current,['fixture']));
 assert.throws(()=>checkGate(complete(),{...identity,revision:'new-revision'},current,['fixture']));
 assert.throws(()=>checkGate(complete(),identity,{...current,'src/scene.ts':'changed'},['fixture']));
 const stale=complete();stale.authorization.inputHashes['src/scene.ts']='old';
 assert.throws(()=>checkGate(stale,identity,current,['fixture']));
 assert.throws(()=>checkGate(complete(),identity,current,['fixture','missing']));
 const defects=complete();defects.unresolvedDefects.push('Unresolved lyric omission');
 assert.throws(()=>checkGate(defects,identity,current,['fixture']));
});

test('mandatory visual and timing inputs cannot be omitted or traverse out of the project',()=>{
 const missing={...identity,hashes:{...identity.hashes}};delete missing.hashes['public/artwork.png'];
 assert.throws(()=>checkGate(complete(missing),missing,current,['fixture']),/required identity input missing/);
 const unsafe={...identity,hashes:{...identity.hashes,'../outside':createHash('sha256').update('x').digest('hex')}};
 assert.throws(()=>checkGate(complete(unsafe),unsafe,{...unsafe.hashes},['fixture']),/unsafe input path/);
});

test('filesystem gate rejects changed visual bytes even when the stored approval is unchanged',()=>{
 const root=mkdtempSync(resolve(tmpdir(),'lyubi-gate-'));
 try{
  for(const path of requiredInputPaths){const file=resolve(root,path);mkdirSync(dirname(file),{recursive:true});writeFileSync(file,'fixture '+path);}
  const cues={sampleRate:44100,sampleCount:44100,duration:1,fps:60,frames:60,audioSha256:'fixture-audio',cues:[{id:'fixture',section:'Test',ru:[{id:'s1',text:'Люби',startSample:1,endSample:22050,candidateSpreadMs:0,reviewRequired:false}],en:[{id:'e1',text:'Love',sourceIds:['s1']}],startSample:1,endSample:22050,visibleFrom:0,visibleUntil:44100}]};
  writeFileSync(resolve(root,'src/cues.json'),JSON.stringify(cues));
  const frozen={...identity,hashes:Object.fromEntries(requiredInputPaths.map(path=>[path,createHash('sha256').update(readFileSync(resolve(root,path))).digest('hex')]))};
  mkdirSync(resolve(root,'evidence'));writeFileSync(resolve(root,'evidence/preview-identity.json'),JSON.stringify(frozen));writeFileSync(resolve(root,'evidence/cross-language-sync-review.json'),JSON.stringify(complete(frozen)));
  assert.equal(assertProductionGate(root),true);
  writeFileSync(resolve(root,'src/scene.ts'),'a changed composition');
  assert.throws(()=>assertProductionGate(root),/stale input src\/scene.ts/);
 }finally{rmSync(root,{recursive:true,force:true});}
});
