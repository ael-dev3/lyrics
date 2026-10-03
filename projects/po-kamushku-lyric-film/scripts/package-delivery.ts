import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {copyFileSync,createReadStream,existsSync,mkdirSync,readFileSync,statSync,writeFileSync} from 'node:fs';
import {basename,dirname,isAbsolute,join,relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkCurrentProductionGate} from './render-gate.ts';

checkCurrentProductionGate();
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const at=process.argv.indexOf('--dest'),argument=at<0?undefined:process.argv[at+1];
assert.ok(argument&&isAbsolute(argument),'Pass an absolute --dest staging folder');
const destination=resolve(argument),stagingRelative=relative(root,destination);
assert.ok(stagingRelative&&!stagingRelative.startsWith('..')&&!isAbsolute(stagingRelative),'Stage the package within this project; copy to Desktop only after verification');
assert.ok(!existsSync(join(destination,'Delivery-Manifest.json')),'Preserve an existing completed package; use a new staging folder');
const read=<T>(path:string)=>JSON.parse(readFileSync(join(root,path),'utf8')) as T;
const hash=async(path:string)=>{const digest=createHash('sha256');for await(const bytes of createReadStream(path))digest.update(bytes as Buffer);return digest.digest('hex');};
type Identity={revision:string;inputs:Record<string,string>};
type Film={file:string;sha256:string};
type Verification={status:string;revision:string;sourceSha256:string;approvedInputHashes:Record<string,string>;rendererSha256:string;verifierSha256:string;formats:{landscape:Film;portrait:Film}};
type Cover={path:string;sha256:string;width:number;height:number};
type Covers={status:string;revision:string;sourceSha256:string;approvedInputHashes:Record<string,string>;makerSha256:string;files:Cover[];proofs:{path:string;sha256:string}[]};
type Captions={status:string;revision:string;sourceSha256:string;timelineSha256:string;makerSha256:string;files:{path:string;sha256:string}[]};
const identity=read<Identity>('evidence/preview-inputs.json');
const verification=read<Verification>('evidence/final-verification.json');
const decoded=read<Verification>('evidence/decoded-scene-verification.json');
for(const report of [verification,decoded]){
  assert.equal(report.status,'passed','Both full film reports must pass');
  assert.equal(report.revision,identity.revision);assert.equal(report.sourceSha256,identity.inputs['public/source.mp4']);
  assert.deepEqual(report.approvedInputHashes,identity.inputs);
  assert.equal(report.rendererSha256,await hash(join(root,'scripts/render-production.ts')),'Renderer changed after verification');
  for(const format of ['landscape','portrait'] as const){
    assert.ok(report.formats[format]?.file&&report.formats[format]?.sha256,`Incomplete full-film report: ${format}`);
    assert.equal(report.formats[format].file,basename(report.formats[format].file),'Report must name a render basename');
  }
}
assert.equal(verification.verifierSha256,await hash(join(root,'scripts/verify-final.ts')));
assert.equal(decoded.verifierSha256,await hash(join(root,'scripts/verify-decoded-scene.ts')));
const expectedNames={landscape:'Po-Kamushku-Settlers-YouTube-1080x1080-60fps.mp4',portrait:'Po-Kamushku-Settlers-TikTok-1080x1920-60fps.mp4'};
for(const format of ['landscape','portrait'] as const){
  assert.equal(verification.formats[format].file,expectedNames[format]);
  assert.equal(decoded.formats[format].file,verification.formats[format].file);
  assert.equal(decoded.formats[format].sha256,verification.formats[format].sha256);
}
const covers=read<Covers>('evidence/cover-assets.json');
assert.equal(covers.status,'passed','Inspect covers and accept their exact hashes before packaging');
assert.equal(covers.revision,identity.revision);assert.equal(covers.sourceSha256,identity.inputs['public/source.mp4']);
assert.deepEqual(covers.approvedInputHashes,identity.inputs);assert.equal(covers.files.length,2);
assert.equal(covers.makerSha256,await hash(join(root,'scripts/make-covers.ts')));
for(const proof of covers.proofs)assert.equal(await hash(join(root,proof.path)),proof.sha256,'Cover proof changed');
const youtubeCover=covers.files.find(file=>file.path.startsWith('YouTube/')),tiktokCover=covers.files.find(file=>file.path.startsWith('TikTok/'));
assert.ok(youtubeCover&&tiktokCover);assert.equal(youtubeCover.width,1280);assert.equal(youtubeCover.height,720);
assert.equal(tiktokCover.width,1200);assert.equal(tiktokCover.height,1600);
const captions=read<Captions>('evidence/caption-assets.json');
assert.equal(captions.status,'passed');assert.equal(captions.revision,identity.revision);
assert.equal(captions.sourceSha256,identity.inputs['public/source.mp4']);assert.equal(captions.timelineSha256,identity.inputs['public/timeline.json']);
assert.equal(captions.makerSha256,await hash(join(root,'scripts/make-captions.ts')));assert.equal(captions.files.length,4);
type Planned={from:string;to:string;role:string;expected?:string};
const planned:Planned[]=[
  {from:join(root,'renders',verification.formats.landscape.file),to:`YouTube/${expectedNames.landscape}`,role:'Complete native square lyric film',expected:verification.formats.landscape.sha256},
  {from:join(root,'renders',verification.formats.portrait.file),to:`TikTok/${expectedNames.portrait}`,role:'Complete vertical lyric film',expected:verification.formats.portrait.sha256},
  ...covers.files.map(file=>({from:join(destination,file.path),to:file.path,role:'Reviewed platform cover',expected:file.sha256})),
  ...covers.proofs.map(proof=>({from:join(root,proof.path),to:`Verification/Covers/${basename(proof.path)}`,role:'Local cover size/crop simulation',expected:proof.sha256})),
  ...captions.files.map(file=>({from:join(destination,file.path),to:file.path,role:'Optional cue-level caption sidecar',expected:file.sha256})),
  {from:join(root,'publishing/YouTube-Title.txt'),to:'YouTube/title.txt',role:'YouTube title'},
  {from:join(root,'publishing/YouTube-Description.txt'),to:'YouTube/description.txt',role:'YouTube description and source credits'},
  {from:join(root,'publishing/TikTok-Description.txt'),to:'TikTok/description.txt',role:'TikTok description and source credit'},
  ...['final-verification.json','decoded-scene-verification.json','cover-assets.json','caption-assets.json','preview-inputs.json','sync-review.json','production-authorization.json'].map(name=>({from:join(root,'evidence',name),to:`Verification/${name}`,role:'Approved identity and final verification evidence'})),
];
// Finish every input verification before copying either full movie. Covers and
// captions are already staged, and must exactly match their reviewed manifests.
const ready=await Promise.all(planned.map(async item=>{
  assert.ok(!item.to.startsWith('..')&&!isAbsolute(item.to),'Unsafe package path');
  const sha256=await hash(item.from);if(item.expected)assert.equal(sha256,item.expected,`Delivery input changed: ${item.to}`);
  assert.ok(statSync(item.from).size>0,`Empty delivery input: ${item.to}`);
  if(item.to.endsWith('.jpg')&&item.to.startsWith('YouTube/'))assert.ok(statSync(item.from).size<2000000);
  return{...item,sha256,bytes:statSync(item.from).size};
}));
type Entry={path:string;bytes:number;sha256:string;role:string};const entries:Entry[]=[];
for(const item of ready){
  const output=join(destination,item.to);mkdirSync(dirname(output),{recursive:true});
  if(resolve(item.from)!==resolve(output)){
    assert.ok(!existsSync(output),`Preserve existing delivery output: ${item.to}`);copyFileSync(item.from,output);
  }
  assert.equal(await hash(output),item.sha256);entries.push({path:item.to,bytes:item.bytes,sha256:item.sha256,role:item.role});
}
const guide=[
  '# Settlers — По камушку — Upload Kit','',
  'Both platform folders contain the complete bilingual film and its dedicated cover. Russian and English words are already highlighted in the video.','',
  '- YouTube: 1080 × 1080 native square film at 60 fps; 1280 × 720 thumbnail; title and description.',
  '- TikTok: 1080 × 1920 vertical film at 60 fps; 1200 × 1600 portrait profile cover; description.',
  '- Captions: optional separate Russian/English SRT and VTT. These are cue-level subtitles; the film contains the precise individual word highlighting. Enable a sidecar only if an additional caption track is useful.',
  '- Verification: the approved input identities, complete encoded checks and cover/caption manifests.','',
  'Select the matching cover for each platform and check its upload preview. The cover crop checks included in this package are local simulations. This is an unofficial lyric edition; the original recording and artwork retain their source credits. No platform posting is included.','',
  'Verify the package from this folder with `shasum -a 256 -c SHA256SUMS.txt`.','',
].join('\n');
writeFileSync(join(destination,'START-HERE.md'),guide);entries.push({path:'START-HERE.md',bytes:Buffer.byteLength(guide),sha256:await hash(join(destination,'START-HERE.md')),role:'Upload guide'});
const manifest={schemaVersion:1,project:'po-kamushku-lyric-film',revision:identity.revision,status:'verified local upload kit; not posted',sourceUrl:'https://www.youtube.com/watch?v=oysjDP9Vqdg',sourceSha256:identity.inputs['public/source.mp4'],framesPerSecond:60,frameCountPerFilm:12530,originalAudioDecodedSamples:9209280,originalAudioSampleRate:44100,captionLanguages:['Russian','English'],files:entries};
writeFileSync(join(destination,'Delivery-Manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const manifestSha256=await hash(join(destination,'Delivery-Manifest.json'));
writeFileSync(join(destination,'SHA256SUMS.txt'),[...entries,{path:'Delivery-Manifest.json',sha256:manifestSha256}].map(entry=>`${entry.sha256}  ${entry.path}`).join('\n')+'\n');
checkCurrentProductionGate();for(const entry of entries)assert.equal(await hash(join(destination,entry.path)),entry.sha256);
writeFileSync(join(root,'evidence/delivery-receipt.json'),JSON.stringify({schemaVersion:1,status:'passed',revision:identity.revision,sourceSha256:identity.inputs['public/source.mp4'],folderLabel:basename(destination),scope:'Verified project-staged upload kit; Desktop copy and public archival publication are separate coordinator steps. No platform posting.',packagerSha256:await hash(fileURLToPath(import.meta.url)),files:entries,manifestSha256,checksumsSha256:await hash(join(destination,'SHA256SUMS.txt')),copyVerification:'Every staged file SHA-256 matches its verified input; both movies match both complete final verification reports.'},null,2)+'\n');
console.log(JSON.stringify({status:'packaged and hash-verified',stage:stagingRelative,files:entries.length+2}));
