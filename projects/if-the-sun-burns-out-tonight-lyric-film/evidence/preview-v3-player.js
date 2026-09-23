const $=s=>document.querySelector(s);
const video=$('#source'),ambientVideo=$('#ambientVideo'),stage=$('#stage'),lyrics=$('#lyrics'),seek=$('#seek'),clock=$('#clock'),cueSelect=$('#cue'),error=$('#error');
const DRAFT_KEY='if-sun-preview-v3-dtw';
// Initialize audio state before any async module work or event listeners can run.
let audioCtx=null,analyser=null,sourceNode=null,freq=null;
const timeline=await fetch('/src/timeline.json').then(r=>{if(!r.ok)throw Error('Cannot load lyric timing draft');return r.json()});
const syllables=s=>{const t=s.toLowerCase().replace(/[^a-z]/g,'');if(!t)return 1;const m=t.match(/[aeiouy]+/g);let n=m?.length??1;if(t.endsWith('e')&&!t.endsWith('le')&&n>1)n--;return Math.max(1,n)};
const wordWeights=line=>line.match(/[\p{L}\p{N}’'-]+[,.!?…]?/gu)?.map((text,i,a)=>({text,weight:syllables(text)*(i===a.length-1?1.16:1)}))??[];
function compile(sections){const out=[];for(const section of sections){const raw=section.lines.map(line=>typeof line==='string'?{text:line}:line);const weights=raw.map(line=>line.words?.length?line.words.map(w=>({...w,weight:Math.max(.01,w.end-w.start)})):wordWeights(line.text));const lineWeights=weights.map(ws=>ws.reduce((n,w)=>n+w.weight,0)),sum=lineWeights.reduce((a,b)=>a+b,0)||1;let at=section.start;raw.forEach((line,i)=>{const duration=(section.end-section.start)*lineWeights[i]/sum;const start=Number.isFinite(line.start)?line.start:at,end=Number.isFinite(line.end)?line.end:at+duration;out.push({id:out.length,section:section.name,text:line.text,start,end,words:weights[i]});at=end})}return out}
let cues=compile(timeline.sections);
try{const saved=JSON.parse(localStorage.getItem(DRAFT_KEY)||'null');if(Array.isArray(saved)&&saved.length===cues.length)cues=cues.map((c,i)=>({...c,start:Number(saved[i].start),end:Number(saved[i].end)}))}catch{}
const fmt=n=>{n=Math.max(0,n||0);return `${Math.floor(n/60)}:${String(Math.floor(n%60)).padStart(2,'0')}`};
const save=()=>localStorage.setItem(DRAFT_KEY,JSON.stringify(cues.map(c=>({start:c.start,end:c.end}))));
function populateSelector(){cueSelect.innerHTML='';for(const c of cues){const o=document.createElement('option');o.value=c.id;o.textContent=`${String(c.id+1).padStart(2,'0')} · ${fmt(c.start)} · ${c.text}`;cueSelect.append(o)}}
populateSelector();
const wordNodes=[];let shown=-1,lastWord=-1;
function activeAt(t){return cues.find(c=>t>=c.start&&t<c.end)??null}
function drawLine(c,t){if(!c){if(shown!==-1){lyrics.classList.add('empty');lyrics.replaceChildren();shown=-1;lastWord=-1}return}if(shown!==c.id){lyrics.replaceChildren();wordNodes.length=0;let accumulated=0;const total=c.words.reduce((n,w)=>n+w.weight,0)||1;c.words.forEach((w,i)=>{if(i){const sep=document.createTextNode(' ');lyrics.append(sep)}const span=document.createElement('span');span.className='word';span.textContent=w.text;lyrics.append(span);const from=accumulated/total;accumulated+=w.weight;wordNodes.push({span,start:w.start,end:w.end,from,to:accumulated/total})});lyrics.classList.remove('empty');shown=c.id;lastWord=-1;cueSelect.value=String(c.id)}const fraction=Math.max(0,Math.min(.999999,(t-c.start)/(c.end-c.start)));const idx=wordNodes.findIndex(w=>Number.isFinite(w.start)&&Number.isFinite(w.end)?t>=w.start&&t<w.end:fraction>=w.from&&fraction<w.to);if(idx!==lastWord){wordNodes.forEach((w,i)=>w.span.classList.toggle('active',i===idx));lastWord=idx}$('#sunmark').classList.toggle('hot',/sun|supernova|void|heavens/i.test(c.text)&&(idx>=0))}
$('#play').addEventListener('click',async()=>{if(video.paused){try{await ensureAudio();await video.play()}catch(e){showError(`Playback could not start: ${e.message}`)}}else video.pause()});
video.addEventListener('play',()=>$('#play').textContent='❚❚ Pause');video.addEventListener('pause',()=>$('#play').textContent='▶ Play');
video.addEventListener('error',()=>showError('The full source video did not load. Use Reload page after checking the local preview server.'));
function syncAmbient(force=false){if(!ambientVideo||video.readyState<1||ambientVideo.readyState<1)return;if(force||Math.abs(ambientVideo.currentTime-video.currentTime)>.08){try{ambientVideo.currentTime=video.currentTime}catch{}}}
ambientVideo?.addEventListener('loadedmetadata',()=>syncAmbient(true));video.addEventListener('seeking',()=>syncAmbient(true));video.addEventListener('seeked',()=>syncAmbient(true));video.addEventListener('timeupdate',()=>syncAmbient());video.addEventListener('play',()=>{syncAmbient(true);ambientVideo.playbackRate=video.playbackRate;ambientVideo.play().catch(()=>{})});video.addEventListener('pause',()=>ambientVideo.pause());video.addEventListener('ratechange',()=>ambientVideo.playbackRate=video.playbackRate);
function applyInitialPosition(){if(video.readyState<1)return;seek.max=String(video.duration);clock.textContent=`0:00 / ${fmt(video.duration)}`;const raw=Number(new URLSearchParams(location.search).get('t')||0);video.currentTime=Math.max(0,Math.min(video.duration,Number.isFinite(raw)?raw:0))}
video.addEventListener('loadedmetadata',applyInitialPosition);if(video.readyState>=1)applyInitialPosition();
function updatePlaybackUI(){const t=video.currentTime;seek.value=String(t);clock.textContent=`${fmt(t)} / ${fmt(video.duration)}`;const c=activeAt(t);drawLine(c,t)}
video.addEventListener('timeupdate',updatePlaybackUI);
seek.addEventListener('input',()=>{video.currentTime=Number(seek.value);const c=activeAt(video.currentTime);drawLine(c,video.currentTime)});
$('#speed').addEventListener('change',e=>video.playbackRate=Number(e.target.value));
$('#landscape').addEventListener('click',()=>setFormat('landscape'));$('#portrait').addEventListener('click',()=>setFormat('portrait'));
function setFormat(f){const p=f==='portrait';stage.classList.toggle('portrait',p);$('#portrait').setAttribute('aria-pressed',String(p));$('#landscape').setAttribute('aria-pressed',String(!p));resizeCanvases()}
setFormat(new URLSearchParams(location.search).get('format')==='portrait'?'portrait':'landscape');
cueSelect.addEventListener('change',()=>{const c=cues[Number(cueSelect.value)];if(c){video.currentTime=c.start;drawLine(c,c.start)}});
$('#jump').addEventListener('click',()=>{const c=cues[Number(cueSelect.value)];if(c){video.currentTime=c.start;drawLine(c,c.start)}});
$('#markIn').addEventListener('click',()=>{const c=cues[Number(cueSelect.value)];if(c){c.start=Math.min(video.currentTime,video.duration-.1);if(c.end<=c.start)c.end=Math.min(video.duration,c.start+.15);save();populateSelector();cueSelect.value=String(c.id);drawLine(c,video.currentTime)}});
$('#markOut').addEventListener('click',()=>{const c=cues[Number(cueSelect.value)];if(c){c.end=Math.max(c.start+.15,Math.min(video.currentTime,video.duration));save();populateSelector();cueSelect.value=String(c.id);drawLine(c,video.currentTime)}});
$('#reset').addEventListener('click',()=>{localStorage.removeItem(DRAFT_KEY);cues=compile(timeline.sections);populateSelector();drawLine(activeAt(video.currentTime),video.currentTime)});
function showError(message){error.textContent=message;error.classList.add('show')}
window.addEventListener('keydown',e=>{if(e.code==='Space'&&!/INPUT|SELECT|TEXTAREA|BUTTON/.test(document.activeElement.tagName)){e.preventDefault();$('#play').click()}if(e.key==='ArrowLeft'&&!/INPUT|SELECT/.test(document.activeElement.tagName))video.currentTime=Math.max(0,video.currentTime-3);if(e.key==='ArrowRight'&&!/INPUT|SELECT/.test(document.activeElement.tagName))video.currentTime=Math.min(video.duration,video.currentTime+3)});

async function ensureAudio(){if(!audioCtx){audioCtx=new AudioContext();analyser=audioCtx.createAnalyser();analyser.fftSize=4096;analyser.smoothingTimeConstant=.72;freq=new Uint8Array(analyser.frequencyBinCount);sourceNode=audioCtx.createMediaElementSource(video);sourceNode.connect(analyser);analyser.connect(audioCtx.destination)}if(audioCtx.state!=='running')await audioCtx.resume()}
const spectrum=$('#spectrum'),sCtx=spectrum?.getContext?.('2d'),nextFrame=window.requestAnimationFrame?.bind(window)??(callback=>window.setTimeout(callback,34));
function resizeCanvases(){if(!sCtx)return;const d=Math.min(2,devicePixelRatio||1),r=stage.getBoundingClientRect();spectrum.width=Math.round(spectrum.clientWidth*d);spectrum.height=Math.round(spectrum.clientHeight*d);sCtx.setTransform(d,0,0,d,0,0)}
if(typeof ResizeObserver==='function')new ResizeObserver(resizeCanvases).observe(stage);window.addEventListener('resize',resizeCanvases);resizeCanvases();
function drawSpectrum(){
  if(!video.paused)updatePlaybackUI();
  if(sCtx){
    const d=Math.min(2,devicePixelRatio||1),w=spectrum.width/d,h=spectrum.height/d;
    sCtx.clearRect(0,0,w,h);
    if(analyser&&video.readyState>=2){
      analyser.getByteFrequencyData(freq);
      const bars=56,step=w/bars,low=2,nyquist=audioCtx.sampleRate/2;
      for(let i=0;i<bars;i++){
        const f0=35*Math.pow(12000/35,i/bars),f1=35*Math.pow(12000/35,(i+1)/bars),a=Math.max(0,Math.floor(f0/nyquist*freq.length)),b=Math.max(a+1,Math.floor(f1/nyquist*freq.length));
        let s=0;for(let j=a;j<b;j++)s+=freq[j];
        const val=(s/(b-a))/255,amp=Math.pow(val,1.14),barH=low+amp*h*.78,x=i*step+step*.25,bw=step*.46;
        const grad=sCtx.createLinearGradient(0,h-barH,0,h);grad.addColorStop(0,'#ffd17c');grad.addColorStop(.45,'#91dce9');grad.addColorStop(1,'rgba(116,217,237,.2)');
        sCtx.fillStyle=grad;sCtx.globalAlpha=.35+.55*Math.min(1,val*3);sCtx.fillRect(x,h-barH,bw,barH);
      }
      sCtx.globalAlpha=1;sCtx.fillStyle='rgba(239,243,244,.32)';sCtx.fillRect(0,h-1,w,1);
    }
  }
  nextFrame(drawSpectrum);
}
nextFrame(drawSpectrum);

// Start paused. An optional ?t= review link opens on a representative source moment.
