import {checkCurrentProductionAuthorization} from './production-authorization.ts';
const authorized=checkCurrentProductionAuthorization();
console.log(JSON.stringify({status:'authorized',identity:authorized.identity,listeningGateComplete:authorized.listeningGateComplete,scope:'Exact current owner-approved preview'}));
