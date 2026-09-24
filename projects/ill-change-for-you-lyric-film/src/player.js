import {createCues, cueAt, wordIndexAt, spectrumAt, createVideoFramePump, createSettledFrameRefresh} from './preview-core.js';
import {paintEdgeprint} from './edgeprint.js';

const $ = selector => document.querySelector(selector);
const stage = $('#stage'), video = $('#source'), backdrop = $('#backdrop');
const backdropContext = backdrop.getContext('2d', {alpha:false});
const edge = $('#edgeprint'), edgeContext = edge.getContext('2d');
const reading = $('#reading'), seek = $('#seek'), clock = $('#clock');
const cueSelect = $('#cue'), playButton = $('#play'), stateOutput = $('#preview-state');
const params = new URLSearchParams(location.search);
let cues = [], featureMetadata = null, featureValues = null, pictureTones = null;
let activeCueId = '', activeWordIndex = -2, wordNodes = [];
let dirty = true, raf = null, inkEnabled = params.get('ink') !== 'off';
let backdropPaints = 0, lastSourceMediaTime = null;
let edgeSize = {width:1,height:1};
const errors = {media:null,backdrop:null,data:null};
const duration = 196.464036;
const timeLabel = time => `${Math.floor(Math.max(0,time)/60)}:${String(Math.floor(Math.max(0,time)%60)).padStart(2,'0')}`;

function updateError() {
  const message=Object.values(errors).filter(Boolean).join(' ');
  const element=$('#error'); element.textContent=message; element.classList.toggle('show',Boolean(message));
}
function setError(kind,message) {errors[kind]=message;updateError();}
function clearError(kind) {errors[kind]=null;updateError();}

async function loadJson(path,label) {
  const response=await fetch(path,{cache:'no-store'});
  if(!response.ok) throw Error(`${label} could not load (${response.status}). Reload the preview.`);
  return response.json();
}
async function loadData() {
  const [timeline,metadata,tones]=await Promise.all([
    loadJson('/src/timeline.json','Lyric timing'),
    loadJson('/public/audio-features.json','Measured audio'),
    loadJson('/public/picture-tones.json','Picture contrast'),
  ]);
  cues=createCues(timeline);
  featureMetadata=metadata; pictureTones=tones;
  const response=await fetch('/public/'+metadata.data.path,{cache:'no-store'});
  if(!response.ok) throw Error('Measured audio data could not load. Reload the preview.');
  const buffer=await response.arrayBuffer();
  const length=metadata.data.frameCount*metadata.data.bandCount;
  if(buffer.byteLength!==length*2) throw Error('Measured audio data is incomplete. Reload the preview.');
  const view=new DataView(buffer); featureValues=new Uint16Array(length);
  for(let index=0;index<length;index++) featureValues[index]=view.getUint16(index*2,true);
  cueSelect.replaceChildren(...cues.map(cue=>{
    const option=document.createElement('option'); option.value=String(cue.index);
    option.textContent=`${timeLabel(cue.words[0].start)} · ${cue.text}`; return option;
  }));
  dirty=true; refresh();
}

function pictureToneAt(time) {
  if(!pictureTones?.values?.length) return 'dark';
  const index=Math.max(0,Math.min(pictureTones.values.length-1,Math.floor(time*pictureTones.framesPerSecond)));
  return pictureTones.values[index]?.mode==='light' ? 'light':'dark';
}
function showCue(cue,time) {
  if(!cue) {
    if(activeCueId) reading.replaceChildren();
    reading.classList.add('empty'); activeCueId='';activeWordIndex=-2;wordNodes=[];
    return;
  }
  if(cue.id!==activeCueId) {
    reading.replaceChildren(); wordNodes=[];
    cue.words.forEach((word,index)=>{
      if(index) reading.append(document.createTextNode(' '));
      const span=document.createElement('span');
      span.className='word';span.textContent=word.text;span.dataset.wordId=word.id;
      if(word.text.toLowerCase().replace(/[^a-z]/g,'')==='change') {
        span.classList.add('change');span.dataset.ink=word.text;
      }
      reading.append(span);wordNodes.push(span);
    });
    reading.classList.remove('empty');activeCueId=cue.id;activeWordIndex=-2;cueSelect.value=String(cue.index);
  }
  const index=wordIndexAt(cue.words,time);
  if(index!==activeWordIndex) {
    wordNodes.forEach((node,i)=>node.classList.toggle('active',i===index));
    activeWordIndex=index;
  }
  wordNodes.forEach((node,i)=>{
    if(!node.classList.contains('change')) return;
    const word=cue.words[i];
    if(i===index){
      const progress=Math.max(0,Math.min(1,(time-word.start)/.21));
      node.style.setProperty('--ghost',String(.23*(1-progress)));
      node.style.setProperty('--ghost-x',`${(1-progress)*1.6}px`);
      node.style.setProperty('--ghost-y',`${(1-progress)*-.8}px`);
    }else{
      node.style.removeProperty('--ghost');node.style.removeProperty('--ghost-x');node.style.removeProperty('--ghost-y');
    }
  });
}

function paintBackdrop() {
  if(!stage.classList.contains('portrait') || video.readyState<2 || !video.videoWidth) return;
  try {
    const frameWidth=video.videoWidth,frameHeight=video.videoHeight;
    const targetRatio=backdrop.width/backdrop.height,sourceRatio=frameWidth/frameHeight;
    let sx=0,sy=0,sw=frameWidth,sh=frameHeight;
    if(sourceRatio>targetRatio){sw=frameHeight*targetRatio;sx=(frameWidth-sw)/2;}
    else{sh=frameWidth/targetRatio;sy=(frameHeight-sh)/2;}
    backdropContext.drawImage(video,sx,sy,sw,sh,0,0,backdrop.width,backdrop.height);
    backdropPaints++;clearError('backdrop');
  }catch(error){setError('backdrop','The background picture needs refreshing. The original video remains visible; choose Restore picture.');}
}
const framePump=createVideoFramePump(video,(now,metadata)=>{
  lastSourceMediaTime=metadata.mediaTime; paintBackdrop();
});
const pausedRefresh=createSettledFrameRefresh({
  requestFrame:callback=>requestAnimationFrame(callback),
  cancelFrame:handle=>cancelAnimationFrame(handle),
  draw:()=>{paintBackdrop();refresh();},
  canDraw:()=>video.paused&&!video.seeking&&!document.hidden,
});
function resize() {
  const ratio=Math.min(2,devicePixelRatio||1);
  const bounds=stage.getBoundingClientRect();
  const backdropScale=Math.min(1,640/Math.max(bounds.width,bounds.height));
  backdrop.width=Math.max(1,Math.round(bounds.width*backdropScale));
  backdrop.height=Math.max(1,Math.round(bounds.height*backdropScale));
  edgeSize={width:Math.max(1,edge.clientWidth),height:Math.max(1,edge.clientHeight)};
  edge.width=Math.max(1,Math.round(edgeSize.width*ratio));
  edge.height=Math.max(1,Math.round(edgeSize.height*ratio));
  paintBackdrop();dirty=true;refresh();
}
function paint(time) {
  const cue=cueAt(cues,time);
  stage.dataset.tone=pictureToneAt(time);
  showCue(cue,time);
  edgeContext.setTransform(edge.width/edgeSize.width,0,0,edge.height/edgeSize.height,0,0);
  if(inkEnabled&&featureMetadata&&featureValues){
    const db=spectrumAt(featureValues,featureMetadata,time);
    paintEdgeprint(edgeContext,edgeSize.width,edgeSize.height,db,stage.classList.contains('portrait')?'dark':stage.dataset.tone);
  }else edgeContext.clearRect(0,0,edgeSize.width,edgeSize.height);
  if(!seek.matches(':active')) seek.value=String(Math.min(duration,time));
  clock.textContent=`${timeLabel(time)} / ${timeLabel(duration)}`;
  stateOutput.value=JSON.stringify({time,format:stage.classList.contains('portrait')?'portrait':'original-4:3',sourceReadyState:video.readyState,sourceWidth:video.videoWidth,sourceHeight:video.videoHeight,sourcePaused:video.paused,sourceMediaTime:lastSourceMediaTime,backdropPaints,cue:cue?.id??null,word:cue?.words[activeWordIndex]?.id??null,tone:stage.dataset.tone,inkEnabled,errors});
}
function tick() {
  raf=null;
  if(video.seeking){dirty=true;return;}
  if(dirty||!video.paused){
    if(!video.paused&&!video.requestVideoFrameCallback)paintBackdrop();
    paint(video.currentTime||0);dirty=false;
  }
  if(!video.paused&&!video.ended) raf=requestAnimationFrame(tick);
}
function refresh() {dirty=true;if(raf===null) raf=requestAnimationFrame(tick);}
function setFormat(format) {
  const portrait=format==='portrait';stage.classList.toggle('portrait',portrait);
  $('#landscape').setAttribute('aria-pressed',String(!portrait));
  $('#portrait').setAttribute('aria-pressed',String(portrait));
  const url=new URL(location.href);url.searchParams.set('format',portrait?'portrait':'landscape');history.replaceState(null,'',url);
  requestAnimationFrame(()=>{resize();pausedRefresh.refresh();});
}
$('#ink').textContent=inkEnabled?'Edge print on':'Edge print off';
$('#ink').setAttribute('aria-pressed',String(inkEnabled));
function updateTransport() {
  playButton.textContent=video.paused?'▶ Play':'Ⅱ Pause';
  if(video.paused){framePump.stop();pausedRefresh.refresh();}
  else{pausedRefresh.cancel();framePump.start();}
  refresh();
}
playButton.addEventListener('click',async()=>{
  try{if(video.paused)await video.play();else video.pause();clearError('media');}
  catch(error){setError('media',`Playback could not start: ${error.message}. Try Restore picture.`);}
});
$('#restart').addEventListener('click',()=>{video.currentTime=0;refresh();});
seek.addEventListener('input',()=>{video.currentTime=Number(seek.value);refresh();});
$('#speed').addEventListener('change',event=>{video.playbackRate=Number(event.target.value);const url=new URL(location.href);url.searchParams.set('speed',event.target.value);history.replaceState(null,'',url);refresh();});
cueSelect.addEventListener('change',()=>{
  const cue=cues[Number(cueSelect.value)];
  if(cue){video.currentTime=Math.max(0,cue.displayStart+.01,cue.words[0].start-.12);refresh();}
});
$('#landscape').addEventListener('click',()=>setFormat('landscape'));
$('#portrait').addEventListener('click',()=>setFormat('portrait'));
$('#ink').addEventListener('click',()=>{
  inkEnabled=!inkEnabled;$('#ink').textContent=inkEnabled?'Edge print on':'Edge print off';
  $('#ink').setAttribute('aria-pressed',String(inkEnabled));
  const url=new URL(location.href);url.searchParams.set('ink',inkEnabled?'on':'off');history.replaceState(null,'',url);refresh();
});
$('#mute').addEventListener('click',()=>{video.muted=!video.muted;$('#mute').textContent=video.muted?'Sound off':'Sound on';$('#mute').setAttribute('aria-pressed',String(!video.muted));});
$('#recover').addEventListener('click',()=>{
  const time=video.currentTime,wasPlaying=!video.paused,speed=video.playbackRate,muted=video.muted;
  framePump.stop();pausedRefresh.cancel();video.pause();
  video.addEventListener('loadedmetadata',async()=>{
    video.currentTime=Math.min(Math.max(0,time),Math.max(0,video.duration-.05));video.playbackRate=speed;video.muted=muted;
    if(wasPlaying)try{await video.play();}catch(error){setError('media','Playback needs another tap after restoring the picture.');}
    paintBackdrop();refresh();
  },{once:true});
  video.load();
});
for(const type of ['play','pause','ended','seeked','loadeddata','ratechange']) video.addEventListener(type,updateTransport);
video.addEventListener('seeking',()=>{framePump.stop();pausedRefresh.cancel();refresh();});
video.addEventListener('error',()=>setError('media','The original video could not load. Check the local preview server, then choose Restore picture.'));
window.addEventListener('resize',resize);
document.addEventListener('visibilitychange',()=>{if(document.hidden){framePump.stop();pausedRefresh.cancel();}else{updateTransport();paintBackdrop();}});

if(params.get('format')==='portrait')setFormat('portrait');
let metadataInitialized=false;
function initializeMetadata(){
  if(metadataInitialized)return;
  metadataInitialized=true;
  video.pause();
  seek.max=String(video.duration||duration);
  const time=Number(params.get('t'));
  if(Number.isFinite(time)&&time>0)video.currentTime=Math.min(Math.max(0,time),Math.max(0,video.duration-.05));
  const speed=Number(params.get('speed'));if([.5,.75,1].includes(speed)){video.playbackRate=speed;$('#speed').value=String(speed);}
  resize();refresh();
}
video.addEventListener('loadedmetadata',initializeMetadata,{once:true});
if(video.readyState>=1)initializeMetadata();
resize();refresh();
loadData().catch(error=>setError('data',error.message));
