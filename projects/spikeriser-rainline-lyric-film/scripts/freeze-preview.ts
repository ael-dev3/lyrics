import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync} from 'node:fs';
import {previewIdentityPaths, REVISION, SONG_ID} from '../src/identity.ts';

const sha256 = (bytes: Buffer | string) => createHash('sha256').update(bytes).digest('hex');
const hashes = Object.fromEntries(previewIdentityPaths.map(path => [path, sha256(readFileSync(path))]));
const identitySha256 = sha256(JSON.stringify(hashes));
writeFileSync('evidence/preview-identity.json', JSON.stringify({song: SONG_ID, revision: REVISION, identitySha256, hashes}, null, 2) + '\n');
console.log(`Preview inputs frozen: ${identitySha256}`);
