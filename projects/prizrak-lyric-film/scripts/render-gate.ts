import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
const root=resolve(import.meta.dirname,'..');
export interface Identity {project:string;revision:string;inputHashes:Record<string,string>;cueIds:string[];}
export interface Review extends Identity {translationComplete:boolean;allLanguageSpansComplete:boolean;fullRecordingNormalSpeed:boolean;uncertainEventsReducedSpeed:boolean;nativeAndPortrait:boolean;noUnresolvedDefects:boolean;reviewerRole:string;reviewedCueIds:string[];}
export interface Approval extends Identity {productionAuthorized:boolean;}
export function enforceGate(current:Identity,review:Review|null,approval:Approval|null):void {
 if(!review)throw Error('Production refused: complete synchronization review is missing.');
 if(!approval)throw Error('Production refused: current song render authorization is missing.');
 for(const record of [review,approval]){
  if(current.project!==record.project || current.revision!==record.revision || JSON.stringify(current.cueIds)!==JSON.stringify(record.cueIds) || JSON.stringify(Object.entries(current.inputHashes).sort())!==JSON.stringify(Object.entries(record.inputHashes).sort()))throw Error('Production refused: wrong song/revision or stale reviewed inputs.');
 }
 if(!review.translationComplete || !review.allLanguageSpansComplete || !review.fullRecordingNormalSpeed || !review.uncertainEventsReducedSpeed || !review.nativeAndPortrait || !review.noUnresolvedDefects || !review.reviewerRole || JSON.stringify([...new Set(review.reviewedCueIds)].sort())!==JSON.stringify([...current.cueIds].sort()))throw Error('Production refused: complete actual-audio, semantic and format review is required.');
 if(!approval.productionAuthorized)throw Error('Production refused: this current preview is not authorized.');
}
export function checkProductionGate():void {
 const current=JSON.parse(readFileSync(resolve(root,'evidence/preview-inputs.json'),'utf8')) as Identity;
 for(const [path,hash] of Object.entries(current.inputHashes))if(createHash('sha256').update(readFileSync(resolve(root,path))).digest('hex')!==hash)throw Error(`Production refused: changed ${path}`);
 const optional=<T>(name:string):T|null=>{try{return JSON.parse(readFileSync(resolve(root,'evidence',name),'utf8')) as T;}catch{return null;}};
 enforceGate(current,optional<Review>('sync-review.json'),optional<Approval>('production-authorization.json'));
}
if(process.argv[1]===resolve(import.meta.filename)){
 checkProductionGate();
 throw Error('Production encoder is not provisioned during preview-only preparation.');
}
