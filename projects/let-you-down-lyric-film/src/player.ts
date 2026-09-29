import {FONT, getLines, loadScene, paintScene, sceneReady, type Diagnostics, type Format} from './scene.ts';
import {normalizeLyrics, sha256Hex} from './lyrics.ts';

// One <video> supplies the original soundtrack and the moving picture. Lyrics,
// light and spectrum are pure functions of its media time, repainted at the
// display rate; nothing accumulates wall-clock state, so seeks and reduced
// speed reconstruct the same frame the renderer paints.
const el = <T extends HTMLElement>(id: string): T => {const e = document.getElementById(id); if (!e) throw Error(`Missing #${id}`); return e as T;};
const video = el<HTMLVideoElement>('source'), canvas = el<HTMLCanvasElement>('film'), stage = el<HTMLElement>('stage');
const ctx2d = canvas.getContext('2d'); if (!ctx2d) throw Error('Canvas 2D unavailable');
const ctx: CanvasRenderingContext2D = ctx2d;
const loading = el<HTMLOutputElement>('loading'), play = el<HTMLButtonElement>('play'), seek = el<HTMLInputElement>('seek'), seconds = el<HTMLInputElement>('seconds');
const speed = el<HTMLSelectElement>('speed'), cueSelect = el<HTMLSelectElement>('cue'), clock = el<HTMLOutputElement>('clock'), status = el<HTMLOutputElement>('status');
const now = el<HTMLOutputElement>('now'), health = el<HTMLElement>('picture-health'), errorBox = el<HTMLElement>('error'), wordsPanel = el<HTMLElement>('words');
const notes = el<HTMLTextAreaElement>('notes'), mode = el<HTMLElement>('mode'), refDialog = el<HTMLDialogElement>('reference-dialog'), ref = el<HTMLVideoElement>('reference-video');
const query = new URLSearchParams(location.search);
let format: Format = query.get('format') === 'portrait' ? 'portrait' : 'landscape';
let ready = false, failed = false, dirty = true, lastPaint = -1, lastDiag: Diagnostics | null = null, paintMs = 0;
let presented = 0, lastPresentedAt = performance.now(), lastPresentedMedia = -1, lastCueId: string | null = null;
let placeholder = query.get('text') === 'placeholder';
type LineInfo = ReturnType<typeof getLines>[number];
let lines: LineInfo[] = [];
let cueWords: {id: string; text: string; start: number; end: number; basis: string; spreadMs: number; review: string}[][] = [];

const fmt = (s: number): string => {const w = Math.max(0, s); return `${Math.floor(w / 60)}:${(w % 60).toFixed(1).padStart(4, '0')}`;};
const duration = (): number => Number.isFinite(video.duration) ? video.duration : 0;
function report(message: string): void {errorBox.textContent = message; errorBox.hidden = false;}
function busy(message: string | null): void {stage.classList.toggle('busy', message !== null); stage.setAttribute('aria-busy', String(message !== null)); loading.value = message ?? ''; loading.hidden = message === null;}
function setFormat(next: Format): void {
  format = next; stage.classList.toggle('portrait', next === 'portrait');
  canvas.width = next === 'landscape' ? 1920 : 1080; canvas.height = next === 'landscape' ? 1080 : 1920;
  el('landscape').setAttribute('aria-pressed', String(next === 'landscape')); el('portrait').setAttribute('aria-pressed', String(next === 'portrait'));
  dirty = true;
}
function updateUrl(): void {
  const u = new URL(location.href);
  u.searchParams.set('t', video.currentTime.toFixed(3)); u.searchParams.set('format', format); u.searchParams.set('speed', String(video.playbackRate));
  if (placeholder) u.searchParams.set('text', 'placeholder'); else u.searchParams.delete('text');
  u.searchParams.delete('playing'); history.replaceState(null, '', u);
}
function setTime(value: number): void {
  const t = Math.min(duration(), Math.max(0, Number.isFinite(value) ? value : 0));
  video.currentTime = t; dirty = true; updateUrl();
}

async function need(url: string): Promise<Response> {const r = await fetch(url, {cache: 'no-store'}); if (!r.ok) throw Error(`Could not load ${url} (${r.status})`); return r;}
async function optional(url: string): Promise<Response | null> {const r = await fetch(url, {cache: 'no-store'}); return r.ok ? r : null;}

async function boot(): Promise<void> {
  await document.fonts.load(`700 80px ${FONT}`);
  if (!document.fonts.check(`700 80px ${FONT}`)) throw Error('The film font (Oswald Bold) did not load');
  const [featuresJson, featureBytes, tones, timelineRes] = await Promise.all([
    need('/public/audio-features.json').then(r => r.json() as Promise<{dataSha256: string}>),
    need('/public/audio-features.bin').then(r => r.arrayBuffer()),
    need('/public/picture-tones.json').then(r => r.json() as Promise<unknown>),
    optional('/public/timeline.json'),
  ]);
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', featureBytes)), b => b.toString(16).padStart(2, '0')).join('');
  if (digest !== featuresJson.dataSha256) throw Error('Audio feature identity mismatch');
  const timeline = timelineRes ? await timelineRes.json() as unknown : null;
  let lyricsText: string | null = null, lyricsSha256: string | null = null;
  if (timeline && !placeholder) {
    const lyricRes = await optional('/source/lyrics.local.txt');
    if (lyricRes) {lyricsText = await lyricRes.text(); lyricsSha256 = await sha256Hex(normalizeLyrics(lyricsText));}
    else {placeholder = true; report('source/lyrics.local.txt was not found, so neutral placeholder words stand in for the lyric. Save the supplied lyric text there and use Restore preview.');}
  }
  loadScene({timeline, features: featuresJson, featureBytes, tones, lyricsText, lyricsSha256, placeholder});
  if (!timeline) report('No word timing yet (public/timeline.json). The picture, light and spectrum play; lyrics appear once alignment has run.');
  mode.textContent = placeholder ? 'Placeholder text' : 'Review preview'; mode.classList.toggle('placeholder', placeholder);
  lines = getLines();
  cueSelect.replaceChildren(new Option('Jump to line…', ''));
  for (const l of lines) cueSelect.add(new Option(`${fmt(l.start)} · ${l.id}${l.review ? ' ⚑' : ''} · ${l.label}`, l.id));
  cueSelect.disabled = !lines.length;
  const tl = timeline as {cues?: {words: {id: string; start: number; end: number; basis: string; spreadMs: number; review: string}[]}[]} | null;
  cueWords = (tl?.cues ?? []).map(q => q.words.map(w => ({...w, text: w.id})));
  ready = true; dirty = true;
}

function renderWords(i: number, t: number): void {
  if (i < 0 || !cueWords[i]) {wordsPanel.textContent = 'No line at this moment.'; return;}
  const label = lines[i]?.label.split(' ') ?? [];
  wordsPanel.replaceChildren(...cueWords[i]!.map((w, k) => {
    const s = document.createElement('span');
    s.textContent = `${w.id.slice(4)} ${label[k] ?? ''} ${w.start.toFixed(2)}–${w.end.toFixed(2)} · ${w.basis}${w.spreadMs > 0 ? ` · ±${Math.round(w.spreadMs)}ms` : ''}`;
    s.className = `${t >= w.start && t < w.end ? 'active' : ''} ${w.review === 'priority' ? 'priority' : ''}`;
    return s;
  }));
}

function frame(): void {
  requestAnimationFrame(frame);
  paintNow(false);
}
/** One paint at the current media time. Also exposed for automated checks,
 * because animation frames pause while a browser tab is hidden. */
function paintNow(force: boolean): void {
  if (!ready || failed || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
  const t = video.currentTime;
  if (!force && video.paused && !dirty && Math.abs(t - lastPaint) < 1e-6) return;
  try {
    const started = performance.now();
    lastDiag = paintScene(ctx, t, format, video);
    paintMs = performance.now() - started; lastPaint = t; dirty = false; busy(null);
    canvas.dataset.sourceTime = t.toFixed(4); canvas.dataset.shot = lastDiag.shot; canvas.dataset.cue = lastDiag.cue ?? '';
  } catch (cause) {
    failed = true; video.pause(); busy('Scene unavailable');
    report(`The scene could not be drawn: ${cause instanceof Error ? cause.message : String(cause)}. Use Restore preview.`);
  }
  seek.value = String(t);
  if (document.activeElement !== seconds) seconds.value = t.toFixed(3);
  clock.value = `${fmt(t)} / ${fmt(duration())}`;
  const i = lines.findIndex(l => t >= l.start && t < l.end), id = lines[i]?.id ?? null;
  if (id !== lastCueId) {lastCueId = id; now.value = id ? `${id} · ${lines[i]!.label}` : 'Between lines'; cueSelect.value = id ?? '';}
  renderWords(i, t);
  status.value = video.paused ? (video.ended ? 'Ended' : 'Paused') : video.seeking ? 'Seeking…' : `Playing ${video.playbackRate}×`;
  play.textContent = video.paused ? (video.ended ? 'Replay' : 'Play') : 'Pause';
  // Picture health: while playing, decoded frames must keep being presented.
  const stale = !video.paused && !video.seeking && performance.now() - lastPresentedAt > 1200;
  health.textContent = stale ? 'Picture stalled — use Restore preview' : `Picture: ${presented} frames presented · last ${lastPresentedMedia.toFixed(3)} s · paint ${paintMs.toFixed(1)} ms`;
  health.style.color = stale ? '#ff7aa8' : '';
  if (refDialog.open) syncReference();
}
function watchFrames(): void {
  if (typeof video.requestVideoFrameCallback !== 'function') return;
  video.requestVideoFrameCallback((_n, meta) => {presented++; lastPresentedAt = performance.now(); lastPresentedMedia = meta.mediaTime; dirty = true; watchFrames();});
}
function syncReference(): void {
  if (ref.readyState < 1) return;
  ref.muted = true; ref.playbackRate = video.playbackRate;
  if (Math.abs(ref.currentTime - video.currentTime) > 0.08) ref.currentTime = video.currentTime;
  if (video.paused && !ref.paused) ref.pause(); else if (!video.paused && ref.paused) void ref.play().catch(() => undefined);
}
function jumpCue(step: number): void {
  const t = video.currentTime, i = lines.findIndex(l => t >= l.start && t < l.end);
  const target = i >= 0 ? lines[i + step] : step > 0 ? lines.find(l => l.start > t) : [...lines].reverse().find(l => l.end < t);
  if (target) setTime(target.start + 0.001);
}

play.addEventListener('click', () => {if (video.paused) void video.play().catch(() => report('Press Play again to allow audio playback.')); else video.pause();});
el('restart').addEventListener('click', () => {setTime(0); void video.play().catch(() => undefined);});
seek.addEventListener('input', () => setTime(Number(seek.value)));
seconds.addEventListener('change', () => setTime(Number(seconds.value)));
speed.addEventListener('change', () => {const v = Number(speed.value); video.playbackRate = [1, 0.75, 0.5].includes(v) ? v : 1; updateUrl();});
el('landscape').addEventListener('click', () => {setFormat('landscape'); updateUrl();});
el('portrait').addEventListener('click', () => {setFormat('portrait'); updateUrl();});
el('prev-cue').addEventListener('click', () => jumpCue(-1));
el('next-cue').addEventListener('click', () => jumpCue(1));
cueSelect.addEventListener('change', () => {const l = lines.find(x => x.id === cueSelect.value); if (l) setTime(l.start + 0.001);});
el('mute').addEventListener('click', () => {video.muted = !video.muted; el('mute').textContent = video.muted ? 'Sound off' : 'Sound on'; el('mute').setAttribute('aria-pressed', String(video.muted));});
el('recover').addEventListener('click', () => {
  const u = new URL(location.href);
  u.searchParams.set('t', video.currentTime.toFixed(3)); u.searchParams.set('format', format); u.searchParams.set('speed', String(video.playbackRate));
  u.searchParams.set('playing', video.paused ? '0' : '1'); if (placeholder) u.searchParams.set('text', 'placeholder');
  video.pause(); location.replace(u);
});
el('show-reference').addEventListener('click', () => {if (!ref.getAttribute('src')) {ref.src = '/public/source.mp4'; ref.load();} refDialog.showModal(); syncReference();});
el('close-reference').addEventListener('click', () => refDialog.close());
refDialog.addEventListener('close', () => ref.pause());
const NOTES_KEY = 'let-you-down-review-notes';
try {notes.value = localStorage.getItem(NOTES_KEY) ?? '';} catch {/* storage unavailable */}
notes.addEventListener('input', () => {try {localStorage.setItem(NOTES_KEY, notes.value);} catch {/* storage unavailable */}});
el('stamp').addEventListener('click', () => {notes.setRangeText(`${fmt(video.currentTime)} (${format}) — `, notes.selectionStart, notes.selectionEnd, 'end'); notes.focus(); notes.dispatchEvent(new Event('input'));});
el('export-notes').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({song: 'BnnbP7pCIvQ', exportedFrom: 'review preview', notes: notes.value}, null, 2)], {type: 'application/json'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'let-you-down-review-notes.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 20000);
});
document.addEventListener('keydown', e => {
  const target = e.target;
  if (refDialog.open || target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;
  if (e.code === 'Space') {e.preventDefault(); play.click();}
  if (e.code === 'ArrowLeft') {e.preventDefault(); jumpCue(-1);}
  if (e.code === 'ArrowRight') {e.preventDefault(); jumpCue(1);}
});
video.addEventListener('loadedmetadata', () => {
  seek.max = String(duration()); seconds.max = String(duration()); seek.disabled = false; seconds.disabled = false; play.disabled = false;
  const t = Number(query.get('t') ?? 0); if (t > 0) setTime(t);
  const s = Number(query.get('speed') ?? 1); video.playbackRate = [1, 0.75, 0.5].includes(s) ? s : 1; speed.value = String(video.playbackRate);
  if (query.get('playing') === '1') void video.play().catch(() => undefined);
});
video.addEventListener('seeked', () => {dirty = true;});
video.addEventListener('pause', () => {dirty = true; updateUrl();});
video.addEventListener('error', () => {failed = true; busy('Original video unavailable'); report('public/source.mp4 could not load or decode. Restore the locked source (README) and use Restore preview.');});
video.muted = query.get('muted') === '1';
(window as unknown as {lyd: unknown}).lyd = {
  state: () => ({ready, failed, placeholder, format, t: video.currentTime, paused: video.paused, presented, lastPresentedMedia, paintMs, diag: lastDiag, sceneReady: sceneReady()}),
  paint: () => {paintNow(true); return lastDiag;},
};

busy('Loading original video and lyric scene…');
setFormat(format); watchFrames(); requestAnimationFrame(frame);
boot().catch(cause => {failed = true; busy('Scene unavailable'); report(`The review scene could not load: ${cause instanceof Error ? cause.message : String(cause)}`);});
