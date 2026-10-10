import {loadScene, paintScene, getLines, getReadingCue, getReadingCues, getSceneIdentity, cueOpacity, setEffectsEnabled, getEffectsEnabled, type Format} from './scene.ts';
import {sourceActive,targetActive} from './model.ts';

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing preview element: ${id}`);
  return found as T;
}

// One source video supplies sound and decoded frames. Words and visual response
// share its source clock. Native picture PTS and finer audio-word time stay separate.
const video = element<HTMLVideoElement>('soundtrack');
const canvas = element<HTMLCanvasElement>('film');
const context = canvas.getContext('2d');
if (!context) throw new Error('This browser cannot create the film canvas.');
const ctx: CanvasRenderingContext2D = context;
const stage = element<HTMLElement>('stage');
const loading = element<HTMLOutputElement>('loading');
const play = element<HTMLButtonElement>('play');
const still = element<HTMLButtonElement>('download-still');
const seek = element<HTMLInputElement>('seek');
const seconds = element<HTMLInputElement>('seconds');
const speed = element<HTMLSelectElement>('speed');
const cue = element<HTMLSelectElement>('cue');
const clock = element<HTMLOutputElement>('clock');
const currentCue = element<HTMLOutputElement>('current-cue');
const status = element<HTMLOutputElement>('status');
const error = element<HTMLElement>('error');
const referenceDialog = element<HTMLDialogElement>('reference-dialog');
const reference = element<HTMLVideoElement>('reference-video');
const query = new URLSearchParams(location.search);
setEffectsEnabled(query.get('effects') !== 'off');
const hasFrameCallback = typeof video.requestVideoFrameCallback === 'function';
let format: Format = query.get('format') === 'portrait' ? 'portrait' : 'landscape';
let sceneReady = false;
let metadataReady = false;
let paintFailed = false;
let mediaFailed = false;
let decodedFrameTime: number | null = null;
let pendingSeekTarget: number | null = null;
let lastPaintTime = -1;
let lastCueId: string | null | undefined;
let referencePlayPending = false;
let referencePlaybackBlocked = false;
let frameCallbackId: number | null = null;

const queryNumber = (key: string, fallback: number): number => {
  const value = Number(query.get(key) ?? fallback);
  return Number.isFinite(value) ? value : fallback;
};
const requestedTime = Math.max(0, queryNumber('t', 0));
const requestedSpeed = queryNumber('speed', 1);
video.playbackRate = [1, 0.75, 0.5].includes(requestedSpeed) ? requestedSpeed : 1;
speed.value = String(video.playbackRate);

function duration(): number {return Number.isFinite(video.duration) ? video.duration : 0;}
function boundedTime(value: number): number {return Math.min(duration(), Math.max(0, Number.isFinite(value) ? value : 0));}
function readableTime(value: number): string {
  const whole = Math.floor(Math.max(0, value));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}
function report(message: string): void {error.textContent = message; error.hidden = false;}
function clearReport(): void {
  if (paintFailed || mediaFailed) return;
  error.textContent = ''; error.hidden = true;
}
function setBusy(message: string | null): void {
  stage.classList.toggle('busy', message !== null);
  stage.setAttribute('aria-busy', String(message !== null));
  loading.value = message ?? '';
  loading.hidden = message === null;
  still.disabled = message !== null || lastPaintTime < 0 || paintFailed;
}
function updateUrl(): void {
  const url = new URL(location.href);
  url.searchParams.set('t', video.currentTime.toFixed(3));
  url.searchParams.set('format', format);
  url.searchParams.set('speed', String(video.playbackRate));
  url.searchParams.set('effects', getEffectsEnabled() ? 'on' : 'off');
  url.searchParams.delete('playing');
  history.replaceState(null, '', url);
}
function updatePlaybackState(): void {
  play.textContent = video.paused ? (video.ended ? 'Replay' : 'Play') : 'Pause';
  play.setAttribute('aria-label', video.paused ? 'Play original video with lyrics' : 'Pause original video with lyrics');
  play.setAttribute('aria-pressed', String(!video.paused));
  status.value = paintFailed || mediaFailed ? 'Preview unavailable' : !sceneReady ? 'Loading lyric scene…' : !metadataReady ? 'Loading original video…' : video.seeking || pendingSeekTarget !== null ? 'Seeking original video…' : decodedFrameTime === null ? 'Decoding original picture…' : video.ended ? 'End of preview' : video.paused ? 'Paused' : 'Playing';
  play.disabled = !sceneReady || !metadataReady || paintFailed || mediaFailed;
}
function synchronizeReference(): void {
  if (!referenceDialog.open || reference.readyState < 1) return;
  reference.muted = true;
  reference.playbackRate = video.playbackRate;
  const target = Math.min(video.currentTime, Math.max(0, reference.duration - 0.001));
  if (Number.isFinite(target) && Math.abs(reference.currentTime - target) > 0.08) reference.currentTime = target;
  if (video.paused || video.ended) {
    if (!reference.paused) reference.pause();
  } else if (reference.paused && !referencePlayPending && !referencePlaybackBlocked && !reference.ended) {
    referencePlayPending = true;
    void reference.play().catch(() => {
      referencePlaybackBlocked = true;
      element<HTMLElement>('reference-status').textContent = 'Reference playback was blocked. Close this panel, press Play, then reopen it.';
    }).finally(() => {referencePlayPending = false;});
  }
}
function updateControls(time = video.currentTime): void {
  seek.value = String(time);
  if (document.activeElement !== seconds) seconds.value = time.toFixed(3);
  clock.value = `${readableTime(time)} / ${readableTime(duration())}`;
  if (sceneReady) {
    const line = getReadingCue(time);
    if ((line?.id ?? null) !== lastCueId) {
      lastCueId = line?.id ?? null;
      currentCue.value = line ? line.sourceText : 'No lyric cue at this point';
      cue.value = line?.id ?? '';
    }
  }
}
function frameMatchesTarget(time: number, target: number): boolean {
  // A seek resolves to its containing 25 fps picture frame.
  // The final source picture is retained through the short AAC container tail.
  const tolerance = target > duration() - .12 ? .12 : 1 / 25 + .005;
  return Math.abs(time - target) <= tolerance;
}
function frameResolvesSeek(time: number, target: number): boolean {
  if (video.paused || video.seeking) return frameMatchesTarget(time, target);
  // A running seek can drop the very first decoded frame. Accept its current
  // successor rather than leaving the preview stuck on a discarded target.
  return time >= target - 1 / 25 - .005 && Math.abs(time - video.currentTime) <= .15;
}
function drawDecodedFrame(): void {
  if (!sceneReady || paintFailed || mediaFailed || video.seeking || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || decodedFrameTime === null) return;
  if (pendingSeekTarget !== null) {
    if (!frameResolvesSeek(decodedFrameTime, pendingSeekTarget)) return;
    pendingSeekTarget = null;
  }
  // Never let an advancing soundtrack silently carry a frozen picture.
  // The original artwork is intentionally static, but decoded PTS must still
  // advance. Source stillness is distinct from stalled media decoding.
  if (!video.paused && !video.ended && hasFrameCallback && Math.abs(video.currentTime-decodedFrameTime)>.16) {
    setBusy('Resuming original picture…');scheduleVideoFrame();return;
  }
  try {
    const paintStarted = performance.now();
    const wordTime = video.ended ? duration() : video.currentTime;
    paintScene(ctx, wordTime, format, video);
    canvas.dataset.paintMilliseconds = (performance.now() - paintStarted).toFixed(2);
    lastPaintTime = wordTime;
    canvas.dataset.wordTime = wordTime.toFixed(6);
    const reading=getReadingCue(wordTime),readings=getReadingCues(wordTime);
    canvas.dataset.lyricCue=reading?.id??'';
    canvas.dataset.lyricOpacity=(reading?cueOpacity(reading,wordTime):0).toFixed(6);
    canvas.dataset.lyricHoldEnd=reading?.fullOpacityEnd.toFixed(6)??'';
    canvas.dataset.lyricClearAt=reading?.visibleEnd.toFixed(6)??'';
    canvas.dataset.sourceTime = decodedFrameTime.toFixed(6);
    canvas.dataset.sourceFrame = String(Math.round(decodedFrameTime * 25));
    canvas.dataset.clock = 'one-source-video.currentTime; native-picture-PTS-separate';
    canvas.dataset.sourceWordEvents = JSON.stringify(reading?.words.map(w=>({id:w.id,startSample:w.startSample,endSample:w.endSample}))??[]);
    canvas.dataset.activeSourceWords = JSON.stringify(readings.flatMap(c=>c.words.filter(w=>sourceActive(w,wordTime)).map(w=>({lane:c.lane,voice:c.voice,text:w.text}))));
    canvas.dataset.activeTargetWords = JSON.stringify(readings.flatMap(c=>c.targets.filter(w=>targetActive(w,c.words,wordTime)).map(w=>({lane:c.lane,voice:c.voice,text:w.text}))));
    canvas.dataset.readingCues=JSON.stringify(readings.map(c=>({id:c.id,lane:c.lane,opacity:cueOpacity(c,wordTime)})));
    setBusy(null);
    updateControls(wordTime);
    updatePlaybackState();
  } catch (cause) {
    paintFailed = true; video.pause();
    setBusy('Original-video preview unavailable');
    report(`The original-video scene could not be drawn: ${cause instanceof Error ? cause.message : String(cause)}. Use Restore preview to reload the complete source and lyric scene.`);
    updatePlaybackState();
  }
}
function scheduleVideoFrame(): void {
  if (!hasFrameCallback || frameCallbackId !== null) return;
  frameCallbackId = video.requestVideoFrameCallback((_now, metadata) => {
    frameCallbackId = null;
    if (pendingSeekTarget === null || frameResolvesSeek(metadata.mediaTime, pendingSeekTarget)) {
      decodedFrameTime = metadata.mediaTime;
      drawDecodedFrame();
    }
    scheduleVideoFrame();
  });
}
function fallbackDecodedFrame(): void {
  if (hasFrameCallback || video.seeking || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
  // Older browsers expose no frame PTS. This fallback still uses the same
  // decoded video with audio, and never renders a stale frame during a seek.
  decodedFrameTime = video.currentTime;
  drawDecodedFrame();
}
function animate(): void {
  if (!hasFrameCallback && !video.paused) fallbackDecodedFrame();
  // Repaint held native 25fps pictures at display cadence so word focus is not
  // delayed to the next picture frame. Never extrapolate across seeks/buffering.
  if (!video.paused && !video.seeking && pendingSeekTarget === null) drawDecodedFrame();
  updateControls(video.currentTime);
  synchronizeReference(); requestAnimationFrame(animate);
}
function setFormat(next: Format): void {
  format = next;
  stage.classList.toggle('portrait', next === 'portrait');
  canvas.width = next === 'landscape' ? 1920 : 1080;
  canvas.height = next === 'landscape' ? 1080 : 1920;
  element<HTMLButtonElement>('landscape').setAttribute('aria-pressed', String(next === 'landscape'));
  element<HTMLButtonElement>('portrait').setAttribute('aria-pressed', String(next === 'portrait'));
  drawDecodedFrame();
}
async function beginPlayback(): Promise<void> {
  if (!sceneReady || !metadataReady || paintFailed || mediaFailed) return;
  if (video.ended) setTime(0);
  try {await video.play(); clearReport();}
  catch {report('Playback needs a browser gesture. Press Play to start the original video and soundtrack.');}
}
function setTime(value: number): void {
  if (!metadataReady) return;
  const target = boundedTime(value);
  if (Math.abs(target - video.currentTime) < .0005 && !video.seeking && decodedFrameTime !== null) {
    drawDecodedFrame(); updateUrl(); return;
  }
  pendingSeekTarget = target; decodedFrameTime = null;
  setBusy('Seeking original video…'); video.currentTime = target;
  scheduleVideoFrame(); updatePlaybackState(); updateControls(target); updateUrl();
}

play.addEventListener('click', () => {if (video.paused) void beginPlayback(); else video.pause();});
element<HTMLButtonElement>('restart').addEventListener('click', () => {setTime(0); void beginPlayback();});
seek.addEventListener('input', () => setTime(Number(seek.value)));
seconds.addEventListener('change', () => setTime(Number(seconds.value)));
seconds.addEventListener('keydown', event => {
  if (event.key === 'Enter') {event.preventDefault(); setTime(Number(seconds.value)); seconds.blur();}
});
speed.addEventListener('change', () => {
  const value = Number(speed.value);
  video.playbackRate = [1, 0.75, 0.5].includes(value) ? value : 1;
  synchronizeReference(); updateUrl();
});
for (const value of ['landscape', 'portrait'] as const) element<HTMLButtonElement>(value).addEventListener('click', () => {setFormat(value); updateUrl();});
function updateEffects():void{const button=element<HTMLButtonElement>('effects');button.textContent=getEffectsEnabled()?'Animation on':'Animation off';button.setAttribute('aria-pressed',String(getEffectsEnabled()));canvas.dataset.effects=getEffectsEnabled()?'on':'off';}
element<HTMLButtonElement>('effects').addEventListener('click',()=>{setEffectsEnabled(!getEffectsEnabled());updateEffects();drawDecodedFrame();updateUrl();});
updateEffects();
cue.addEventListener('change', () => {
  const line = getLines().find(value => value.id === cue.value);
  if (line) setTime(Math.max(0, line.start - 0.4));
});
element<HTMLButtonElement>('mute').addEventListener('click', () => {
  video.muted = !video.muted;
  element<HTMLButtonElement>('mute').textContent = video.muted ? 'Sound off' : 'Sound on';
  element<HTMLButtonElement>('mute').setAttribute('aria-pressed', String(video.muted));
});
element<HTMLButtonElement>('recover').addEventListener('click', () => {
  const url = new URL(location.href);
  url.searchParams.set('t', video.currentTime.toFixed(3)); url.searchParams.set('format', format);
  url.searchParams.set('speed', String(video.playbackRate)); url.searchParams.set('playing', video.paused ? '0' : '1');
  url.searchParams.set('effects', getEffectsEnabled() ? 'on' : 'off');
  url.searchParams.set('muted', video.muted ? '1' : '0');
  video.pause(); reference.pause(); location.replace(url);
});
video.muted = query.get('muted') === '1';
element<HTMLButtonElement>('mute').textContent = video.muted ? 'Sound off' : 'Sound on';
element<HTMLButtonElement>('mute').setAttribute('aria-pressed', String(video.muted));

still.addEventListener('click', () => {
  if (lastPaintTime < 0 || pendingSeekTarget !== null || video.seeking || paintFailed) return;
  const time = lastPaintTime, snapshotFormat = format;
  canvas.toBlob(blob => {
    if (!blob) {report('The review still could not be saved. Try Restore preview.'); return;}
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = `GDE-TY-${snapshotFormat}-${time.toFixed(3)}s.png`;
    link.hidden = true; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }, 'image/png');
});

element<HTMLButtonElement>('show-reference').addEventListener('click', () => {
  referencePlaybackBlocked = false;
  if (!reference.getAttribute('src')) {reference.src = '/public/source.mp4'; reference.load();}
  element<HTMLElement>('reference-status').textContent = 'The same original picture without added lyrics or visualization. Muted to preserve one soundtrack.';
  referenceDialog.showModal(); synchronizeReference();
});
element<HTMLButtonElement>('close-reference').addEventListener('click', () => referenceDialog.close());
referenceDialog.addEventListener('close', () => reference.pause());
reference.addEventListener('loadedmetadata', synchronizeReference);
reference.addEventListener('canplay', synchronizeReference);
reference.addEventListener('volumechange', () => {if (!reference.muted) reference.muted = true;});
reference.addEventListener('error', () => {element<HTMLElement>('reference-status').textContent = 'The source comparison is unavailable. Check the local source file and server.';});

function loadedMetadata(): void {
  if (metadataReady) return;
  metadataReady = duration() > 0;
  seek.max = String(duration()); seconds.max = String(duration());
  seek.disabled = !metadataReady; seconds.disabled = !metadataReady;
  if (requestedTime > 0) setTime(requestedTime);
  updatePlaybackState(); scheduleVideoFrame();
  if (sceneReady && query.get('playing') === '1') void beginPlayback();
}
video.addEventListener('loadedmetadata', loadedMetadata);
video.addEventListener('loadeddata', () => {fallbackDecodedFrame(); scheduleVideoFrame();});
video.addEventListener('seeking', () => {
  if (pendingSeekTarget === null) pendingSeekTarget = video.currentTime;
  setBusy('Seeking original video…'); updatePlaybackState();
});
video.addEventListener('seeked', () => {fallbackDecodedFrame(); drawDecodedFrame(); scheduleVideoFrame(); updatePlaybackState();});
video.addEventListener('play', updatePlaybackState);
// Commit the actual stopped word time, even if pause lands between display
// paints and no further native picture callback arrives.
video.addEventListener('pause', () => {drawDecodedFrame(); updatePlaybackState(); synchronizeReference(); updateUrl();});
video.addEventListener('ended', () => {updatePlaybackState(); drawDecodedFrame(); updateControls(duration());});
video.addEventListener('canplay', () => {clearReport(); fallbackDecodedFrame(); scheduleVideoFrame();});
video.addEventListener('playing', () => {clearReport(); updatePlaybackState(); scheduleVideoFrame();});
video.addEventListener('waiting', () => {if (!video.paused) status.value = 'Buffering original video…';});
video.addEventListener('error', () => {
  mediaFailed = true; setBusy('Original source video unavailable');
  report('The original source video could not load or decode. Check public/source.mp4 and the local server, then use Restore preview.');
  updatePlaybackState();
});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {scheduleVideoFrame(); if (video.paused) {fallbackDecodedFrame(); drawDecodedFrame();}}
});
document.addEventListener('keydown', event => {
  const target = event.target;
  if (referenceDialog.open || target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement || target instanceof HTMLButtonElement) return;
  if (event.code === 'Space') {event.preventDefault(); if (video.paused) void beginPlayback(); else video.pause();}
});

setBusy('Loading original video and lyric scene…');
setFormat(format); updatePlaybackState(); scheduleVideoFrame(); requestAnimationFrame(animate);
if (video.readyState >= HTMLMediaElement.HAVE_METADATA) loadedMetadata();
try {
  await loadScene(); sceneReady = true;
  const identity=getSceneIdentity();
  canvas.dataset.timelineRevision=identity.revision;
  canvas.dataset.sourceSha256=identity.sourceSha256;
  canvas.dataset.timelineSha256=identity.timelineSha256??'';
  canvas.dataset.sceneSha256=identity.sceneSha256??'';
  const badge=document.querySelector('.badge');
  if(badge)badge.textContent=`Timing review · ${identity.revision.match(/-v\d+/)?.[0].slice(1)??identity.revision}`;
  cue.replaceChildren(new Option('Jump to lyric cue…', ''));
  for (const line of getLines()) cue.add(new Option(`${readableTime(line.start)} · ${line.label}`, line.id));
  cue.disabled = false;
  updatePlaybackState(); fallbackDecodedFrame(); drawDecodedFrame(); scheduleVideoFrame();
  if (metadataReady && query.get('playing') === '1') void beginPlayback();
} catch (cause) {
  paintFailed = true; video.pause(); setBusy('Lyric scene unavailable');
  report(`The lyric scene could not load: ${cause instanceof Error ? cause.message : String(cause)}. Use Restore preview after checking the local server.`);
  updatePlaybackState();
}
