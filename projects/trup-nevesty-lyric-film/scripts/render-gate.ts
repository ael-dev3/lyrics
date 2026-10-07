import {checkCurrentProductionAuthorization} from './production-authorization.ts';
try{
 const result=checkCurrentProductionAuthorization();
 console.log(JSON.stringify({allowed:true,revision:result.identity.revision,listeningGateComplete:result.listeningGateComplete,scope:result.listeningGateComplete?'complete listening review':'explicit owner-approved current preview; listening scope not separately attested'}));
}catch(error){console.log(JSON.stringify({allowed:false,reason:error instanceof Error?error.message:String(error)}));process.exitCode=1}
