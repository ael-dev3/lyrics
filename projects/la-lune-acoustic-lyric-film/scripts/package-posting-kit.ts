import {readFileSync,writeFileSync,mkdirSync,copyFileSync,createReadStream,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {assertProductionGate} from './production-contract.ts';
const {identity}=assertProductionGate();
const root='output/Posting Kit';mkdirSync(root,{recursive:true});
const hash=async(p:string)=>{const h=createHash('sha256');for await(const b of createReadStream(p))h.update(b);return h.digest('hex');};
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const transfers:{source:string;file:string}[]=[];
const videos=[];
for(const [format,platform,dimensions] of [['landscape','YouTube','1920x1080'],['portrait','TikTok','1080x1920']] as const){
 const name=`La-Lune-${format}-${dimensions}-60fps.mp4`,source='output/'+name,technical=read(`evidence/${name}.verification.json`),focus=read(`evidence/${format}-${name}.focus-verification.json`);
 const sha256=await hash(source);
 if(technical.status!=='passed technical verification'||technical.sha256!==sha256||focus.status!=='passed'||focus.inputSha256!==sha256||focus.decodedFrames!==technical.frames)throw Error('Delivery verification not complete: '+format);
 videos.push({format,file:`${platform}/${name}`,width:technical.video.width,height:technical.video.height,frames:technical.frames,fps:60,bytes:statSync(source).size,sha256,audioIdentity:technical.audioIdentity,decodedSamples:technical.decodedSamples,decodedPcmSha256:technical.decodedPcmSha256,focusWordStates:focus.wordStates,focusMismatches:focus.mismatchCount,ambiguousWords:focus.ambiguous});transfers.push({source,file:`${platform}/${name}`});
 const cover=platform==='YouTube'?'La-Lune-YouTube-Thumbnail-1920x1080.jpg':'La-Lune-TikTok-Cover-Profile-1200x1600.jpg';transfers.push({source:'publishing/'+cover,file:platform+'/'+cover});
 for(const kind of ['Title','Description'])transfers.push({source:`publishing/${platform}-${kind}.txt`,file:`${platform}/${platform}-${kind}.txt`});
}
for(const lang of ['fr','en','bilingual'])transfers.push({source:`publishing/captions/La-Lune-${lang}.srt`,file:`Captions/La-Lune-${lang}.srt`});
for(const item of transfers){const path=join(root,item.file);mkdirSync(join(path,'..'),{recursive:true});copyFileSync(item.source,path);}
writeFileSync(join(root,'START-HERE.txt'),`La Lune (version acoustique) — L’Impératrice\n\nYouTube: use the landscape MP4, title, description and 1920×1080 thumbnail in YouTube/.\nTikTok: use the portrait MP4, title, description and portrait 1200×1600 profile cover in TikTok/.\n\nBoth videos contain the complete recording with French and English word highlighting. Duration: 3:17.555; 60 fps. Original AAC audio is preserved.\n\nCaptions/ contains optional line-level French, English and bilingual SRT files. The films already include burned-in bilingual words; enabling additional captions can duplicate them.\n\nThe cover JPEGs use dedicated poster layouts with the approved AI-assisted lunar artwork. Source and credit details are in each platform description.\nChecksums and the delivery manifest verify these files. No platform upload has been performed.\n`);
const inventory=[];for(const item of [...transfers,{source:'',file:'START-HERE.txt'}]){const path=join(root,item.file),sha256=await hash(path);if(item.source&&sha256!==await hash(item.source))throw Error('Posting copy mismatch: '+item.file);inventory.push({file:item.file,bytes:statSync(path).size,sha256});}
const receipt={status:'verified local posting kit',song:identity.song,revision:identity.revision,sourceCommit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),previewHashes:identity.hashes,videos,files:inventory,scope:'Technical verification and source-event display agreement are complete. Overall preview acceptance is recorded separately from incomplete granular listening telemetry. No public media release or platform upload.',builtAt:new Date().toISOString()};
writeFileSync(join(root,'Delivery-Manifest.json'),JSON.stringify(receipt,null,2)+'\n');writeFileSync('evidence/delivery-receipt.json',JSON.stringify(receipt,null,2)+'\n');
const manifestHash=await hash(join(root,'Delivery-Manifest.json'));
const checksums=inventory.concat({file:'Delivery-Manifest.json',bytes:statSync(join(root,'Delivery-Manifest.json')).size,sha256:manifestHash}).map(x=>`${x.sha256}  ${x.file}`).join('\n')+'\n';
writeFileSync(join(root,'CHECKSUMS.sha256'),checksums);writeFileSync('evidence/delivery-checksums.sha256',checksums);
console.log({status:receipt.status,files:inventory.length+2,root});
