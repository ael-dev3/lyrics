import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {currentIdentity,projectFile} from './project-identity.ts';

const identity=currentIdentity();
const path=projectFile('source/REVIEW.json');
const prior=existsSync(path)?JSON.parse(readFileSync(path,'utf8')):undefined;
const unchanged=prior&&['revision','sourceSha256','timelineSha256','sceneSha256'].every(k=>prior[k]===identity[k as keyof typeof identity]);
const review=unchanged?{...prior,...identity}:{...identity,
 synchronization:{status:'pending',normalSpeedFullRecording:false,uncertainWordsAndHeldEndingsAtReducedSpeed:false,layouts:[],languages:[],evidence:'Acoustic diagnostics and visual/transport checks support preview review; they are not listener approval.'},
 renderApproval:{approved:false,status:'Preview only; no current-revision render authorization.'},
 ...(prior?.renderApproval?.approved?{supersededApprovedIdentity:{revision:prior.revision,sourceSha256:prior.sourceSha256,timelineSha256:prior.timelineSha256,sceneSha256:prior.sceneSha256}}:{}),
};
writeFileSync(projectFile('public/preview-identity.json'),JSON.stringify(identity,null,2)+'\n');
writeFileSync(path,JSON.stringify(review,null,2)+'\n');
console.log(JSON.stringify({revision:identity.revision,sceneSha256:identity.sceneSha256,reviewPreserved:Boolean(unchanged)}));
