import {readFileSync} from 'node:fs';
import {currentIdentity,projectFile} from './project-identity.ts';
import {productionAllowed,type Review} from '../src/review-gate.ts';
const identity=currentIdentity();
const review:Review=JSON.parse(readFileSync(projectFile('source/REVIEW.json'),'utf8'));
const allowed=productionAllowed(review,identity);
console.log(JSON.stringify({allowed,revision:identity.revision,reason:allowed?'Current-revision listening scope and explicit render approval recorded.':'Preview only. Complete current-revision bilingual listening review and explicit render approval are required before production.'}));
if(!allowed)process.exitCode=1;
