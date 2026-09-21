import {writeFileSync} from 'node:fs';import {currentIdentity} from './identity.ts';
const {identity,hashes}=currentIdentity();
writeFileSync('evidence/input-identity.json',JSON.stringify({identity,hashes},null,2)+'\n');
writeFileSync('evidence/production-status.json',JSON.stringify({identity,stage:'preview-only',review:{...identity,complete:false,normalSpeed:false,uncertainAtReducedSpeed:false,landscape:false,portrait:false},authorization:{...identity,approved:false,scope:'preview'},productionRendered:false,note:'Technical picture checks are separate from pending listener review and explicit production authorization.'},null,2)+'\n');
console.log(identity);
