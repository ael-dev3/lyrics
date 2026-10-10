export interface RevisionIdentity{revision:string;sourceSha256:string;timelineSha256:string;sceneSha256:string}
export interface Review extends RevisionIdentity{
 synchronization:{status:string;normalSpeedFullRecording:boolean;uncertainWordsAndHeldEndingsAtReducedSpeed:boolean;layouts:string[];languages:string[]};
 renderApproval:{approved:boolean};
}
export function productionAllowed(review:Review,current:RevisionIdentity):boolean{
 return ['revision','sourceSha256','timelineSha256','sceneSha256'].every(k=>review[k as keyof RevisionIdentity]===current[k as keyof RevisionIdentity])
  &&review.synchronization.status==='complete'
  &&review.synchronization.normalSpeedFullRecording===true
  &&review.synchronization.uncertainWordsAndHeldEndingsAtReducedSpeed===true
  &&['landscape','portrait'].every(f=>review.synchronization.layouts.includes(f))
  &&['ru','en'].every(l=>review.synchronization.languages.includes(l))
  &&review.renderApproval.approved===true;
}
