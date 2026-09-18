import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {createHash} from 'node:crypto';
import {verifiedAcceptedDelivery,deliveryReviewHtml} from '../scripts/review-delivery-status.ts';
test('Delivery badge requires current acceptance, exact inputs and both verified file identities',()=>{
 const root=mkdtempSync(join(tmpdir(),'lune-status-'));const write=(p:string,v:unknown)=>writeFileSync(join(root,p),JSON.stringify(v));const hash=(s:string)=>createHash('sha256').update(s).digest('hex');
 try{
  mkdirSync(join(root,'evidence'));mkdirSync(join(root,'output'));writeFileSync(join(root,'scene'),'fixture scene');
  const identity={song:'fixture',revision:'fixture',hashes:{scene:hash('fixture scene')}},acceptance={...identity,inputHashes:identity.hashes,previewAccepted:true,deliveryHashes:{landscape:hash('landscape bytes'),portrait:hash('portrait bytes')}};
  write('evidence/preview-identity.json',identity);write('evidence/owner-acceptance-v3.json',acceptance);
  const videos=['landscape','portrait'].map(format=>{const file=format+'.mp4',sha256=hash(format+' bytes');writeFileSync(join(root,'output',file),format+' bytes');write('evidence/'+file+'.verification.json',{status:'passed technical verification',sha256});write('evidence/'+format+'-'+file+'.focus-verification.json',{status:'passed',inputSha256:sha256,mismatchCount:0,ambiguous:0});return {file,format,sha256};});
  const receipt={revision:identity.revision,status:'verified local posting kit',videos};write('evidence/delivery-receipt.json',receipt);assert.equal(verifiedAcceptedDelivery(root),true);
  write('evidence/owner-acceptance-v3.json',{...acceptance,previewAccepted:false});assert.equal(verifiedAcceptedDelivery(root),false);write('evidence/owner-acceptance-v3.json',acceptance);
  writeFileSync(join(root,'scene'),'changed');assert.equal(verifiedAcceptedDelivery(root),false);writeFileSync(join(root,'scene'),'fixture scene');
  write('evidence/delivery-receipt.json',{...receipt,videos:[videos[0],videos[0]]});assert.equal(verifiedAcceptedDelivery(root),false);write('evidence/delivery-receipt.json',receipt);
  writeFileSync(join(root,'output/portrait.mp4'),'changed');assert.equal(verifiedAcceptedDelivery(root),false);
 }finally{rmSync(root,{recursive:true,force:true});}
});
test('Pending status stays unchanged without verified delivery evidence',()=>{const html='PREVIEW · REVIEW PENDING | Preview only; production rendering remains pending.';assert.equal(deliveryReviewHtml(html,false),html);assert.match(deliveryReviewHtml(html,true),/ACCEPTED · RENDERS VERIFIED/);assert.doesNotMatch(deliveryReviewHtml(html,true),/pending/);assert.equal(verifiedAcceptedDelivery('/nonexistent-lunar-fixture'),false);});
