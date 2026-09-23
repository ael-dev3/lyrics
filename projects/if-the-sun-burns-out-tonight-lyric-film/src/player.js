import {createCues, cueAt, wordIndexAt, spectrumAt, createVideoFramePump, createSettledFrameRefresh} from './preview-core.js';
import {paintSpectrum} from './spectrum-view.js';
import {drawSunfire} from './sunfire.js';
import {validateFireDynamics, fireDynamicsAt} from './fire-dynamics.js';
import {isSunbeamWord, sunbeamPresence, drawSunbeam} from './sunbeam.js';
import {frostState, drawFrost} from './frost.js';
import {darknessState, drawDarkness} from './darkness.js';
import {damageState, drawDamage} from './damage.js';

const $ = selector => document.querySelector(selector);
const stage = $('#stage'), video = $('#source'), reading = $('#reading'), shade = $('.shade');
const backdrop = $('#backdrop'), picture = $('#picture'), spectrum = $('#spectrum');
const backgroundContext = backdrop.getContext('2d', {alpha:false});
const pictureContext = picture.getContext('2d');
const spectrumContext = spectrum.getContext('2d');
const sunfire = $('#sunfire'), fireContext = sunfire.getContext('2d');
let fireEnabled = new URLSearchParams(location.search).get('fire') !== 'off';
let fireCueId = '', fireAnchors = [], firePhrase = null;
let fireBounds={x:0,y:0,width:1,height:1};
let fireDynamics=null, currentFire={drive:0,rate:.45,phase:0};
const sunbeam=$('#sunbeam'),beamContext=sunbeam.getContext('2d');
let beamWordId='',beamAnchor=null,beamNode=null,beamPresence=0;
const frost=$('#frost'),frostContext=frost.getContext('2d');
let frostWordId='',frostAnchors=[],frostNode=null,currentFrost={presence:0,spread:0};
let frostBounds={width:1,height:1};
let supernovaNode=null,supernovaPresence=0;
const darkness=$('#darkness'),darknessContext=darkness.getContext('2d');
let darknessNode=null,darknessWordId='',darknessBounds=null,currentDarkness={presence:0,progress:0};
const damage=$('#damage'),damageContext=damage.getContext('2d');
let damageNode=null,damageWordId='',damageBounds=null,currentDamage={presence:0,impact:0,fracture:0,progress:0};
const seek = $('#seek'), clock = $('#clock'), cueSelect = $('#cue'), playButton = $('#play');
const stateOutput = $('#preview-state');
let timeline, cues = [], featureMetadata = null, featureValues = null;
let displayedCueId = '', previousWordIndex = -2, wordNodes = [];
let stageSize = {width:1,height:1}, spectrumSize = {width:1,height:1};
let dirty = true, lastFallbackTime = -1, lastFallbackWallTime = -1, lastTelemetry = 0;
let restoreState = null, resumeAfterSeek = false;
const errors = {media:null,data:null};
const diagnostics = {sourcePresentedFrames:null, lastFrameTime:null, maxFrameCallbackDelayMs:0, paintedFrames:0, pictureError:null};
const seconds = value => {
  const n = Math.max(0, Number(value) || 0);
  return Math.floor(n / 60) + ':' + String(Math.floor(n % 60)).padStart(2, '0');
};
function updateError() { $('#error').textContent = Object.values(errors).filter(Boolean).join(' '); $('#error').classList.toggle('show',Boolean($('#error').textContent)); }
function announceError(message,kind='media') { errors[kind]=message;updateError(); }
function clearError(kind='media') { errors[kind]=null;updateError(); }

async function loadData() {
  const response = await fetch('/src/timeline.json');
  if (!response.ok) throw new Error('Lyric timing could not be loaded. Reload the preview.');
  timeline = await response.json();
  cues = createCues(timeline);
  cueSelect.replaceChildren(...cues.map(cue => {
    const option = document.createElement('option');
    option.value = String(cue.index);
    option.textContent = seconds(cue.start) + ' · ' + cue.text;
    return option;
  }));
  const metadataResponse = await fetch('/public/audio-features.json');
  if (!metadataResponse.ok) throw new Error('The audio visualizer data could not be loaded. Reload the preview.');
  featureMetadata = await metadataResponse.json();
  const featureResponse = await fetch('/public/' + featureMetadata.data.path);
  if (!featureResponse.ok) throw new Error('The audio visualizer data could not be loaded. Reload the preview.');
  const bytes = await featureResponse.arrayBuffer();
  const expected = featureMetadata.data.frameCount * featureMetadata.data.bandCount;
  if (bytes.byteLength !== expected * 2) throw new Error('The visualizer data is incomplete. Reload the preview.');
  const view = new DataView(bytes);
  featureValues = new Uint16Array(expected);
  for (let index = 0; index < expected; index++) featureValues[index] = view.getUint16(index * 2, true);
  dirty = true;
}

async function loadFireDynamics() {
  const response=await fetch('/public/fire-dynamics.json');
  if(!response.ok) throw new Error('Audio-reactive fire could not be loaded. Reload the preview.');
  const data=await response.json();
  if(!validateFireDynamics(data)) throw new Error('Audio-reactive fire data is incomplete. Reload the preview.');
  fireDynamics=data;dirty=true;
}

function showCue(cue, time) {
  if (!cue) {
    if (displayedCueId) reading.replaceChildren();
    reading.classList.add('empty');
    displayedCueId = ''; wordNodes = []; previousWordIndex = -2;
    fireCueId = ''; fireAnchors = []; firePhrase = null;
    return;
  }
  if (cue.id !== displayedCueId) {
    reading.replaceChildren(); reading.classList.remove('sunfire-wrap'); wordNodes = [];
    cue.words.forEach((word, index) => {
      if (index) reading.append(document.createTextNode(' '));
      const node = document.createElement('span');
      node.className = 'word'; node.textContent = word.text; node.dataset.wordId = word.id;
      reading.append(node); wordNodes.push(node);
    });
    reading.classList.remove('empty'); displayedCueId = cue.id; previousWordIndex = -2; fireCueId='';
    cueSelect.value = String(cue.index);
  }
  const active = wordIndexAt(cue.words, time);
  if (active !== previousWordIndex) {
    wordNodes.forEach((node, index) => node.classList.toggle('active', index === active));
    previousWordIndex = active;
  }
}

function resizeScene() {
  const bounds = stage.getBoundingClientRect();
  stageSize = {width:Math.max(1,bounds.width), height:Math.max(1,bounds.height)};
  const pixelRatio = Math.min(1.5, window.devicePixelRatio || 1);
  picture.width = Math.round(stageSize.width * pixelRatio);
  picture.height = Math.round(stageSize.height * pixelRatio);
  fireCueId='';
  beamWordId='';beamAnchor=null;
  frostWordId='';frostAnchors=[];
  darknessWordId='';darknessBounds=null;
  damageWordId='';damageBounds=null;
  sunbeam.width=Math.round(stageSize.width*pixelRatio);sunbeam.height=Math.round(stageSize.height*pixelRatio);
  const backgroundScale = Math.min(1, 640 / Math.max(stageSize.width,stageSize.height));
  backdrop.width = Math.max(1,Math.round(stageSize.width * backgroundScale));
  backdrop.height = Math.max(1,Math.round(stageSize.height * backgroundScale));
  spectrumSize = {width:spectrum.clientWidth,height:spectrum.clientHeight};
  spectrum.width = Math.max(1,Math.round(spectrumSize.width * pixelRatio));
  spectrum.height = Math.max(1,Math.round(spectrumSize.height * pixelRatio));
  drawPicture(); dirty = true;
}

function drawPicture() {
  if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;
  try {
    const ratio = video.videoWidth / video.videoHeight;
    const backgroundRatio = backdrop.width / backdrop.height;
    let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;
    if (ratio > backgroundRatio) {sw = sh * backgroundRatio; sx = (video.videoWidth-sw)/2;}
    else {sh = sw/backgroundRatio; sy = (video.videoHeight-sh)/2;}
    backgroundContext.drawImage(video,sx,sy,sw,sh,0,0,backdrop.width,backdrop.height);
    pictureContext.clearRect(0,0,picture.width,picture.height);
    const top = stage.classList.contains('portrait') ? picture.height*.17 : 0;
    pictureContext.drawImage(video,0,top,picture.width,picture.width/ratio);
    diagnostics.paintedFrames++;
    diagnostics.pictureError = null;
  } catch (error) {
    diagnostics.pictureError = error.message;
    announceError('The picture needs to be refreshed. Choose Restore picture below.');
  }
}

const framePump = createVideoFramePump(video, (now, metadata) => {
  diagnostics.sourcePresentedFrames = metadata.presentedFrames ?? null;
  diagnostics.lastFrameTime = metadata.mediaTime;
  diagnostics.maxFrameCallbackDelayMs = Math.max(diagnostics.maxFrameCallbackDelayMs,now-metadata.expectedDisplayTime);
  drawPicture();
});
const pausedPictureRefresh = createSettledFrameRefresh({
  requestFrame: callback => requestAnimationFrame(callback),
  cancelFrame: handle => cancelAnimationFrame(handle),
  draw: drawPicture,
  canDraw: () => video.paused && !video.seeking && !document.hidden,
});

function drawSpectrum(time) {
  const {width,height} = spectrumSize;
  if (!width || !height) return;
  spectrumContext.setTransform(spectrum.width/width,0,0,spectrum.height/height,0,0);
  spectrumContext.clearRect(0,0,width,height);
  if (!featureValues || !featureMetadata) return;
  const db = spectrumAt(featureValues,featureMetadata,time);
  paintSpectrum(spectrumContext,width,height,db);
  return db;
}

function prepareFire(cue) {
  fireCueId=cue.id;fireAnchors=[];firePhrase=null;
  const tokens=cue.words.map(word=>word.text.toLowerCase().replace(/[^a-z]/g,''));
  const first=tokens.findIndex((word,index)=>word==='sun' && /^(burns|burnt)$/.test(tokens[index+1]) && tokens[index+2]==='out' && tokens[index+3]==='tonight');
  if (first<0) return;
  reading.classList.remove('sunfire-wrap');
  const readingFont=parseFloat(getComputedStyle(reading).fontSize);
  if(stage.classList.contains('portrait') && reading.getBoundingClientRect().height>readingFont*1.5) reading.classList.add('sunfire-wrap');
  firePhrase={start:cue.words[first].start,end:Math.min(cue.displayEnd,cue.words[first+3].end+.18),first};
  const stageBounds=stage.getBoundingClientRect();
  const wordBoxes=wordNodes.map(node=>node.getBoundingClientRect());
  for(let index=first;index<first+4;index++) {
    const node=wordNodes[index], text=node.firstChild, fontSize=parseFloat(getComputedStyle(node).fontSize);
    const role=index===first+1?'burns':tokens[index];
    for(let letter=0;letter<text.textContent.length;letter++) {
      const character=text.textContent[letter];
      if(!/[a-z]/i.test(character)) continue;
      const range=document.createRange();range.setStart(text,letter);range.setEnd(text,letter+1);
      const bounds=range.getBoundingClientRect();
      const top=/[bdfhkltA-Z]/.test(character) ? .20 : .39;
      const previousRows=wordBoxes.filter(box=>box.top<bounds.top-3);
      const glyphY=bounds.top-stageBounds.top+fontSize*top;
      const previousBottom=previousRows.length ? Math.max(...previousRows.map(box=>box.bottom-stageBounds.top)) : -Infinity;
      const maxRise=Math.min(fontSize*1.9,Math.max(0,glyphY-previousBottom-fontSize*.08));
      let seed=letter+1;for(const code of cue.words[index].id) seed=(seed*31+code.charCodeAt(0))>>>0;
      fireAnchors.push({x:bounds.left-stageBounds.left+bounds.width*.5,y:glyphY,width:bounds.width,fontSize,maxRise,seed,wordStart:cue.words[index].start,wordEnd:cue.words[index].end,role});
    }
  }
  const left=Math.max(0,Math.floor(Math.min(...fireAnchors.map(anchor=>anchor.x-anchor.width*.5-anchor.fontSize*.9))));
  const top=Math.max(0,Math.floor(Math.min(...fireAnchors.map(anchor=>anchor.y-Math.min(anchor.maxRise,anchor.fontSize*1.9)-anchor.fontSize*.12))));
  const right=Math.min(stageSize.width,Math.ceil(Math.max(...fireAnchors.map(anchor=>anchor.x+anchor.width*.5+anchor.fontSize*.9))));
  const bottom=Math.min(stageSize.height,Math.ceil(Math.max(...fireAnchors.map(anchor=>anchor.y+anchor.fontSize*.25))));
  fireBounds={x:left,y:top,width:Math.max(1,right-left),height:Math.max(1,bottom-top)};
  fireAnchors=fireAnchors.map(anchor=>({...anchor,x:anchor.x-left,y:anchor.y-top}));
  Object.assign(sunfire.style,{left:left+'px',top:top+'px',width:fireBounds.width+'px',height:fireBounds.height+'px'});
  const pixelRatio=Math.min(1.5,window.devicePixelRatio||1);
  sunfire.width=Math.round(fireBounds.width*pixelRatio);sunfire.height=Math.round(fireBounds.height*pixelRatio);
}

function paintFire(cue,time) {
  if(cue && fireCueId!==cue.id) prepareFire(cue);
  const {width,height}=fireBounds;
  fireContext.setTransform(sunfire.width/width,0,0,sunfire.height/height,0,0);
  fireContext.clearRect(0,0,width,height);
  const smooth=value=>{const x=Math.max(0,Math.min(1,value));return x*x*(3-2*x);};
  const presence=fireEnabled && firePhrase ? smooth((time-firePhrase.start)/.12)*smooth((firePhrase.end-time)/.20) : 0;
  currentFire=fireDynamicsAt(fireDynamics,time);
  const power=presence*currentFire.drive;
  wordNodes.forEach((node,index)=>{
    const eligible=power>0 && firePhrase && index>=firePhrase.first && index<firePhrase.first+4;
    node.classList.toggle('sunfire-lit',Boolean(eligible));
    if(eligible) node.style.setProperty('--fire-glow',String(presence*(.15+.85*Math.sqrt(currentFire.drive))*(index===previousWordIndex ? .85 : .12)));
    else node.style.removeProperty('--fire-glow');
  });
  if(power>0) drawSunfire(fireContext,width,height,fireAnchors,time,currentFire.drive,{phase:currentFire.phase,presence});
}

function updateFireButton() {
  $('#fire-toggle').setAttribute('aria-pressed',String(fireEnabled));
  $('#fire-toggle').textContent=fireEnabled?'Sunfire on':'Sunfire off';
}
updateFireButton();
$('#fire-toggle').addEventListener('click',()=>{
  fireEnabled=!fireEnabled;updateFireButton();dirty=true;
  const url=new URL(location.href);url.searchParams.set('fire',fireEnabled?'on':'off');history.replaceState(null,'',url);
});

function paintSunbeam(cue,time) {
  const word=cue?.words[previousWordIndex];
  const matches=isSunbeamWord(cue?.words,previousWordIndex);
  beamPresence=matches ? sunbeamPresence(time,word) : 0;
  if(beamNode) {beamNode.classList.remove('sunbeam-lit');beamNode.style.removeProperty('--beam-glow');}
  if(!beamPresence) {sunbeam.hidden=true;beamNode=null;return;}
  beamNode=wordNodes[previousWordIndex];
  if(beamWordId!==word.id || !beamAnchor) {
    const box=beamNode.getBoundingClientRect(),stageBox=stage.getBoundingClientRect();
    beamAnchor={x:box.left-stageBox.left+box.width*.5,y:box.top-stageBox.top+box.height*.48,wordWidth:box.width,fontSize:parseFloat(getComputedStyle(beamNode).fontSize)};
    beamWordId=word.id;
  }
  const {width,height}=stageSize;
  beamContext.setTransform(sunbeam.width/width,0,0,sunbeam.height/height,0,0);
  beamContext.clearRect(0,0,width,height);sunbeam.hidden=false;
  drawSunbeam(beamContext,width,height,beamAnchor,beamPresence,(time-word.start)/(word.end-word.start));
  beamNode.classList.add('sunbeam-lit');beamNode.style.setProperty('--beam-glow',String(beamPresence*.32));
}

function paintFrost(cue,time) {
  const word=cue?.words[previousWordIndex];
  const matches=word && /^(colder|freezing)$/.test(word.text.toLowerCase().replace(/[^a-z]/g,''));
  currentFrost=matches ? frostState(time,word) : {presence:0,spread:0};
  const nextNode=currentFrost.presence ? wordNodes[previousWordIndex] : null;
  if(frostNode && frostNode!==nextNode) {
    frostNode.classList.remove('frost-lit');
    for(const name of ['--frost-ice','--frost-front','--frost-glow']) frostNode.style.removeProperty(name);
  }
  frostNode=nextNode;
  if(!frostNode) {frost.hidden=true;return;}
  if(frostWordId!==word.id || !frostAnchors.length) {
    const box=frostNode.getBoundingClientRect(),stageBox=stage.getBoundingClientRect();
    const fontSize=parseFloat(getComputedStyle(frostNode).fontSize),padding=fontSize*.3;
    const left=box.left-stageBox.left-padding,top=box.top-stageBox.top-padding;
    frostBounds={width:box.width+2*padding,height:box.height+2*padding};
    frostAnchors=[];
    const text=frostNode.firstChild;
    for(let letter=0;letter<text.length;letter++) {
      const range=document.createRange();range.setStart(text,letter);range.setEnd(text,letter+1);
      const glyph=range.getBoundingClientRect(),ascender=/[bdfhkltA-Z]/.test(text.textContent[letter]);
      frostAnchors.push({x:glyph.left-stageBox.left-left+glyph.width*.53,y:glyph.top-stageBox.top-top+fontSize*(ascender?.20:.39),fontSize});
    }
    Object.assign(frost.style,{left:left+'px',top:top+'px',width:frostBounds.width+'px',height:frostBounds.height+'px'});
    const ratio=Math.min(1.5,window.devicePixelRatio||1);
    frost.width=Math.round(frostBounds.width*ratio);frost.height=Math.round(frostBounds.height*ratio);
    frostWordId=word.id;
  }
  const {presence,spread}=currentFrost,{width,height}=frostBounds;
  frostContext.setTransform(frost.width/width,0,0,frost.height/height,0,0);
  frostContext.clearRect(0,0,width,height);frost.hidden=false;
  drawFrost(frostContext,frostAnchors,presence,spread);
  const warm=[255,218,133],ice=[180,225,246];
  frostNode.style.setProperty('--frost-ice','rgb('+warm.map((value,index)=>Math.round(value+(ice[index]-value)*presence)).join(',')+')');
  frostNode.style.setProperty('--frost-front',(spread*118-18)+'%');
  frostNode.style.setProperty('--frost-glow',String(presence*.26));
  frostNode.classList.add('frost-lit');
}

function updatePlaybackUi() {
  const time = Number.isFinite(video.currentTime) ? video.currentTime : 0;
  seek.value = String(time); clock.textContent = seconds(time) + ' / ' + seconds(video.duration);
  const smooth = value => {const x=Math.max(0,Math.min(1,value));return x*x*(3-2*x);};
  const firstWord = cues[0]?.words[0], lastWord = cues.at(-1)?.words.at(-1);
  const presence = firstWord && lastWord ? smooth((time-firstWord.start+.8)/.6)*smooth((lastWord.end+.8-time)/.6) : 0;
  shade.style.opacity=String(presence);spectrum.style.opacity=String(presence);
  const cue=cueAt(cues,time);showCue(cue,time);drawSpectrum(time);paintFire(cue,time);paintSunbeam(cue,time);paintFrost(cue,time);paintSupernova(cue,time);paintDarkness(cue,time);paintDamage(cue,time);
}

function paintSupernova(cue,time) {
  const word=cue?.words[previousWordIndex];
  const matches=word && /^(supernova|void)$/.test(word.text.toLowerCase().replace(/[^a-z]/g,''));
  const smooth=value=>{const x=Math.max(0,Math.min(1,value));return x*x*(3-2*x);};
  supernovaPresence=matches ? smooth((time-word.start)/.18)*smooth((word.end-time)/.28) : 0;
  const nextNode=supernovaPresence ? wordNodes[previousWordIndex] : null;
  if(supernovaNode && supernovaNode!==nextNode) {
    supernovaNode.classList.remove('supernova-lit');
    supernovaNode.style.removeProperty('--nova-inner');supernovaNode.style.removeProperty('--nova-outer');
  }
  supernovaNode=nextNode;
  if(!supernovaNode) return;
  // A steady, soft halo follows the source word clock; no pulses or glyph motion.
  supernovaNode.classList.add('supernova-lit');
  supernovaNode.style.setProperty('--nova-inner',String(supernovaPresence*.52));
  supernovaNode.style.setProperty('--nova-outer',String(supernovaPresence*.3));
}

function paintDarkness(cue,time) {
  const word=cue?.words[previousWordIndex];
  const matches=word && /^(darkness|void)$/.test(word.text.toLowerCase().replace(/[^a-z]/g,''));
  currentDarkness=matches ? darknessState(time,word) : {presence:0,progress:0};
  const nextNode=currentDarkness.presence ? wordNodes[previousWordIndex] : null;
  if(darknessNode && darknessNode!==nextNode) {
    darknessNode.classList.remove('darkness-lit');
    for(const name of ['--dark-x','--dark-y','--dark-alpha']) darknessNode.style.removeProperty(name);
  }
  darknessNode=nextNode;
  if(!darknessNode) {darkness.hidden=true;return;}
  if(darknessWordId!==word.id || !darknessBounds) {
    const box=darknessNode.getBoundingClientRect(),stageBox=stage.getBoundingClientRect();
    const fontSize=parseFloat(getComputedStyle(darknessNode).fontSize);
    darknessBounds={width:box.width+fontSize*1.4,height:box.height+fontSize*1.1,fontSize,wordWidth:box.width};
    Object.assign(darkness.style,{left:(box.left-stageBox.left-fontSize*.7)+'px',top:(box.top-stageBox.top-fontSize*.55)+'px',width:darknessBounds.width+'px',height:darknessBounds.height+'px'});
    const ratio=Math.min(1.5,window.devicePixelRatio||1);
    darkness.width=Math.round(darknessBounds.width*ratio);darkness.height=Math.round(darknessBounds.height*ratio);
    darknessWordId=word.id;
  }
  const {width,height,fontSize,wordWidth}=darknessBounds,{presence,progress}=currentDarkness;
  darknessContext.setTransform(darkness.width/width,0,0,darkness.height/height,0,0);
  darknessContext.clearRect(0,0,width,height);darkness.hidden=false;
  drawDarkness(darknessContext,width,height,fontSize,wordWidth,presence,progress);
  darknessNode.classList.add('darkness-lit');
  darknessNode.style.setProperty('--dark-x',(Math.sin(progress*Math.PI*1.25)*.17)+'em');
  darknessNode.style.setProperty('--dark-y',(-.09+Math.cos(progress*Math.PI)*.08)+'em');
  darknessNode.style.setProperty('--dark-alpha',String(presence*.75));
}

function paintDamage(cue,time) {
  const word=cue?.words[previousWordIndex];
  currentDamage=damageState(time,word);
  const nextNode=currentDamage.presence ? wordNodes[previousWordIndex] : null;
  if(damageNode && damageNode!==nextNode) {
    damageNode.classList.remove('damage-lit');
    damageNode.style.removeProperty('--damage-cut');damageNode.style.removeProperty('--damage-glow');
  }
  damageNode=nextNode;
  if(!damageNode) {damage.hidden=true;return;}
  if(damageWordId!==word.id || !damageBounds) {
    const box=damageNode.getBoundingClientRect(),stageBox=stage.getBoundingClientRect();
    const fontSize=parseFloat(getComputedStyle(damageNode).fontSize),padding=fontSize*.45;
    damageBounds={width:box.width+padding*2,height:box.height+padding*2,fontSize,wordWidth:box.width};
    Object.assign(damage.style,{left:(box.left-stageBox.left-padding)+'px',top:(box.top-stageBox.top-padding)+'px',width:damageBounds.width+'px',height:damageBounds.height+'px'});
    const ratio=Math.min(1.5,window.devicePixelRatio||1);
    damage.width=Math.round(damageBounds.width*ratio);damage.height=Math.round(damageBounds.height*ratio);
    damageWordId=word.id;
  }
  const {width,height,fontSize,wordWidth}=damageBounds;
  damageContext.setTransform(damage.width/width,0,0,damage.height/height,0,0);
  damageContext.clearRect(0,0,width,height);damage.hidden=false;
  drawDamage(damageContext,width,height,fontSize,wordWidth,currentDamage);
  damageNode.classList.add('damage-lit');
  damageNode.style.setProperty('--damage-cut',String(currentDamage.fracture*.62));
  damageNode.style.setProperty('--damage-glow',String(currentDamage.impact*.24));
}

function setFormat(format) {
  const portrait = format === 'portrait';
  stage.classList.toggle('portrait',portrait);
  $('#portrait').setAttribute('aria-pressed',String(portrait));
  $('#landscape').setAttribute('aria-pressed',String(!portrait));
  const url = new URL(location.href); url.searchParams.set('format',portrait?'portrait':'landscape');
  history.replaceState(null,'',url); resizeScene();
}
$('#landscape').addEventListener('click',()=>setFormat('landscape'));
$('#portrait').addEventListener('click',()=>setFormat('portrait'));
setFormat(new URLSearchParams(location.search).get('format') === 'portrait' ? 'portrait' : 'landscape');

function initialiseMedia() {
  if (video.readyState < 1) return;
  pausedPictureRefresh.cancel();
  video.pause();
  seek.max = String(video.duration || timeline?.duration || 234.266122);
  const rawRequested = restoreState?.time ?? Number(new URLSearchParams(location.search).get('t') || 0);
  const requested = Number.isFinite(rawRequested) ? rawRequested : 0;
  const requestedSpeed = restoreState?.rate ?? Number(new URLSearchParams(location.search).get('speed') || 1);
  video.playbackRate=[.5,.75,1].includes(requestedSpeed) ? requestedSpeed : 1;
  $('#speed').value=String(video.playbackRate);
  if (restoreState) {resumeAfterSeek=restoreState.playing; restoreState=null;}
  video.currentTime = Math.min(video.duration,Math.max(0,requested));
  dirty = true; drawPicture();
}
async function play() {
  try { await video.play(); clearError(); }
  catch (error) { announceError('Playback could not start. Try Play again. ' + error.message); }
}
playButton.addEventListener('click',()=>video.paused ? play() : video.pause());
video.addEventListener('play',()=>{pausedPictureRefresh.cancel();playButton.textContent='❚❚ Pause';framePump.start();dirty=true;});
video.addEventListener('pause',()=>{playButton.textContent='▶ Play';framePump.stop();pausedPictureRefresh.refresh();dirty=true;});
video.addEventListener('ended',()=>{framePump.stop();pausedPictureRefresh.refresh();dirty=true;});
video.addEventListener('seeking',()=>{pausedPictureRefresh.cancel();framePump.stop();dirty=true;});
video.addEventListener('seeked',()=>{
  if (video.paused) pausedPictureRefresh.refresh(); else drawPicture();
  dirty=true;framePump.start();
  if (resumeAfterSeek) {resumeAfterSeek=false;play();}
});
video.addEventListener('loadedmetadata',initialiseMedia);
video.addEventListener('loadeddata',()=>{drawPicture();dirty=true;clearError();});
video.addEventListener('error',()=>announceError('The source video could not be loaded. Choose Restore picture to retry.'));
seek.addEventListener('input',()=>{video.currentTime=Number(seek.value);dirty=true;updatePlaybackUi();});
$('#speed').addEventListener('change',event=>{
  video.playbackRate=Number(event.target.value);
  const url=new URL(location.href);url.searchParams.set('speed',String(video.playbackRate));
  history.replaceState(null,'',url);
});
$('#mute').addEventListener('click',()=>{
  video.muted=!video.muted;$('#mute').textContent=video.muted?'Sound off':'Sound on';
  $('#mute').setAttribute('aria-pressed',String(video.muted));
});
$('#restart').addEventListener('click',()=>{video.currentTime=0;dirty=true;});
cueSelect.addEventListener('change',()=>{
  const cue = cues[Number(cueSelect.value)];
  if (cue) {video.currentTime=cue.displayStart+.001;dirty=true;}
});
$('#recover').addEventListener('click',()=>{
  restoreState={time:video.currentTime,rate:video.playbackRate,playing:!video.paused};
  framePump.stop();video.pause();pausedPictureRefresh.cancel();video.load();
});
window.addEventListener('resize',resizeScene);
if (typeof ResizeObserver === 'function') new ResizeObserver(resizeScene).observe(stage);
document.addEventListener('visibilitychange',()=>{
  if (document.hidden) {pausedPictureRefresh.cancel();framePump.stop();}
  else {if (video.paused) pausedPictureRefresh.refresh(); else drawPicture();framePump.start();dirty=true;}
});
window.addEventListener('pagehide',()=>{pausedPictureRefresh.cancel();framePump.stop();});
window.addEventListener('pageshow',()=>{
  if (document.hidden) return;
  if (video.paused) pausedPictureRefresh.refresh(); else drawPicture();
  framePump.start();dirty=true;
});
window.addEventListener('keydown',event=>{
  if (/INPUT|SELECT|TEXTAREA|BUTTON/.test(document.activeElement?.tagName||'')) return;
  if (event.code==='Space') {event.preventDefault();playButton.click();}
  if (event.key==='ArrowLeft') video.currentTime=Math.max(0,video.currentTime-3);
  if (event.key==='ArrowRight') video.currentTime=Math.min(video.duration||0,video.currentTime+3);
});

function animate(now) {
  if (!video.paused || dirty) {
    updatePlaybackUi();dirty=false;
    if (!video.requestVideoFrameCallback && video.currentTime !== lastFallbackTime && now-lastFallbackWallTime>=1000/24) {
      drawPicture();lastFallbackTime=video.currentTime;lastFallbackWallTime=now;
    }
  }
  if (now-lastTelemetry>=250) {
    const quality=video.getVideoPlaybackQuality?.();
    const canvasFrames=framePump.metrics();
    stateOutput.textContent=JSON.stringify({
      revision:timeline?.revision,visualRevision:'word-atmosphere-v5',time:video.currentTime,paused:video.paused,seeking:video.seeking,
      sunbeamWord:beamNode?.dataset.wordId??null,sunbeamPresence:beamPresence,
      frostWord:frostNode?.dataset.wordId??null,frostPresence:currentFrost.presence,frostSpread:currentFrost.spread,
      supernovaWord:supernovaNode?.dataset.wordId??null,supernovaPresence,
      darknessWord:darknessNode?.dataset.wordId??null,darknessPresence:currentDarkness.presence,
      damageWord:damageNode?.dataset.wordId??null,damagePresence:currentDamage.presence,damageFracture:currentDamage.fracture,
      sunfireEnabled:fireEnabled,sunfireAnchorCount:fireAnchors.length,
      fireDynamicsLoaded:Boolean(fireDynamics),fireDrive:currentFire.drive,fireRate:currentFire.rate,firePhase:currentFire.phase,
      fireVocalDbfs:currentFire.vocalDbfs,fireMixDbfs:currentFire.mixDbfs,
      readyState:video.readyState,activeWord:wordNodes[previousWordIndex]?.dataset.wordId??null,
      format:stage.classList.contains('portrait')?'portrait':'landscape',spectrumLoaded:Boolean(featureValues),
      frameCallbackPending:framePump.pending(),pausedPictureRefreshPending:pausedPictureRefresh.pending(),
      nativeTotalVideoFrames:quality?.totalVideoFrames,nativeDroppedVideoFrames:quality?.droppedVideoFrames,
      canvasFrameCallbacks:canvasFrames.callbackCount,canvasSkippedSourceFrames:canvasFrames.skippedSourceFrames,
      canvasMaximumFrameGap:canvasFrames.maximumFrameGap,transportGeneration:canvasFrames.generation,
      ...diagnostics
    });
    lastTelemetry=now;
  }
  requestAnimationFrame(animate);
}
loadData().then(()=>{dirty=true;clearError('data');}).catch(error=>announceError(error.message,'data'));
loadFireDynamics().then(()=>clearError('fire')).catch(error=>announceError(error.message,'fire'));
initialiseMedia();resizeScene();requestAnimationFrame(animate);
