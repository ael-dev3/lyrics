import {array,object,str} from './schema.ts';
import type {PreviewIdentity} from './identity.ts';
export function checkProductionReview(raw:unknown,identity:PreviewIdentity,current:Record<string,string>,cueIds:string[]){
 const review=object(raw);
 if(review.song!==identity.song||review.revision!==identity.revision)throw Error('Wrong song or stale review revision');
 for(const [path,expected] of Object.entries(identity.hashes))if(current[path]!==expected)throw Error('Changed preview input: '+path);
 const hashes=object(review.inputHashes);for(const [path,expected] of Object.entries(identity.hashes))if(hashes[path]!==expected)throw Error('Review does not bind '+path);
 for(const key of ['actualAudioReviewComplete','translationReviewComplete','allCuesAllFormatsComplete'])if(review[key]!==true)throw Error('Incomplete '+key);
 if(array(review.unresolvedDefects).length)throw Error('Unresolved synchronization defects');
 const rows=array(review.cues).map(object);if(rows.length!==cueIds.length||new Set(rows.map(r=>r.id)).size!==cueIds.length)throw Error('Incomplete cue inventory');
 for(const id of cueIds){const row=rows.find(r=>r.id===id);if(!row||['meaning','normalAudio','slowAudio','landscape','portrait'].some(k=>row[k]!==true))throw Error('Incomplete cue review: '+id);}
 str(review.reviewerRole);str(review.actualAudioMethod);
 const approval=object(review.authorization);if(approval.approved!==true||approval.revision!==identity.revision)throw Error('No explicit render authorization for reviewed revision');
 str(approval.evidence);
 return true;
}
