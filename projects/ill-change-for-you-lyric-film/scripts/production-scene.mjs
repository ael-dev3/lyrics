// Source-clocked raster overlay. The locked source video remains an FFmpeg
// input, so no picture is approximated or replaced by a poster in production.
import {readFileSync} from 'node:fs';
import {createCanvas, GlobalFonts} from '@napi-rs/canvas';
import {createCues, cueAt, wordIndexAt, spectrumAt} from '../src/preview-core.js';
import {paintEdgeprint} from '../src/edgeprint.js';

const readJson = name => JSON.parse(readFileSync(name, 'utf8'));
export const timeline = readJson('src/timeline.json');
export const cues = createCues(timeline);
const featureMetadata = readJson('public/audio-features.json');
const pictureTones = readJson('public/picture-tones.json');
const featureBytes = readFileSync('public/' + featureMetadata.data.path);
const featureValues = new Uint16Array(featureMetadata.data.frameCount * featureMetadata.data.bandCount);
for (let i = 0; i < featureValues.length; i++) featureValues[i] = featureBytes.readUInt16LE(i * 2);

const approvedFontPath = process.env.LYRIC_FONT || '/System/Library/Fonts/Supplemental/Iowan Old Style.ttc';
if (!GlobalFonts.registerFromPath(approvedFontPath, 'IowanProduction'))
  throw Error('The approved Iowan Old Style font could not load: ' + approvedFontPath);

const tones = {
  dark: {paper: '#f4e9de', active: '#f3bbaf', shadow: 'rgba(20,10,19,.94)'},
  light: {paper: '#241c23', active: '#992d47', shadow: 'rgba(255,249,239,.95)'},
};
const wordToken = word => word.text.toLowerCase().replace(/[^a-z]/g, '');
const tOf = time => {
  const i = Math.max(0, Math.min(pictureTones.values.length - 1,
    Math.floor(time * pictureTones.framesPerSecond)));
  return pictureTones.values[i]?.mode === 'light' ? 'light' : 'dark';
};

// CSS text-wrap:balance finds the shortest possible layout and balances its
// line widths. Search all legal breaks; there are at most 13 words per cue.
function balancedRows(words, widths, gap, maxWidth) {
  const length = words.length;
  for (let rows = 1; rows <= length; rows++) {
    let best = null;
    const visit = (at, built, spans) => {
      if (built.length === rows) {
        if (at !== length) return;
        const widest = Math.max(...spans), narrowest = Math.min(...spans);
        const score = widest * 1000 + (widest - narrowest);
        if (!best || score < best.score) best = {score, rows: built.map(row => [...row])};
        return;
      }
      const remainingRows = rows - built.length - 1;
      for (let end = at + 1; end <= length - remainingRows; end++) {
        const width = widths.slice(at, end).reduce((a, b) => a + b, 0) + gap * (end - at - 1);
        if (width > maxWidth + 1e-5) break;
        visit(end, [...built, words.slice(at, end)], [...spans, width]);
      }
    };
    visit(0, [], []);
    if (best) return best.rows;
  }
  throw Error('Lyric line does not fit the render canvas');
}

function makeLyricLayout(cue, format, width, height) {
  const portrait = format === 'portrait';
  const fontSize = width * (portrait ? .060 : .0425);
  // Skia's TTC face is 7.7% narrower than Chrome's CSS Iowan Old Style face
  // at the same declared size on this host. This measured scale reproduces
  // browser word widths (including its native inter-word spacing).
  const paintSize = fontSize * 1.077;
  const lineHeight = fontSize * (portrait ? 1.21 : 1.20);
  const maxWidth = width * (portrait ? .84 : .86);
  const bottom = height * (portrait ? .22 : .12);
  const measuring = createCanvas(2, 2).getContext('2d');
  measuring.font = `600 ${paintSize}px IowanProduction`;
  measuring.letterSpacing = `${-fontSize * .018}px`;
  const widths = cue.words.map(word => measuring.measureText(word.text).width);
  const gap = measuring.measureText(' ').width;
  const rows = balancedRows(cue.words, widths, gap, maxWidth);
  const rowTop = height - bottom - rows.length * lineHeight;
  const ascent = measuring.measureText('Mg').actualBoundingBoxAscent;
  const descent = measuring.measureText('Mg').actualBoundingBoxDescent;
  const baselineOffset = (lineHeight - (ascent + descent)) / 2 + ascent;
  const positions = new Map();
  let index = 0;
  rows.forEach((row, rowIndex) => {
    const rowWidth = row.reduce((sum, _, j) => sum + widths[index + j], 0) + gap * (row.length - 1);
    let x = (width - rowWidth) / 2;
    const baseline = rowTop + rowIndex * lineHeight + baselineOffset;
    row.forEach(word => {
      positions.set(word.id, {x, baseline, width: widths[index], rowIndex});
      x += widths[index++] + gap;
    });
  });
  const top = Math.max(0, Math.floor(rowTop - fontSize * .45));
  const contentHeight = Math.ceil(rows.length * lineHeight + fontSize * .90);
  return {fontSize, paintSize, lineHeight, positions, rows: rows.length, top, contentHeight};
}

function renderLyricLayer(cue, layout, tone, activeIndex, width) {
  const canvas = createCanvas(width, layout.contentHeight), ctx = canvas.getContext('2d');
  const color = tones[tone];
  ctx.font = `600 ${layout.paintSize}px IowanProduction`;
  ctx.letterSpacing = `${-layout.fontSize * .018}px`;
  ctx.textBaseline = 'alphabetic';
  cue.words.forEach((word, i) => {
    const pos = layout.positions.get(word.id);
    ctx.save();
    // The browser preview uses a fixed, protective text shadow behind each
    // letter. It never moves the letter during sung-word focus.
    ctx.shadowColor = color.shadow;
    ctx.shadowBlur = tone === 'light' ? 9 * width / (width === 1440 ? 820 : 480) : 13 * width / (width === 1440 ? 820 : 480);
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = i === activeIndex ? color.active : color.paper;
    ctx.fillText(word.text, pos.x, pos.baseline - layout.top);
    ctx.restore();
  });
  return {canvas, y: layout.top};
}

export function createScene(format) {
  if (!['landscape', 'portrait'].includes(format)) throw Error('Unknown render format');
  const portrait = format === 'portrait';
  const width = portrait ? 1080 : 1440, height = portrait ? 1920 : 1080;
  const canvas = createCanvas(width, height), ctx = canvas.getContext('2d');
  const edge = createCanvas(Math.round(width * (portrait ? .048 : .042)),
    Math.round(height * (portrait ? .37 : .68)));
  const edgeContext = edge.getContext('2d');
  const shade = {};
  for (const tone of ['dark', 'light']) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    const stops = portrait
      ? [[0, .10], [.43, 0], [.59, .32], [1, .46]]
      : tone === 'light'
        ? [[0, 0], [.48, 0], [.62, .03], [.80, .24], [1, .52]]
        : [[0, 0], [.46, 0], [.59, .02], [.75, .18], [1, .48]];
    const rgb = portrait ? '25,17,25' : tone === 'light' ? '250,242,226' : '24,17,24';
    for (const [stop, alpha] of stops) gradient.addColorStop(stop, `rgba(${rgb},${alpha})`);
    shade[tone] = gradient;
  }
  const layouts = new Map(), variants = new Map();
  for (const cue of cues) {
    const layout = makeLyricLayout(cue, format, width, height);
    layouts.set(cue.id, layout);
  }
  let cachedCue = null;
  function paint(time) {
    ctx.clearRect(0, 0, width, height);
    const tone = portrait ? 'dark' : tOf(time);
    ctx.fillStyle = shade[tone];
    ctx.fillRect(0, 0, width, height);
    if (portrait) {
      ctx.fillStyle = 'rgba(244,233,222,.22)';
      ctx.fillRect(0, 288, width, 2);
      ctx.fillRect(0, 1097, width, 2);
    }
    const db = spectrumAt(featureValues, featureMetadata, time);
    paintEdgeprint(edgeContext, edge.width, edge.height, db, tone);
    ctx.drawImage(edge, width * (portrait ? .013 : .018), height * (portrait ? .17 : .09));
    const cue = cueAt(cues, time);
    if (cue) {
      const active = wordIndexAt(cue.words, time);
      // Keep only the active cue in memory. Long-form rendering can otherwise
      // retain hundreds of full-resolution lyric canvases across the film.
      if (cachedCue !== cue.id) { variants.clear(); cachedCue = cue.id; }
      const key = `${tone}/${active}`;
      if (!variants.has(key)) variants.set(key,
        renderLyricLayer(cue, layouts.get(cue.id), tone, active, width));
      const layer = variants.get(key);
      ctx.drawImage(layer.canvas, 0, layer.y);
      const word = cue.words[active];
      if (word && wordToken(word) === 'change') {
        const progress = Math.max(0, Math.min(1, (time - word.start) / .21));
        const pos = layouts.get(cue.id).positions.get(word.id);
        ctx.save();
        ctx.globalAlpha = .23 * (1 - progress);
        ctx.filter = `blur(${layouts.get(cue.id).fontSize * .035}px)`;
        ctx.font = `600 ${layouts.get(cue.id).paintSize}px IowanProduction`;
        ctx.letterSpacing = `${-layouts.get(cue.id).fontSize * .018}px`;
        ctx.fillStyle = tones[tone].active;
        ctx.fillText(word.text, pos.x + (1 - progress) * 1.6, pos.baseline - (1 - progress) * .8);
        ctx.restore();
      }
    }
    return canvas;
  }
  return {width, height, format, paint, lyricLayouts: layouts};
}
