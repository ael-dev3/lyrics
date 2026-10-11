import {checkCurrentProductionAuthorization} from './production-authorization.ts';
const approved=checkCurrentProductionAuthorization();
console.log(JSON.stringify({status:'authorized',...approved}));
