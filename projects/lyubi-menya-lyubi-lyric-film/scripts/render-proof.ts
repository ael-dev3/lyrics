import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {assertProductionGate} from './production-gate.ts';
import {createRasterCompositor,rendererHashes,sha256} from './raster-compositor.ts';
import type {Format} from '../src/schema.ts';

assertProductionGate();
const format=process.argv[2] as Format;if(!['landscape','portrait'].includes(format))throw Error('Usage: node scripts/render-proof.ts landscape|portrait');
const out=`evidence/render-proof/${format}`,inputIdentitySha256=sha256(readFileSync('evidence/preview-identity.json')),currentRendererHashes=rendererHashes();
if(existsSync(`${out}/parity.json`)){
 const previous=JSON.parse(readFileSync(`${out}/parity.json`,'utf8'));
 if(previous.inputIdentitySha256!==inputIdentitySha256||JSON.stringify(previous.rendererHashes)!==JSON.stringify(currentRendererHashes))throw Error('Archive the previous parity evidence before replacing it with a new input or renderer identity');
}
const scene=await createRasterCompositor(format,2);mkdirSync(out,{recursive:true});
// Intro/outro plus held already/now and year/years in both performances.
const times=[0,11.5,13.85,78.8,81,186.9],results=[];
const thresholds={meanAbsoluteRGB:0.01,rootMeanSquareRGB:0.1,maximumChannelDifference:4,pixelsOver4:0};
for(const time of times){
 const frame=Math.round(time*scene.data.fps),painted=await scene.paint(frame),direct=await scene.reference(frame),a=painted.data(),b=direct.data();
 let absolute=0,squared=0,maximum=0,differing=0,over4=0;
 for(let i=0;i<a.length;i+=4){let pixelMaximum=0;for(let ch=0;ch<3;ch++){const delta=Math.abs(a[i+ch]!-b[i+ch]!);absolute+=delta;squared+=delta*delta;maximum=Math.max(maximum,delta);pixelMaximum=Math.max(pixelMaximum,delta);}if(pixelMaximum)differing++;if(pixelMaximum>4)over4++;}
 const channels=scene.width*scene.height*3,result={time,frame,meanAbsoluteRGB:absolute/channels,rootMeanSquareRGB:Math.sqrt(squared/channels),maximumChannelDifference:maximum,differingPixels:differing,pixelsOver4:over4,totalPixels:scene.width*scene.height};results.push(result);
 writeFileSync(`${out}/compositor-${frame}.png`,painted.toBuffer('image/png'));writeFileSync(`${out}/shared-svg-${frame}.png`,direct.toBuffer('image/png'));console.log(result);
}
const passed=results.every(result=>Object.entries(thresholds).every(([key,limit])=>result[key as keyof typeof result]<=limit));
writeFileSync(`${out}/parity.json`,JSON.stringify({status:passed?'PASS':'FAIL',scope:'2x cached compositor compared with full shared-scene SVG rasterization, both using explicit adapters for the unchanged artwork and parsed static text spacing/opacity omitted by the SVG decoder. This measures code-native raster parity, not browser pixel equality or acoustic accuracy. Independent native-browser comparison is required to adopt the adapter.',format,captureWidth:scene.width,captureHeight:scene.height,thresholds,compositor:scene.contract,rendererHashes:currentRendererHashes,inputIdentitySha256,results},null,2)+'\n');
if(!passed)throw Error('Compositor exceeds its declared parity thresholds; production remains blocked');
