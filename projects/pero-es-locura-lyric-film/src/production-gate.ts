import {object,array} from './schema.ts';
export function checkGate(review:unknown,identity:unknown,current:Record<string,string>,cueIds:string[]){
 const r=object(review),i=object(identity),approval=object(r.authorization),expected=object(i.hashes),bound=object(r.inputHashes);
 if(i.song!=='uvLVcEBIn-4'||r.song!==i.song||r.revision!==i.revision)throw Error('Wrong song or revision');
 if(!Object.keys(expected).length)throw Error('Empty identity');
 for(const [path,hash] of Object.entries(expected))if(current[path]!==hash||bound[path]!==hash)throw Error('Stale review input: '+path);
 if(array(r.unresolvedDefects).length)throw Error('Unresolved synchronization defects');
 if(!cueIds.length)throw Error('Missing cue inventory');
 const rows=array(r.cues).map(object);
 if(rows.length!==cueIds.length||new Set(rows.map(x=>x.id)).size!==cueIds.length)throw Error('Incomplete cue inventory');
 for(const flag of ['actualAudioReviewComplete','translationReviewComplete','allCuesAllFormatsComplete'])if(r[flag]!==true)throw Error('Incomplete '+flag);
 for(const id of cueIds)if(!rows.some(x=>x.id===id&&['meaning','normalAudio','slowAudio','landscape','portrait'].every(k=>x[k]===true)))throw Error('Incomplete cue '+id);
 if(approval.approved!==true||approval.song!==i.song||approval.revision!==i.revision||typeof approval.evidence!=='string'||!approval.evidence.trim())throw Error('Explicit render approval required');
 return true;
}
