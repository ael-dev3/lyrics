import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
export interface Identity {project:string;revision:string;inputs:Record<string,string>;cueCount:number;cueIds:string[];}
export interface Review extends Identity {translationComplete:boolean;allSourceAndTargetSpansComplete:boolean;fullRecordingNormalSpeed:boolean;uncertainEventsReducedSpeed:boolean;nativeSquareAndPortrait:boolean;noUnresolvedDefects:boolean;reviewerRole:string;reviewedCueIds:string[];}
export interface Approval extends Identity {productionAuthorized:boolean;}
export function enforceProductionGate(current:Identity,review:Review|null,approval:Approval|null):void {
  if(!review)throw Error('Production blocked: synchronization review is missing');
  if(!approval)throw Error('Production blocked: current preview render authorization is missing');
  for(const evidence of [review,approval]) {
    if(evidence.project!==current.project || evidence.revision!==current.revision || evidence.cueCount!==current.cueCount || JSON.stringify(evidence.cueIds)!==JSON.stringify(current.cueIds) || JSON.stringify(Object.entries(evidence.inputs).sort())!==JSON.stringify(Object.entries(current.inputs).sort())) throw Error('Production blocked: stale or mismatched input identity');
  }
  if(!review.translationComplete || !review.allSourceAndTargetSpansComplete || !review.fullRecordingNormalSpeed || !review.uncertainEventsReducedSpeed || !review.nativeSquareAndPortrait || !review.noUnresolvedDefects || !review.reviewerRole || JSON.stringify([...new Set(review.reviewedCueIds)].sort())!==JSON.stringify([...current.cueIds].sort()))throw Error('Production blocked: complete actual-audio, meaning and format review is required');
  if(!approval.productionAuthorized)throw Error('Production blocked: current song/revision is not authorized');
}
export function checkCurrentProductionGate():void {
  const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
  const current=JSON.parse(readFileSync(resolve(root,'evidence/preview-inputs.json'),'utf8')) as Identity;
  for(const [path,expected] of Object.entries(current.inputs)) {
    const actual=createHash('sha256').update(readFileSync(resolve(root,path))).digest('hex');
    if(actual!==expected)throw Error(`Production blocked: changed ${path}`);
  }
  const optional=<T>(path:string):T|null=>{try{return JSON.parse(readFileSync(resolve(root,path),'utf8')) as T;}catch{return null;}};
  enforceProductionGate(current,optional<Review>('evidence/sync-review.json'),optional<Approval>('evidence/production-authorization.json'));
}
