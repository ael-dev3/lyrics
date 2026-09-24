import {activeSourceIds, activeTargetIndices, validateTimeline, visibleLineAt} from './model.ts';
import type {LyricLine, Timeline} from './model.ts';
import {artworkTransform, featureAt, paintAtmosphere} from './visual.ts';
import type {Aspect, FeatureMetadata} from './visual.ts';

const element = <T extends HTMLElement>(id: string): T => {
  const value = document.getElementById(id);
  if (!value) throw Error(`Missing ${id}`);
  return value as T;
};
const media = element<HTMLVideoElement>('source');
const stage = element<HTMLElement>('stage');
const smoke = element<HTMLCanvasElement>('smoke');
const glint = element<HTMLElement>('glint');
const esLane = element<HTMLElement>('es');
const enLane = element<HTMLElement>('en');
const title = element<HTMLElement>('title-state');
const seek = element<HTMLInputElement>('seek');
const clock = element<HTMLElement>('clock');
const play = element<HTMLButtonElement>('play');
const mute = element<HTMLButtonElement>('mute');
const error = element<HTMLElement>('error');
const state = element<HTMLOutputElement>('preview-state');
const lineSelect = element<HTMLSelectElement>('cue');
const notes = element<HTMLTextAreaElement>('notes');
const params = new URLSearchParams(location.search);
if (params.get('diagnostics') === '1') state.hidden = false;
let aspect: Aspect = params.get('format') === 'portrait' ? 'portrait' : 'landscape';
let timeline: Timeline;
let featureMeta: FeatureMetadata;
let featureBytes: Uint8Array;
let currentLine: LyricLine | null = null;
let sourceSpans: HTMLSpanElement[] = [];
let targetSpans: HTMLSpanElement[] = [];
let lastPainted = -1;
let presentedFrames = 0;
let lastPresentedMediaTime = 0;
let dataError = false;

function report(message: string, fatal = false): void {
  if (fatal) dataError = true;
  error.textContent = message;
  error.classList.add('show');
}
function clearReport(): void {
  if (dataError) return;
  error.classList.remove('show');
  error.textContent = '';
}
async function load<T>(path: string): Promise<T> {
  const response = await fetch(path, {cache: 'no-store'});
  if (!response.ok) throw Error(`${path}: HTTP ${response.status}`);
  return response.json() as Promise<T>;
}
function formatTime(seconds: number): string {
  const whole = Math.floor(Math.max(0, seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}
function clamp(value: number): number {return Math.max(0, Math.min(1, value));}

function makeWords(host: HTMLElement, words: string[]): HTMLSpanElement[] {
  host.replaceChildren();
  const spans: HTMLSpanElement[] = [];
  words.forEach((word, index) => {
    if (index) host.append(document.createTextNode(' '));
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = word;
    host.append(span);
    spans.push(span);
  });
  host.classList.remove('empty');
  return spans;
}

function selectLine(line: LyricLine | null): void {
  if (currentLine?.id === line?.id) return;
  currentLine = line;
  if (!line) {
    esLane.classList.add('empty');
    enLane.classList.add('empty');
    sourceSpans = [];
    targetSpans = [];
    return;
  }
  sourceSpans = makeWords(esLane, line.es.map(word => word.text));
  targetSpans = makeWords(enLane, line.en.map(word => word.text));
  lineSelect.value = line.id;
}

function paint(): void {
  if (!timeline || !featureMeta || !featureBytes) return;
  const seconds = Number.isFinite(media.currentTime) ? media.currentTime : 0;
  const frame = Math.round(seconds * 60);
  if (frame === lastPainted) return;
  lastPainted = frame;
  const sample = Math.round(seconds * timeline.sampleRate);
  const line = visibleLineAt(timeline, seconds);
  selectLine(line);
  const active = line ? activeSourceIds(line, sample) : new Set<string>();
  const target = line ? activeTargetIndices(line, active) : new Set<number>();
  sourceSpans.forEach((span, index) => span.classList.toggle('active', active.has(line?.es[index]?.id ?? '')));
  targetSpans.forEach((span, index) => span.classList.toggle('active', target.has(index)));
  const acoustic = featureAt(featureBytes, featureMeta, seconds);
  glint.style.opacity = String(paintAtmosphere(smoke, aspect, seconds, acoustic));
  media.style.transform = artworkTransform(seconds);
  const intro = clamp(seconds / 1.2) * clamp((17.0 - seconds) / 1.1);
  const tail = clamp((seconds - 248) / 4.0) * clamp((timeline.durationSeconds - seconds) / 2.0);
  title.style.opacity = String(Math.max(intro, tail));
  seek.value = String(seconds);
  clock.textContent = `${formatTime(seconds)} / ${formatTime(timeline.durationSeconds)}`;
  state.value = JSON.stringify({time: seconds, format: aspect, line: line?.id ?? null, source: [...active], target: [...target], mediaReady: media.readyState, mediaWidth: media.videoWidth, mediaHeight: media.videoHeight, presentedFrames, lastPresentedMediaTime});
}
function tick(): void {paint(); requestAnimationFrame(tick);}
function applyAspect(next: Aspect): void {
  aspect = next;
  stage.classList.toggle('portrait', aspect === 'portrait');
  element<HTMLButtonElement>('landscape').setAttribute('aria-pressed', String(aspect === 'landscape'));
  element<HTMLButtonElement>('portrait').setAttribute('aria-pressed', String(aspect === 'portrait'));
  lastPainted = -1;
  paint();
}
async function togglePlayback(): Promise<void> {
  if (media.paused) {
    try {await media.play(); clearReport();}
    catch {report('The recording could not start. Check the local preview server, then use Restore picture.');}
  } else media.pause();
}

try {
  const [rawTimeline, metadata, response] = await Promise.all([
    load<Timeline>('/src/timeline.json'),
    load<FeatureMetadata>('/public/audio-features.json'),
    fetch('/public/audio-features.bin', {cache: 'no-store'}),
  ]);
  if (!response.ok) throw Error(`Audio features: HTTP ${response.status}`);
  timeline = rawTimeline;
  validateTimeline(timeline);
  featureMeta = metadata;
  featureBytes = new Uint8Array(await response.arrayBuffer());
  if (timeline.sourceSha256 !== featureMeta.sourceSha256 || featureBytes.length !== featureMeta.frameCount * (featureMeta.bandCount + 2)) {
    throw Error('The preview timing and measured audio belong to different sources');
  }
  seek.max = String(timeline.durationSeconds);
  lineSelect.replaceChildren(new Option('Jump to lyric line…', ''));
  for (const line of timeline.lines) {
    const start = line.es[0]!.startSample / timeline.sampleRate;
    lineSelect.add(new Option(`${formatTime(start)} · ${line.es.map(word => word.text).join(' ')}`, line.id));
  }
  const noteKey = `el-tesoro-preview-notes-${timeline.sourceSha256}`;
  notes.value = localStorage.getItem(noteKey) ?? '';
  notes.addEventListener('input', () => localStorage.setItem(noteKey, notes.value));
  applyAspect(aspect);
  const requestedSpeed = Number(params.get('speed') ?? '1');
  if ([1, 0.75, 0.5].includes(requestedSpeed)) {
    media.playbackRate = requestedSpeed;
    element<HTMLSelectElement>('speed').value = String(requestedSpeed);
  }
  const requestedTime = Number(params.get('t') ?? '0');
  const restoreTime = (): void => {media.currentTime = Math.max(0, Math.min(timeline.durationSeconds - 0.05, Number.isFinite(requestedTime) ? requestedTime : 0)); lastPainted = -1; paint();};
  if (media.readyState >= 1) restoreTime(); else media.addEventListener('loadedmetadata', restoreTime, {once: true});
  tick();
} catch (cause) {
  report(`Preview data unavailable: ${cause instanceof Error ? cause.message : String(cause)}. Restart the preview server and restore the picture.`, true);
}

play.onclick = () => void togglePlayback();
media.onplay = () => {play.textContent = 'Ⅱ Pause';};
media.onpause = () => {play.textContent = media.ended ? '↤ Replay' : '▶ Play';};
media.onerror = () => report('The source recording is unavailable. Restart the local preview server, then use Restore picture.');
media.oncanplay = clearReport;
media.onseeked = () => {lastPainted = -1; paint();};
media.onwaiting = () => {if (!media.paused) report('Buffering source picture and audio…');};
media.onplaying = clearReport;
element<HTMLButtonElement>('restart').onclick = () => {media.currentTime = 0; lastPainted = -1; void media.play();};
seek.oninput = () => {media.currentTime = Number(seek.value); lastPainted = -1; paint();};
element<HTMLSelectElement>('speed').onchange = event => {media.playbackRate = Number((event.currentTarget as HTMLSelectElement).value);};
element<HTMLButtonElement>('landscape').onclick = () => applyAspect('landscape');
element<HTMLButtonElement>('portrait').onclick = () => applyAspect('portrait');
lineSelect.onchange = () => {const line = timeline?.lines.find(value => value.id === lineSelect.value); if (line) {media.currentTime = Math.max(0, line.es[0]!.startSample / timeline.sampleRate - 0.55); lastPainted = -1; paint();}};
mute.onclick = () => {media.muted = !media.muted; mute.textContent = media.muted ? 'Sound off' : 'Sound on';};
element<HTMLButtonElement>('recover').onclick = () => {
  const url = new URL(location.href);
  url.searchParams.set('t', media.currentTime.toFixed(3));
  url.searchParams.set('format', aspect);
  url.searchParams.set('speed', String(media.playbackRate));
  location.replace(url);
};
if ('requestVideoFrameCallback' in media) {
  const observe = (_now: number, metadata: VideoFrameCallbackMetadata): void => {
    presentedFrames++;
    lastPresentedMediaTime = metadata.mediaTime;
    media.requestVideoFrameCallback(observe);
  };
  media.requestVideoFrameCallback(observe);
}
