import assert from 'node:assert/strict';
import {mkdirSync,readdirSync,readFileSync,copyFileSync,existsSync,writeFileSync,statSync} from 'node:fs';
import {resolve,relative,dirname,basename} from 'node:path';
import {root,fileHash} from './render-production.ts';

const at=process.argv.indexOf('--destination'),argument=process.argv[at+1];
if(at<0||!argument)throw Error('Use --destination NEW_FOLDER.');
const destination=resolve(argument),kit=resolve(root,'publishing-kit');
if(existsSync(destination))throw Error('Destination already exists; refusing to overwrite a delivery.');
const paths=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?paths(resolve(dir,e.name)):[resolve(dir,e.name)]);
const manifest=JSON.parse(readFileSync(resolve(kit,'DELIVERY.json'),'utf8'));
const lines=readFileSync(resolve(kit,'CHECKSUMS.sha256'),'utf8').trim().split('\n');
assert.equal(lines.length,12);assert.equal(paths(kit).length,13);
for(const line of lines){const [,sha,file]=/^([a-f0-9]{64})  (.+)$/.exec(line)??[];assert.ok(sha&&file);assert.equal(await fileHash(resolve(kit,file)),sha);}
for(const entry of manifest.files){assert.equal(statSync(resolve(kit,entry.file)).size,entry.bytes);assert.equal(await fileHash(resolve(kit,entry.file)),entry.sha256);}
mkdirSync(destination,{recursive:true});
const files=[];
for(const source of paths(kit).sort()){
 const file=relative(kit,source),target=resolve(destination,file);mkdirSync(dirname(target),{recursive:true});copyFileSync(source,target);
 const sha256=await fileHash(source);assert.equal(await fileHash(target),sha256);
 files.push({file,bytes:statSync(target).size,sha256});
}
const receipt={status:'pass',folderName:basename(destination),copiedAtUtc:new Date().toISOString(),files:files.length,totalBytes:files.reduce((s,f)=>s+f.bytes,0),identity:manifest.identity,allPreparedAndDeliveredBytesIdentical:true,inventory:files,posting:'Ready for manual platform upload; no upload performed.'};
writeFileSync(resolve(root,'evidence/desktop-delivery.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({...receipt,inventory:undefined}));
