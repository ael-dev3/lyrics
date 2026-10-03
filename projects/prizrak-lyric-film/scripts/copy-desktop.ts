import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createReadStream,readFileSync,writeFileSync,existsSync,mkdirSync,copyFileSync,lstatSync,statSync,realpathSync} from 'node:fs';
import {homedir} from 'node:os';
import {resolve,join,relative,isAbsolute,basename,dirname} from 'node:path';
import {checkProductionGate,type Identity} from './render-gate.ts';
const root=resolve(import.meta.dirname,'..');
const option=(flag:string)=>{const at=process.argv.indexOf(flag);return at<0?undefined:process.argv[at+1];};
const kitArgument=option('--kit'),destinationArgument=option('--dest');
assert.ok(kitArgument&&isAbsolute(kitArgument),'Pass an absolute --kit project staging folder.');
assert.ok(destinationArgument&&isAbsolute(destinationArgument),'Pass an absolute --dest new Desktop folder.');
const kit=resolve(kitArgument),destination=resolve(destinationArgument),desktop=realpathSync(join(homedir(),'Desktop'));
const inside=(parent:string,path:string)=>{const r=relative(parent,path);return !!r&&!r.startsWith('..')&&!isAbsolute(r);};
assert.ok(inside(join(root,'deliverables'),kit),'Use this project verified staging folder.');
assert.equal(realpathSync(dirname(destination)),desktop,'Create one new folder directly on Desktop.');
assert.ok(!existsSync(destination),'Preserve existing Desktop folders.');
checkProductionGate();
const hash=async(p:string)=>{const h=createHash('sha256');for await(const chunk of createReadStream(p))h.update(chunk as Buffer);return h.digest('hex');};
const read=<T>(p:string)=>JSON.parse(readFileSync(join(root,p),'utf8')) as T;
const identity=read<Identity>('evidence/preview-inputs.json');
const receipt=read<{status:string;revision:string;manifestSha256:string;checksumsSha256:string}>('evidence/delivery-receipt.json');
assert.equal(receipt.status,'passed');assert.equal(receipt.revision,identity.revision);
assert.equal(await hash(join(kit,'Delivery-Manifest.json')),receipt.manifestSha256);
assert.equal(await hash(join(kit,'SHA256SUMS.txt')),receipt.checksumsSha256);
const entries=readFileSync(join(kit,'SHA256SUMS.txt'),'utf8').trimEnd().split('\n').map(line=>{
 const match=/^([0-9a-f]{64})  (.+)$/.exec(line);assert.ok(match,'Malformed kit checksum.');
 const path=match[2]!;assert.ok(!isAbsolute(path)&&!path.split(/[\\/]/).includes('..')&&!/[\n\0]/.test(path),'Unsafe kit path.');
 return {path,sha256:match[1]!};
});
assert.equal(new Set(entries.map(e=>e.path)).size,entries.length,'Duplicate kit checksum path.');
entries.push({path:'SHA256SUMS.txt',sha256:receipt.checksumsSha256});
for(const entry of entries){assert.ok(lstatSync(join(kit,entry.path)).isFile(),'Only actual verified files may be copied.');assert.equal(await hash(join(kit,entry.path)),entry.sha256);}
mkdirSync(destination);
for(const entry of entries){const from=join(kit,entry.path),to=join(destination,entry.path);mkdirSync(dirname(to),{recursive:true});copyFileSync(from,to);assert.equal(await hash(to),entry.sha256,`Copied file differs: ${entry.path}`);}
checkProductionGate();for(const entry of entries)assert.equal(await hash(join(kit,entry.path)),entry.sha256,'Staged kit changed during Desktop copying.');
writeFileSync(join(root,'evidence/desktop-delivery-receipt.json'),JSON.stringify({status:'passed',revision:identity.revision,sourceSha256:identity.inputHashes['public/source.mp4'],folderLabel:basename(destination),copyScriptSha256:await hash(join(root,'scripts/copy-desktop.ts')),manifestSha256:receipt.manifestSha256,checksumsSha256:receipt.checksumsSha256,files:entries.map(e=>({...e,bytes:statSync(join(destination,e.path)).size})),scope:'Every staged and copied upload-kit file was separately hashed. The new Desktop folder contains both complete platform films, dedicated covers, publishing copy, optional captions and verification. Existing folders were preserved; no platform posting.'},null,2)+'\n');
console.log(JSON.stringify({status:'passed',folderLabel:basename(destination),files:entries.length}));
