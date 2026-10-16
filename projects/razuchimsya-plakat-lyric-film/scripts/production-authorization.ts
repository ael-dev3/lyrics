import {existsSync,readFileSync} from 'node:fs';
import {currentIdentity,projectFile} from './project-identity.ts';
export function checkCurrentProductionAuthorization(){
 const path=projectFile('source/REVIEW.json');if(!existsSync(path))throw Error('Production blocked: current review and explicit approval are missing.');
 const review=JSON.parse(readFileSync(path,'utf8')),identity=currentIdentity();
 let listeningGateComplete=true;try{assertApprovedReview(review,identity)}catch{listeningGateComplete=false}
 const authPath=projectFile('source/PRODUCTION-AUTHORIZATION.json');
 const authorization=existsSync(authPath)?JSON.parse(readFileSync(authPath,'utf8')):undefined;
 if(!listeningGateComplete&&!currentPreviewAuthorized(review,identity,authorization))throw Error('Production blocked: missing current listening review or explicit current-preview owner authorization.');
 return {identity,listeningGateComplete,authorization,reviewSha256:JSON.stringify(review)};
}
export function assertApprovedReview(value:unknown,identity:ReturnType<typeof currentIdentity>):void{
 if(typeof value!=='object'||value===null)throw Error('Production blocked: review missing.');
 const review=value as Record<string,unknown>;
 for(const key of ['revision','sourceSha256','timelineSha256','sceneSha256'] as const)if(review[key]!==identity[key])throw Error('Production blocked: reviewed identity is stale.');
 const s=review.synchronization;
 if(typeof s!=='object'||s===null)throw Error('Production blocked: listening checks missing.');
 const sync=s as Record<string,unknown>;
 const layouts=sync.layouts,languages=sync.languages;
 if(sync.status!=='complete'||sync.normalSpeedFullRecording!==true||sync.uncertainWordsAndHeldEndingsAtReducedSpeed!==true||!Array.isArray(layouts)||!['landscape','portrait'].every(v=>layouts.includes(v))||!Array.isArray(languages)||!['ru','en'].every(v=>languages.includes(v)))throw Error('Production blocked: current full-song, reduced-speed and bilingual/both-format listening checks are incomplete.');
 const approval=review.renderApproval;
 if(typeof approval!=='object'||approval===null||(approval as Record<string,unknown>).approved!==true)throw Error('Production blocked: explicit approval for this exact preview is missing.');
}

export function currentPreviewAuthorized(review:any,identity:ReturnType<typeof currentIdentity>,authorization:any):boolean{
 return review?.renderApproval?.approved===true && review?.acceptance?.status==='owner-reviewed-current-preview'
  && authorization?.actorRole==='owner' && authorization.scope==='current-complete-preview'
  && authorization.acceptance==='owner-reviewed-current-preview' && authorization.render===true
  && authorization.noFurtherConfirmation===true && Boolean(authorization.recordedAtUtc) && Boolean(authorization.basis)
  && (['revision','sourceSha256','timelineSha256','sceneSha256'] as const).every(k=>review[k]===identity[k]&&authorization[k]===identity[k]);
}
