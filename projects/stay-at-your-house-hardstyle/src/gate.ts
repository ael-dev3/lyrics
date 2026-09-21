export type Identity={song:string;revision:string;inputsSha256:string};
export type Review=Identity&{complete:boolean;normalSpeed:boolean;uncertainAtReducedSpeed:boolean;landscape:boolean;portrait:boolean};
export type Authorization=Identity&{approved:boolean;scope:string};
export function assertProductionReady(review:Review|undefined,authorization:Authorization|undefined,current:Identity){
 if(!review||!authorization)throw Error('Production blocked: review and authorization are required');
 for(const item of [review,authorization])for(const key of ['song','revision','inputsSha256'] as const)if(item[key]!==current[key])throw Error('Production blocked: stale or different inputs');
 if(!review.complete||!review.normalSpeed||!review.uncertainAtReducedSpeed||!review.landscape||!review.portrait)throw Error('Production blocked: synchronization review incomplete');
 if(!authorization.approved||authorization.scope!=='full-song-production')throw Error('Production blocked: no explicit full-song approval');
}
