import assert from 'node:assert/strict';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {root,fileHash,read} from './render-production.ts';
const rows=[];
for(const [format,time] of [['landscape',50.2],['portrait',253.9]] as const){
 const file=`evidence/browser-${format}-${time.toFixed(3)}.png`,proof=`evidence/preview-${format}-${time.toFixed(2)}.jpg`;
 const a=await loadImage(resolve(root,file)),b=await loadImage(resolve(root,proof));assert.equal(a.width,b.width);assert.equal(a.height,b.height);
 const c=createCanvas(a.width,a.height),ctx=c.getContext('2d');ctx.drawImage(a,0,0);const actual=c.data();ctx.clearRect(0,0,a.width,a.height);ctx.drawImage(b,0,0);const expected=c.data();let total=0,sum=0,large=0;
 for(let i=0;i<actual.length;i+=4)for(let ch=0;ch<3;ch++){const d=Math.abs(actual[i+ch]!-expected[i+ch]!);sum+=d;total++;if(d>24)large++}
 assert.ok(sum/total<8&&large/total<.03,'Actual browser differs substantially from the shared scene.');
 rows.push({format,time,nativeSourceFrame:Math.floor(time*25),nativeSourcePts:Math.floor(time*25)/25,browserFile:file,sha256:await fileHash(resolve(root,file)),width:a.width,height:a.height,referenceProof:proof,meanAbsoluteRgbDifference:sum/total,fractionChannelsDifferenceOver24:large/total,method:'Unmodified native canvas PNG saved through the actual browser Download still control; comparison includes JPEG compression and browser rasterization.'});
}
const result={schemaVersion:1,identity:read('public/preview-identity.json'),actualBrowser:'Codex in-app Chromium browser',nativeCanvasEvidence:rows,fontLoaded:true,sourceReadyState:4,landscape:{wordTime:50.2,picturePts:50.2,activeSource:'Наперегонки',activeTarget:'Racing'},portrait:{wordTime:253.9,picturePts:253.88,activeSource:'наперегонки',activeTarget:'racing'},reducedSpeedTransport:{rate:0.5,observedAdvancingNativePts:[162.4,257.0],observedWordTimes:[162.411407,257.0168],scope:'Clock transport only; no direct assistant listening claimed.'},recovery:{observedRetainedTime:257.0168,rate:0.5,format:'portrait',muted:true,effects:'on',result:'Complete source/canvas restored with retained state.'},mainPreview:'Owner accepted complete current v1 and directly authorized production.'};
writeFileSync(resolve(root,'evidence/browser-review.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(rows));
