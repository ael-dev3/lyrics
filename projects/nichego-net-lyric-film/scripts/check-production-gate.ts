import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {assertApprovedReview,checkCurrentProductionAuthorization} from './production-authorization.ts';
export const assertProduction=assertApprovedReview;
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{const a=checkCurrentProductionAuthorization();console.log(JSON.stringify({status:'authorized',revision:a.identity.revision,listeningGateComplete:a.listeningGateComplete,scope:a.listeningGateComplete?'complete-listening-review':'owner-approved-current-preview'}));}
 catch(error){console.error(String(error));process.exitCode=1;}
}
