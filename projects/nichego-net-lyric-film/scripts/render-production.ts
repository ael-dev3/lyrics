// Preview-first boundary: no capture, encoding or final-file creation precedes
// this gate. Production profile is prepared only for an approved edition.
import {readFileSync} from 'node:fs';
import {assertProduction} from './check-production-gate.ts';
import {currentIdentity,projectFile} from './project-identity.ts';
assertProduction(JSON.parse(readFileSync(projectFile('source/REVIEW.json'),'utf8')),currentIdentity());
throw Error('Production profile is not commissioned yet. This project currently delivers the complete live preview.');
