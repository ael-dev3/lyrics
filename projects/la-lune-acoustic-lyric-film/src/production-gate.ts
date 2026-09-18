import {object,array} from './schema.ts';
export function checkGate(review:unknown,identity:unknown,current:Record<string,string>,cueIds:string[],authorization?:unknown){
 const r=object(review),i=object(identity),approval=object(r.authorization),expected=object(i.hashes),bound=object(r.inputHashes);
 if(r.song!==i.song||r.revision!==i.revision)throw Error('Wrong song or revision');
 for(const [path,hash] of Object.entries(expected))if(current[path]!==hash||bound[path]!==hash)throw Error('Stale review input: '+path);
 if(array(r.unresolvedDefects).length)throw Error('Unresolved synchronization defects');
 const rows=array(r.cues).map(object);
 if(rows.length!==cueIds.length||new Set(rows.map(x=>x.id)).size!==cueIds.length)throw Error('Incomplete cue inventory');
 if(r.reviewMode==='owner-approved-preview'){
  const auth=object(authorization),acceptance=object(r.acceptance);
  if(i.song!=='p3E731cu_nE'||i.revision!=='preview-v2-lunar'||auth.authorizationId!=='la-lune-v2-production-2026-09-18'||auth.previewAccepted!==true||auth.fullRenderAuthorized!==true||auth.song!==i.song||auth.previewRevision!==i.revision||acceptance.authorizationId!==auth.authorizationId||r.status!=='accepted-for-production')throw Error('Missing scoped preview acceptance');
  if(r.actualAudioReviewComplete!==false||r.allCuesAllFormatsComplete!==false||r.translationReviewComplete!==true)throw Error('Preserve honest granular listening status');
  if(typeof acceptance.evidenceBasis!=='string'||!acceptance.evidenceBasis.trim()||typeof acceptance.coverageLimit!=='string'||!acceptance.coverageLimit.trim())throw Error('Missing acceptance scope');
  if(r.finalTechnicalAuditComplete!==true)throw Error('Final technical audit required');
  for(const id of cueIds)if(!rows.some(x=>x.id===id&&x.meaning===true))throw Error('Incomplete meaning inventory '+id);
  if(approval.approved!==true||approval.song!==i.song||approval.revision!==i.revision)throw Error('Explicit render approval required');
  return true;
 }
 for(const flag of ['actualAudioReviewComplete','translationReviewComplete','allCuesAllFormatsComplete'])if(r[flag]!==true)throw Error('Incomplete '+flag);
 for(const id of cueIds)if(!rows.some(x=>x.id===id&&['meaning','normalAudio','slowAudio','landscape','portrait'].every(k=>x[k]===true)))throw Error('Incomplete cue '+id);
 if(approval.approved!==true||approval.song!==i.song||approval.revision!==i.revision||typeof approval.evidence!=='string'||!approval.evidence.trim())throw Error('Explicit render approval required');
 return true;
}
