import {checkCurrentProductionAuthorization} from './production-authorization.ts';
try {checkCurrentProductionAuthorization();console.log('Current listening and render authorization accepted.');}
catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
