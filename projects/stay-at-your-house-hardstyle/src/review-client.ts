import dataJSON from './cues.json';import layoutJSON from './layout.json';
import {parseData} from './schema.ts';import type {Format} from './schema.ts';import type {Layouts} from './layout-types.ts';
import {montages} from './trailer.ts';
import {drawScene} from './scene.ts';import type {MotionFrame} from './scene.ts';import {chapters} from './score.ts';import {visibleCues,activeSource} from './focus.ts';
const data=parseData(dataJSON),layouts=layoutJSON as Layouts;
const el=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const canvas=el<HTMLCanvasElement>('film'),ctx=canvas.getContext('2d')!,audio=el<HTMLAudioElement>('audio'),dropOne=el<HTMLVideoElement>('drop-one'),dropTwo=el<HTMLVideoElement>('drop-two'),seek=el<HTMLInputElement>('seek');
const params=new URLSearchParams(location.search);let format:Format=params.get('format')==='portrait'?'portrait':'landscape',ready=false,bands:number[][]=[],motion:MotionFrame[]=[],lastCue='',lastTick=0,maxAssetDrift=0,decodedFrames=0,paintFrames=0,restoreCount=0;
let requestedTime=Number(params.get('t')??0);
const art=new Image();art.src='/public/source-artwork.png';
if(params.get('clean')==='1')document.body.classList.add('clean');
let reviews:string[]=[];try{reviews=JSON.parse(localStorage.getItem('stay-hardstyle-v1-review')??'[]');}catch{}
const time=(s:number)=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
function error(message:string){ready=false;el('loading').hidden=false;el('load-title').textContent='The complete scene is not ready';el('load-message').textContent=message;audio.pause();}
function mediaReady(v:HTMLMediaElement){return new Promise<void>((resolve,reject)=>{if(v.readyState>=2){resolve();return;}const timeout=setTimeout(()=>reject(Error('Media loading timed out')),25000);v.addEventListener('loadeddata',()=>{clearTimeout(timeout);resolve();},{once:true});v.addEventListener('error',()=>{clearTimeout(timeout);reject(Error('A required media file could not load'));},{once:true});});}
function size(){const l=layouts[format];canvas.width=l.width;canvas.height=l.height;canvas.dataset.format=format;el('wide').setAttribute('aria-pressed',String(format==='landscape'));el('tall').setAttribute('aria-pressed',String(format==='portrait'));paint();}
function paint(){if(!ready)return;const t=audio.currentTime;drawScene(ctx,t,format,data,layouts,bands,motion,{art,dropOne,dropTwo});paintFrames++;canvas.dataset.sourceTime=t.toFixed(6);canvas.dataset.dropOneTime=dropOne.currentTime.toFixed(4);canvas.dataset.dropTwoTime=dropTwo.currentTime.toFixed(4);canvas.dataset.scene=montages.some(m=>t>=m.songStart&&t<m.songStart+m.duration)?'trailer':'artwork';canvas.dataset.paintedFrames=String(paintFrames);canvas.dataset.decodedAssetFrames=String(decodedFrames);}
function syncAssets(force=false){if(!ready)return;
 for(const [i,video] of [dropOne,dropTwo].entries()){
  const montage=montages[i]!,local=audio.currentTime-montage.songStart,active=local>=0&&local<montage.duration;
  const target=Math.max(0,Math.min(montage.duration-1/60,local)),drift=Math.abs(video.currentTime-target);
  if(active&&!force&&!video.seeking)maxAssetDrift=Math.max(maxAssetDrift,drift);
  video.playbackRate=audio.playbackRate;
  if((force||(active&&drift>.065))&&!video.seeking&&Math.abs(video.currentTime-target)>.016)video.currentTime=target;
  if(audio.paused||!active){video.pause();}else if(video.paused)void video.play().catch(e=>error('Footage playback needs recovery: '+String(e)));
 }
}
function words(){const cues=visibleCues(data,Math.round(audio.currentTime*60)),cue=cues[0];const key=cue?.id??'';if(key!==lastCue){lastCue=key;el('words').replaceChildren();if(cue)for(const w of cue.source){const s=document.createElement('span');s.dataset.word=w.id;s.textContent=`${w.text}  ${(w.startSample/data.sampleRate).toFixed(3)}–${(w.endSample/data.sampleRate).toFixed(3)}`;s.className=w.reviewRequired?'uncertain':'';el('words').append(s);}}
 const active=cue?activeSource(cue,Math.round(audio.currentTime*60),data):new Set<string>();el('words').querySelectorAll<HTMLElement>('[data-word]').forEach(s=>s.classList.toggle('current',active.has(s.dataset.word!)));
 el('review-count').textContent=`${reviews.length} / ${data.cues.length} phrases marked`;
}
function tick(now:number){if(ready){syncAssets();paint();if(now-lastTick>100){lastTick=now;seek.value=String(audio.currentTime);el('time').textContent=`${time(audio.currentTime)} / ${time(data.duration)}`;el('play').textContent=audio.paused?'Play':'Pause';el('part').textContent=chapters.filter(c=>c.time<=audio.currentTime).at(-1)?.name??'Opening';if(el<HTMLDetailsElement>('timing').open)words();el('clock-status').textContent=audio.paused?'Paused · seek freely':'Playing · audio-locked visuals';}}requestAnimationFrame(tick);}
async function go(t:number){requestedTime=t;if(!ready)return;audio.currentTime=Math.max(0,Math.min(data.duration-.02,t));syncAssets(true);lastCue='';paint();}
async function restore(){const t=audio.currentTime,wasPlaying=!audio.paused;audio.pause();ready=false;el('loading').hidden=false;restoreCount++;try{for(const v of [dropOne,dropTwo]){v.pause();v.load();}await Promise.all([mediaReady(dropOne),mediaReady(dropTwo),art.decode()]);ready=true;audio.currentTime=t;syncAssets(true);el('loading').hidden=true;el('ready').textContent='Full scene ready · trailer footage + original artwork';canvas.dataset.restoreCount=String(restoreCount);paint();if(wasPlaying)await audio.play();}catch(e){error(String(e));}}
el('play').onclick=()=>{if(ready){if(audio.paused)void audio.play().catch(e=>error(String(e)));else audio.pause();}};
el('restart').onclick=()=>void go(0);seek.oninput=()=>void go(Number(seek.value));
el<HTMLSelectElement>('speed').onchange=e=>{audio.playbackRate=Number((e.target as HTMLSelectElement).value);syncAssets(true);};
el('wide').onclick=()=>{format='landscape';size();syncAssets(true);};el('tall').onclick=()=>{format='portrait';size();syncAssets(true);};
el('restore').onclick=()=>void restore();el('recover-overlay').onclick=()=>void restore();
el('previous').onclick=()=>void go(Math.max(0,(data.cues.filter(c=>c.startSample/data.sampleRate<audio.currentTime-.3).at(-1)?.startSample??0)/data.sampleRate-.18));
el('next').onclick=()=>{const c=data.cues.find(c=>c.startSample/data.sampleRate>audio.currentTime+.3);if(c)void go(c.startSample/data.sampleRate-.18);};
el('mark').onclick=()=>{const c=visibleCues(data,Math.round(audio.currentTime*60))[0];if(c&&!reviews.includes(c.id)){reviews.push(c.id);localStorage.setItem('stay-hardstyle-v1-review',JSON.stringify(reviews));}words();};
for(const c of chapters){const b=document.createElement('button');b.textContent=c.name;b.onclick=()=>void go(c.time);el('chapters').append(b);}
audio.addEventListener('seeking',()=>syncAssets(true));audio.addEventListener('seeked',()=>{syncAssets(true);paint();});audio.addEventListener('pause',()=>syncAssets());audio.addEventListener('play',()=>syncAssets(true));audio.addEventListener('error',()=>error('The soundtrack could not load. Restore visuals or restart the preview server.'));
for(const v of [dropOne,dropTwo]){v.muted=true;v.addEventListener('seeked',paint);v.addEventListener('error',()=>error('A required trailer edit could not load.'));const callback=()=>{decodedFrames++;v.requestVideoFrameCallback(callback);};v.requestVideoFrameCallback(callback);}
window.addEventListener('keydown',e=>{if((e.target as HTMLElement).matches('input,select,textarea'))return;if(e.code==='Space'){e.preventDefault();el('play').click();}if(e.code==='ArrowRight')void go(audio.currentTime+5);if(e.code==='ArrowLeft')void go(audio.currentTime-5);});
try{await document.fonts.load('600 76px StaySans');await document.fonts.load('700 71px StayDisplay');[bands,motion]=await Promise.all([fetch('/public/science.json').then(r=>r.json()),fetch('/public/motion.json').then(r=>r.json())]);await Promise.all([art.decode(),mediaReady(audio),mediaReady(dropOne),mediaReady(dropTwo)]);ready=true;seek.max=String(data.duration);size();el('loading').hidden=true;el('ready').textContent='Full scene ready · trailer footage + original artwork';audio.playbackRate=Number(params.get('speed')??1);el<HTMLSelectElement>('speed').value=String(audio.playbackRate);await go(requestedTime);canvas.dataset.ready='true';requestAnimationFrame(tick);}catch(e){error(String(e));}
