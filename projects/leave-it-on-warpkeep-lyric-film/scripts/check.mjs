import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildIdentity, evaluateGate, LOCKED_SOURCE_SHA256, PROJECT_ROOT} from './render-gate.mjs';

const finite = Number.isFinite;
const close = (a, b, epsilon = 1 / 48000) => Math.abs(a - b) <= epsilon;
const normalized = text => text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

/** Structural validation only. Pending listening and uncertain acoustic candidates
 * remain valid preview inputs; passing this function does not approve timing. */
export function validateProjectData(lyrics, features) {
  const errors = [];
  const cues = lyrics?.cues;
  const duration = lyrics?.source?.duration;
  if (!finite(duration) || duration <= 0) errors.push('Source duration must be finite and positive.');
  if (lyrics?.source?.sha256 !== LOCKED_SOURCE_SHA256) errors.push('Lyric data refers to a different source recording.');
  if (!Array.isArray(cues) || !cues.length) return [...errors, 'The full preview requires nonempty lyric cues.'];
  const ids = new Set();
  let previousDisplayEnd = -Infinity;
  for (const cue of cues) {
    const label = cue.id || '(missing cue id)';
    if (!cue.id || ids.has(cue.id)) errors.push(`Missing or duplicate cue ID: ${label}.`);
    ids.add(cue.id);
    if (typeof cue.text !== 'string' || !cue.text.trim() || /^\[.*\]$/.test(cue.text.trim())) errors.push(`${label}: empty text or a stage direction is being treated as a lyric.`);
    for (const key of ['start', 'end', 'displayStart', 'displayEnd']) if (!finite(cue[key])) errors.push(`${label}: ${key} is not finite.`);
    if (!(cue.start >= 0 && cue.start < cue.end && cue.end <= duration + .02)) errors.push(`${label}: invalid acoustic line interval.`);
    if (!(cue.displayStart >= 0 && cue.displayStart < cue.displayEnd && cue.displayEnd <= duration + .02)) errors.push(`${label}: invalid visible line interval.`);
    if (cue.displayStart < previousDisplayEnd - 1e-8) errors.push(`${label}: overlapping display cues would hide one cue in cueAt().`);
    previousDisplayEnd = cue.displayEnd;
    if (!Array.isArray(cue.words)) {errors.push(`${label}: words must be an array.`); continue;}
    let previousWordEnd = -Infinity;
    for (const word of cue.words) {
      const wordLabel = word.id || `${label}:${word.text}`;
      if (!word.id || ids.has(word.id)) errors.push(`Missing or duplicate word ID: ${wordLabel}.`);
      ids.add(word.id);
      if (typeof word.text !== 'string' || !word.text.trim()) errors.push(`${wordLabel}: empty word.`);
      if (!(finite(word.start) && finite(word.end) && word.start < word.end)) errors.push(`${wordLabel}: invalid positive word interval.`);
      if (word.start < previousWordEnd - 1e-8) errors.push(`${wordLabel}: overlapping acoustic words.`);
      if (word.start < cue.displayStart - 1e-8 || word.end > cue.displayEnd + 1e-8) errors.push(`${wordLabel}: focus exists outside its visible phrase.`);
      if (word.start < cue.start - 1e-8 || word.end > cue.end + 1e-8) errors.push(`${wordLabel}: focus exists outside its acoustic line.`);
      if (word.startSample !== undefined && (!Number.isInteger(word.startSample) || !close(word.startSample / lyrics.source.sampleRate, word.start))) errors.push(`${wordLabel}: onset disagrees with source sample index.`);
      if (word.endSampleExclusive !== undefined && (!Number.isInteger(word.endSampleExclusive) || !close(word.endSampleExclusive / lyrics.source.sampleRate, word.end))) errors.push(`${wordLabel}: release disagrees with exclusive sample index.`);
      previousWordEnd = word.end;
    }
    if (cue.words.length && normalized(cue.words.map(word => word.text).join(' ')) !== normalized(cue.text)) errors.push(`${label}: word sequence differs from displayed lyric.`);
  }
  if (features?.sourceSha256 !== lyrics.source.sha256) errors.push('Measured features and lyrics reference different audio.');
  if (!finite(features?.sampleRate) || features.sampleRate <= 0 || !finite(features?.duration) || Math.abs(features.duration - duration) > .02) errors.push('Feature clock/duration does not match the source.');
  if (JSON.stringify(features?.channels) !== JSON.stringify(['rms', 'low', 'mid', 'high', 'attack'])) errors.push('Feature channel order differs from the scene contract.');
  if (!Array.isArray(features?.frames) || features.frames.length < 2) errors.push('Measured feature frames are missing.');
  else {
    if ((features.frames.length - 1) / features.sampleRate < duration - 1 / features.sampleRate) errors.push('Measured feature data ends before the source tail.');
    for (let i = 0; i < features.frames.length; i++) {
      const values = features.frames[i];
      if (!Array.isArray(values) || values.length !== 5 || values.some(value => !finite(value) || value < 0 || value > 1)) {errors.push(`Invalid measured display feature frame ${i}.`); break;}
    }
  }
  if (features?.normalization?.localNormalization !== false) errors.push('Quiet-window normalization must not inflate local energy.');
  if (features?.analysis?.wordTimingAuthority !== false) errors.push('Measured musical features must not claim authority over word timing.');
  return errors;
}

export function validateSpectrum(spectrum, source) {
  const errors = [];
  if (spectrum?.sourceSha256 !== source.sha256) errors.push('Environmental spectrum refers to a different recording.');
  if (spectrum?.bandCount !== 48 || spectrum?.sampleRate !== 25 || spectrum?.hz !== 25) errors.push('Environmental spectrum must retain its measured 48-band, 25 Hz contract.');
  if (!finite(spectrum?.duration) || Math.abs(spectrum.duration - source.duration) > .02) errors.push('Environmental spectrum duration differs from the source.');
  if (!Array.isArray(spectrum?.bandCentersHz) || spectrum.bandCentersHz.length !== 48 || spectrum.bandCentersHz.some((value, index, values) => !finite(value) || value <= 0 || (index > 0 && value <= values[index - 1]))) errors.push('Spectrum band centers are invalid.');
  if (!Array.isArray(spectrum?.frames) || !spectrum.frames.length) errors.push('Environmental spectrum frames are missing.');
  else {
    if ((spectrum.frames.length - 1) / spectrum.sampleRate < source.duration - 1 / spectrum.sampleRate) errors.push('Environmental spectrum omits the source tail.');
    for (let i = 0; i < spectrum.frames.length; i++) {
      const frame = spectrum.frames[i];
      if (!Array.isArray(frame) || frame.length !== 48 || frame.some(value => !Number.isInteger(value) || value < 0 || value > 255)) {errors.push(`Invalid quantized spectrum frame ${i}.`); break;}
    }
  }
  if (spectrum?.normalization?.localNormalization !== false || spectrum?.normalization?.perBandNormalization !== false) errors.push('Spectrum must preserve the full-recording shared band reference.');
  if (spectrum?.analysis?.wordTimingAuthority !== false) errors.push('Environmental spectrum must not establish word timing.');
  return errors;
}

export async function checkProject(root = PROJECT_ROOT) {
  const lyrics = JSON.parse(await readFile(path.join(root, 'data/lyrics.json'), 'utf8'));
  const features = JSON.parse(await readFile(path.join(root, 'data/features.json'), 'utf8'));
  const errors = validateProjectData(lyrics, features);
  const spectrum = JSON.parse(await readFile(path.join(root, 'data/spectrum.json'), 'utf8'));
  errors.push(...validateSpectrum(spectrum, lyrics.source));
  const identity = await buildIdentity(root);
  if (identity.files['source/Leave It On.m4a'].sha256 !== LOCKED_SOURCE_SHA256) errors.push('Original source bytes differ from the locked master.');
  const selected = JSON.parse(await readFile(path.join(root, 'source/asset-provenance/selected-assets.json'), 'utf8'));
  for (const asset of selected.assets || []) {
    const record = identity.files[`public/${asset.path}`];
    if (!record || record.sha256 !== asset.sha256 || record.bytes !== asset.bytes) errors.push(`Selected asset identity differs: ${asset.id}.`);
  }
  const menu = JSON.parse(await readFile(path.join(root, 'source/asset-provenance/pr375/manifest.json'), 'utf8'));
  if (menu.ref !== '75934520a8dc295c8b68d4c8c197785299e2ff0b') errors.push('PR375 scene provenance does not match the selected revision.');
  for (const asset of menu.assets || []) {
    const record = identity.files[`public/${asset.path}`];
    if (!record || record.sha256 !== asset.sha256 || record.bytes !== asset.bytes) errors.push(`PR375 asset identity differs: ${asset.path}.`);
  }
  const gate = await evaluateGate(root);
  return {errors, gate, cueCount: lyrics.cues.length, wordCount: lyrics.cues.reduce((total, cue) => total + cue.words.length, 0), inputCount: Object.keys(identity.files).length, timingStatus: lyrics.status};
}

async function main() {
  const result = await checkProject();
  if (result.errors.length) {console.error(result.errors.map(error => `- ${error}`).join('\n')); process.exitCode = 1; return;}
  console.log(`Technical input checks pass: ${result.cueCount} cues, ${result.wordCount} acoustic candidate words, ${result.inputCount} hashed inputs. Timing status: ${result.timingStatus}.`);
  console.log(result.gate.errors.length ? `Production remains CLOSED (${result.gate.errors.length} unresolved authorization/review bindings). No freeze or approval record was changed.` : 'Production review bindings pass; renderer parity and encoded proof still require separate evidence.');
  console.log('These checks establish data integrity and source identity, not complete listening, creative approval or browser-visible motion.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(error => {console.error(error.message); process.exitCode = 1;});
