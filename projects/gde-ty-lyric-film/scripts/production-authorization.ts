import {readFileSync} from 'node:fs';
import {currentIdentity,projectFile} from './project-identity.ts';
import {productionAllowed,type Review} from '../src/review-gate.ts';

/** The current song requires complete listening scope and explicit approval. */
export function checkCurrentProductionAuthorization(){
 const identity=currentIdentity(),review=JSON.parse(readFileSync(projectFile('source/REVIEW.json'),'utf8')) as Review;
 if(!productionAllowed(review,identity))throw Error('Current-revision synchronization review and render approval are required.');
 return {identity,listeningGateComplete:true,reviewSha256:JSON.stringify(review)};
}
