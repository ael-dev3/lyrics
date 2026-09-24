import rawCues from './word-cues.json';
import {DIMENSIONS, DURATION_FRAMES, DURATION_SECONDS, FPS, REVISION, SONG_ID, type Format} from './config.ts';
import {getCityCue, paintCity, setCityAirship, setCityBackground, setCitySprites, setCityTrain} from './city.ts';

type Cue = {id: string; start: number; end: number; text: string; uncertain?: boolean};
type CueReview = {landscape: boolean; portrait: boolean; notes: string};
type FrozenIdentity = {song: string; revision: string; identitySha256: string};
type EmbeddedAssets = Record<string, string>;
const cues = (rawCues as unknown as Cue[]).map((cue, index) => {
  if (!cue || typeof cue.id !== 'string' || typeof cue.text !== 'string' ||
    !Number.isFinite(cue.start) || !Number.isFinite(cue.end) ||
    cue.start < 0 || cue.end <= cue.start || cue.end > DURATION_SECONDS + .05 ||
    (index > 0 && cue.start < (rawCues[index - 1] as Cue).start)) {
    throw new Error(`Invalid review cue ${index + 1}`);
  }
  return cue;
});

const get = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing review element: ${id}`);
  return element as T;
};
const embeddedJson = (id: string): unknown | undefined => {
  const element = document.getElementById(id);
  if (!element) return undefined;
  return JSON.parse(element.textContent ?? '');
};
const embeddedAssets = embeddedJson('embedded-assets') as EmbeddedAssets | undefined;
const assetUrl = (name: string) => {
  if (!embeddedAssets) return `/public/${name}`;
  const value = embeddedAssets[name];
  if (typeof value !== 'string' || !value.startsWith('data:')) throw new Error(`Embedded asset missing: ${name}`);
  return value;
};
const audio = get<HTMLAudioElement>('audio');
const scene = get<HTMLCanvasElement>('scene');
const painter = (() => {const context = scene.getContext('2d', {alpha: false}); if (!context) throw new Error('City canvas is unavailable'); return context;})();
const stage = get<HTMLDivElement>('stage');
const stageWrap = get<HTMLDivElement>('stage-wrap');
const seek = get<HTMLInputElement>('seek');
const status = get<HTMLParagraphElement>('status');
if (embeddedAssets) {
  try {audio.src = assetUrl('soundtrack.m4a'); audio.load();}
  catch (error) {status.textContent = `Soundtrack unavailable: ${String(error)}`;}
}
const records: Record<string, CueReview> = Object.fromEntries(cues.map(cue => [cue.id, {landscape: false, portrait: false, notes: ''}]));

let format: Format = 'landscape';
let selected = cues.length ? 0 : -1;
let lastFrame = -1;
let seekTarget: number | undefined;
let seekRetries = 0;
let intendedPlaying = false;
let playAfterSeek = false;
let artReady = false;
let artLoading = false;
let artError: string | undefined;
let identitySha256 = 'unfrozen';
let storageKey = `rainline-review-${REVISION}-unfrozen`;
let waitingTimer: ReturnType<typeof setTimeout> | undefined;

const duration = () => Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : DURATION_SECONDS;
const seconds = (value: number) => {
  const ms = Math.round(Math.max(0, value) * 1000);
  return `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}.${String(ms % 1000).padStart(3, '0')}`;
};
const currentCue = () => selected >= 0 ? cues[selected] : undefined;
const currentReview = () => {const cue = currentCue(); return cue ? records[cue.id] : undefined;};
const draftPayload = () => ({song: SONG_ID, revision: REVISION, identitySha256, records});
const saveDraft = (): boolean => {
  const review = currentReview();
  if (review) review.notes = get<HTMLTextAreaElement>('notes').value;
  try {localStorage.setItem(storageKey, JSON.stringify(draftPayload())); return true;}
  catch {get<HTMLElement>('save-status').textContent = 'Browser storage is unavailable for this local file. Use Save review notes to download a copy.'; return false;}
};
const loadDraft = () => {
  let stored: string | null;
  try {stored = localStorage.getItem(storageKey);} catch {return;}
  if (!stored) return;
  try {
    const draft = JSON.parse(stored) as {records?: Record<string, Partial<CueReview>>};
    for (const cue of cues) {
      const prior = draft.records?.[cue.id];
      const row = records[cue.id];
      if (!prior || !row) continue;
      row.landscape = prior.landscape === true;
      row.portrait = prior.portrait === true;
      row.notes = typeof prior.notes === 'string' ? prior.notes : '';
    }
  } catch {
    get<HTMLElement>('save-status').textContent = 'Saved notes could not be restored. The preview remains available.';
  }
};
void (async () => {
  const embedded = embeddedJson('embedded-identity');
  if (embedded !== undefined) return embedded as FrozenIdentity;
  const response = await fetch('/evidence/preview-identity.json', {cache: 'no-store'});
  if (!response.ok) throw new Error('Preview inputs are not frozen yet');
  return await response.json() as FrozenIdentity;
})().then(identity => {
  if (identity.song !== SONG_ID || identity.revision !== REVISION || !/^[a-f0-9]{64}$/.test(identity.identitySha256)) throw new Error('Preview identity does not match this revision');
  identitySha256 = identity.identitySha256;
  storageKey = `rainline-review-${REVISION}-${identitySha256}`;
  loadDraft();
  updateSelected();
}).catch(error => {
  const detail = error instanceof Error ? error.message : String(error);
  get<HTMLElement>('save-status').textContent = `${detail}. Notes are local to this unfrozen draft.`;
  loadDraft();
  updateSelected();
});

function resize() {
  const {width, height} = DIMENSIONS[format];
  const scale = Math.min(stageWrap.clientWidth / width, stageWrap.clientHeight / height);
  stage.style.width = `${Math.max(1, width * scale)}px`;
  stage.style.height = `${Math.max(1, height * scale)}px`;
  if (scene.width !== width || scene.height !== height) {scene.width = width; scene.height = height;}
  lastFrame = -1;
}

function draw(force = false, time = seekTarget ?? audio.currentTime) {
  if (!artReady) {
    scene.dataset.sceneReady = 'false';
    status.dataset.sceneError = 'true';
    status.textContent = artError ?? 'Loading city artwork…';
    return;
  }
  const frame = Math.max(0, Math.min(DURATION_FRAMES - 1, Math.round(time * FPS)));
  if (!force && frame === lastFrame) return;
  try {
    paintCity(painter, frame, format);
    scene.dataset.frame = String(frame);
    scene.dataset.format = format;
    scene.dataset.sceneReady = 'true';
    lastFrame = frame;
    if (status.dataset.sceneError === 'true') {status.textContent = ''; status.dataset.sceneError = 'false';}
  } catch (error) {
    scene.dataset.sceneReady = 'false';
    status.textContent = `Scene unavailable: ${String(error)}. Use Restore visuals after fixing the preview.`;
    status.dataset.sceneError = 'true';
  }
}

async function loadArt() {
  if (artLoading) return;
  artLoading = true;
  artError = undefined;
  draw(true);
  const decode = async (name: string) => {
    const picture = new Image();
    picture.src = assetUrl(name);
    try {
      await picture.decode();
      if (!picture.naturalWidth || !picture.naturalHeight) throw new Error('Empty image');
      return picture;
    } catch (error) {
      throw new Error(`${name} could not be decoded: ${String(error)}`);
    }
  };
  try {
    const [landscape, portrait, airship, train, sprites] = await Promise.all([
      decode('city-landscape.png'), decode('city-portrait.png'), decode('city-airship.png'),
      decode('city-train.png'), decode('city-sprites.png'),
    ]);
    setCityBackground('landscape', landscape);
    setCityBackground('portrait', portrait);
    setCityAirship(airship);
    setCityTrain(train);
    setCitySprites(sprites);
    artReady = true;
    lastFrame = -1;
    draw(true);
  } catch (error) {
    artError = `City artwork unavailable: ${String(error)}. Restore the image files, then use Restore visuals.`;
    draw(true);
  } finally {
    artLoading = false;
  }
}

function listCues() {
  const list = get<HTMLDivElement>('cue-list');
  list.replaceChildren(...cues.map((cue, index) => {
    const button = document.createElement('button');
    button.className = `cue-item${index === selected ? ' active' : ''}`;
    button.type = 'button';
    const row = records[cue.id];
    button.textContent = `${cue.id} · ${seconds(cue.start)} ${row?.landscape ? '16:9 ✓' : ''} ${row?.portrait ? '9:16 ✓' : ''}${cue.uncertain ? ' · CHECK' : ''}`;
    const text = document.createElement('span');
    text.textContent = cue.text;
    button.append(text);
    button.onclick = () => selectCue(index);
    return button;
  }));
}

function updateSelected() {
  const cue = currentCue();
  const review = currentReview();
  get<HTMLElement>('cue-title').textContent = cue ? `${cue.id} · ${cue.text}` : 'No lyric cues loaded';
  get<HTMLElement>('cue-status').textContent = cue && review ? `16:9 ${review.landscape ? 'reviewed' : 'pending'} · 9:16 ${review.portrait ? 'reviewed' : 'pending'}${cue.uncertain ? ' · timing uncertain' : ''}` : 'Cue review awaits the transcript.';
  get<HTMLTextAreaElement>('notes').value = review?.notes ?? '';
  get<HTMLInputElement>('checked').checked = false;
  listCues();
}

function selectVisibleCue(time: number) {
  const visible = getCityCue(time);
  const index = visible ? cues.findIndex(cue => cue.id === visible.id) : -1;
  if (index >= 0 && index !== selected) selectCue(index, false);
}

function seekTo(value: number) {
  const target = Math.max(0, Math.min(duration() - .05, value));
  const previousTime = audio.currentTime;
  const alreadySeeking = audio.seeking;
  seekTarget = target;
  seekRetries = 0;
  audio.currentTime = target;
  seek.value = String(target);
  get<HTMLElement>('time').textContent = seconds(target);
  selectVisibleCue(target);
  draw(true, target);
  // currentTime can echo a requested seek before the decoder has settled there.
  // Keep the target until `seeked`; only a no-op seek can finish synchronously.
  if (!alreadySeeking && !audio.seeking && Math.abs(previousTime - target) < .02) seekTarget = undefined;
}

function completeSeek() {
  if (seekTarget === undefined) return;
  const target = seekTarget;
  if (Math.abs(audio.currentTime - target) > .25 && seekRetries < 2) {
    seekRetries++;
    audio.currentTime = target;
    return;
  }
  if (Math.abs(audio.currentTime - target) > .25) {
    intendedPlaying = false;
    playAfterSeek = false;
    audio.pause();
    status.textContent = `The soundtrack could not settle at ${seconds(target)}. Use Restore visuals to reconnect.`;
  } else {
    status.textContent = '';
    seekTarget = undefined;
    if (playAfterSeek) {playAfterSeek = false; void play();}
  }
  seekTarget = undefined;
  draw(true);
}

function selectCue(index: number, jump = true) {
  const old = currentReview();
  if (old) old.notes = get<HTMLTextAreaElement>('notes').value;
  selected = Math.max(0, Math.min(cues.length - 1, index));
  const cue = cues[selected];
  if (jump && cue) seekTo(Math.max(0, cue.start - .35));
  updateSelected();
  saveDraft();
}

async function play() {
  intendedPlaying = true;
  if (audio.seeking || seekTarget !== undefined) {
    playAfterSeek = true;
    status.textContent = 'Locating the selected soundtrack position…';
    return;
  }
  try { await audio.play(); status.textContent = ''; }
  catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    intendedPlaying = false;
    status.textContent = `Soundtrack unavailable: ${String(error)}. Keep the local preview server open, then restore playback.`;
  }
}

function pause() {intendedPlaying = false; playAfterSeek = false; audio.pause();}

function restoreAudio() {
  const position = seekTarget ?? audio.currentTime;
  const wasPlaying = intendedPlaying;
  pause();
  audio.addEventListener('loadedmetadata', () => {
    seekTo(position);
    if (wasPlaying) void play();
  }, {once: true});
  audio.load();
}

get<HTMLButtonElement>('play').onclick = () => intendedPlaying ? pause() : void play();
get<HTMLButtonElement>('restart').onclick = () => {seekTo(0); if (cues.length) selectCue(0, false); void play();};
get<HTMLButtonElement>('previous').onclick = () => {if (cues.length) selectCue(selected - 1);};
get<HTMLButtonElement>('next').onclick = () => {if (cues.length) selectCue(selected + 1);};
get<HTMLButtonElement>('restore').onclick = () => {lastFrame = -1; if (!artReady) void loadArt(); else draw(true); if (audio.error || audio.readyState === 0) restoreAudio();};
get<HTMLButtonElement>('toggle-tools').onclick = () => {
  const watching = document.body.classList.toggle('watch');
  get<HTMLButtonElement>('toggle-tools').textContent = watching ? 'Timing review' : 'Watch preview';
  resize(); draw(true);
};
get<HTMLButtonElement>('fullscreen').onclick = () => {stageWrap.classList.add('expanded'); resize(); draw(true);};
get<HTMLButtonElement>('close-expanded').onclick = () => {stageWrap.classList.remove('expanded'); resize(); draw(true);};
document.addEventListener('keydown', event => {if (event.key === 'Escape' && stageWrap.classList.contains('expanded')) {stageWrap.classList.remove('expanded'); resize(); draw(true);}});
get<HTMLSelectElement>('speed').onchange = event => {audio.playbackRate = Number((event.target as HTMLSelectElement).value);};
seek.oninput = () => seekTo(Number(seek.value));
for (const choice of ['landscape', 'portrait'] as const) get<HTMLButtonElement>(choice).onclick = () => {
  format = choice;
  for (const name of ['landscape', 'portrait'] as const) get<HTMLButtonElement>(name).classList.toggle('selected', name === choice);
  resize(); draw(true); updateSelected();
};
get<HTMLTextAreaElement>('notes').oninput = saveDraft;
get<HTMLButtonElement>('mark-cue').onclick = () => {
  if (!get<HTMLInputElement>('checked').checked) return;
  const review = currentReview();
  if (!review) return;
  review[format] = true;
  get<HTMLInputElement>('checked').checked = false;
  get<HTMLElement>('save-status').textContent = 'Cue marked for this layout. Full synchronization review remains pending.';
  saveDraft(); updateSelected();
};
get<HTMLButtonElement>('save-notes').onclick = async () => {
  const savedLocally = saveDraft();
  if (embeddedAssets) {
    if (!savedLocally) {
      const bytes = new Blob([JSON.stringify(draftPayload(), null, 2) + '\n'], {type: 'application/json'});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(bytes);
      link.download = `rainline-review-${REVISION}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      get<HTMLElement>('save-status').textContent = 'Review notes downloaded as JSON.';
    } else get<HTMLElement>('save-status').textContent = 'Review notes saved in this browser for this preview.';
    return;
  }
  try {
    const response = await fetch('/api/review-progress', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({...draftPayload(), status: 'review progress only', savedAt: new Date().toISOString()})});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    get<HTMLElement>('save-status').textContent = 'Review notes saved locally. This does not approve rendering.';
  } catch {
    get<HTMLElement>('save-status').textContent = 'Server save failed; notes remain in this browser.';
  }
};

audio.addEventListener('play', () => {if (!intendedPlaying) {audio.pause(); return;} get<HTMLButtonElement>('play').textContent = 'Pause';});
audio.addEventListener('pause', () => get<HTMLButtonElement>('play').textContent = audio.ended ? 'Replay recording' : 'Play recording');
audio.addEventListener('seeked', completeSeek);
audio.addEventListener('error', () => status.textContent = 'Soundtrack unavailable. Keep the local server running, then use Restore visuals to reconnect.');
audio.addEventListener('canplay', () => {clearTimeout(waitingTimer); if (status.dataset.sceneError !== 'true') status.textContent = '';});
audio.addEventListener('waiting', () => {clearTimeout(waitingTimer); waitingTimer = setTimeout(() => status.textContent = 'Buffering soundtrack. Use Restore visuals if it does not resume.', 3000);});
audio.addEventListener('loadedmetadata', () => {seek.max = String(duration()); get<HTMLElement>('duration').textContent = seconds(duration());});

function tick() {
  draw();
  const time = seekTarget ?? audio.currentTime;
  seek.value = String(time);
  get<HTMLElement>('time').textContent = seconds(time);
  if (intendedPlaying && cues.length) selectVisibleCue(time);
  requestAnimationFrame(tick);
}

const params = new URLSearchParams(location.search);
if (params.get('format') === 'portrait') format = 'portrait';
if (params.get('clean') === '1') document.body.classList.add('clean');
for (const name of ['landscape', 'portrait'] as const) get<HTMLButtonElement>(name).classList.toggle('selected', name === format);
get<HTMLElement>('cue-count').textContent = `${cues.length} lyric cues`;
const startAt = Number(params.get('t') ?? 0);
if (Number.isFinite(startAt) && startAt > 0) {
  if (audio.readyState >= 1) seekTo(Math.min(startAt, DURATION_SECONDS - .1));
  else audio.addEventListener('loadedmetadata', () => seekTo(Math.min(startAt, duration() - .1)), {once: true});
}
new ResizeObserver(() => {resize(); draw(true);}).observe(stageWrap);
updateSelected(); resize(); draw(true); void loadArt(); tick();
