import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createReadStream,readFileSync,writeFileSync,mkdirSync,existsSync,copyFileSync,statSync} from 'node:fs';
import {resolve,join,dirname,basename,isAbsolute,relative} from 'node:path';
import {checkProductionGate,type Identity} from './render-gate.ts';
const root=resolve(import.meta.dirname,'..');
const read=<T>(p:string)=>JSON.parse(readFileSync(join(root,p),'utf8')) as T;
const hash=async(p:string)=>{const digest=createHash('sha256');for await(const chunk of createReadStream(p))digest.update(chunk as Buffer);return digest.digest('hex');};
checkProductionGate();
const at=process.argv.indexOf('--dest'),argument=process.argv[at+1];
assert.ok(at>=0&&argument&&isAbsolute(argument),'Pass an absolute --dest project staging folder.');
const destination=resolve(argument),local=relative(root,destination);
assert.ok(local&&!local.startsWith('..')&&!isAbsolute(local),'Stage inside this project; verified Desktop copying is separate.');
assert.ok(!existsSync(destination),'Preserve completed upload kits; choose a new folder.');
const identity=read<Identity>('evidence/preview-inputs.json');
type Film={file:string;sha256:string};
type Verification={status:string;revision:string;sourceSha256:string;approvedInputHashes:Record<string,string>;rendererSha256:string;verifierSha256:string;formats:{landscape:Film;portrait:Film}};
const final=read<Verification>('evidence/final-verification.json'),decoded=read<Verification>('evidence/decoded-scene-verification.json');
const names={landscape:'Prizrak-Sotode-YouTube-1920x1080-60fps.mp4',portrait:'Prizrak-Sotode-TikTok-1080x1920-60fps.mp4'};
for(const [report,script] of [[final,'verify-final.ts'],[decoded,'verify-decoded-scene.ts']] as const){
 assert.equal(report.status,'passed');assert.equal(report.revision,identity.revision);
 assert.equal(report.sourceSha256,identity.inputHashes['public/source.mp4']);assert.deepEqual(report.approvedInputHashes,identity.inputHashes);
 assert.equal(report.rendererSha256,await hash(join(root,'scripts/render-production.ts')));
 assert.equal(report.verifierSha256,await hash(join(root,'scripts',script)));
 for(const format of ['landscape','portrait'] as const){assert.equal(report.formats[format].file,names[format]);assert.equal(report.formats[format].sha256,await hash(join(root,'renders',names[format])));}
}
type Asset={path:string;sha256:string;width?:number;height?:number};
type Assets={status:string;revision:string;sourceSha256:string;makerSha256:string;files:Asset[];proofs?:Asset[];timelineSha256?:string;approvedInputHashes?:Record<string,string>;publicCopy?:Asset[]};
const covers=read<Assets>('evidence/cover-assets.json'),captions=read<Assets>('evidence/caption-assets.json');
assert.deepEqual(covers.approvedInputHashes,identity.inputHashes,'Cover review belongs to stale preview inputs.');
assert.equal(captions.timelineSha256,identity.inputHashes['public/timeline.json'],'Caption report belongs to a stale timing map.');
assert.equal(covers.publicCopy?.length,4,'All four publishing copy files must be reviewed.');
for(const file of covers.publicCopy!)assert.equal(await hash(join(root,file.path)),file.sha256,`Changed reviewed publishing copy ${file.path}`);
for(const [report,script] of [[covers,'make-covers.ts'],[captions,'make-captions.ts']] as const){
 assert.equal(report.status,'passed');assert.equal(report.revision,identity.revision);assert.equal(report.sourceSha256,identity.inputHashes['public/source.mp4']);assert.equal(report.makerSha256,await hash(join(root,'scripts',script)));
 for(const file of [...report.files,...(report.proofs??[])])assert.equal(await hash(join(root,file.path)),file.sha256,`Changed reviewed asset ${file.path}`);
}
assert.equal(covers.files.length,2);assert.equal(captions.files.length,6);
const youtubeCover=covers.files.find(f=>f.path.includes('YouTube-Thumbnail'))!,tiktokCover=covers.files.find(f=>f.path.includes('TikTok-Cover'))!;
assert.equal(youtubeCover.width,1920);assert.equal(youtubeCover.height,1080);assert.ok(statSync(join(root,youtubeCover.path)).size<2000000);
assert.equal(tiktokCover.width,1200);assert.equal(tiktokCover.height,1600);
type Plan={from:string;to:string;role:string};
const plans:Plan[]=[
 {from:`renders/${names.landscape}`,to:`YouTube/${names.landscape}`,role:'Complete native 16:9 film'},
 {from:`renders/${names.portrait}`,to:`TikTok/${names.portrait}`,role:'Complete 9:16 film'},
 {from:youtubeCover.path,to:`YouTube/${basename(youtubeCover.path)}`,role:'YouTube thumbnail'},
 {from:tiktokCover.path,to:`TikTok/${basename(tiktokCover.path)}`,role:'Portrait 3:4 profile cover'},
 {from:'publishing/YouTube-Title.txt',to:'YouTube/title.txt',role:'YouTube title'},
 {from:'publishing/YouTube-Description.txt',to:'YouTube/description.txt',role:'YouTube description and source credits'},
 {from:'publishing/TikTok-Description.txt',to:'TikTok/description.txt',role:'TikTok description and source credits'},
 {from:'publishing/Release-Notes.md',to:'Release-Notes.md',role:'Edition notes'},
 ...captions.files.map(file=>({from:file.path,to:`Captions/${basename(file.path)}`,role:'Optional cue-level caption sidecar'})),
 ...['final-verification.json','decoded-scene-verification.json','cover-assets.json','caption-assets.json','preview-inputs.json','sync-review.json','production-authorization.json','render-clock-verification.json'].map(name=>({from:`evidence/${name}`,to:`Verification/${name}`,role:'Bound approval or delivery evidence'})),
];
const entries=[];
for(const plan of plans){
 const from=join(root,plan.from),to=join(destination,plan.to);assert.ok(statSync(from).size>0);
 mkdirSync(dirname(to),{recursive:true});copyFileSync(from,to);
 const sha256=await hash(from);assert.equal(await hash(to),sha256);
 entries.push({path:plan.to,role:plan.role,sha256,bytes:statSync(to).size});
}
const guide='# sotode 外で — призрак — Upload Kit\n\nYouTube contains the complete 1920×1080 native film, thumbnail, title and description. TikTok contains the complete 1080×1920 vertical film, dedicated 1200×1600 portrait profile cover and description. Both films are 60 fps.\n\nRussian and English meanings are highlighted in the film. Japanese passages include Japanese, Russian and English; simultaneous Japanese and Russian vocal tracks use separate centered blocks. The original picture and soundtrack remain intact.\n\nCaptions are optional cue-level SRT/VTT files. Japanese captions cover Japanese passages only. Word highlights are already in the video; avoid duplicating captions unless needed. Inspect the matching cover in the platform upload preview. Included cover tests are local simulations.\n\nNo platform posting is performed. Verify this folder with `shasum -a 256 -c SHA256SUMS.txt`.\n';
writeFileSync(join(destination,'START-HERE.md'),guide);entries.push({path:'START-HERE.md',role:'Upload guide',sha256:await hash(join(destination,'START-HERE.md')),bytes:Buffer.byteLength(guide)});
const manifest={schemaVersion:1,project:identity.project,revision:identity.revision,presentation:'centered-upper-vocal-block',status:'verified upload kit; not posted',sourceUrl:'https://www.youtube.com/watch?v=Psp5vt8BwoY',sourceSha256:identity.inputHashes['public/source.mp4'],fps:60,frameCountPerFilm:15306,originalAudioSampleRate:44100,originalAudioDecodedSamples:11249664,files:entries};
writeFileSync(join(destination,'Delivery-Manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const manifestSha256=await hash(join(destination,'Delivery-Manifest.json'));
writeFileSync(join(destination,'SHA256SUMS.txt'),[...entries,{path:'Delivery-Manifest.json',sha256:manifestSha256}].map(e=>`${e.sha256}  ${e.path}`).join('\n')+'\n');
checkProductionGate();for(const entry of entries)assert.equal(await hash(join(destination,entry.path)),entry.sha256);
writeFileSync(join(root,'evidence/delivery-receipt.json'),JSON.stringify({status:'passed',revision:identity.revision,sourceSha256:identity.inputHashes['public/source.mp4'],folderLabel:basename(destination),scope:'Verified project-staged complete upload kit; Desktop copying and authenticated GitHub media backup are separate steps. No platform posting.',packagerSha256:await hash(join(root,'scripts/package-delivery.ts')),files:entries,manifestSha256,checksumsSha256:await hash(join(destination,'SHA256SUMS.txt'))},null,2)+'\n');
console.log(JSON.stringify({status:'passed',folderLabel:basename(destination),files:entries.length+2}));
