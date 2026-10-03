import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createReadStream,existsSync,mkdirSync,mkdtempSync,readFileSync,renameSync,rmSync,statSync,writeFileSync} from 'node:fs';
import {basename,isAbsolute,join,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkCurrentProductionGate} from './render-gate.ts';

// The exact committed source and completed local kit must be reproducible
// independently of this checkout. Publication and Desktop copying are separate.
checkCurrentProductionGate();
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const option=(flag:string)=>{const at=process.argv.indexOf(flag);return at<0?undefined:process.argv[at+1];};
const kitArgument=option('--kit'),destinationArgument=option('--dest'),commit=option('--commit');
assert.ok(kitArgument&&isAbsolute(kitArgument),'Pass an absolute --kit verified staging folder');
assert.ok(destinationArgument&&isAbsolute(destinationArgument),'Pass an absolute --dest project archives folder');
assert.ok(commit&&/^[0-9a-f]{40}$/.test(commit),'Pass the exact 40-character committed source SHA');
const kit=resolve(kitArgument),destination=resolve(destinationArgument);
const inside=(parent:string,path:string)=>{const rel=relative(parent,path);return !rel.startsWith('..')&&!isAbsolute(rel);};
assert.ok(inside(root,kit)&&kit!==root,'Use the verified project-staged kit');
assert.ok(inside(join(root,'archives'),destination),'Archive destination must be inside this project archives/');
const git=(args:string[])=>execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:64000000}).trim();
const repository=git(['rev-parse','--show-toplevel']),projectPath=relative(repository,root).replaceAll('\\','/');
assert.equal(git(['rev-parse','HEAD']),commit,'Commit the final source before archiving');
assert.equal(git(['rev-parse',`${commit}^{commit}`]),commit);
assert.equal(git(['status','--porcelain','--untracked-files=no','--',projectPath]),'','Tracked project files differ from the committed source');
const hash=async(path:string)=>{const digest=createHash('sha256');for await(const bytes of createReadStream(path))digest.update(bytes as Buffer);return digest.digest('hex');};
const read=<T>(path:string)=>JSON.parse(readFileSync(join(root,path),'utf8')) as T;
type Identity={revision:string;inputs:Record<string,string>};
type Film={file:string;sha256:string;productionProvenance?:{receiptFile:string;receiptSha256:string}};
type Verification={status:string;revision:string;sourceSha256:string;approvedInputHashes:Record<string,string>;rendererSha256:string;verifierSha256:string;formats:{landscape:Film;portrait:Film}};
type Entry={path:string;bytes:number;sha256:string;role?:string};
const identity=read<Identity>('evidence/preview-inputs.json');
const final=read<Verification>('evidence/final-verification.json'),decoded=read<Verification>('evidence/decoded-scene-verification.json');
for(const report of [final,decoded]){
  assert.equal(report.status,'passed','Both complete film reports must pass before archiving');
  assert.equal(report.revision,identity.revision);assert.equal(report.sourceSha256,identity.inputs['public/source.mp4']);
  assert.deepEqual(report.approvedInputHashes,identity.inputs);
  assert.equal(report.rendererSha256,await hash(join(root,'scripts/render-production.ts')));
}
assert.equal(final.verifierSha256,await hash(join(root,'scripts/verify-final.ts')));
assert.equal(decoded.verifierSha256,await hash(join(root,'scripts/verify-decoded-scene.ts')));
const manifestPath=join(kit,'Delivery-Manifest.json'),checksumPath=join(kit,'SHA256SUMS.txt');
const manifest=JSON.parse(readFileSync(manifestPath,'utf8')) as {status:string;revision:string;sourceSha256:string;files:Entry[]};
assert.equal(manifest.status,'verified local upload kit; not posted');assert.equal(manifest.revision,identity.revision);
assert.equal(manifest.sourceSha256,identity.inputs['public/source.mp4']);
const receipt=read<{status:string;revision:string;manifestSha256:string;checksumsSha256:string}>('evidence/delivery-receipt.json');
assert.equal(receipt.status,'passed');assert.equal(receipt.revision,identity.revision);
assert.equal(await hash(manifestPath),receipt.manifestSha256);assert.equal(await hash(checksumPath),receipt.checksumsSha256);
const checksumEntries=readFileSync(checksumPath,'utf8').trimEnd().split('\n').map(line=>{
  const match=/^([0-9a-f]{64})  (.+)$/.exec(line);assert.ok(match,'Malformed delivery checksum');return {path:match[2]!,sha256:match[1]!};
});
assert.equal(checksumEntries.length,manifest.files.length+1,'Unexpected delivery checksum coverage');
assert.equal(new Set(checksumEntries.map(entry=>entry.path)).size,checksumEntries.length,'Duplicate delivery checksum path');
const manifestEntries=new Map(manifest.files.map(entry=>[entry.path,entry]));assert.equal(manifestEntries.size,manifest.files.length);
const safePath=(path:string)=>!isAbsolute(path)&&!path.split(/[\\/]/).includes('..')&&!path.includes('\n')&&!path.includes('\0');
for(const entry of checksumEntries){
  assert.ok(safePath(entry.path),`Unsafe kit path ${entry.path}`);assert.equal(await hash(join(kit,entry.path)),entry.sha256,`Kit checksum changed: ${entry.path}`);
  if(entry.path==='Delivery-Manifest.json')assert.equal(entry.sha256,receipt.manifestSha256);
  else{const documented=manifestEntries.get(entry.path);assert.ok(documented);assert.equal(documented.sha256,entry.sha256);assert.equal(statSync(join(kit,entry.path)).size,documented.bytes);}
}
for(const format of ['landscape','portrait'] as const){
  const film=final.formats[format];assert.ok(film?.file&&film?.sha256);
  assert.equal(film.file,basename(film.file));assert.equal(decoded.formats[format].file,film.file);assert.equal(decoded.formats[format].sha256,film.sha256);
  assert.equal(await hash(join(root,'renders',film.file)),film.sha256);
  const stagedPath=`${format==='landscape'?'YouTube':'TikTok'}/${film.file}`;
  assert.equal(manifestEntries.get(stagedPath)?.sha256,film.sha256,'Verified film is missing from the kit');
}
const commonPaths=['AGENTS.md','LICENSE.md',
  'docs/preview-before-render.md','docs/cross-language-sync-gate.md','docs/connected-phoneme-onset-workflow.md',
  'docs/bilingual-lyric-workflow.md','docs/cinematic-lyric-workflow.md','docs/scene-integrated-visuals.md',
  'docs/tiktok-cover-workflow.md','docs/source-clocked-word-effects-workflow.md','docs/track-workflow-preferences-and-known-issues.md'];
for(const path of commonPaths)assert.ok(existsSync(join(repository,path)),`Missing common project guidance ${path}`);
const tracked=execFileSync('git',['ls-tree','-r','--name-only','-z',commit,'--',projectPath,...commonPaths],{cwd:repository}).toString().split('\0').filter(Boolean);
assert.ok(tracked.length>0);
const excluded=/\/(node_modules|\.venv[^/]*|models|stems|captures|archives|deliverables|renders|analysis)\//;
for(const path of tracked)assert.ok(safePath(path)&&!excluded.test(path)&&!path.endsWith('.mp4'),`Excluded media/cache unexpectedly tracked: ${path}`);
type Planned={path:string;from:string;sha256:string;bytes:number};
const sourceEntries:Planned[]=await Promise.all(tracked.map(async path=>({path,from:join(repository,path),sha256:await hash(join(repository,path)),bytes:statSync(join(repository,path)).size})));
for(const required of ['scripts/archive-delivery.ts','scripts/render-production.ts','scripts/render-gate.ts','scripts/verify-final.ts','scripts/verify-decoded-scene.ts','scripts/make-covers.ts','scripts/make-captions.ts','scripts/package-delivery.ts','source/manifest.json','package.json','package-lock.json','evidence/final-verification.json','evidence/decoded-scene-verification.json','evidence/delivery-receipt.json','evidence/cover-assets.json','evidence/caption-assets.json','evidence/sync-review.json','evidence/production-authorization.json']){
  assert.equal(sourceEntries.find(entry=>entry.path===`${projectPath}/${required}`)?.sha256,await hash(join(root,required)),`Required source/provenance file absent from exact commit: ${required}`);
}
for(const [input,expected] of Object.entries(identity.inputs)){
  assert.equal(await hash(join(root,input)),expected,'Approved input changed before archiving');
  if(input==='public/source.mp4')sourceEntries.push({path:`${projectPath}/${input}`,from:join(root,input),sha256:expected,bytes:statSync(join(root,input)).size});
  else assert.equal(sourceEntries.find(entry=>entry.path===`${projectPath}/${input}`)?.sha256,expected,`Frozen input absent from exact commit: ${input}`);
}
const covers=read<{status:string;revision:string;approvedInputHashes:Record<string,string>;proofs:{path:string;sha256:string}[]}>('evidence/cover-assets.json');
assert.equal(covers.status,'passed');assert.equal(covers.revision,identity.revision);assert.deepEqual(covers.approvedInputHashes,identity.inputs);
for(const proof of covers.proofs){
  assert.ok(proof.path.startsWith('analysis/covers/')&&safePath(proof.path));assert.equal(await hash(join(root,proof.path)),proof.sha256);
  sourceEntries.push({path:`${projectPath}/${proof.path}`,from:join(root,proof.path),sha256:proof.sha256,bytes:statSync(join(root,proof.path)).size});
}
for(const format of ['landscape','portrait'] as const){
  const film=final.formats[format],provenance=film.productionProvenance;
  assert.ok(provenance,'Verified production receipt provenance is required');assert.equal(provenance.receiptFile,basename(provenance.receiptFile));
  const path=join(root,'renders',provenance.receiptFile);assert.equal(await hash(path),provenance.receiptSha256);
  const render=JSON.parse(readFileSync(path,'utf8')) as {sha256:string;revision:string};assert.equal(render.sha256,film.sha256);assert.equal(render.revision,identity.revision);
  sourceEntries.push({path:`${projectPath}/evidence/render-receipts/${provenance.receiptFile}`,from:path,sha256:provenance.receiptSha256,bytes:statSync(path).size});
}
const kitEntries:Planned[]=[...manifest.files,{path:'Delivery-Manifest.json',bytes:statSync(manifestPath).size,sha256:receipt.manifestSha256},{path:'SHA256SUMS.txt',bytes:statSync(checksumPath).size,sha256:receipt.checksumsSha256}].map(entry=>({path:entry.path,from:join(kit,entry.path),sha256:entry.sha256,bytes:entry.bytes}));
assert.equal(new Set(sourceEntries.map(entry=>entry.path)).size,sourceEntries.length,'Duplicate source archive entry');
assert.equal(new Set(kitEntries.map(entry=>entry.path)).size,kitEntries.length,'Duplicate kit archive entry');
mkdirSync(destination,{recursive:true});
const kitZip=join(destination,'Po-Kamushku-Settlers-Upload-Kit.zip'),sourceZip=join(destination,'Po-Kamushku-Settlers-Source-Project.zip');
assert.ok(!existsSync(kitZip)&&!existsSync(sourceZip),'Preserve existing archives; use a new archives subfolder');
const temporary=mkdtempSync(join(destination,'.archive-build-'));
try{
  const gitZip=join(temporary,'committed-project.zip');
  const sourceWorkZip=join(temporary,'source-project.zip'),kitWorkZip=join(temporary,'upload-kit.zip');
  execFileSync('git',['archive','--format=zip',`--output=${gitZip}`,commit,'--',projectPath,...commonPaths],{cwd:repository});
  const readme=[
    'Settlers — По камушку — verified delivery archive','',
    `Source commit: ${commit}`,`Approved revision: ${identity.revision}`,`Original recording SHA-256: ${identity.inputs['public/source.mp4']}`,
    'Original recording URL: https://www.youtube.com/watch?v=oysjDP9Vqdg','',
    'The upload-kit ZIP contains the two verified full films, covers, publishing copy, optional cue captions and delivery verification. The source-project ZIP preserves the committed repository project paths and relevant common guidance, with the exact excluded source MP4, bound cover proofs and original rendering receipts added. No dependencies, local models, stems or unrelated tracks are bundled.','',
    'Restore the source ZIP into a fresh directory, then:',`  cd ${projectPath}`,'  npm ci','  npm run check','  npm run preview','  node scripts/render-production.ts --plan',
    'Use the documented render options and approval/input gate. Keep the exact Node, FFmpeg and package versions recorded in the source manifest/lockfile; install Python 3 for the archive helper. Covers and captions can be regenerated into project staging with their respective --dest options. The source ZIP is a source snapshot, not a complete .git checkout; create a repository if continuing versioned work.','',
    'This archive enables reproducible source and timing reconstruction. It does not guarantee bit-identical codec output across software versions or machines. The original recording/artwork retain their respective owners and source credits. No platform posting is implied.','',
    'ARCHIVE-SHA256SUMS.txt covers every payload entry, including this README, but excludes itself to avoid a recursive self-checksum. The outer ZIP hashes are recorded separately in evidence/archive-receipt.json after both actual archives are independently verified. Existing kit SHA256SUMS.txt retains its own original coverage.','',
  ].join('\n');
  const spec={gitZip,sourceZip:sourceWorkZip,kitZip:kitWorkZip,sourceEntries,kitEntries,readme,projectPath,frozenInputs:identity.inputs};
  const specification=join(temporary,'archive-spec.json');writeFileSync(specification,JSON.stringify(spec));
  // Standard-library ZIP creation and a separate decompression/read pass. No
  // shell interpolation, third-party archiver or media re-encoding is involved.
  const python=String.raw`
import hashlib,json,pathlib,sys,zipfile
s=json.loads(pathlib.Path(sys.argv[1]).read_text())
def digest(stream):
 h=hashlib.sha256()
 while True:
  block=stream.read(1024*1024)
  if not block:break
  h.update(block)
 return h.hexdigest()
def make(path,entries,base=None):
 expected={e['path']:e for e in entries}
 with zipfile.ZipFile(path,'w',allowZip64=True) as out:
  copied=set()
  if base:
   with zipfile.ZipFile(base) as original:
    for info in original.infolist():
     if info.is_dir():continue
     if info.filename not in expected:raise RuntimeError('Unexpected committed archive path '+info.filename)
     with original.open(info) as f:data=f.read()
     if hashlib.sha256(data).hexdigest()!=expected[info.filename]['sha256']:raise RuntimeError('Committed entry differs '+info.filename)
     out.writestr(info.filename,data,compress_type=zipfile.ZIP_DEFLATED,compresslevel=6)
     copied.add(info.filename)
  for e in entries:
   if e['path'] in copied:continue
   compression=zipfile.ZIP_STORED if pathlib.Path(e['path']).suffix.lower() in ['.mp4','.jpg','.png'] else zipfile.ZIP_DEFLATED
   out.write(e['from'],e['path'],compress_type=compression,compresslevel=6)
  readme=s['readme'].encode('utf-8');out.writestr('ARCHIVE-README.txt',readme,compress_type=zipfile.ZIP_DEFLATED)
  expected['ARCHIVE-README.txt']={'sha256':hashlib.sha256(readme).hexdigest(),'bytes':len(readme)}
  checks=''.join(e['sha256']+'  '+name+'\n' for name,e in sorted(expected.items())).encode('utf-8')
  out.writestr('ARCHIVE-SHA256SUMS.txt',checks,compress_type=zipfile.ZIP_DEFLATED)
  expected['ARCHIVE-SHA256SUMS.txt']={'sha256':hashlib.sha256(checks).hexdigest(),'bytes':len(checks)}
 with zipfile.ZipFile(path) as archive:
  names=[i.filename for i in archive.infolist() if not i.is_dir()]
  if len(names)!=len(set(names)) or set(names)!=set(expected):raise RuntimeError('Archive coverage mismatch')
  for name,e in expected.items():
   if archive.getinfo(name).file_size!=e['bytes']:raise RuntimeError('Archive size mismatch '+name)
   with archive.open(name) as f:
    if digest(f)!=e['sha256']:raise RuntimeError('Archive SHA mismatch '+name)
  parsed={}
  for line in archive.read('ARCHIVE-SHA256SUMS.txt').decode('utf-8').splitlines():
   sha,name=line.split('  ',1)
   if name in parsed:raise RuntimeError('Duplicate archive checksum path')
   parsed[name]=sha
  if set(parsed)!=set(expected)-{'ARCHIVE-SHA256SUMS.txt'}:raise RuntimeError('Archive checksum coverage mismatch')
  for name,sha in parsed.items():
   with archive.open(name) as f:
    if digest(f)!=sha:raise RuntimeError('Archive checksum does not verify '+name)
  if base:
   for name,sha in s['frozenInputs'].items():
    with archive.open(s['projectPath']+'/'+name) as f:
     if digest(f)!=sha:raise RuntimeError('Frozen source input mismatch '+name)
 return {'payloadEntryCount':len(expected),'independentlyReadAndHashed':True}
result={'source':make(s['sourceZip'],s['sourceEntries'],s['gitZip']),'kit':make(s['kitZip'],s['kitEntries'])}
print(json.dumps(result))
`;
  const inspection=JSON.parse(execFileSync('python3',['-c',python,specification],{encoding:'utf8',maxBuffer:10000000})) as {source:{payloadEntryCount:number};kit:{payloadEntryCount:number}};
  checkCurrentProductionGate();assert.equal(git(['rev-parse','HEAD']),commit);assert.equal(git(['status','--porcelain','--untracked-files=no','--',projectPath]),'');
  for(const entry of [...sourceEntries,...kitEntries])assert.equal(await hash(entry.from),entry.sha256,'Archive input changed during construction');
  renameSync(sourceWorkZip,sourceZip);renameSync(kitWorkZip,kitZip);
  const archives=await Promise.all([{kind:'upload-kit',path:kitZip,inspection:inspection.kit},{kind:'source-project',path:sourceZip,inspection:inspection.source}].map(async item=>({kind:item.kind,file:basename(item.path),bytes:statSync(item.path).size,sha256:await hash(item.path),...item.inspection})));
  writeFileSync(join(root,'evidence/archive-receipt.json'),JSON.stringify({schemaVersion:1,status:'passed',project:'po-kamushku-lyric-film',revision:identity.revision,sourceCommit:commit,sourceSha256:identity.inputs['public/source.mp4'],archiverSha256:await hash(fileURLToPath(import.meta.url)),archives,sourceCoverage:{frozenInputCount:Object.keys(identity.inputs).length,committedEntries:tracked.length,addedExactSource:true,addedCoverProofs:covers.proofs.length,addedRenderReceipts:2,allCommittedScriptAndEvidenceHashesVerified:true},kitCoverage:{manifestEntries:manifest.files.length,originalManifestAndChecksumFileVerified:true,allEntryHashesVerified:true},checksumPolicy:'Each archive checksum file excludes itself; ZIP SHA-256 is external. Every archive entry was separately decompressed and hashed after ZIP creation.',scope:'Verified local source and upload ZIPs; public upload, Desktop copying and remote availability verification are separate coordinator steps.'},null,2)+'\n');
  console.log(JSON.stringify({status:'archives created and independently verified',archives}));
}finally{rmSync(temporary,{recursive:true,force:true});}
