import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {currentIdentity,projectFile} from './project-identity.ts';
export function assertProduction(review:any,identity:any){
 for(const key of ['revision','sourceSha256','timelineSha256','sceneSha256'])assert.equal(review?.[key],identity[key],'Missing or stale review identity: '+key);
 assert.equal(review?.synchronization?.status,'complete','Full current-revision synchronization review remains pending.');
 assert.equal(review.synchronization.normalSpeedFullRecording,true);
 assert.equal(review.synchronization.uncertainWordsAndHeldEndingsAtReducedSpeed,true);
 for(const f of ['landscape','portrait'])assert(review.synchronization.layouts.includes(f));
 for(const l of ['ru','en'])assert(review.synchronization.languages.includes(l));
 assert.equal(review?.renderApproval?.approved,true,'This song has no production-render approval.');
}
if(import.meta.url===new URL(process.argv[1]!, 'file://').href){assertProduction(JSON.parse(readFileSync(projectFile('source/REVIEW.json'),'utf8')),currentIdentity());console.log('Production review and approval match the current identity.');}
