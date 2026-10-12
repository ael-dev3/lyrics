import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync,readdirSync,copyFileSync,renameSync,statSync} from 'node:fs';
import {resolve,relative,dirname,basename,sep} from 'node:path';
import {root,read,fileHash} from './render-production.ts';
import {checkCurrentProductionAuthorization} from './production-authorization.ts';

const at=process.argv.indexOf('--destination'),arg=process.argv[at+1];
if(at<0||!arg)throw Error('An explicit --destination for the new upload folder is required.');
const destination=resolve(arg),staging=destination+'.assembling',kit=resolve(root,'publishing-kit');
assert.equal(basename(dirname(destination)),'Desktop','Delivery must be a new folder directly on Desktop.');
assert.ok(!existsSync(destination)&&!existsSync(staging),'Refusing to overwrite an existing delivery or staging folder.');
const identity=checkCurrentProductionAuthorization().identity,delivery=read<any>('publishing-kit/DELIVERY.json');
assert.deepEqual(delivery.identity,identity);assert.ok(delivery.movies.every((m:any)=>m.technicalStatus==='pass'));
const checksText=readFileSync(resolve(kit,'CHECKSUMS.sha256'),'utf8'),checks=checksText.trim().split('\n').map(line=>({sha256:line.slice(0,64),file:line.slice(66)}));
assert.equal(checks.length,12);
const walk=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{assert.ok(!entry.isSymbolicLink(),'No links in the upload kit.');return entry.isDirectory()?walk(resolve(dir,entry.name)):[resolve(dir,entry.name)]});
const expected=[...checks.map(c=>c.file),'CHECKSUMS.sha256'].sort();assert.deepEqual(walk(kit).map(p=>relative(kit,p)).sort(),expected);
for(const c of checks){const path=resolve(kit,c.file);assert.ok(path.startsWith(kit+sep)&&/^[a-f0-9]{64}$/.test(c.sha256));assert.equal(await fileHash(path),c.sha256,`Kit hash mismatch: ${c.file}`)}
const checksumsSha256=await fileHash(resolve(kit,'CHECKSUMS.sha256'));
mkdirSync(staging);
for(const file of expected){const target=resolve(staging,file);assert.ok(target.startsWith(staging+sep));mkdirSync(dirname(target),{recursive:true});copyFileSync(resolve(kit,file),target)}
assert.deepEqual(walk(staging).map(p=>relative(staging,p)).sort(),expected);
for(const c of checks)assert.equal(await fileHash(resolve(staging,c.file)),c.sha256,`Delivered hash mismatch: ${c.file}`);
assert.equal(await fileHash(resolve(staging,'CHECKSUMS.sha256')),checksumsSha256);
assert.ok(!existsSync(destination),'Destination appeared while preparing the new kit.');renameSync(staging,destination);
const record={schemaVersion:1,status:'pass',edition:delivery.edition,identity,folderName:basename(destination),files:expected.length,checksumsSha256,allDeliveredHashesMatch:true,totalBytes:walk(destination).reduce((n,p)=>n+statSync(p).size,0),method:'New Desktop folder assembled separately, every file hash compared with the verified local kit, then renamed into its final location. Existing Desktop folders are never overwritten.'};
writeFileSync(resolve(root,'evidence/desktop-delivery.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({...record,destination}));
