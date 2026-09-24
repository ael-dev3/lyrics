// src/model.ts
function visibleLineAt(timeline2, seconds) {
  const sample = Math.round(seconds * timeline2.sampleRate);
  return timeline2.lines.find((line) => sample >= line.visibleFromSample && sample < line.visibleUntilSample) ?? null;
}
function activeSourceIds(line, sample) {
  return new Set(line.es.filter((word) => sample >= word.startSample && sample < word.endSample).map((word) => word.id));
}
function activeTargetIndices(line, sourceIds) {
  return new Set(line.en.flatMap((word, index) => word.sourceIds.some((id) => sourceIds.has(id)) ? [index] : []));
}
function validateTimeline(timeline2) {
  if (timeline2.sampleRate !== 44100 || timeline2.durationSeconds < 260 || timeline2.lines.length !== 24) {
    throw Error("Unexpected source clock or lyric coverage");
  }
  const allIds = /* @__PURE__ */ new Set();
  let previousStart = -1;
  let previousVisibleUntil = -1;
  for (const line of timeline2.lines) {
    if (!line.es.length || !line.en.length) throw Error(`${line.id}: empty language lane`);
    const first = line.es[0];
    const last = line.es.at(-1);
    if (first.startSample <= previousStart) throw Error(`${line.id}: lines out of order`);
    if (line.visibleFromSample < previousVisibleUntil) throw Error(`${line.id}: hides the preceding line during a cue overlap`);
    previousStart = first.startSample;
    previousVisibleUntil = line.visibleUntilSample;
    if (line.visibleFromSample > first.startSample || line.visibleUntilSample <= last.endSample) {
      throw Error(`${line.id}: line visibility clips its words`);
    }
    let previousWordStart = -1;
    for (const word of line.es) {
      if (allIds.has(word.id)) throw Error(`Duplicate word ID: ${word.id}`);
      allIds.add(word.id);
      if (word.startSample < previousWordStart || word.endSample <= word.startSample) {
        throw Error(`${word.id}: invalid word interval`);
      }
      if (word.startSample < line.visibleFromSample || word.endSample > line.visibleUntilSample) {
        throw Error(`${word.id}: word clipped by line visibility`);
      }
      previousWordStart = word.startSample;
    }
    const mapped = new Set(line.en.flatMap((word) => word.sourceIds));
    for (const word of line.en) {
      if (!word.sourceIds.length || word.sourceIds.some((id) => !line.es.some((source) => source.id === id))) {
        throw Error(`${line.id}: incomplete English mapping for ${word.text}`);
      }
    }
    for (const word of line.es) if (!mapped.has(word.id)) throw Error(`${word.id}: no English meaning`);
  }
}

// src/visual.ts
function featureAt(bytes, metadata, seconds) {
  const stride = metadata.bandCount + 2;
  const position = Math.max(0, Math.min(metadata.frameCount - 1, seconds * metadata.framesPerSecond));
  const first = Math.floor(position);
  const second = Math.min(metadata.frameCount - 1, first + 1);
  const mix = position - first;
  const sample = (offset) => ((bytes[first * stride + offset] ?? 0) * (1 - mix) + (bytes[second * stride + offset] ?? 0) * mix) / 255;
  return { rms: sample(0), flux: sample(1), bands: Array.from({ length: metadata.bandCount }, (_, i) => sample(i + 2)) };
}
var clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
function paintAtmosphere(canvas, aspect2, seconds, audio) {
  const width = aspect2 === "landscape" ? 1920 : 1080;
  const height = aspect2 === "landscape" ? 1080 : 1920;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return 0;
  ctx.clearRect(0, 0, width, height);
  const pressure = clamp((audio.rms - 0.82) / 0.12);
  const pulse = clamp(audio.flux * 1.25);
  const centerX = width / 2;
  const smokeY = aspect2 === "landscape" ? 250 : 310;
  ctx.lineCap = "round";
  for (const side of [-1, 1]) {
    for (let strand = 0; strand < 4; strand++) {
      const band = audio.bands[(strand * 5 + (side === 1 ? 2 : 0)) % audio.bands.length] ?? 0;
      const local = clamp((band - 0.26) * 1.65);
      const reach = (aspect2 === "landscape" ? 445 : 300) * (0.91 + 0.09 * pressure);
      const offset = aspect2 === "landscape" ? 235 : 135;
      ctx.beginPath();
      for (let point = 0; point <= 55; point++) {
        const u = point / 55;
        const edge = Math.sin(Math.PI * u);
        const flutter = Math.sin(u * 7 + seconds * 0.18 + strand * 0.82 + side) * 10;
        const breathing = edge * (12 + 26 * local + 12 * pressure) * Math.sin(u * 5.2 + seconds * 0.26 + strand);
        const x = centerX + side * (offset + reach * u + flutter * edge);
        const y = smokeY + strand * 29 + 30 * u + breathing;
        if (point === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(117,83,151,${(0.075 + 0.075 * pressure + 0.055 * local).toFixed(3)})`;
      ctx.lineWidth = 1.8 + 0.9 * pressure;
      ctx.stroke();
    }
  }
  return clamp(0.025 + 0.19 * pulse * (0.35 + pressure), 0, 0.22);
}
function artworkTransform(seconds) {
  const zoom = 1.014 + 8e-3 * Math.sin(seconds / 24);
  const x = 0.28 * Math.sin(seconds / 31);
  const y = 0.16 * Math.cos(seconds / 37);
  return `translate(${x.toFixed(3)}%,${y.toFixed(3)}%) scale(${zoom.toFixed(5)})`;
}

// src/player.ts
var element = (id) => {
  const value = document.getElementById(id);
  if (!value) throw Error(`Missing ${id}`);
  return value;
};
var media = element("source");
var stage = element("stage");
var smoke = element("smoke");
var glint = element("glint");
var esLane = element("es");
var enLane = element("en");
var title = element("title-state");
var seek = element("seek");
var clock = element("clock");
var play = element("play");
var mute = element("mute");
var error = element("error");
var state = element("preview-state");
var lineSelect = element("cue");
var notes = element("notes");
var params = new URLSearchParams(location.search);
if (params.get("diagnostics") === "1") state.hidden = false;
var aspect = params.get("format") === "portrait" ? "portrait" : "landscape";
var timeline;
var featureMeta;
var featureBytes;
var currentLine = null;
var sourceSpans = [];
var targetSpans = [];
var lastPainted = -1;
var presentedFrames = 0;
var lastPresentedMediaTime = 0;
var dataError = false;
function report(message, fatal = false) {
  if (fatal) dataError = true;
  error.textContent = message;
  error.classList.add("show");
}
function clearReport() {
  if (dataError) return;
  error.classList.remove("show");
  error.textContent = "";
}
async function load(path) {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) throw Error(`${path}: HTTP ${response.status}`);
  return response.json();
}
function formatTime(seconds) {
  const whole = Math.floor(Math.max(0, seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
function clamp2(value) {
  return Math.max(0, Math.min(1, value));
}
function makeWords(host, words) {
  host.replaceChildren();
  const spans = [];
  words.forEach((word, index) => {
    if (index) host.append(document.createTextNode(" "));
    const span = document.createElement("span");
    span.className = "word";
    span.textContent = word;
    host.append(span);
    spans.push(span);
  });
  host.classList.remove("empty");
  return spans;
}
function selectLine(line) {
  if (currentLine?.id === line?.id) return;
  currentLine = line;
  if (!line) {
    esLane.classList.add("empty");
    enLane.classList.add("empty");
    sourceSpans = [];
    targetSpans = [];
    return;
  }
  sourceSpans = makeWords(esLane, line.es.map((word) => word.text));
  targetSpans = makeWords(enLane, line.en.map((word) => word.text));
  lineSelect.value = line.id;
}
function paint() {
  if (!timeline || !featureMeta || !featureBytes) return;
  const seconds = Number.isFinite(media.currentTime) ? media.currentTime : 0;
  const frame = Math.round(seconds * 60);
  if (frame === lastPainted) return;
  lastPainted = frame;
  const sample = Math.round(seconds * timeline.sampleRate);
  const line = visibleLineAt(timeline, seconds);
  selectLine(line);
  const active = line ? activeSourceIds(line, sample) : /* @__PURE__ */ new Set();
  const target = line ? activeTargetIndices(line, active) : /* @__PURE__ */ new Set();
  sourceSpans.forEach((span, index) => span.classList.toggle("active", active.has(line?.es[index]?.id ?? "")));
  targetSpans.forEach((span, index) => span.classList.toggle("active", target.has(index)));
  const acoustic = featureAt(featureBytes, featureMeta, seconds);
  glint.style.opacity = String(paintAtmosphere(smoke, aspect, seconds, acoustic));
  media.style.transform = artworkTransform(seconds);
  const intro = clamp2(seconds / 1.2) * clamp2((17 - seconds) / 1.1);
  const tail = clamp2((seconds - 248) / 4) * clamp2((timeline.durationSeconds - seconds) / 2);
  title.style.opacity = String(Math.max(intro, tail));
  seek.value = String(seconds);
  clock.textContent = `${formatTime(seconds)} / ${formatTime(timeline.durationSeconds)}`;
  state.value = JSON.stringify({ time: seconds, format: aspect, line: line?.id ?? null, source: [...active], target: [...target], mediaReady: media.readyState, mediaWidth: media.videoWidth, mediaHeight: media.videoHeight, presentedFrames, lastPresentedMediaTime });
}
function tick() {
  paint();
  requestAnimationFrame(tick);
}
function applyAspect(next) {
  aspect = next;
  stage.classList.toggle("portrait", aspect === "portrait");
  element("landscape").setAttribute("aria-pressed", String(aspect === "landscape"));
  element("portrait").setAttribute("aria-pressed", String(aspect === "portrait"));
  lastPainted = -1;
  paint();
}
async function togglePlayback() {
  if (media.paused) {
    try {
      await media.play();
      clearReport();
    } catch {
      report("The recording could not start. Check the local preview server, then use Restore picture.");
    }
  } else media.pause();
}
try {
  const [rawTimeline, metadata, response] = await Promise.all([
    load("/src/timeline.json"),
    load("/public/audio-features.json"),
    fetch("/public/audio-features.bin", { cache: "no-store" })
  ]);
  if (!response.ok) throw Error(`Audio features: HTTP ${response.status}`);
  timeline = rawTimeline;
  validateTimeline(timeline);
  featureMeta = metadata;
  featureBytes = new Uint8Array(await response.arrayBuffer());
  if (timeline.sourceSha256 !== featureMeta.sourceSha256 || featureBytes.length !== featureMeta.frameCount * (featureMeta.bandCount + 2)) {
    throw Error("The preview timing and measured audio belong to different sources");
  }
  seek.max = String(timeline.durationSeconds);
  lineSelect.replaceChildren(new Option("Jump to lyric line\u2026", ""));
  for (const line of timeline.lines) {
    const start = line.es[0].startSample / timeline.sampleRate;
    lineSelect.add(new Option(`${formatTime(start)} \xB7 ${line.es.map((word) => word.text).join(" ")}`, line.id));
  }
  const noteKey = `el-tesoro-preview-notes-${timeline.sourceSha256}`;
  notes.value = localStorage.getItem(noteKey) ?? "";
  notes.addEventListener("input", () => localStorage.setItem(noteKey, notes.value));
  applyAspect(aspect);
  const requestedSpeed = Number(params.get("speed") ?? "1");
  if ([1, 0.75, 0.5].includes(requestedSpeed)) {
    media.playbackRate = requestedSpeed;
    element("speed").value = String(requestedSpeed);
  }
  const requestedTime = Number(params.get("t") ?? "0");
  const restoreTime = () => {
    media.currentTime = Math.max(0, Math.min(timeline.durationSeconds - 0.05, Number.isFinite(requestedTime) ? requestedTime : 0));
    lastPainted = -1;
    paint();
  };
  if (media.readyState >= 1) restoreTime();
  else media.addEventListener("loadedmetadata", restoreTime, { once: true });
  tick();
} catch (cause) {
  report(`Preview data unavailable: ${cause instanceof Error ? cause.message : String(cause)}. Restart the preview server and restore the picture.`, true);
}
play.onclick = () => void togglePlayback();
media.onplay = () => {
  play.textContent = "\u2161 Pause";
};
media.onpause = () => {
  play.textContent = media.ended ? "\u21A4 Replay" : "\u25B6 Play";
};
media.onerror = () => report("The source recording is unavailable. Restart the local preview server, then use Restore picture.");
media.oncanplay = clearReport;
media.onseeked = () => {
  lastPainted = -1;
  paint();
};
media.onwaiting = () => {
  if (!media.paused) report("Buffering source picture and audio\u2026");
};
media.onplaying = clearReport;
element("restart").onclick = () => {
  media.currentTime = 0;
  lastPainted = -1;
  void media.play();
};
seek.oninput = () => {
  media.currentTime = Number(seek.value);
  lastPainted = -1;
  paint();
};
element("speed").onchange = (event) => {
  media.playbackRate = Number(event.currentTarget.value);
};
element("landscape").onclick = () => applyAspect("landscape");
element("portrait").onclick = () => applyAspect("portrait");
lineSelect.onchange = () => {
  const line = timeline?.lines.find((value) => value.id === lineSelect.value);
  if (line) {
    media.currentTime = Math.max(0, line.es[0].startSample / timeline.sampleRate - 0.55);
    lastPainted = -1;
    paint();
  }
};
mute.onclick = () => {
  media.muted = !media.muted;
  mute.textContent = media.muted ? "Sound off" : "Sound on";
};
element("recover").onclick = () => {
  const url = new URL(location.href);
  url.searchParams.set("t", media.currentTime.toFixed(3));
  url.searchParams.set("format", aspect);
  url.searchParams.set("speed", String(media.playbackRate));
  location.replace(url);
};
if ("requestVideoFrameCallback" in media) {
  const observe = (_now, metadata) => {
    presentedFrames++;
    lastPresentedMediaTime = metadata.mediaTime;
    media.requestVideoFrameCallback(observe);
  };
  media.requestVideoFrameCallback(observe);
}
