import {array,object,str} from './schema.ts';
import type {PreviewIdentity} from './identity.ts';
export function checkProductionReview(raw:unknown,identity:PreviewIdentity,current:Record<string,string>,cueIds:string[],authorization?:unknown){
 const review=object(raw);
 if(review.song!==identity.song||review.revision!==identity.revision)throw Error('Wrong song or stale review revision');
 for(const [path,expected] of Object.entries(identity.hashes))if(current[path]!==expected)throw Error('Changed preview input: '+path);
 const hashes=object(review.inputHashes);for(const [path,expected] of Object.entries(identity.hashes))if(hashes[path]!==expected)throw Error('Review does not bind '+path);
 if(array(review.unresolvedDefects).length)throw Error('Unresolved synchronization defects');
 const rows=array(review.cues).map(object);if(rows.length!==cueIds.length||new Set(rows.map(r=>r.id)).size!==cueIds.length)throw Error('Incomplete cue inventory');
 if(review.reviewMode==='owner-approved-preview'){
  const auth=object(authorization),acceptance=object(review.acceptance);
  const accepted=((identity.revision==='preview-v3-audio-led'&&auth.authorizationId==='kazhdyy-v3-production-2026-09-17')||(identity.revision==='preview-v4-vocal-response'&&auth.authorizationId==='kazhdyy-v4-production-2026-09-17')||(identity.revision==='preview-v5-section-dynamics'&&auth.authorizationId==='kazhdyy-v5-production-2026-09-17')||(identity.revision==='preview-v6-shadow-static'&&auth.authorizationId==='kazhdyy-v6-production-2026-09-17'))&&auth.previewAccepted===true;
  if(identity.song!=='3yDdoi1c7-8'||!accepted||review.status!=='accepted-for-production'||auth.fullRenderAuthorized!==true||auth.song!==identity.song||auth.previewRevision!==identity.revision||acceptance.authorizationId!==auth.authorizationId)throw Error('Missing scoped current-preview acceptance');
  if(review.translationReviewComplete!==true||review.actualAudioReviewComplete!==false||review.allCuesAllFormatsComplete!==false)throw Error('Preserve honest detailed-review status');
  for(const id of cueIds){const row=rows.find(r=>r.id===id);if(!row||row.meaning!==true)throw Error('Missing accepted meaning inventory: '+id);}
  str(acceptance.evidenceBasis);str(acceptance.coverageLimit);return true;
 }
 for(const key of ['actualAudioReviewComplete','translationReviewComplete','allCuesAllFormatsComplete'])if(review[key]!==true)throw Error('Incomplete '+key);
 for(const id of cueIds){const row=rows.find(r=>r.id===id);if(!row||['meaning','normalAudio','slowAudio','landscape','portrait'].some(k=>row[k]!==true))throw Error('Incomplete cue review: '+id);}
 str(review.reviewerRole);str(review.actualAudioMethod);
 const approval=object(review.authorization);if(approval.approved!==true||approval.revision!==identity.revision)throw Error('No explicit render authorization for reviewed revision');
 str(approval.evidence);
 return true;
}
