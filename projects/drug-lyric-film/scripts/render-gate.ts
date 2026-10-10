import {readFileSync} from 'node:fs';
import {currentIdentity,projectFile} from './project-identity.ts';
import {productionAllowed,type Review} from '../src/review-gate.ts';
const review=JSON.parse(readFileSync(projectFile('source/REVIEW.json'),'utf8')) as Review;
if(!productionAllowed(review,currentIdentity()))throw Error('Production is closed: review this complete current preview and record current-revision authorization first.');
throw Error('Preview project only. An approved production adapter must be prepared and verified before capture.');
