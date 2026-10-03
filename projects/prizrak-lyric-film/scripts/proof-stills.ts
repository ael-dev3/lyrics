import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createCanvas,GlobalFonts,loadImage} from '@napi-rs/canvas';
import {initScene,paintScene,layoutCue,cueOpacity} from '../src/scene.ts';
import {sourceActive,tokenActive,visibleCues,vocalTrack,type Timeline} from '../src/model.ts';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const timeline=read('public/timeline.json') as Timeline;
GlobalFonts.registerFromPath('public/fonts/NotoSerif.ttf','PrizrakSerif');
GlobalFonts.registerFromPath('public/fonts/NotoSerifJP.ttf','PrizrakJP');
initScene(timeline,read('public/audio-features.json'));
mkdirSync('analysis/scene-proofs',{recursive:true});
const results=[];
for(const cue of timeline.cues){
 const time=cue.words[Math.floor(cue.words.length/2)]!.startSample/44100+.06;
 const frame=spawnSync('ffmpeg',['-v','error','-ss',String(time),'-i','public/source.mp4','-frames:v','1','-f','image2pipe','-c:v','png','pipe:1'],{maxBuffer:15e6});
 if(frame.status!==0)throw Error(frame.stderr.toString());const source=await loadImage(frame.stdout);
 for(const format of ['landscape','portrait'] as const){
  const width=format==='landscape'?1920:1080,height=format==='landscape'?1080:1920;
  const canvas=createCanvas(width,height),ctx=canvas.getContext('2d') as unknown as CanvasRenderingContext2D;
  const layout=layoutCue(ctx,cue,format);
  for(const lane of layout.lanes)for(const slot of lane.slots)if(slot.x<80 || slot.x+slot.width>width-80 || slot.y>height-180 && format==='portrait')throw Error(`Unsafe text bounds ${slot.id}/${format}`);
  for(const word of cue.words){
   const focused=word.startSample/44100;
   if(cueOpacity(cue,focused)!==1 || !sourceActive(word,focused))throw Error(`First voice frame visibility failed ${word.id}`);
   for(const lane of cue.lanes)if(!lane.tokens.some(t=>tokenActive(t,cue.words,focused)))throw Error(`Missing focused meaning ${word.id}/${lane.language}`);
  }
  for(const current of visibleCues(timeline,time)){
   const upper=visibleCues(timeline,time).find(c=>vocalTrack(c)==='japanese-upper');
   const lead=visibleCues(timeline,time).find(c=>vocalTrack(c)==='lead');
   if(upper && lead){
    const a=layoutCue(ctx,upper,format),b=layoutCue(ctx,lead,format);
    if(a.bottom+30>b.top)throw Error(`Vocal blocks collide ${upper.id}/${lead.id}/${format}`);
    if(a.size!==b.size)throw Error(`Concurrent voices have unequal optical size ${upper.id}/${lead.id}/${format}`);
   }
  }
  paintScene(ctx,time,format,source as unknown as CanvasImageSource);
  const path=`analysis/scene-proofs/${cue.id}-${format}.jpg`;writeFileSync(path,canvas.toBuffer('image/jpeg',89));
  results.push({cueId:cue.id,format,sourceTime:time,size:layout.size,laneRows:layout.lanes.map(l=>({language:l.language,rows:l.rows})),firstActiveOpacity:1,proof:path});
 }
}
writeFileSync('evidence/layout-proof.json',JSON.stringify({revision:timeline.revision,sourceSha256:timeline.sourceSha256,status:'Every cue/language fitted in both complete compositions; first-active visibility and semantic coverage checked. Still/geometry diagnostic, not listening approval or encoded-film evidence.',results},null,2)+'\n');
console.log(`${results.length} complete stills; every word onset and every language checked in both layouts.`);
