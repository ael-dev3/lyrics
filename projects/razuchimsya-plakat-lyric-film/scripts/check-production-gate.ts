import {checkCurrentProductionAuthorization} from './production-authorization.ts';
try {const a=checkCurrentProductionAuthorization();console.log(JSON.stringify({status:'authorized',revision:a.identity.revision,listeningGateComplete:a.listeningGateComplete,scope:a.listeningGateComplete?'complete-listening-review':'owner-approved-current-preview'}));}
catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
