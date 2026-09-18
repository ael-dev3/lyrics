import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,basename} from 'node:path';

// Delivery chrome is separate from the frozen film scene and historical render authorization.
export function verifiedAcceptedDelivery(root:string):boolean{
 try{
  const read=(path:string)=>JSON.parse(readFileSync(join(root,path),'utf8'));
  const hash=(path:string)=>createHash('sha256').update(readFileSync(join(root,path))).digest('hex');
  const identity=read('evidence/preview-identity.json'),acceptance=read('evidence/owner-acceptance-v3.json'),receipt=read('evidence/delivery-receipt.json');
  if(acceptance.previewAccepted!==true||acceptance.song!==identity.song||acceptance.revision!==identity.revision||receipt.revision!==identity.revision||receipt.status!=='verified local posting kit')return false;
  const entries=Object.entries(identity.hashes);if(!entries.length)return false;
  for(const [path,sha] of entries)if(acceptance.inputHashes?.[path]!==sha||hash(path)!==sha)return false;
  if(receipt.videos?.length!==2||new Set(receipt.videos.map((v:{format:string})=>v.format)).size!==2)return false;
  for(const format of ['landscape','portrait']){
   const video=receipt.videos.find((v:{format:string})=>v.format===format);if(!video)return false;
   const name=basename(video.file),technical=read(`evidence/${name}.verification.json`),focus=read(`evidence/${format}-${name}.focus-verification.json`);
   if(acceptance.deliveryHashes?.[format]!==video.sha256||hash('output/'+name)!==video.sha256||technical.sha256!==video.sha256||technical.status!=='passed technical verification'||focus.inputSha256!==video.sha256||focus.status!=='passed'||focus.mismatchCount!==0||focus.ambiguous!==0)return false;
  }
  return true;
 }catch{return false;}
}

export function deliveryReviewHtml(html:string,verified:boolean){
 if(!verified)return html;
 return html.replace('PREVIEW · REVIEW PENDING','ACCEPTED · RENDERS VERIFIED').replace('Preview only; production rendering remains pending.','Both complete films are rendered and verified. The upload kit includes YouTube and TikTok videos, covers and posting copy.');
}
