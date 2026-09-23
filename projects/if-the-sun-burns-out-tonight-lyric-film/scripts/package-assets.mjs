import {createRequire} from 'node:module';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createCues} from '../src/preview-core.js';
import {canvasApi} from './native-env.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url);
const {createCanvas,loadImage,GlobalFonts}=canvasApi;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=path=>JSON.parse(readFileSync(join(root,path),'utf8'));
const put=(path,value)=>{const target=join(root,path);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,value);};
const fontPath=join(root,'output/runtime/AvenirNextCondensed-DemiBold.ttf');
if(!existsSync(fontPath)) throw new Error('Prepare the locally installed Avenir Next Condensed DemiBold font in output/runtime before making covers.');
if(!GlobalFonts.registerFromPath(fontPath,'SunburnCoverDemi')) throw new Error('Cover font registration failed');

const manifest=json('source/media-manifest.json');
const timeline=json('src/timeline.json');
const cues=createCues(timeline);
const sourcePath=join(root,manifest.sourceVideo);
if(sha(readFileSync(sourcePath))!==manifest.sha256) throw new Error('Source media hash differs from the locked manifest');
const sourceFrame=3543, sourceTime=sourceFrame/24;
const sourceStill='output/cover-sources/eclipse-source-frame-3543.png';
mkdirSync(dirname(join(root,sourceStill)),{recursive:true});
const extract=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-xerror','-i',sourcePath,'-an','-vf',`select=eq(n\\,${sourceFrame})`,'-fps_mode','passthrough','-frames:v','1','-y',join(root,sourceStill)],{encoding:'utf8'});
if(extract.status!==0) throw new Error('Source still extraction failed: '+extract.stderr);
const source=await loadImage(join(root,sourceStill));
if(source.width!==1920 || source.height!==818) throw new Error('Unexpected source geometry');

const palette={paper:'#fff1d5',gold:'#ffda85',matte:'#1a0c07'};
const placements=[];
function text(ctx,text,x,y,size,{color=palette.paper,spacing=0}={}) {
  ctx.font=`600 ${size}px "SunburnCoverDemi"`;
  ctx.letterSpacing=spacing+'px';ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillStyle=color;ctx.shadowColor='rgba(13,5,2,.54)';ctx.shadowBlur=size*.07;ctx.shadowOffsetX=0;ctx.shadowOffsetY=size*.018;
  ctx.fillText(text,x,y);
  const metrics=ctx.measureText(text);
  const box={left:x-metrics.width/2,top:y-metrics.actualBoundingBoxAscent,right:x+metrics.width/2,bottom:y+metrics.actualBoundingBoxDescent};
  if(box.left<0 || box.right>ctx.canvas.width || box.top<0 || box.bottom>ctx.canvas.height) throw new Error('Cover text is outside the image: '+text);
  placements.push({text,fontSize:size,baseline:y,...box});
  ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
}
const covers=[];
for(const format of ['youtube','tiktok']) {
  const portrait=format==='tiktok',width=portrait?1200:1920,height=portrait?1600:1080;
  const out=createCanvas(width,height),ctx=out.getContext('2d');
  ctx.fillStyle=palette.matte;ctx.fillRect(0,0,width,height);
  const crop=portrait?{x:436,y:0,width:1048,height:818}:{x:(1920-818*16/9)/2,y:0,width:818*16/9,height:818};
  const imageRect=portrait?{x:0,y:120,width:1200,height:818*1200/1048}:{x:0,y:0,width:1920,height:1080};
  ctx.drawImage(source,crop.x,crop.y,crop.width,crop.height,imageRect.x,imageRect.y,imageRect.width,imageRect.height);
  const firstPlacement=placements.length;
  if(portrait) {
    text(ctx,'IF THE SUN',600,455,132,{spacing:1.5});
    text(ctx,'BURNS OUT',600,600,132,{spacing:1.5});
    text(ctx,'TONIGHT',600,768,164,{color:palette.gold,spacing:2});
    text(ctx,'GRABBITZ',600,1170,76,{spacing:3});
    text(ctx,'OLI SYKES',600,1260,76,{spacing:3});
    text(ctx,'COURTNEY LAPLANTE',600,1350,76,{spacing:2});
    text(ctx,'ENGLISH LYRIC FILM',600,1490,38,{color:palette.gold,spacing:4});
  } else {
    text(ctx,'IF THE SUN',960,350,146,{spacing:2});
    text(ctx,'BURNS OUT',960,503,146,{spacing:2});
    text(ctx,'TONIGHT',960,680,174,{color:palette.gold,spacing:3});
    text(ctx,'GRABBITZ  ·  OLI SYKES',960,791,56,{spacing:1.5});
    text(ctx,'COURTNEY LAPLANTE',960,861,56,{spacing:1.5});
    text(ctx,'ENGLISH LYRIC FILM',960,952,25,{color:palette.gold,spacing:3});
  }
  const file=portrait?'tiktok-profile-cover.jpg':'youtube-thumbnail.jpg';
  const bytes=out.toBuffer('image/jpeg',95);
  put('publishing/'+file,bytes);
  const qa=createCanvas(portrait?150:320,portrait?200:180);qa.getContext('2d').drawImage(out,0,0,qa.width,qa.height);
  put(`output/cover-qa/${format}-small.jpg`,qa.toBuffer('image/jpeg',95));
  covers.push({format,path:'publishing/'+file,width,height,sha256:sha(bytes),bytes:bytes.length,sourceCrop:crop,sourcePlacement:imageRect,text:placements.slice(firstPlacement),sourceTreatment:'Source still is cropped and uniformly scaled only. No recoloring, generative edits, reconstruction, or image filters. Typography is a separate overlay. Portrait uses a solid warm matte outside the still.'});
}

const title='If The Sun Burns Out Tonight — Grabbitz, Oli Sykes & Courtney LaPlante | Lyrics';
const description=`If The Sun Burns Out Tonight — Grabbitz, Oli Sykes & Courtney LaPlante.\n\nAn English lyric film with word-by-word highlighting and gentle effects that follow the song.\n\nPerformers: Grabbitz, Oli Sykes and Courtney LaPlante\nOriginal music video: VALORANT\n${manifest.sourceUrl}\n\nThis is an unofficial lyric film. Music, lyrics and original video belong to their respective rights holders.\n\n#IfTheSunBurnsOutTonight #Grabbitz #OliSykes #CourtneyLaPlante #VALORANT #Lyrics\n`;
const tiktokTitle='If The Sun Burns Out Tonight | English Lyrics';
const tiktokDescription=`If The Sun Burns Out Tonight ☀️\nGrabbitz · Oli Sykes · Courtney LaPlante\n\nEnglish word-by-word lyrics. Unofficial lyric film.\nOriginal music video: VALORANT\n${manifest.sourceUrl}\nMusic, lyrics and original video belong to their respective rights holders.\n\n#IfTheSunBurnsOutTonight #Grabbitz #OliSykes #CourtneyLaPlante #VALORANT #Lyrics\n`;
for(const [path,value] of Object.entries({'youtube-title.txt':title+'\n','youtube-description.txt':description,'tiktok-title.txt':tiktokTitle+'\n','tiktok-description.txt':tiktokDescription})) put('publishing/'+path,value);
put('publishing/metadata.json',JSON.stringify({song:manifest.title,performers:manifest.performers,source:{publisher:manifest.publisher,url:manifest.sourceUrl},language:'en',youtube:{title,description,thumbnail:'youtube-thumbnail.jpg',videoAspectRatio:'1920:818'},tiktok:{title:tiktokTitle,description:tiktokDescription,cover:'tiktok-profile-cover.jpg',videoAspectRatio:'9:16'},classification:'Unofficial lyric film'},null,2)+'\n');

function timestamp(seconds,separator) {
  const value=Math.round(seconds*1000),ms=value%1000,totalSeconds=Math.floor(value/1000);
  const s=totalSeconds%60,m=Math.floor(totalSeconds/60)%60,h=Math.floor(totalSeconds/3600);
  return [h,m,s].map(n=>String(n).padStart(2,'0')).join(':')+separator+String(ms).padStart(3,'0');
}
for(let i=0;i<cues.length;i++) {
  const cue=cues[i];
  if(!(cue.displayStart>=0 && cue.displayStart<cue.displayEnd && cue.displayEnd<=timeline.duration)) throw new Error('Invalid caption interval');
  if(i && Math.round(cues[i-1].displayEnd*1000)>Math.round(cue.displayStart*1000)) throw new Error('Overlapping exported captions');
}
const srt=cues.map((cue,index)=>`${index+1}\n${timestamp(cue.displayStart,',')} --> ${timestamp(cue.displayEnd,',')}\n${cue.text}\n`).join('\n');
const vtt='WEBVTT\n\n'+cues.map((cue,index)=>`${index+1}\n${timestamp(cue.displayStart,'.')} --> ${timestamp(cue.displayEnd,'.')}\n${cue.text}\n`).join('\n');
put('publishing/english.srt',srt);put('publishing/english.vtt',vtt);
const startHere=`# If The Sun Burns Out Tonight — posting kit\n\nGrabbitz · Oli Sykes · Courtney LaPlante\n\n## YouTube\n\nUse the landscape MP4 in **YouTube/**. It retains the original 1920×818 picture composition. Copy **title.txt** and **description.txt**, and choose **thumbnail.jpg** as the custom thumbnail.\n\n## TikTok\n\nUse the portrait MP4 in **TikTok/**. Copy **description.txt**; **title.txt** supplies a short optional title. **profile-cover.jpg** is the 1200×1600 cover artwork. The portrait video is 1080×1920.\n\n## Captions\n\nThe videos already contain English word highlights. **Captions/english.srt** and **Captions/english.vtt** provide optional selectable English captions. Both follow the approved phrase display windows.\n\nOriginal music video: ${manifest.sourceUrl}\n\nUnofficial lyric film. Artist and original-video credits are included in both descriptions.\n`;
put('publishing/START-HERE.md',startHere);put('output/posting-kit/START-HERE.md',startHere);
const mapping={
  'youtube-title.txt':'YouTube/title.txt','youtube-description.txt':'YouTube/description.txt','youtube-thumbnail.jpg':'YouTube/thumbnail.jpg',
  'tiktok-title.txt':'TikTok/title.txt','tiktok-description.txt':'TikTok/description.txt','tiktok-profile-cover.jpg':'TikTok/profile-cover.jpg',
  'english.srt':'Captions/english.srt','english.vtt':'Captions/english.vtt',
};
for(const [from,to] of Object.entries(mapping)) {const target=join(root,'output/posting-kit',to);mkdirSync(dirname(target),{recursive:true});copyFileSync(join(root,'publishing',from),target);}
const evidence={schema:'lyric-film/publishing-assets/v1',source:{path:manifest.sourceVideo,sha256:manifest.sha256,frame:sourceFrame,timeSeconds:sourceTime,frameRate:'24/1',stillPath:sourceStill,stillSha256:sha(readFileSync(join(root,sourceStill)))},font:{family:'Avenir Next Condensed DemiBold',weight:600,privateRuntimePath:'output/runtime/AvenirNextCondensed-DemiBold.ttf',sha256:sha(readFileSync(fontPath)),redistributed:false},covers,captions:{timelineRevision:timeline.revision,timelineSha256:sha(readFileSync(join(root,'src/timeline.json'))),cueCount:cues.length,wordCount:cues.reduce((sum,cue)=>sum+cue.words.length,0),timing:'Same bounded displayStart/displayEnd windows as approved preview; acoustic word events unchanged.',srtSha256:sha(srt),vttSha256:sha(vtt),firstStart:cues[0].displayStart,lastEnd:cues.at(-1).displayEnd},generation:{script:'scripts/package-assets.mjs',nativeCanvasVersion:require((process.env.CANVAS_MODULE_PATH||'@napi-rs/canvas')+'/package.json').version},scope:'Covers, copy and caption sidecars only. Film MP4s are supplied by the production renderer.'};
put('evidence/publishing-assets.json',JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({covers:covers.map(({path,width,height,bytes})=>({path,width,height,bytes})),captions:cues.length,postingKit:'output/posting-kit'},null,2));
