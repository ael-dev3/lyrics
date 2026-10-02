import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createReadStream,copyFileSync,existsSync,mkdirSync,readFileSync,statSync,writeFileSync} from 'node:fs';
import {basename,dirname,isAbsolute,join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {checkCurrentProductionGate} from './render-gate.ts';
checkCurrentProductionGate();
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const at=process.argv.indexOf('--dest'),dest=at<0?undefined:process.argv[at+1];
if(!dest||!isAbsolute(dest))throw Error('Pass an absolute --dest folder');
const folder=resolve(dest);if(existsSync(folder))throw Error('Preserve the existing delivery folder; no overwrite');
type Film={file:string;sha256:string};
type Verification={status:string;revision:string;sourceSha256:string;approvedInputHashes:Record<string,string>;rendererSha256:string;verifierSha256:string;formats:{landscape:Film;portrait:Film}};
const identity=JSON.parse(readFileSync(resolve(root,'evidence/preview-inputs.json'),'utf8'));
const verification=JSON.parse(readFileSync(resolve(root,'evidence/final-verification.json'),'utf8')) as Verification;
const encoded=JSON.parse(readFileSync(resolve(root,'evidence/encoded-scene-verification.json'),'utf8')) as Verification;
assert.equal(encoded.status,'passed');assert.equal(encoded.revision,identity.revision);assert.equal(encoded.sourceSha256,identity.inputs['public/source.mp4']);
for(const format of ['landscape','portrait'] as const){assert.ok(encoded.formats[format],`Missing encoded scene audit ${format}`);assert.equal(encoded.formats[format].sha256,verification.formats[format].sha256);}
assert.equal(verification.status,'passed');assert.equal(verification.revision,identity.revision);assert.equal(verification.sourceSha256,identity.inputs['public/source.mp4']);
const covers=JSON.parse(readFileSync(resolve(root,'evidence/cover-assets.json'),'utf8')) as {status:string;revision:string;sourceSha256:string;approvedInputHashes:Record<string,string>;makerSha256:string;files:{path:string;sha256:string}[]};
assert.equal(covers.status,'passed');assert.equal(covers.files.length,2);assert.equal(covers.revision,identity.revision);assert.equal(covers.sourceSha256,identity.inputs['public/source.mp4']);assert.deepEqual(covers.approvedInputHashes,identity.inputs);
assert.deepEqual(verification.approvedInputHashes,identity.inputs);assert.deepEqual(encoded.approvedInputHashes,identity.inputs);
const hash=async(path:string)=>{const h=createHash('sha256');for await(const b of createReadStream(path))h.update(b as Buffer);return h.digest('hex');};
const rendererHash=await hash(resolve(root,'scripts/render-production.ts'));
assert.equal(verification.rendererSha256,rendererHash);assert.equal(encoded.rendererSha256,rendererHash);
assert.equal(verification.verifierSha256,await hash(resolve(root,'scripts/verify-final.ts')));assert.equal(encoded.verifierSha256,await hash(resolve(root,'scripts/verify-decoded-scene.ts')));
assert.equal(covers.makerSha256,await hash(resolve(root,'scripts/make-covers.ts')));
for(const cover of covers.files)assert.equal(await hash(resolve(root,cover.path)),cover.sha256,`Reviewed cover changed ${cover.path}`);
type Entry={path:string;bytes:number;sha256:string;role:string};const entries:Entry[]=[];
// Build under the authorized project first. The Desktop folder is created only
// after every required source and verification hash has been checked.
const planned:{from:string;to:string;role:string;expected?:string}[]=[
 {from:`renders/${verification.formats.landscape.file}`,to:'YouTube/POLNALYUBVI-Komety-YouTube-1920x796-60fps.mp4',role:'Native wide film',expected:verification.formats.landscape.sha256},
 {from:`renders/${verification.formats.portrait.file}`,to:'TikTok/POLNALYUBVI-Komety-TikTok-1080x1920-60fps.mp4',role:'Portrait film',expected:verification.formats.portrait.sha256},
 {from:'publishing/POLNALYUBVI-Komety-YouTube-Thumbnail-1920x1080.jpg',to:'YouTube/thumbnail.jpg',role:'YouTube thumbnail'},
 {from:'publishing/POLNALYUBVI-Komety-TikTok-Cover-1200x1600.jpg',to:'TikTok/profile-cover.jpg',role:'TikTok profile cover'},
 ...(['YouTube','TikTok'] as const).flatMap(platform=>['Title','Description'].map(kind=>({from:`publishing/${platform}-${kind}.txt`,to:`${platform}/${kind.toLowerCase()}.txt`,role:`${platform} ${kind.toLowerCase()}`}))),
 ...['russian','english'].flatMap(language=>['srt','vtt'].map(ext=>({from:`publishing/${language}.${ext}`,to:`Captions/${language}.${ext}`,role:`Optional ${language} captions`}))),
 {from:'evidence/final-verification.json',to:'Verification/final-verification.json',role:'Encoded delivery checks'},
 {from:'evidence/cover-assets.json',to:'Verification/cover-assets.json',role:'Cover checks'},
 {from:'evidence/encoded-scene-verification.json',to:'Verification/encoded-scene-verification.json',role:'Source picture, bilingual glyph and reading-tail checks'},
];
const ready=await Promise.all(planned.map(async p=>{const path=resolve(root,p.from);const sha256=await hash(path);if(p.from.endsWith('.jpg')){const reviewed=covers.files.find(f=>f.path===p.from);assert.ok(reviewed,`Cover absent from accepted manifest ${p.from}`);assert.equal(sha256,reviewed.sha256);}if(p.expected)assert.equal(sha256,p.expected,`Verified film identity ${p.from}`);return {...p,sha256,bytes:statSync(path).size};}));
mkdirSync(folder,{recursive:true});
for(const item of ready){const to=join(folder,item.to);mkdirSync(dirname(to),{recursive:true});copyFileSync(resolve(root,item.from),to);assert.equal(await hash(to),item.sha256);entries.push({path:item.to,bytes:item.bytes,sha256:item.sha256,role:item.role});}
const guide=[
 '# POLNALYUBVI — Кометы — Upload Kit','',
 'The YouTube and TikTok folders each contain the complete video, its cover, title and description. Both films are 60 fps and preserve the original stereo soundtrack.','',
 '- YouTube: 1920×796 native wide film; 1920×1080 thumbnail.',
 '- TikTok: 1080×1920 vertical film; 1200×1600 portrait profile cover.',
 '- Captions: optional Russian and English SRT/VTT. Both languages already appear in the film. Avoid enabling a duplicate visible caption track unless wanted.',
 '- Verification: source identity and encoded checks, plus cover dimensions and crop evidence.','',
 'Use each platform’s preview to confirm its cover crop. This package is an unofficial lyric edition of the original POLNALYUBVI / FILM GODS video; no platform posting is included.','',
 'Verify all supplied files from this folder with `shasum -a 256 -c SHA256SUMS.txt`.','',
].join('\n');
writeFileSync(join(folder,'START-HERE.md'),guide);entries.push({path:'START-HERE.md',bytes:Buffer.byteLength(guide),sha256:await hash(join(folder,'START-HERE.md')),role:'Posting guide'});
const manifest={schemaVersion:1,project:'komety-lyric-film',revision:identity.revision,status:'verified local upload kit; not posted',sourceUrl:'https://www.youtube.com/watch?v=76BmuIf0duw',sourceSha256:verification.sourceSha256,framesPerSecond:60,frameCountPerFilm:15606,audioDecodedSamples:11469824,files:entries};
writeFileSync(join(folder,'Delivery-Manifest.json'),JSON.stringify(manifest,null,2)+'\n');
writeFileSync(join(folder,'SHA256SUMS.txt'),[...entries,{path:'Delivery-Manifest.json',sha256:await hash(join(folder,'Delivery-Manifest.json'))}].map(e=>`${e.sha256}  ${e.path}`).join('\n')+'\n');
checkCurrentProductionGate();for(const entry of entries)assert.equal(await hash(join(folder,entry.path)),entry.sha256);
writeFileSync(resolve(root,'evidence/delivery-receipt.json'),JSON.stringify({schemaVersion:1,status:'passed',revision:identity.revision,sourceSha256:verification.sourceSha256,folderLabel:basename(folder),scope:'Verified local Desktop upload kit, no platform posting or public full-media release',files:entries,manifestSha256:await hash(join(folder,'Delivery-Manifest.json')),checksumsSha256:await hash(join(folder,'SHA256SUMS.txt')),copyVerification:'Every copied file SHA-256 matches its input; both films match final verification.'},null,2)+'\n');
console.log(JSON.stringify({status:'packaged and hash-verified',folderLabel:basename(folder),files:entries.length+2}));
