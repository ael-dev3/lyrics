import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {identityPaths,song,revision} from '../src/identity.ts';
writeFileSync('evidence/preview-identity.json',JSON.stringify({song,revision,hashes:Object.fromEntries(identityPaths.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]))},null,2)+'\n');
