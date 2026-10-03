import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createReadStream,readFileSync,statSync,writeFileSync} from 'node:fs';
import {resolve,join,basename,isAbsolute} from 'node:path';
import {checkProductionGate,type Identity} from './render-gate.ts';

const root=resolve(import.meta.dirname,'..');
const option=(flag:string)=>{const at=process.argv.indexOf(flag);return at<0?undefined:process.argv[at+1];};
const argument=option('--dir'),metadataArgument=option('--remote-metadata');
assert.ok(argument&&isAbsolute(argument),'Pass an absolute --dir containing the two downloaded archives.');
assert.ok(metadataArgument&&isAbsolute(metadataArgument),'Pass absolute --remote-metadata with the read-only GitHub asset inventory.');
checkProductionGate();
const hash=async(path:string)=>{const h=createHash('sha256');for await(const bytes of createReadStream(path))h.update(bytes as Buffer);return h.digest('hex');};
const read=<T>(path:string)=>JSON.parse(readFileSync(path,'utf8')) as T;
const identity=read<Identity>(join(root,'evidence/preview-inputs.json'));
type Archive={kind:string;file:string;bytes:number;sha256:string;payloadEntryCount:number};
const receipt=read<{status:string;sourceCommit:string;revision:string;sourceSha256:string;archives:Archive[]}>(join(root,'evidence/archive-receipt.json'));
type Asset={id:number;name:string;size:number;digest?:string|null;state:string};
const remote=read<{repository:string;id:number;draft:boolean;tag_name:string;target_commitish:string;assets:Asset[]}>(metadataArgument);
assert.equal(receipt.status,'passed');assert.equal(receipt.revision,identity.revision);
assert.equal(receipt.sourceSha256,identity.inputHashes['public/source.mp4']);
assert.equal(remote.repository,'ael-dev3/lyrics');assert.equal(remote.draft,true,'Media storage must remain an authenticated draft.');
assert.equal(remote.target_commitish,receipt.sourceCommit,'Release target differs from immutable archived source.');
assert.equal(receipt.archives.length,2);
const inspected=[];
for(const archive of receipt.archives){
 assert.equal(archive.file,basename(archive.file));
 const asset=remote.assets.find(a=>a.name===archive.file);assert.ok(asset,`Missing remote asset ${archive.file}`);
 assert.equal(asset.state,'uploaded');assert.equal(asset.size,archive.bytes);
 if(asset.digest!=null)assert.equal(asset.digest,`sha256:${archive.sha256}`);
 const path=join(resolve(argument),archive.file);assert.equal(statSync(path).size,archive.bytes);assert.equal(await hash(path),archive.sha256,'Downloaded bytes differ from independently verified local archive.');
 const python=String.raw`
import hashlib,json,pathlib,sys,zipfile
path=pathlib.Path(sys.argv[1]);expected=json.loads(sys.argv[2]);kind=sys.argv[3];commit=sys.argv[4]
def digest(stream):
 h=hashlib.sha256()
 while True:
  b=stream.read(1024*1024)
  if not b:break
  h.update(b)
 return h.hexdigest()
with zipfile.ZipFile(path) as z:
 names=[i.filename for i in z.infolist() if not i.is_dir()]
 if len(names)!=len(set(names)):raise RuntimeError('Duplicate archive paths')
 for name in names:
  if pathlib.PurePosixPath(name).is_absolute() or '..' in pathlib.PurePosixPath(name).parts or '\\' in name:raise RuntimeError('Unsafe archive path')
 checks={}
 for line in z.read('ARCHIVE-SHA256SUMS.txt').decode('utf-8').splitlines():
  sha,name=line.split('  ',1)
  if name in checks:raise RuntimeError('Duplicate checksum paths')
  checks[name]=sha
 if set(checks)!=set(names)-{'ARCHIVE-SHA256SUMS.txt'}:raise RuntimeError('Incomplete checksum coverage')
 for name,sha in checks.items():
  with z.open(name) as f:
   if digest(f)!=sha:raise RuntimeError('Inner checksum failure '+name)
 if ('Source commit: '+commit) not in z.read('ARCHIVE-README.txt').decode('utf-8'):raise RuntimeError('Source commit not preserved')
 frozen=0
 if kind=='source-project':
  prefix='projects/prizrak-lyric-film/'
  for name,sha in expected.items():
   with z.open(prefix+name) as f:
    if digest(f)!=sha:raise RuntimeError('Frozen source input failure '+name)
   frozen+=1
 else:
  manifest=json.loads(z.read('Delivery-Manifest.json'))
  for entry in manifest['files']:
   if z.getinfo(entry['path']).file_size!=entry['bytes']:raise RuntimeError('Kit entry size failure')
   with z.open(entry['path']) as f:
    if digest(f)!=entry['sha256']:raise RuntimeError('Kit manifest failure '+entry['path'])
  for line in z.read('SHA256SUMS.txt').decode('utf-8').splitlines():
   sha,name=line.split('  ',1)
   with z.open(name) as f:
    if digest(f)!=sha:raise RuntimeError('Kit checksum failure '+name)
 print(json.dumps({'payloadEntryCount':len(names),'innerChecksumsPassed':True,'frozenInputsVerified':frozen}))
`;
 const inner=JSON.parse(execFileSync('python3',['-c',python,path,JSON.stringify(identity.inputHashes),archive.kind,receipt.sourceCommit],{encoding:'utf8',maxBuffer:1000000})) as {payloadEntryCount:number;innerChecksumsPassed:boolean;frozenInputsVerified:number};
 assert.equal(inner.payloadEntryCount,archive.payloadEntryCount);
 if(archive.kind==='source-project')assert.equal(inner.frozenInputsVerified,Object.keys(identity.inputHashes).length);
 inspected.push({...archive,assetId:asset.id,githubDigest:asset.digest??null,githubDigestAvailable:asset.digest!=null,downloadedSha256:await hash(path),...inner});
}
checkProductionGate();
const result={schemaVersion:1,status:'passed',checkedAt:new Date().toISOString(),project:'prizrak-lyric-film',revision:identity.revision,sourceCommit:receipt.sourceCommit,sourceSha256:receipt.sourceSha256,repository:remote.repository,releaseId:remote.id,tag:remote.tag_name,draft:true,verifierSha256:await hash(join(root,'scripts/verify-archives.ts')),archives:inspected,scope:'Authenticated draft assets were downloaded independently. Downloaded byte counts and hashes match the locally verified archives; available outer GitHub digests also match, with unavailable metadata explicitly null. Every payload was decompressed and checked against internal checksums, including all frozen source inputs and the complete upload kit. No platform posting or public media release.'};
writeFileSync(join(root,'evidence/remote-archive-verification.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,tag:result.tag,archives:inspected.length,frozenInputs:Object.keys(identity.inputHashes).length}));
