// src/model.ts
var PALETTE = { rest: "#b8b8b6", focus: "#f6f4ef", shadow: "#111111", spectrum: "#ddd8ce" };
var SOURCE_FPS = 25;
var object = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
var numbers = (v) => Array.isArray(v) && v.every((x) => typeof x === "number" && Number.isFinite(x));
var texts = (record, keys) => keys.every((k) => typeof record[k] === "string");
function parseTimeline(value) {
  if (!object(value) || value.schemaVersion !== 1 || value.sampleRate !== 48e3 || !texts(value, ["revision", "sourceSha256"]) || !numbers([value.sourceDuration]) || !Array.isArray(value.cues)) throw Error("Invalid timeline JSON");
  for (const c of value.cues) {
    if (!object(c) || !texts(c, ["id", "templateId", "lane", "voice", "sourceLanguage", "targetLanguage", "sourceText", "targetText", "exitMode"]) || !numbers([c.start, c.end, c.visibleStart, c.fullOpacityEnd, c.visibleEnd]) || !numbers(c.sourceBreaks) || !numbers(c.targetBreaks) || !Array.isArray(c.words) || !Array.isArray(c.targets)) throw Error("Invalid cue JSON");
    for (const w of c.words) if (!object(w) || !texts(w, ["id", "text", "method"]) || !numbers([w.sourceIndex, w.startSample, w.endSample]) || !(typeof w.confidence === "string" || typeof w.confidence === "number") || w.punctuationAfter !== void 0 && typeof w.punctuationAfter !== "string") throw Error("Invalid word JSON");
    for (const target of c.targets) if (!object(target) || !texts(target, ["id", "text", "relation", "rationale"]) || !numbers(target.sourceIndices) || !numbers(target.focusSourceIndices)) throw Error("Invalid correspondence JSON");
  }
  const timeline2 = value;
  validateTimeline(timeline2);
  return timeline2;
}
function parseFeatures(value) {
  if (!object(value) || typeof value.sourceSha256 !== "string" || !object(value.analysis) || !object(value.analysis.frameRate) || !numbers([value.analysis.frameRate.numerator, value.analysis.frameRate.denominator, value.analysis.frameCount]) || !Array.isArray(value.rows)) throw Error("Invalid measured-audio JSON");
  if (Number(value.analysis.frameRate.numerator) <= 0 || Number(value.analysis.frameRate.denominator) <= 0 || value.rows.length !== value.analysis.frameCount || !value.rows.length) throw Error("Invalid measured-audio clock");
  for (const row of value.rows) if (!numbers(row) || row.length !== 26 || !row.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) throw Error("Invalid measured-audio row");
  return value;
}
function sourceActive(word, time, sampleRate = 48e3) {
  const scaled = time * sampleRate, nearest = Math.round(scaled);
  const sample = Math.abs(scaled - nearest) <= 2 * Number.EPSILON * Math.max(1, Math.abs(scaled)) ? nearest : scaled;
  return sample >= word.startSample && sample < word.endSample;
}
function targetActive(target, words, time, sampleRate = 48e3) {
  return target.focusSourceIndices.some((index) => words.some((word) => word.sourceIndex === index && sourceActive(word, time, sampleRate)));
}
function visibleCue(timeline2, time) {
  return visibleCues(timeline2, time).find((cue2) => cue2.lane === "lead") ?? visibleCues(timeline2, time)[0];
}
function visibleCues(timeline2, time) {
  return timeline2.cues.filter((cue2) => time >= cue2.visibleStart && time < cue2.visibleEnd);
}
function validateTimeline(t) {
  if (t.schemaVersion !== 1 || t.sampleRate !== 48e3 || !t.cues.length || !Number.isFinite(t.sourceDuration) || t.sourceDuration <= 0 || !/^[a-f0-9]{64}$/.test(t.sourceSha256)) throw Error("Invalid source-clock timeline");
  const ids = /* @__PURE__ */ new Set();
  const prior = /* @__PURE__ */ new Map();
  for (const cue2 of t.cues) {
    if (ids.has(cue2.id)) throw Error(`Duplicate cue ${cue2.id}`);
    ids.add(cue2.id);
    const p = prior.get(cue2.lane) ?? { end: 0, visibleEnd: 0 };
    if (!["lead", "backing"].includes(cue2.lane) || !(cue2.start >= p.end && cue2.end > cue2.start && cue2.visibleStart >= p.visibleEnd && cue2.visibleStart <= cue2.start && cue2.fullOpacityEnd >= cue2.end && cue2.fullOpacityEnd <= cue2.visibleEnd && cue2.visibleEnd <= t.sourceDuration && cue2.end <= t.sourceDuration)) throw Error(`Invalid cue interval ${cue2.id}`);
    if (cue2.exitMode === "vocal-handoff" && cue2.fullOpacityEnd !== cue2.visibleEnd) throw Error(`Invalid continuous handoff ${cue2.id}`);
    if (cue2.exitMode === "fade" && cue2.visibleEnd - cue2.fullOpacityEnd < 0.419999) throw Error(`Compressed reading fade ${cue2.id}`);
    prior.set(cue2.lane, { end: cue2.end, visibleEnd: cue2.visibleEnd });
    if (!cue2.words.length || !cue2.targets.length || !["fade", "vocal-handoff"].includes(cue2.exitMode)) throw Error(`Empty or unknown cue ${cue2.id}`);
    let wordEnd = 0;
    cue2.words.forEach((w, i) => {
      if (w.sourceIndex !== i || !(w.startSample >= wordEnd && w.endSample > w.startSample) || !Number.isSafeInteger(w.startSample) || !Number.isSafeInteger(w.endSample)) throw Error(`Invalid word interval ${w.id}`);
      if (w.startSample < Math.round(cue2.start * t.sampleRate) - 1 || w.endSample > Math.round(cue2.end * t.sampleRate) + 1) throw Error(`Word outside cue ${w.id}`);
      wordEnd = w.endSample;
    });
    const mapped = /* @__PURE__ */ new Set();
    for (const target of cue2.targets) {
      if (!target.focusSourceIndices.length || !target.rationale) throw Error(`Missing semantic justification ${target.id}`);
      for (const i of target.focusSourceIndices) {
        if (!Number.isInteger(i) || !cue2.words[i]) throw Error(`Missing semantic anchor ${target.id}`);
        mapped.add(i);
      }
    }
    cue2.words.forEach((w) => {
      if (!mapped.has(w.sourceIndex)) throw Error(`Unmapped source word ${w.id}`);
    });
  }
}

// src/scene.ts
var SOURCE_VIEWS = { landscape: [0, 210, 1080, 607.5], portrait: [170, 0, 607.5, 1080] };
var COMPOSITION = {
  landscape: { width: 1920, height: 1080, reading: [155, 26, 1610, 302] },
  portrait: { width: 1080, height: 1920, reading: [115, 1430, 850, 340] }
};
var SOURCE_MUSIC_EDGE = { from: [712, 641], to: [565, 807] };
var MUSIC_LINE = {
  landscape: { points: 65, strokeWidth: 3, maxDeviation: 11 },
  portrait: { points: 65, strokeWidth: 3, maxDeviation: 11 }
};
var clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
var smooth = (a, b, t) => {
  const u = clamp((t - a) / (b - a));
  return u * u * (3 - 2 * u);
};
var font = (n) => `600 ${n}px Cormorant`;
var shown = (w) => w.text + (w.punctuationAfter ?? "");
var timeline;
var features;
var identity;
var effectsEnabled = true;
var responses = [];
var layouts = /* @__PURE__ */ new Map();
var lastVisualizer = { enabled: true, points: 0, kind: "edge-filament", opacity: 0, peakDeviation: 0 };
var shades = /* @__PURE__ */ new Map();
function prepareResponse() {
  const hz = features.analysis.frameRate.numerator / features.analysis.frameRate.denominator;
  const prior = Array(24).fill(0);
  responses = [];
  for (const row of features.rows) {
    const rms = -96 + row[0] * 96 / 255, gate = smooth(-62, -27, rms);
    const raw = Array.from({ length: 24 }, (_, i) => Math.pow(clamp((-96 + row[i + 2] * 96 / 255 + 61) / 41), 1.25) * gate);
    const spatial = raw.map((value, i) => (value * 2 + raw[Math.max(0, i - 1)] + raw[Math.min(23, i + 1)]) / 4);
    responses.push(spatial.map((value, i) => {
      const tau = value > prior[i] ? 0.06 : 0.28;
      prior[i] = prior[i] + (value - prior[i]) * (1 - Math.exp(-1 / (hz * tau)));
      return prior[i];
    }));
  }
}
function visualizerGeometry(t, format2 = "landscape") {
  const p = clamp(t * features.analysis.frameRate.numerator / features.analysis.frameRate.denominator, 0, responses.length - 1), i = Math.floor(p), u = p - i, j = Math.min(i + 1, responses.length - 1), spec = MUSIC_LINE[format2];
  const ending = 1 - smooth(timeline.sourceDuration - 1.4, timeline.sourceDuration - 0.06, t);
  const rms = -96 + (features.rows[i][0] * (1 - u) + features.rows[j][0] * u) * 96 / 255;
  const opacity = (0.46 + 0.38 * smooth(-25, -9, rms)) * smooth(-62, -42, rms) * ending;
  const view = SOURCE_VIEWS[format2], scale = COMPOSITION[format2].width / view[2];
  const [ax, ay] = SOURCE_MUSIC_EDGE.from, [bx, by] = SOURCE_MUSIC_EDGE.to;
  const length = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / length, ny = (bx - ax) / length;
  const points = Array.from({ length: spec.points }, (_, index) => {
    const position = index / (spec.points - 1), band = position * 23, lo = Math.floor(band), hi = Math.min(23, lo + 1), mix = band - lo;
    const at = (b) => responses[i][b] * (1 - u) + responses[j][b] * u;
    const level = at(lo) * (1 - mix) + at(hi) * mix;
    const deviation = -Math.sin(position * Math.PI * 4) * Math.sin(position * Math.PI) * level * spec.maxDeviation;
    return { index, bandPosition: band, x: (ax + (bx - ax) * position - view[0]) * scale + nx * deviation, y: (ay + (by - ay) * position - view[1]) * scale + ny * deviation, deviation, level };
  });
  return { points, opacity };
}
function getVisualizerState() {
  return { ...lastVisualizer };
}
function musicLine(ctx2, t, format2) {
  const geometry = visualizerGeometry(t, format2);
  lastVisualizer = { enabled: effectsEnabled, kind: "edge-filament", points: effectsEnabled ? geometry.points.length : 0, opacity: effectsEnabled ? geometry.opacity : 0, peakDeviation: effectsEnabled ? Math.max(...geometry.points.map((p) => Math.abs(p.deviation))) : 0 };
  if (!effectsEnabled || geometry.opacity < 2e-3) return;
  ctx2.save();
  ctx2.globalAlpha = geometry.opacity;
  ctx2.strokeStyle = "#d9dcdb";
  ctx2.shadowColor = "rgba(8,8,8,.9)";
  ctx2.shadowBlur = 1;
  ctx2.shadowOffsetY = 0;
  ctx2.lineWidth = MUSIC_LINE[format2].strokeWidth;
  ctx2.lineCap = "round";
  ctx2.lineJoin = "round";
  const pts = geometry.points;
  ctx2.beginPath();
  ctx2.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    ctx2.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
  }
  const last = pts.at(-1);
  ctx2.lineTo(last.x, last.y);
  ctx2.stroke();
  ctx2.restore();
}
function prepareShades(factory) {
  for (const format2 of ["landscape", "portrait"]) {
    const p = COMPOSITION[format2], surface = factory(p.width, p.height), ctx2 = surface.context;
    const g = ctx2.createLinearGradient(0, format2 === "portrait" ? 1320 : 0, 0, format2 === "portrait" ? 1920 : 450);
    if (format2 === "portrait") {
      g.addColorStop(0, "rgba(10,10,10,0)");
      g.addColorStop(0.36, "rgba(10,10,10,.50)");
      g.addColorStop(1, "rgba(10,10,10,.68)");
    } else {
      g.addColorStop(0, "rgba(10,10,10,.69)");
      g.addColorStop(0.55, "rgba(10,10,10,.57)");
      g.addColorStop(1, "rgba(10,10,10,0)");
    }
    ctx2.fillStyle = g;
    ctx2.fillRect(0, 0, p.width, p.height);
    shades.set(format2, surface.canvas);
  }
}
function initializeScene(t, f, factory, _reference, previewIdentity) {
  validateTimeline(t);
  if (t.sourceSha256 !== f.sourceSha256) throw Error("Recording/feature mismatch");
  timeline = t;
  features = f;
  identity = previewIdentity;
  layouts.clear();
  prepareResponse();
  prepareShades(factory);
}
async function loadScene() {
  const json = async (path) => {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) throw Error("Missing preview asset " + path);
    return r.json();
  };
  const [t, f, i] = await Promise.all([json("/public/timeline.json"), json("/public/audio-features.json"), json("/public/preview-identity.json")]);
  const face = new FontFace("Cormorant", "url('/public/fonts/Cormorant.ttf')", { weight: "600" });
  await face.load();
  document.fonts.add(face);
  await document.fonts.ready;
  const picture = new Image();
  picture.src = "/public/artwork-reference.png";
  await picture.decode();
  if (typeof i !== "object" || i === null || !["revision", "sourceSha256", "timelineSha256", "sceneSha256"].every((k) => typeof i[k] === "string")) throw Error("Invalid loaded identity");
  const bound = i, parsed = parseTimeline(t);
  if (bound.revision !== parsed.revision || bound.sourceSha256 !== parsed.sourceSha256) throw Error("Stale source/timing identity");
  initializeScene(parsed, parseFeatures(f), (w, h) => {
    const canvas2 = document.createElement("canvas");
    canvas2.width = w;
    canvas2.height = h;
    const context2 = canvas2.getContext("2d");
    if (!context2) throw Error("Canvas unavailable");
    return { canvas: canvas2, context: context2 };
  }, picture, bound);
}
function setEffectsEnabled(v) {
  effectsEnabled = v;
}
function getEffectsEnabled() {
  return effectsEnabled;
}
function getLines() {
  return timeline.cues.map((c) => ({ id: c.id, label: c.sourceText, start: c.start, end: c.end }));
}
function getReadingCue(t) {
  return visibleCue(timeline, t);
}
function getReadingCues(t) {
  return visibleCues(timeline, t);
}
function getSceneIdentity() {
  return { ...identity, revision: timeline.revision, sourceSha256: timeline.sourceSha256, sampleRate: timeline.sampleRate };
}
function cueOpacity(c, t) {
  if (t < c.visibleStart || t >= c.visibleEnd) return 0;
  return (t >= c.start ? 1 : smooth(c.visibleStart, c.start, t)) * (c.exitMode === "vocal-handoff" ? 1 : 1 - smooth(c.fullOpacityEnd, c.visibleEnd, t));
}
function wrap(ctx2, tokens, size, width) {
  ctx2.font = font(size);
  const space = ctx2.measureText(" ").width, items = tokens.map((w, index) => ({ index, text: shown(w), width: ctx2.measureText(shown(w)).width }));
  const costs = Array(items.length + 1).fill(Infinity), next = Array(items.length).fill(0);
  costs[items.length] = 0;
  for (let i = items.length - 1; i >= 0; i--) {
    let used = 0;
    for (let j = i; j < items.length; j++) {
      used += items[j].width + (j === i ? 0 : space);
      if (used > width && j > i) break;
      const last = j === items.length - 1, ragged = (width - used) ** 2 * (last ? 0.3 : 1), runt = j === i && items.length > 3 ? width * width * 0.4 : 0;
      const cost = ragged + runt + costs[j + 1];
      if (cost < costs[i]) {
        costs[i] = cost;
        next[i] = j + 1;
      }
    }
  }
  const rows = [];
  for (let i = 0; i < items.length; ) {
    const j = Math.max(i + 1, next[i]);
    rows.push(items.slice(i, j));
    i = j;
  }
  return rows;
}
function layoutCue(ctx2, c, format2) {
  const key = format2 + ":" + c.id, prior = layouts.get(key);
  if (prior) return prior;
  const p = COMPOSITION[format2], r = p.reading;
  let size = format2 === "portrait" ? 61 : 66;
  const rowsFor = (tokens, breaks) => {
    const stops = [0, ...breaks, tokens.length];
    return stops.slice(0, -1).flatMap((start, i) => wrap(ctx2, tokens.slice(start, stops[i + 1]), size, r[2]).map((row) => row.map((w) => ({ ...w, index: w.index + start }))));
  };
  let a = rowsFor(c.words, c.sourceBreaks), b = rowsFor(c.targets, c.targetBreaks);
  while ((a.length + b.length) * size * 1.15 + size * 0.45 > r[3] && size > 48) {
    size--;
    a = rowsFor(c.words, c.sourceBreaks);
    b = rowsFor(c.targets, c.targetBreaks);
  }
  const step = size * 1.15, gap = size * 0.45, total = (a.length + b.length) * step + gap, top = r[1] + (r[3] - total) / 2;
  if (total > r[3]) throw Error("Reading block overflow " + c.id + "/" + format2);
  ctx2.font = font(size);
  const space = ctx2.measureText(" ").width;
  const place = (rows, offset) => rows.flatMap((line, row) => {
    const length = line.reduce((n, w) => n + w.width, 0) + space * (line.length - 1);
    let x = p.width / 2 - length / 2;
    return line.map((w) => {
      const result2 = { ...w, x, y: top + offset + row * step + size };
      x += w.width + space;
      return result2;
    });
  });
  const result = { size, source: place(a, 0), target: place(b, a.length * step + gap), top, bottom: top + total, duet: false };
  layouts.set(key, result);
  return result;
}
function lyrics(ctx2, c, t, format2) {
  const opacity = cueOpacity(c, t);
  if (opacity <= 0) return;
  const l = layoutCue(ctx2, c, format2);
  ctx2.save();
  ctx2.globalAlpha = opacity;
  ctx2.font = font(l.size);
  ctx2.textBaseline = "alphabetic";
  ctx2.textAlign = "left";
  ctx2.lineJoin = "round";
  for (const [slots, original] of [[l.source, true], [l.target, false]]) for (const s of slots) {
    const active = original ? sourceActive(c.words[s.index], t, 48e3) : targetActive(c.targets[s.index], c.words, t, 48e3);
    ctx2.shadowColor = "rgba(8,8,8,.94)";
    ctx2.shadowBlur = 4;
    ctx2.shadowOffsetX = 0;
    ctx2.shadowOffsetY = 2;
    ctx2.lineWidth = 1.4;
    ctx2.strokeStyle = "rgba(8,8,8,.72)";
    ctx2.strokeText(s.text, s.x, s.y);
    ctx2.fillStyle = active ? PALETTE.focus : PALETTE.rest;
    ctx2.fillText(s.text, s.x, s.y);
  }
  ctx2.restore();
}
function paintScene(ctx2, t, format2, source) {
  const p = COMPOSITION[format2], v = SOURCE_VIEWS[format2];
  ctx2.save();
  ctx2.clearRect(0, 0, p.width, p.height);
  ctx2.drawImage(source, v[0], v[1], v[2], v[3], 0, 0, p.width, p.height);
  ctx2.drawImage(shades.get(format2), 0, 0);
  musicLine(ctx2, t, format2);
  for (const c of visibleCues(timeline, t)) lyrics(ctx2, c, t, format2);
  ctx2.restore();
}

// src/player.ts
function element(id) {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing preview element: ${id}`);
  return found;
}
var video = element("soundtrack");
var canvas = element("film");
var context = canvas.getContext("2d");
if (!context) throw new Error("This browser cannot create the film canvas.");
var ctx = context;
var stage = element("stage");
var loading = element("loading");
var play = element("play");
var still = element("download-still");
var seek = element("seek");
var seconds = element("seconds");
var speed = element("speed");
var cue = element("cue");
var clock = element("clock");
var currentCue = element("current-cue");
var status = element("status");
var error = element("error");
var referenceDialog = element("reference-dialog");
var reference = element("reference-video");
var query = new URLSearchParams(location.search);
setEffectsEnabled(query.get("effects") !== "off");
var hasFrameCallback = typeof video.requestVideoFrameCallback === "function";
var format = query.get("format") === "portrait" ? "portrait" : "landscape";
var sceneReady = false;
var metadataReady = false;
var paintFailed = false;
var mediaFailed = false;
var decodedFrameTime = null;
var pendingSeekTarget = null;
var lastPaintTime = -1;
var lastCueId;
var referencePlayPending = false;
var referencePlaybackBlocked = false;
var frameCallbackId = null;
var queryNumber = (key, fallback) => {
  const value = Number(query.get(key) ?? fallback);
  return Number.isFinite(value) ? value : fallback;
};
var requestedTime = Math.max(0, queryNumber("t", 0));
var requestedSpeed = queryNumber("speed", 1);
video.playbackRate = [1, 0.75, 0.5].includes(requestedSpeed) ? requestedSpeed : 1;
speed.value = String(video.playbackRate);
function duration() {
  return Number.isFinite(video.duration) ? video.duration : 0;
}
function boundedTime(value) {
  return Math.min(duration(), Math.max(0, Number.isFinite(value) ? value : 0));
}
function readableTime(value) {
  const whole = Math.floor(Math.max(0, value));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
function report(message) {
  error.textContent = message;
  error.hidden = false;
}
function clearReport() {
  if (paintFailed || mediaFailed) return;
  error.textContent = "";
  error.hidden = true;
}
function setBusy(message) {
  stage.classList.toggle("busy", message !== null);
  stage.setAttribute("aria-busy", String(message !== null));
  loading.value = message ?? "";
  loading.hidden = message === null;
  still.disabled = message !== null || lastPaintTime < 0 || paintFailed;
}
function updateUrl() {
  const url = new URL(location.href);
  url.searchParams.set("t", video.currentTime.toFixed(3));
  url.searchParams.set("format", format);
  url.searchParams.set("speed", String(video.playbackRate));
  url.searchParams.set("effects", getEffectsEnabled() ? "on" : "off");
  url.searchParams.delete("playing");
  history.replaceState(null, "", url);
}
function updatePlaybackState() {
  play.textContent = video.paused ? video.ended ? "Replay" : "Play" : "Pause";
  play.setAttribute("aria-label", video.paused ? "Play original video with lyrics" : "Pause original video with lyrics");
  play.setAttribute("aria-pressed", String(!video.paused));
  status.value = paintFailed || mediaFailed ? "Preview unavailable" : !sceneReady ? "Loading lyric scene\u2026" : !metadataReady ? "Loading original video\u2026" : video.seeking || pendingSeekTarget !== null ? "Seeking original video\u2026" : decodedFrameTime === null ? "Decoding original picture\u2026" : video.ended ? "End of preview" : video.paused ? "Paused" : "Playing";
  play.disabled = !sceneReady || !metadataReady || paintFailed || mediaFailed;
}
function synchronizeReference() {
  if (!referenceDialog.open || reference.readyState < 1) return;
  reference.muted = true;
  reference.playbackRate = video.playbackRate;
  const target = Math.min(video.currentTime, Math.max(0, reference.duration - 1e-3));
  if (Number.isFinite(target) && Math.abs(reference.currentTime - target) > 0.08) reference.currentTime = target;
  if (video.paused || video.ended) {
    if (!reference.paused) reference.pause();
  } else if (reference.paused && !referencePlayPending && !referencePlaybackBlocked && !reference.ended) {
    referencePlayPending = true;
    void reference.play().catch(() => {
      referencePlaybackBlocked = true;
      element("reference-status").textContent = "Reference playback was blocked. Close this panel, press Play, then reopen it.";
    }).finally(() => {
      referencePlayPending = false;
    });
  }
}
function updateControls(time = video.currentTime) {
  seek.value = String(time);
  if (document.activeElement !== seconds) seconds.value = time.toFixed(3);
  clock.value = `${readableTime(time)} / ${readableTime(duration())}`;
  if (sceneReady) {
    const line = getReadingCue(time);
    if ((line?.id ?? null) !== lastCueId) {
      lastCueId = line?.id ?? null;
      currentCue.value = line ? line.sourceText : "No lyric cue at this point";
      cue.value = line?.id ?? "";
    }
  }
}
function frameMatchesTarget(time, target) {
  const tolerance = target > duration() - 0.12 ? 0.12 : 1 / SOURCE_FPS + 5e-3;
  return Math.abs(time - target) <= tolerance;
}
function frameResolvesSeek(time, target) {
  if (video.paused || video.seeking) return frameMatchesTarget(time, target);
  return time >= target - 1 / SOURCE_FPS - 5e-3 && Math.abs(time - video.currentTime) <= 0.15;
}
function drawDecodedFrame() {
  if (!sceneReady || paintFailed || mediaFailed || video.seeking || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || decodedFrameTime === null) return;
  if (pendingSeekTarget !== null) {
    if (!frameResolvesSeek(decodedFrameTime, pendingSeekTarget)) return;
    pendingSeekTarget = null;
  }
  if (!video.paused && !video.ended && hasFrameCallback && Math.abs(video.currentTime - decodedFrameTime) > 0.16) {
    setBusy("Resuming original picture\u2026");
    scheduleVideoFrame();
    return;
  }
  try {
    const paintStarted = performance.now();
    const wordTime = video.ended ? duration() : video.currentTime;
    paintScene(ctx, wordTime, format, video);
    canvas.dataset.paintMilliseconds = (performance.now() - paintStarted).toFixed(2);
    canvas.dataset.visualizer = JSON.stringify(getVisualizerState());
    lastPaintTime = wordTime;
    canvas.dataset.wordTime = wordTime.toFixed(6);
    const reading = getReadingCue(wordTime), readings = getReadingCues(wordTime);
    canvas.dataset.lyricCue = reading?.id ?? "";
    canvas.dataset.lyricOpacity = (reading ? cueOpacity(reading, wordTime) : 0).toFixed(6);
    canvas.dataset.lyricHoldEnd = reading?.fullOpacityEnd.toFixed(6) ?? "";
    canvas.dataset.lyricClearAt = reading?.visibleEnd.toFixed(6) ?? "";
    canvas.dataset.sourceTime = decodedFrameTime.toFixed(6);
    canvas.dataset.sourceFrame = String(Math.round(decodedFrameTime * SOURCE_FPS));
    canvas.dataset.clock = "one-source-video.currentTime; native-picture-PTS-separate";
    canvas.dataset.sourceWordEvents = JSON.stringify(reading?.words.map((w) => ({ id: w.id, startSample: w.startSample, endSample: w.endSample })) ?? []);
    canvas.dataset.activeSourceWords = JSON.stringify(readings.flatMap((c) => c.words.filter((w) => sourceActive(w, wordTime)).map((w) => ({ lane: c.lane, voice: c.voice, text: w.text }))));
    canvas.dataset.activeTargetWords = JSON.stringify(readings.flatMap((c) => c.targets.filter((w) => targetActive(w, c.words, wordTime)).map((w) => ({ lane: c.lane, voice: c.voice, text: w.text }))));
    canvas.dataset.readingCues = JSON.stringify(readings.map((c) => ({ id: c.id, lane: c.lane, opacity: cueOpacity(c, wordTime) })));
    setBusy(null);
    updateControls(wordTime);
    updatePlaybackState();
  } catch (cause) {
    paintFailed = true;
    video.pause();
    setBusy("Original-video preview unavailable");
    report(`The original-video scene could not be drawn: ${cause instanceof Error ? cause.message : String(cause)}. Use Restore preview to reload the complete source and lyric scene.`);
    updatePlaybackState();
  }
}
function scheduleVideoFrame() {
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
function fallbackDecodedFrame() {
  if (hasFrameCallback || video.seeking || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
  decodedFrameTime = video.currentTime;
  drawDecodedFrame();
}
function animate() {
  if (!hasFrameCallback && !video.paused) fallbackDecodedFrame();
  if (!video.paused && !video.seeking && pendingSeekTarget === null) drawDecodedFrame();
  updateControls(video.currentTime);
  synchronizeReference();
  requestAnimationFrame(animate);
}
function setFormat(next) {
  format = next;
  stage.classList.toggle("portrait", next === "portrait");
  canvas.width = next === "landscape" ? 1920 : 1080;
  canvas.height = next === "landscape" ? 1080 : 1920;
  element("landscape").setAttribute("aria-pressed", String(next === "landscape"));
  element("portrait").setAttribute("aria-pressed", String(next === "portrait"));
  drawDecodedFrame();
}
async function beginPlayback() {
  if (!sceneReady || !metadataReady || paintFailed || mediaFailed) return;
  if (video.ended) setTime(0);
  try {
    await video.play();
    clearReport();
  } catch {
    report("Playback needs a browser gesture. Press Play to start the original video and soundtrack.");
  }
}
function setTime(value) {
  if (!metadataReady) return;
  const target = boundedTime(value);
  if (Math.abs(target - video.currentTime) < 5e-4 && !video.seeking && decodedFrameTime !== null) {
    drawDecodedFrame();
    updateUrl();
    return;
  }
  pendingSeekTarget = target;
  decodedFrameTime = null;
  setBusy("Seeking original video\u2026");
  video.currentTime = target;
  scheduleVideoFrame();
  updatePlaybackState();
  updateControls(target);
  updateUrl();
}
play.addEventListener("click", () => {
  if (video.paused) void beginPlayback();
  else video.pause();
});
element("fullscreen").addEventListener("click", () => {
  void stage.requestFullscreen().catch(() => report("Fullscreen is unavailable in this browser. The complete preview remains playable here."));
});
element("restart").addEventListener("click", () => {
  setTime(0);
  void beginPlayback();
});
seek.addEventListener("input", () => setTime(Number(seek.value)));
seconds.addEventListener("change", () => setTime(Number(seconds.value)));
seconds.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    setTime(Number(seconds.value));
    seconds.blur();
  }
});
speed.addEventListener("change", () => {
  const value = Number(speed.value);
  video.playbackRate = [1, 0.75, 0.5].includes(value) ? value : 1;
  synchronizeReference();
  updateUrl();
});
for (const value of ["landscape", "portrait"]) element(value).addEventListener("click", () => {
  setFormat(value);
  updateUrl();
});
function updateEffects() {
  const button = element("effects");
  button.textContent = getEffectsEnabled() ? "Animation on" : "Animation off";
  button.setAttribute("aria-pressed", String(getEffectsEnabled()));
  canvas.dataset.effects = getEffectsEnabled() ? "on" : "off";
}
element("effects").addEventListener("click", () => {
  setEffectsEnabled(!getEffectsEnabled());
  updateEffects();
  drawDecodedFrame();
  updateUrl();
});
updateEffects();
cue.addEventListener("change", () => {
  const line = getLines().find((value) => value.id === cue.value);
  if (line) setTime(Math.max(0, line.start - 0.4));
});
element("mute").addEventListener("click", () => {
  video.muted = !video.muted;
  element("mute").textContent = video.muted ? "Sound off" : "Sound on";
  element("mute").setAttribute("aria-pressed", String(video.muted));
});
element("recover").addEventListener("click", () => {
  const url = new URL(location.href);
  url.searchParams.set("t", video.currentTime.toFixed(3));
  url.searchParams.set("format", format);
  url.searchParams.set("speed", String(video.playbackRate));
  url.searchParams.set("playing", video.paused ? "0" : "1");
  url.searchParams.set("effects", getEffectsEnabled() ? "on" : "off");
  url.searchParams.set("muted", video.muted ? "1" : "0");
  video.pause();
  reference.pause();
  location.replace(url);
});
video.muted = query.get("muted") === "1";
element("mute").textContent = video.muted ? "Sound off" : "Sound on";
element("mute").setAttribute("aria-pressed", String(video.muted));
still.addEventListener("click", () => {
  if (lastPaintTime < 0 || pendingSeekTarget !== null || video.seeking || paintFailed) return;
  const time = lastPaintTime, snapshotFormat = format;
  canvas.toBlob((blob) => {
    if (!blob) {
      report("The review still could not be saved. Try Restore preview.");
      return;
    }
    const url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url;
    link.download = `NICHEGO-NET-${snapshotFormat}-${time.toFixed(3)}s.png`;
    link.hidden = true;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 3e4);
  }, "image/png");
});
element("show-reference").addEventListener("click", () => {
  referencePlaybackBlocked = false;
  if (!reference.getAttribute("src")) {
    reference.src = "/public/source.mp4";
    reference.load();
  }
  element("reference-status").textContent = "The same original picture without added lyrics or visualization. Muted to preserve one soundtrack.";
  referenceDialog.showModal();
  synchronizeReference();
});
element("close-reference").addEventListener("click", () => referenceDialog.close());
referenceDialog.addEventListener("close", () => reference.pause());
reference.addEventListener("loadedmetadata", synchronizeReference);
reference.addEventListener("canplay", synchronizeReference);
reference.addEventListener("volumechange", () => {
  if (!reference.muted) reference.muted = true;
});
reference.addEventListener("error", () => {
  element("reference-status").textContent = "The source comparison is unavailable. Check the local source file and server.";
});
function loadedMetadata() {
  if (metadataReady) return;
  metadataReady = duration() > 0;
  seek.max = String(duration());
  seconds.max = String(duration());
  seek.disabled = !metadataReady;
  seconds.disabled = !metadataReady;
  if (requestedTime > 0) setTime(requestedTime);
  updatePlaybackState();
  scheduleVideoFrame();
  if (sceneReady && query.get("playing") === "1") void beginPlayback();
}
video.addEventListener("loadedmetadata", loadedMetadata);
video.addEventListener("loadeddata", () => {
  fallbackDecodedFrame();
  scheduleVideoFrame();
});
video.addEventListener("seeking", () => {
  if (pendingSeekTarget === null) pendingSeekTarget = video.currentTime;
  setBusy("Seeking original video\u2026");
  updatePlaybackState();
});
video.addEventListener("seeked", () => {
  fallbackDecodedFrame();
  drawDecodedFrame();
  scheduleVideoFrame();
  updatePlaybackState();
});
video.addEventListener("play", updatePlaybackState);
video.addEventListener("pause", () => {
  drawDecodedFrame();
  updatePlaybackState();
  synchronizeReference();
  updateUrl();
});
video.addEventListener("ended", () => {
  updatePlaybackState();
  drawDecodedFrame();
  updateControls(duration());
});
video.addEventListener("canplay", () => {
  clearReport();
  fallbackDecodedFrame();
  scheduleVideoFrame();
});
video.addEventListener("playing", () => {
  clearReport();
  updatePlaybackState();
  scheduleVideoFrame();
});
video.addEventListener("waiting", () => {
  if (!video.paused) status.value = "Buffering original video\u2026";
});
video.addEventListener("error", () => {
  mediaFailed = true;
  setBusy("Original source video unavailable");
  report("The original source video could not load or decode. Check public/source.mp4 and the local server, then use Restore preview.");
  updatePlaybackState();
});
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    scheduleVideoFrame();
    if (video.paused) {
      fallbackDecodedFrame();
      drawDecodedFrame();
    }
  }
});
document.addEventListener("keydown", (event) => {
  const target = event.target;
  if (referenceDialog.open || target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement || target instanceof HTMLButtonElement) return;
  if (event.code === "Space") {
    event.preventDefault();
    if (video.paused) void beginPlayback();
    else video.pause();
  }
});
setBusy("Loading original video and lyric scene\u2026");
setFormat(format);
updatePlaybackState();
scheduleVideoFrame();
requestAnimationFrame(animate);
if (video.readyState >= HTMLMediaElement.HAVE_METADATA) loadedMetadata();
try {
  await loadScene();
  sceneReady = true;
  const identity2 = getSceneIdentity();
  canvas.dataset.timelineRevision = identity2.revision;
  canvas.dataset.sourceSha256 = identity2.sourceSha256;
  canvas.dataset.timelineSha256 = identity2.timelineSha256 ?? "";
  canvas.dataset.sceneSha256 = identity2.sceneSha256 ?? "";
  const badge = document.querySelector(".badge");
  if (badge) badge.textContent = `Preview \xB7 ${identity2.revision.match(/-v\d+(?:\.\d+)*/)?.[0].slice(1) ?? identity2.revision}`;
  cue.replaceChildren(new Option("Jump to lyric cue\u2026", ""));
  for (const line of getLines()) cue.add(new Option(`${readableTime(line.start)} \xB7 ${line.label}`, line.id));
  cue.disabled = false;
  updatePlaybackState();
  fallbackDecodedFrame();
  drawDecodedFrame();
  scheduleVideoFrame();
  if (metadataReady && query.get("playing") === "1") void beginPlayback();
} catch (cause) {
  paintFailed = true;
  video.pause();
  setBusy("Lyric scene unavailable");
  report(`The lyric scene could not load: ${cause instanceof Error ? cause.message : String(cause)}. Use Restore preview after checking the local server.`);
  updatePlaybackState();
}
