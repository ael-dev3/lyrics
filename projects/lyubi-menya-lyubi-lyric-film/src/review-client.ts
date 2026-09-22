import raw from './cues.json';
import rawLayouts from './layout.json';
import {parseData} from './schema.ts';
import type {Format} from './schema.ts';
import type {Layouts} from './layout-types.ts';
import {activeSource,sourceFocusIds,targetFocusIds,visibleCue} from './focus.ts';
import {createPreviewPainter} from './preview-painter.ts';

const data=parseData(raw),layouts=rawLayouts as Layouts;
const el=<T extends HTMLElement>(id:string):T=>{const e=document.getElementById(id);if(!e)throw Error('Missing preview control: '+id);return e as T;};
const audio=el<HTMLAudioElement>('audio'),stage=el('stage'),overlay=el('overlay'),seek=el<HTMLInputElement>('seek');
const params=new URLSearchParams(location.search);
let format:Format=params.get('format')==='portrait'?'portrait':'landscape';
let ready=false,busy=false,artReady=false,intendedPlaying=false,framesPainted=0,lastFrame=-1,lastUi=0,selected=0,pendingNotes=false,loopEnd:number|undefined,identity='',transportId=0;
let painter:ReturnType<typeof createPreviewPainter>|undefined;
let artwork:HTMLImageElement|undefined;
let lastPaintTime=0,lastMediaTime=-1,maxClockErrorMs=0;
const paintIntervals:number[]=[];
const records=data.cues.map(c=>({id:c.id,normalAudio:false,slowAudio:false,landscape:false,portrait:false,notes:''}));
const storageKey='lyubi-menya-lyubi-review-v1';
const requiredInputPaths=['public/soundtrack.m4a','public/artwork.png','public/fonts/Oswald-Medium.ttf','public/science.json','src/cues.json','src/layout.json','src/scene.ts','src/preview-painter.ts','src/focus.ts','src/schema.ts','src/review-client.ts','review/index.html','review/client.js'];
type PreviewIdentity={song:'DBGCHjBSNzo';revision:'preview-v3-duration-focus';hashes:Record<string,string>};
let previewIdentity:PreviewIdentity|undefined;
async function fetchIdentity():Promise<PreviewIdentity>{
 const response=await fetch('/evidence/preview-identity.json',{cache:'no-store'});if(!response.ok)throw Error('The complete preview identity is not ready. Restart the preview after its inputs are frozen.');
 const value:unknown=await response.json();
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('The preview identity is invalid.');
 const manifest=value as Record<string,unknown>,hashes=manifest.hashes;
 if(manifest.song!=='DBGCHjBSNzo'||manifest.revision!=='preview-v3-duration-focus'||!hashes||typeof hashes!=='object'||Array.isArray(hashes))throw Error('The preview identity belongs to different inputs.');
 const entries=Object.entries(hashes);
 if(requiredInputPaths.some(path=>!(path in hashes))||entries.some(([path,hash])=>path.startsWith('/')||path.includes('\\')||path.split('/').some(part=>!part||part==='.'||part==='..')||typeof hash!=='string'||!/^[a-f0-9]{64}$/.test(hash)))throw Error('The preview identity does not cover all required inputs.');
 const sorted=Object.fromEntries(entries.sort(([a],[b])=>a.localeCompare(b))) as Record<string,string>;
 if(sorted['public/soundtrack.m4a']!==data.audioSha256)throw Error('The recording identity does not match the lyric timeline.');
 return {song:'DBGCHjBSNzo',revision:'preview-v3-duration-focus',hashes:sorted};
}
const timestamp=(t:number)=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
const clampTime=(t:number)=>Math.max(0,Math.min(data.duration-.001,Number.isFinite(t)?t:0));
const status=(text:string,error=false)=>{el('playback-status').textContent=text;el('playback-status').dataset.error=String(error);};

type PreviewState={ready:boolean;busy:boolean;time:number;duration:number;format:Format;frame:number;playing:boolean;artworkLoaded:boolean;paintedFrames:number;cue:string|null;inputIdentity:string;maxClockErrorMs:number;recentFrameIntervalP95Ms:number;sourceKind:'static-album-art';error:string|null};
declare global{interface Window{__previewSeek:(seconds:number,nextFormat?:Format)=>Promise<PreviewState>;readonly __previewState:PreviewState;}}
let lastError:string|null=null;
function state():PreviewState{const sorted=[...paintIntervals].sort((a,b)=>a-b);return {ready,busy,time:audio.currentTime,duration:data.duration,format,frame:Math.min(data.frames-1,Math.round(audio.currentTime*data.fps)),playing:!audio.paused,artworkLoaded:artReady&&overlay.dataset.artworkReady==='true',paintedFrames:framesPainted,cue:visibleCue(data,Math.round(audio.currentTime*data.fps))?.id??null,inputIdentity:identity,maxClockErrorMs,recentFrameIntervalP95Ms:sorted[Math.floor(sorted.length*.95)]??0,sourceKind:'static-album-art',error:lastError};}
Object.defineProperty(window,'__previewState',{get:state});

function cacheNotes(){if(pendingNotes){const r=records[selected];if(r)r.notes=el<HTMLTextAreaElement>('notes').value;pendingNotes=false;}}
function saveLocal(){cacheNotes();if(identity)localStorage.setItem(storageKey,JSON.stringify({identity,records}));}
function setEnabled(value:boolean){for(const id of ['play','restart','previous','next'])el<HTMLButtonElement>(id).disabled=!value;seek.disabled=!value;}
function fail(message:string){ready=false;busy=false;intendedPlaying=false;lastError=message;audio.pause();setEnabled(false);el('loading').hidden=false;el('loading-title').textContent='The complete preview is not ready';el('loading-message').textContent=message;el('restore-overlay').hidden=false;status(message,true);}

function resize(){
 const l=layouts[format],wrap=el('stage-wrap'),native=params.get('native')==='1';
 if(native){document.body.classList.add('native');wrap.style.width=l.width+'px';wrap.style.height=l.height+'px';}
 const scale=native?1:Math.min(wrap.clientWidth/l.width,wrap.clientHeight/l.height);
 stage.style.width=l.width*scale+'px';stage.style.height=l.height*scale+'px';
 for(const f of ['landscape','portrait'] as const)el(f).setAttribute('aria-pressed',String(f===format));
 lastFrame=-1;paint();
}
function paint(){
 if(!ready||!painter)return;
 const frame=Math.min(data.frames-1,Math.max(0,Math.round(audio.currentTime*data.fps)));
 if(frame===lastFrame)return;
 painter.paint(frame,format);lastFrame=frame;framesPainted++;
 overlay.dataset.ready='true';overlay.dataset.sourceTime=audio.currentTime.toFixed(6);overlay.dataset.frame=String(frame);overlay.dataset.format=format;overlay.dataset.paintedFrames=String(framesPainted);
 if(!audio.paused&&!busy){
  const now=performance.now();maxClockErrorMs=Math.max(maxClockErrorMs,Math.abs(frame/data.fps-audio.currentTime)*1000);
  if(lastPaintTime&&audio.currentTime>lastMediaTime&&audio.currentTime-lastMediaTime<.1){paintIntervals.push(now-lastPaintTime);if(paintIntervals.length>1200)paintIntervals.shift();}
  lastPaintTime=now;lastMediaTime=audio.currentTime;
 }
}
function list(){
 el('cue-list').replaceChildren(...data.cues.map((c,i)=>{const b=document.createElement('button');b.className='cue-item'+(selected===i?' current':'');b.textContent=`${timestamp(c.startSample/data.sampleRate)} · ${c.section}`;const s=document.createElement('span');s.textContent=c.ru.map(w=>w.text).join(' ');b.append(s);b.onclick=()=>{select(i);void go(c.startSample/data.sampleRate-.3,false);};return b;}));
}
function reviewStatus(){const r=records[selected];el('review-status').textContent=r?`This cue: normal ${r.normalAudio?'checked':'pending'} · slow ${r.slowAudio?'checked':'pending'} · 16:9 ${r.landscape?'checked':'pending'} · 9:16 ${r.portrait?'checked':'pending'}`:'No lyric cue at this position.';}
function select(index:number){
 cacheNotes();selected=Math.max(0,Math.min(data.cues.length-1,index));const cue=data.cues[selected];if(!cue)return;
 el('cue-title').textContent=`${cue.id} · ${cue.ru.map(w=>w.text).join(' ')}`;
 el<HTMLTextAreaElement>('notes').value=records[selected]?.notes??'';el<HTMLInputElement>('listened').checked=false;
 el('word-detail').textContent='';
 el('word-list').replaceChildren(...cue.ru.map(w=>{const b=document.createElement('button');b.textContent=w.text;b.dataset.word=w.id;b.onclick=()=>{
  const source=sourceFocusIds(cue,w.id),target=cue.en.filter(t=>targetFocusIds(t).includes(w.id));
  el('word-detail').textContent=`${cue.ru.filter(x=>source.includes(x.id)).map(x=>x.text).join(' ')} ↔ ${target.map(x=>x.text).join(' ')} · ${(w.startSample/data.sampleRate).toFixed(3)}–${(w.endSample/data.sampleRate).toFixed(3)} s${w.reviewRequired?' · listening check pending':''}`;
  const end=Math.min(data.duration,w.endSample/data.sampleRate+.65);void go(w.startSample/data.sampleRate-.6,true).then(token=>{if(token!==undefined&&token===transportId&&ready)loopEnd=end;});
 };return b;}));
 list();reviewStatus();
}
function updateUi(){
 seek.value=String(audio.currentTime);el('time').textContent=`${timestamp(audio.currentTime)} / ${timestamp(data.duration)}`;el('play').textContent=audio.paused?(audio.ended?'Replay':'Play'):'Pause';
 const c=visibleCue(data,Math.round(audio.currentTime*data.fps));
 if(c&&!pendingNotes&&document.activeElement!==el('notes')){const index=data.cues.indexOf(c);if(index!==selected)select(index);}
 const selectedCue=data.cues[selected],active=selectedCue?activeSource(selectedCue,Math.round(audio.currentTime*data.fps),data):new Set<string>();
 for(const b of el('word-list').querySelectorAll<HTMLElement>('[data-word]'))b.classList.toggle('active',active.has(b.dataset.word??''));
}
function mediaReady(){return new Promise<void>((resolve,reject)=>{
 if(audio.readyState>=2&&Number.isFinite(audio.duration)){resolve();return;}
 const done=()=>{clearTimeout(timer);audio.removeEventListener('loadeddata',loaded);audio.removeEventListener('error',error);};
 const loaded=()=>{done();resolve();},error=()=>{done();reject(Error('The recording could not load. Restore the preview after restarting its server.'));};
 const timer=setTimeout(()=>{done();reject(Error('The recording is taking too long to load. Use Restore visuals to reconnect.'));},25000);
 audio.addEventListener('loadeddata',loaded,{once:true});audio.addEventListener('error',error,{once:true});
});}
async function seekTo(t:number){
 if(Math.abs(audio.currentTime-t)<.0001&&!audio.seeking)return;
 await new Promise<void>((resolve,reject)=>{
  const done=()=>{clearTimeout(timer);audio.removeEventListener('seeked',seeked);audio.removeEventListener('error',error);};
  const seeked=()=>{done();resolve();},error=()=>{done();reject(Error('The recording could not seek to this position.'));};
  const timer=setTimeout(()=>{done();reject(Error('Seeking stalled. Restore the preview to reconnect at this position.'));},12000);
  audio.addEventListener('seeked',seeked,{once:true});audio.addEventListener('error',error,{once:true});audio.currentTime=t;
 });
}
async function go(seconds:number,play:boolean):Promise<number|undefined>{
 if(!ready)return;const token=++transportId;intendedPlaying=play;audio.pause();loopEnd=undefined;busy=true;setEnabled(false);
 try{await seekTo(clampTime(seconds));if(token!==transportId)return;lastFrame=-1;paint();updateUi();if(play)await audio.play();if(token!==transportId)return;busy=false;setEnabled(true);status('Full preview ready · original recording and artwork');return token;}
 catch(error){if(token===transportId)fail(String(error));}
}
window.__previewSeek=async(seconds,nextFormat)=>{if(nextFormat){format=nextFormat;resize();}await go(seconds,false);await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));paint();return state();};

async function loadPreview(position:number,play:boolean){
 const token=++transportId;ready=false;busy=true;lastError=null;setEnabled(false);audio.pause();artReady=false;el('loading').hidden=false;el('restore-overlay').hidden=true;
 el('loading-title').textContent='Preparing the complete preview';el('loading-message').textContent='Loading the recording, original artwork and lyrics.';
 try{
  const image=new Image();image.src='/public/artwork.png';artwork=image;
  const [bands,manifest]=await Promise.all([
   fetch('/public/science.json',{cache:'no-store'}).then(async r=>{if(!r.ok)throw Error('The measured visualizer could not load.');const value:unknown=await r.json();if(!Array.isArray(value)||value.length!==data.frames||!value.every(row=>Array.isArray(row)&&row.length===64&&row.every(x=>typeof x==='number'&&Number.isFinite(x))))throw Error('The visualizer data does not match this recording.');return value as number[][];}),
   fetchIdentity(),
   image.decode(),mediaReady(),document.fonts.load('500 72px LyubiSans')
  ]);
  if(token!==transportId)return;
  if(!image.naturalWidth||!image.naturalHeight)throw Error('The original artwork did not decode.');
  if(!document.fonts.check('500 72px LyubiSans'))throw Error('The lyric font could not load. Restore the preview after restarting its server.');
  if(Math.abs(audio.duration-data.duration)>.15)throw Error('The recording duration does not match this lyric timeline.');
  artReady=true;
  previewIdentity=manifest;
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(manifest)));
  identity=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
  if(token!==transportId)return;
  for(const row of records){row.normalAudio=false;row.slowAudio=false;row.landscape=false;row.portrait=false;row.notes='';}
  try{const saved=localStorage.getItem(storageKey);if(saved){const old=JSON.parse(saved) as {identity?:string;records?:typeof records};if(old.identity===identity&&Array.isArray(old.records)){for(const row of records){const prior=old.records.find(r=>r.id===row.id);if(prior){row.notes=typeof prior.notes==='string'?prior.notes:'';for(const key of ['normalAudio','slowAudio','landscape','portrait'] as const)row[key]=prior[key]===true;}}}else{localStorage.setItem(storageKey+'-archived-'+Date.now(),saved);el('save-status').textContent='Earlier notes were archived. This revised preview needs a fresh review.';}}}catch{el('save-status').textContent='Earlier notes could not be restored. The unchanged preview is available.';}
  overlay.replaceChildren();painter=createPreviewPainter(overlay,data,layouts,bands);lastFrame=-1;ready=true;busy=false;seek.max=String(data.duration);el('loading').hidden=true;resize();select(selected);await go(position,play);
 }catch(error){if(token===transportId)fail(String(error));}
}
function restore(){saveLocal();const position=audio.currentTime,playing=intendedPlaying,rate=audio.playbackRate;audio.load();audio.playbackRate=rate;void loadPreview(position,playing);}
el('restore').onclick=restore;el('restore-overlay').onclick=restore;
el('play').onclick=()=>{if(!ready||busy)return;if(audio.paused)void go(audio.ended?0:audio.currentTime,true);else{intendedPlaying=false;audio.pause();loopEnd=undefined;updateUi();}};
el('restart').onclick=()=>void go(0,true);
seek.oninput=()=>void go(Number(seek.value),intendedPlaying);
el('previous').onclick=()=>{const cue=data.cues.filter(c=>c.startSample/data.sampleRate<audio.currentTime-.35).at(-1);void go(cue?cue.startSample/data.sampleRate-.25:0,false);};
el('next').onclick=()=>{const cue=data.cues.find(c=>c.startSample/data.sampleRate>audio.currentTime+.35);if(cue)void go(cue.startSample/data.sampleRate-.25,false);};
for(const f of ['landscape','portrait'] as const)el(f).onclick=()=>{format=f;el<HTMLInputElement>('listened').checked=false;resize();reviewStatus();};
el<HTMLSelectElement>('speed').onchange=()=>{audio.playbackRate=Number(el<HTMLSelectElement>('speed').value);el<HTMLInputElement>('listened').checked=false;};
el('toggle-review').onclick=()=>{const open=document.body.classList.toggle('reviewing');el('toggle-review').setAttribute('aria-pressed',String(open));el('toggle-review').textContent=open?'Watch preview':'Timing review';resize();updateUi();};
function expand(){const expanded=el('stage-wrap').classList.toggle('expanded');el('close-expanded').hidden=!expanded;document.body.style.overflow=expanded?'hidden':'';resize();}
el('expand').onclick=expand;el('close-expanded').onclick=expand;
el<HTMLTextAreaElement>('notes').oninput=()=>{pendingNotes=true;saveLocal();};
el('mark-review').onclick=()=>{if(!el<HTMLInputElement>('listened').checked)return;const row=records[selected];if(!row)return;row[format]=true;if(audio.playbackRate===1)row.normalAudio=true;else row.slowAudio=true;el<HTMLInputElement>('listened').checked=false;saveLocal();reviewStatus();el('save-status').textContent='Cue review saved locally. Saving notes does not authorize rendering.';};
el('save-review').onclick=async()=>{saveLocal();try{if(!ready||!previewIdentity)throw Error('Preview identity not ready');const response=await fetch('/api/review-progress',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({song:'DBGCHjBSNzo',status:'listener-progress-only',savedAt:new Date().toISOString(),previewNotesIdentity:identity,previewRevision:previewIdentity.revision,inputHashes:previewIdentity.hashes,audioSha256:data.audioSha256,cues:records})});if(!response.ok)throw Error('Save failed');el('save-status').textContent='Review notes saved. Remaining checks and production approval stay separate.';}catch{el('save-status').textContent='The server could not save these notes. Your local draft is preserved; restart the preview and save again.';}};
for(const event of ['play','pause','seeking','seeked','ratechange'])audio.addEventListener(event,()=>{lastPaintTime=0;lastMediaTime=-1;});
audio.addEventListener('error',()=>{if(ready)fail('The recording is unavailable. Restore the preview after restarting its server.');});
overlay.addEventListener('error',event=>{if(event.target instanceof SVGImageElement)fail('The artwork layer could not load. Use Restore visuals to reload the complete preview.');},true);
audio.addEventListener('waiting',()=>{if(ready)status('Buffering the recording. Restore visuals if playback does not continue.');});
audio.addEventListener('playing',()=>status('Full preview ready · original recording and artwork'));
audio.addEventListener('ended',()=>{intendedPlaying=false;loopEnd=undefined;updateUi();});
window.addEventListener('keydown',event=>{if((event.target as HTMLElement).matches('input,select,textarea'))return;if(event.code==='Space'){event.preventDefault();el('play').click();}if(event.code==='ArrowRight')void go(audio.currentTime+5,!audio.paused);if(event.code==='ArrowLeft')void go(audio.currentTime-5,!audio.paused);if(event.key==='Escape'&&el('stage-wrap').classList.contains('expanded'))expand();});
window.addEventListener('beforeunload',saveLocal);
new ResizeObserver(resize).observe(el('stage-wrap'));
if(params.get('clean')==='1')document.body.classList.add('clean');
const speed=Number(params.get('speed')??1);if([1,.75,.5].includes(speed)){audio.playbackRate=speed;el<HTMLSelectElement>('speed').value=String(speed);}
function tick(now:number){if(ready){paint();if(now-lastUi>100){lastUi=now;updateUi();}if(loopEnd!==undefined&&audio.currentTime>=loopEnd){intendedPlaying=false;audio.pause();loopEnd=undefined;}}requestAnimationFrame(tick);}
requestAnimationFrame(tick);
void loadPreview(clampTime(Number(params.get('t')??0)),false);
