import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,copyFileSync,mkdirSync,existsSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,dirname,basename,relative,isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
import {fileHash,root} from './render-production.ts';
import {checkCurrentProductionGate} from './render-gate.ts';
process.chdir(root);checkCurrentProductionGate();
const read=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const identity=read('evidence/preview-inputs.json'),verification=read('evidence/production-verification.json'),decoded=read('evidence/decoded-scene-verification.json');
const same=(a:unknown,b:unknown)=>assert.equal(JSON.stringify(a),JSON.stringify(b));
for(const report of [verification,decoded]){
 assert.equal(report.status,'passed');assert.equal(report.revision,identity.revision);assert.equal(report.sourceSha256,identity.sourceSha256);same(report.approvedInputHashes,identity.inputs);
 assert.equal(report.rendererSha256,await fileHash('scripts/render-production.ts'));
}
assert.equal(verification.verifierSha256,await fileHash('scripts/verify-final.ts'));
assert.equal(decoded.verifierSha256,await fileHash('scripts/verify-decoded-scene.ts'));
const cover=read('publishing/cover-assets.json'),captions=read('evidence/caption-assets.json');
assert.equal(cover.status,'local-cover-review-passed');assert.equal(cover.revision,identity.revision);assert.equal(cover.makerSha256,await fileHash('scripts/make-covers.ts'));
assert.equal(captions.status,'passed');assert.equal(captions.revision,identity.revision);assert.equal(captions.timelineSha256,identity.inputs['public/timeline.json']);assert.equal(captions.makerSha256,await fileHash('scripts/make-captions.ts'));
const destination=resolve(root,'archives/Svetloe-Chuvstvo-Settlers-Upload-Kit');
assert.ok(!existsSync(destination),'Preserve any existing completed upload kit');
type Planned={from:string;to:string;role:string;sha256?:string};
const planned:Planned[]=[];
for(const format of ['landscape','portrait']){
 const film=verification.formats[format];same(film.sha256,decoded.formats[format].sha256);assert.equal(film.file,basename(film.file));
 planned.push({from:`renders/${film.file}`,to:`${format==='landscape'?'YouTube':'TikTok'}/${film.file}`,role:'Complete clean bilingual lyric film',sha256:film.sha256});
}
for(const file of cover.files)planned.push({from:`publishing/${file.path}`,to:file.path,role:'Dedicated reviewed platform thumbnail',sha256:file.sha256});
for(const file of captions.files)planned.push({from:file.path,to:`Captions/${basename(file.path)}`,role:'Optional cue-level caption sidecar',sha256:file.sha256});
planned.push({from:'publishing/YouTube-Title.txt',to:'YouTube/title.txt',role:'YouTube title'},
 {from:'publishing/YouTube-Description.txt',to:'YouTube/description.txt',role:'YouTube description and credits'},
 {from:'publishing/TikTok-Description.txt',to:'TikTok/description.txt',role:'TikTok description and credits'});
for(const file of ['production-verification.json','decoded-scene-verification.json','review-status.json','preview-inputs.json','caption-assets.json','window-light-review.json'])
 planned.push({from:`evidence/${file}`,to:`Verification/${file}`,role:'Source identity, approval and verification'});
planned.push({from:'publishing/cover-assets.json',to:'Verification/cover-assets.json',role:'Cover identity and crop review'});
for(const item of planned){
 assert.ok(!isAbsolute(item.to)&&!item.to.split('/').includes('..'),'Unsafe staged path');
 assert.ok(statSync(item.from).size>0,'Empty input');if(item.sha256)assert.equal(await fileHash(item.from),item.sha256,`Changed input${item.to}`);
}
mkdirSync(destination,{recursive:true});const entries=[];
for(const item of planned){
 const target=resolve(destination,item.to);mkdirSync(dirname(target),{recursive:true});copyFileSync(item.from,target);
 const sha256=await fileHash(item.from);assert.equal(await fileHash(target),sha256);entries.push({path:item.to,bytes:statSync(target).size,sha256,role:item.role});
}
const guide=`# Settlers — Светлое чувство — Upload Kit\n\nBoth films contain the complete recording, Russian lyrics and English translation with word/meaning highlighting.\n\n- YouTube: native 1080×1080 square film at 60 fps; 1280×720 thumbnail, title and description.\n- TikTok: 1080×1920 portrait film at 60 fps; 1200×1600 portrait profile cover and description.\n- Captions: optional separate Russian/English SRT and VTT. The precise word highlighting is already burned into the films; sidecars provide cue-level reading.\n- Verification: complete encoded timing/audio/picture checks and approved source identities.\n\nSelect the matching cover and inspect the platform’s upload preview. Cover crop checks were local simulations. Original source credits are in each description. This is an unofficial lyric edition; no platform posting is included.\n\nVerify copied files with: shasum -a256 -c SHA256SUMS.txt\n`;
writeFileSync(resolve(destination,'START-HERE.md'),guide);entries.push({path:'START-HERE.md',bytes:Buffer.byteLength(guide),sha256:await fileHash(resolve(destination,'START-HERE.md')),role:'Upload guide'});
const manifest={schemaVersion:1,status:'verified local upload kit; not posted',revision:identity.revision,sourceSha256:identity.sourceSha256,
 sourceUrl:'https://www.youtube.com/watch?v=UANr7uyRZ3w',framesPerFilm:10608,framesPerSecond:60,audioDecodedSamples:7796160,audioSampleRate:44100,files:entries};
writeFileSync(resolve(destination,'Delivery-Manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const manifestSha256=await fileHash(resolve(destination,'Delivery-Manifest.json'));
writeFileSync(resolve(destination,'SHA256SUMS.txt'),[...entries,{path:'Delivery-Manifest.json',sha256:manifestSha256}].map(e=>`${e.sha256}  ${e.path}`).join('\n')+'\n');
checkCurrentProductionGate();
writeFileSync('evidence/delivery-receipt.json',JSON.stringify({schemaVersion:1,status:'project staging verified; Desktop copy pending',revision:identity.revision,sourceSha256:identity.sourceSha256,
 folderLabel:'Светлое чувство — Upload Kit',stagingFolder:relative(root,destination),packagerSha256:await fileHash(fileURLToPath(import.meta.url)),manifestSha256,
 checksumsSha256:await fileHash(resolve(destination,'SHA256SUMS.txt')),files:entries,scope:'All copied payload hashes match. Desktop delivery and repository source handoff are separate steps; no platform upload.'},null,2)+'\n');
console.log(JSON.stringify({status:'verified',stagingFolder:relative(root,destination),files:entries.length+2}));
