import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {identityPaths} from '../src/identity.ts';
const identity={song:'3yDdoi1c7-8',revision:'preview-v6-shadow-static',hashes:Object.fromEntries(identityPaths.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]))};
writeFileSync('evidence/preview-identity.json',JSON.stringify(identity,null,2)+'\n');
console.log(identity.revision);
