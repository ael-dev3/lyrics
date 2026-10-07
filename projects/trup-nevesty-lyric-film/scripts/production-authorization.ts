import {readFileSync} from 'node:fs';
import {currentIdentity,projectFile} from './project-identity.ts';
import {productionAllowed,type Review,type RevisionIdentity} from '../src/review-gate.ts';

export interface OwnerAuthorization extends RevisionIdentity{
 scope:'current-complete-preview';
 actorRole:'owner';
 render:boolean;
 desktopKit:boolean;
 sourceHandoff:boolean;
 recordedAtUtc:string;
 basis:string;
}
export function currentPreviewAuthorized(review:Review,current:RevisionIdentity,authorization:OwnerAuthorization):boolean{
 return review.renderApproval.approved===true
  &&authorization.actorRole==='owner'&&authorization.scope==='current-complete-preview'&&authorization.render===true
  &&Boolean(authorization.recordedAtUtc)&&Boolean(authorization.basis)
  &&(['revision','sourceSha256','timelineSha256','sceneSha256'] as const).every(k=>review[k]===current[k]&&authorization[k]===current[k]);
}
export function checkCurrentProductionAuthorization(){
 const identity=currentIdentity();
 const review:Review=JSON.parse(readFileSync(projectFile('source/REVIEW.json'),'utf8'));
 const authorization:OwnerAuthorization=JSON.parse(readFileSync(projectFile('source/PRODUCTION-AUTHORIZATION.json'),'utf8'));
 const listeningGateComplete=productionAllowed(review,identity);
 if(!listeningGateComplete&&!currentPreviewAuthorized(review,identity,authorization))throw Error('No current-revision production authorization.');
 // Current-song owner direction is separate from a listening attestation. This
 // does not complete the stricter shared review or create a future-song waiver.
 return {identity,authorization,listeningGateComplete,reviewSha256:JSON.stringify(review)};
}
