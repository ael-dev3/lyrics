import dataJSON from './cues.json';import layoutJSON from './layout.json';
import {parseData} from './schema.ts';import type {Format} from './schema.ts';import type {Layouts} from './layout-types.ts';
import {FrameDeck} from './frame-deck.ts';
import {PlaybackAudit,type SyncEvent} from './playback-audit.ts';
import {montages} from './trailer.ts';
import {drawScene} from './scene.ts';import type {MotionFrame} from './scene.ts';import {chapters} from './score.ts';import {visibleCues,activeSource} from './focus.ts';
const data=parseData(dataJSON),layouts=layoutJSON as Layouts;
const el=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const canvas=el<HTMLCanvasElement>('film'),ctx=canvas.getContext('2d')!,audio=el<HTMLAudioElement>('audio'),dropOne=el<HTMLVideoElement>('drop-one'),dropTwo=el<HTMLVideoElement>('drop-two'),seek=el<HTMLInputElement>('seek');
const params=new URLSearchParams(location.search);let format:Format=params.get('format')==='portrait'?'portrait':'landscape',ready=false,bands:number[][]=[],motion:MotionFrame[]=[],lastCue='',lastTick=0,paintFrames=0,restoreCount=0,busy=false,transportToken=0,intendedPlaying=false;
const decks=[new FrameDeck(dropOne,()=>{if(audio.paused)paint();}),new FrameDeck(dropTwo,()=>{if(audio.paused)paint();})];
const pictureErrors:number[]=[];
const events:SyncEvent[]=montages.flatMap(m=>m.shots.flatMap(s=>{
 const accents='accents' in s?s.accents:('accent' in s&&s.accent?[s.accent]:[]);
 return [{id:`${m.id}/${s.name}/cut`,time:m.songStart+s.startFrame/60,montage:m.id,kind:'cut' as const},...accents.map(a=>({id:`${m.id}/${s.name}/${a.frame}`,time:m.songStart+(s.startFrame+a.frame)/60,montage:m.id,kind:'action' as const}))];
}));
const onsetAudit=new PlaybackAudit(events);
let requestedTime=Number(params.get('t')??0);
const art=new Image();art.src='/public/source-artwork.png';
if(params.get('clean')==='1')document.body.classList.add('clean');
let reviews:string[]=[];try{reviews=JSON.parse(localStorage.getItem('stay-hardstyle-v1-review')??'[]');}catch{}
const time=(s:number)=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
function error(message:string){ready=false;intendedPlaying=false;el('loading').hidden=false;el('load-title').textContent='The complete scene is not ready';el('load-message').textContent=message;audio.pause();}
function mediaReady(v:HTMLMediaElement){return new Promise<void>((resolve,reject)=>{if(v.readyState>=2){resolve();return;}const timeout=setTimeout(()=>reject(Error('Media loading timed out')),25000);v.addEventListener('loadeddata',()=>{clearTimeout(timeout);resolve();},{once:true});v.addEventListener('error',()=>{clearTimeout(timeout);reject(Error('A required media file could not load'));},{once:true});});}
function size(){const l=layouts[format];canvas.width=l.width;canvas.height=l.height;canvas.dataset.format=format;el('wide').setAttribute('aria-pressed',String(format==='landscape'));el('tall').setAttribute('aria-pressed',String(format==='portrait'));paint();}
function paint(){if(!ready||busy)return;const t=audio.currentTime,index=montages.findIndex(m=>t>=m.songStart&&t<m.songStart+m.duration),pictures=decks.map((deck,i)=>deck.picture(Math.max(0,t-montages[i]!.songStart)));
 let pictureTime=t;
 if(index>=0){const picture=pictures[index];if(!picture)return;pictureTime=picture.time+montages[index]!.songStart;const errorMs=(t-pictureTime)*1000;
  if(!audio.paused){pictureErrors.push(errorMs);if(pictureErrors.length>3600)pictureErrors.shift();onsetAudit.sample(t,pictureTime,montages[index]!.id);}
  canvas.dataset.pictureTime=pictureTime.toFixed(6);canvas.dataset.pictureErrorMs=errorMs.toFixed(3);
 }
 drawScene(ctx,t,format,data,layouts,bands,motion,{art,dropOne:pictures[0]?.image??dropOne,dropTwo:pictures[1]?.image??dropTwo,pictureTime});paintFrames++;
 canvas.dataset.sourceTime=t.toFixed(6);canvas.dataset.dropOneTime=dropOne.currentTime.toFixed(4);canvas.dataset.dropTwoTime=dropTwo.currentTime.toFixed(4);canvas.dataset.scene=index>=0?'trailer':'artwork';canvas.dataset.paintedFrames=String(paintFrames);canvas.dataset.decodedAssetFrames=String(decks.reduce((n,d)=>n+d.decoded,0));
}
function syncAssets(){if(!ready||busy)return;decks.forEach((deck,i)=>deck.sync(audio.currentTime-montages[i]!.songStart,audio.playbackRate,!audio.paused));}
async function transport(t:number,play:boolean,reload=false){const token=++transportToken;intendedPlaying=play;audio.pause();busy=true;el<HTMLButtonElement>('play').disabled=true;const target=Math.max(0,Math.min(data.duration-.02,t));
 try{
  if(reload){for(const d of decks){d.clear();d.video.load();}await Promise.all(decks.map(d=>mediaReady(d.video)));}
  if(token!==transportToken)return;audio.currentTime=target;
  await Promise.all(decks.map((deck,i)=>{const m=montages[i]!,local=target-m.songStart;return deck.prime(local>=0&&local<m.duration?local:0,play&&local>=0&&local<m.duration);}));
  if(token!==transportToken)return;busy=false;lastCue='';onsetAudit.begin(target);pictureErrors.length=0;paint();if(play)await audio.play();syncAssets();
 }catch(e){if(token===transportToken){busy=false;error(String(e));}}
 finally{if(token===transportToken)el<HTMLButtonElement>('play').disabled=false;}
}
function words(){const cues=visibleCues(data,Math.round(audio.currentTime*60)),cue=cues[0];const key=cue?.id??'';if(key!==lastCue){lastCue=key;el('words').replaceChildren();if(cue)for(const w of cue.source){const s=document.createElement('span');s.dataset.word=w.id;s.textContent=`${w.text}  ${(w.startSample/data.sampleRate).toFixed(3)}–${(w.endSample/data.sampleRate).toFixed(3)}`;s.className=w.reviewRequired?'uncertain':'';el('words').append(s);}}
 const active=cue?activeSource(cue,Math.round(audio.currentTime*60),data):new Set<string>();el('words').querySelectorAll<HTMLElement>('[data-word]').forEach(s=>s.classList.toggle('current',active.has(s.dataset.word!)));
 el('review-count').textContent=`${reviews.length} / ${data.cues.length} phrases marked`;
}
function tick(now:number){if(ready){syncAssets();paint();if(now-lastTick>100){lastTick=now;seek.value=String(audio.currentTime);el('time').textContent=`${time(audio.currentTime)} / ${time(data.duration)}`;el('play').textContent=audio.paused?'Play':'Pause';el('part').textContent=chapters.filter(c=>c.time<=audio.currentTime).at(-1)?.name??'Opening';if(el<HTMLDetailsElement>('timing').open)words();el('clock-status').textContent=audio.paused?'Paused · seek freely':'Playing · frames selected on the audio clock';canvas.dataset.onsetAudit=JSON.stringify(onsetAudit.observations);if(pictureErrors.length){const sorted=[...pictureErrors].sort((a,b)=>a-b);canvas.dataset.pictureSamples=String(sorted.length);canvas.dataset.pictureP95Ms=sorted[Math.floor(sorted.length*.95)]!.toFixed(3);canvas.dataset.pictureMaxMs=sorted.at(-1)!.toFixed(3);}}}requestAnimationFrame(tick);}
async function go(t:number){requestedTime=t;if(!ready)return;await transport(t,intendedPlaying);}
async function restore(){const t=audio.currentTime,playing=intendedPlaying;restoreCount++;ready=true;await transport(t,playing,true);if(ready){el('loading').hidden=true;canvas.dataset.restoreCount=String(restoreCount);el('ready').textContent='Full scene ready · frame-timed trailer edits';}}
el('play').onclick=()=>{if(!ready||busy)return;if(audio.paused)void transport(audio.currentTime,true);else{intendedPlaying=false;audio.pause();syncAssets();}};
el('restart').onclick=()=>void go(0);seek.oninput=()=>void go(Number(seek.value));
el<HTMLSelectElement>('speed').onchange=e=>{const playing=intendedPlaying;audio.playbackRate=Number((e.target as HTMLSelectElement).value);void transport(audio.currentTime,playing);};
el('wide').onclick=()=>{format='landscape';size();syncAssets();};el('tall').onclick=()=>{format='portrait';size();syncAssets();};
el('restore').onclick=()=>void restore();el('recover-overlay').onclick=()=>void restore();
el('previous').onclick=()=>void go(Math.max(0,(data.cues.filter(c=>c.startSample/data.sampleRate<audio.currentTime-.3).at(-1)?.startSample??0)/data.sampleRate-.18));
el('next').onclick=()=>{const c=data.cues.find(c=>c.startSample/data.sampleRate>audio.currentTime+.3);if(c)void go(c.startSample/data.sampleRate-.18);};
el('mark').onclick=()=>{const c=visibleCues(data,Math.round(audio.currentTime*60))[0];if(c&&!reviews.includes(c.id)){reviews.push(c.id);localStorage.setItem('stay-hardstyle-v1-review',JSON.stringify(reviews));}words();};
for(const c of chapters){const b=document.createElement('button');b.textContent=c.name;b.onclick=()=>void go(c.time);el('chapters').append(b);}
audio.addEventListener('ended',()=>{intendedPlaying=false;});
audio.addEventListener('pause',()=>syncAssets());audio.addEventListener('error',()=>error('The soundtrack could not load. Restore visuals or restart the preview server.'));
for(const v of [dropOne,dropTwo]){v.muted=true;v.addEventListener('error',()=>error('A required trailer edit could not load.'));}
window.addEventListener('keydown',e=>{if((e.target as HTMLElement).matches('input,select,textarea'))return;if(e.code==='Space'){e.preventDefault();el('play').click();}if(e.code==='ArrowRight')void go(audio.currentTime+5);if(e.code==='ArrowLeft')void go(audio.currentTime-5);});
try{await document.fonts.load('600 76px StaySans');await document.fonts.load('700 71px StayDisplay');[bands,motion]=await Promise.all([fetch('/public/science.json').then(r=>r.json()),fetch('/public/motion.json').then(r=>r.json())]);await Promise.all([art.decode(),mediaReady(audio),mediaReady(dropOne),mediaReady(dropTwo)]);ready=true;seek.max=String(data.duration);size();el('loading').hidden=true;el('ready').textContent='Full scene ready · frame-timed trailer edits';audio.playbackRate=Number(params.get('speed')??1);el<HTMLSelectElement>('speed').value=String(audio.playbackRate);await go(requestedTime);canvas.dataset.ready='true';requestAnimationFrame(tick);}catch(e){error(String(e));}
