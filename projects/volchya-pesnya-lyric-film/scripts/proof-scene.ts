import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createCanvas,loadImage,GlobalFonts} from '@napi-rs/canvas';
import {initializeScene,paintScene,layoutCue,cueOpacity,setEffectsEnabled} from '../src/scene.ts';
import {parseTimeline,parseFeatures,sourceActive,targetActive,type Format} from '../src/model.ts';
import {currentIdentity} from './project-identity.ts';
const root=new URL('../',import.meta.url),read=(p:string)=>JSON.parse(readFileSync(new URL(p,root),'utf8'));
const timeline=parseTimeline(read('public/timeline.json')),features=parseFeatures(read('public/audio-features.json'));
if(!GlobalFonts.registerFromPath(new URL('public/fonts/Alegreya.ttf',root).pathname,'Broadside'))throw Error('Broadside font missing');
const reference=await loadImage(new URL('public/artwork-reference.png',root).pathname);
initializeScene(timeline,features,(w,h)=>{const c=createCanvas(w,h);return {canvas:c as unknown as CanvasImageSource,context:c.getContext('2d') as unknown as CanvasRenderingContext2D}},reference as unknown as CanvasImageSource);setEffectsEnabled(true);
mkdirSync(new URL('evidence/',root),{recursive:true});mkdirSync(new URL('analysis/proofs/',root),{recursive:true});
const times=[0,12.3,16.4,21.8,32.3,50.2,55.8,68.4,79.9,92.8,110.8,122.4,134.8,149.9,152.5,162.3,176.7,194.1,209.4,221.8,232.9,244.7,253.9,258.8];
let layouts=0,glyphs=0,wordBoundaryChecks=0,focusedMeanings=0;const images=[];
for(const format of ['landscape','portrait'] as Format[]){
 const w=format==='landscape'?1920:1080,h=format==='landscape'?1080:1920,canvas=createCanvas(w,h),ctx=canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
 for(const c of timeline.cues){const l=layoutCue(ctx,c,format);layouts++;for(const s of [...l.source,...l.target]){if(s.x<45||s.x+s.width>w-45||s.y-l.size<(format==='portrait'?1110:285)||s.y>(format==='portrait'?1735:970))throw Error(`Glyph clearance ${format}/${c.id}/${s.text}`);glyphs++}
  for(const word of c.words){const onset=word.startSample/44100;if(cueOpacity(c,onset)!==1||!sourceActive(word,onset)||sourceActive(word,word.endSample/44100))throw Error(`Onset/end display ${word.id}`);wordBoundaryChecks++;focusedMeanings+=c.targets.filter(t=>targetActive(t,c.words,(word.startSample+word.endSample)/88200)).length}
 }
 for(const t of times){paintScene(ctx,t,format,reference as unknown as CanvasImageSource);const path=`evidence/preview-${format}-${t.toFixed(2)}.jpg`;writeFileSync(new URL(path,root),canvas.toBuffer('image/jpeg',92));images.push({path,timeSeconds:t,width:w,height:h,method:'Native shared-scene proof, actual original reference picture at 12 s; complete JPEG92, not a browser or final encoded film.'})}
}
const proof={status:'pass',identity:currentIdentity(),layouts,glyphPlacements:glyphs,wordBoundaryChecks,focusedTargetStates:focusedMeanings,referenceSourceTimeSeconds:12,images,limits:'Geometry and sample-state checks support a complete preview. They do not establish human listening or acoustic millisecond accuracy.'};
writeFileSync(new URL('evidence/scene-proof.json',root),JSON.stringify(proof,null,2)+'\n');
console.log(JSON.stringify({status:proof.status,layouts,glyphs,wordBoundaryChecks,focusedMeanings,stills:images.length}));
