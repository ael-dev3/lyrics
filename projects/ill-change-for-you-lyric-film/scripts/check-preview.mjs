import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createReadStream} from 'node:fs';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createCues, cueAt} from '../src/preview-core.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const at = relative => path.join(root, relative);
const json = async relative => JSON.parse(await readFile(at(relative), 'utf8'));
const close = (actual, expected, tolerance, label) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${label}: ${actual} differs from ${expected}`);
const tokenize = text => (text.match(/[\p{L}\p{N}]+(?:[’'][\p{L}\p{N}]+)*/gu) ?? [])
  .map(token => token.replaceAll('’', "'").toLowerCase());

async function sha256(relative) {
  const digest = createHash('sha256');
  for await (const chunk of createReadStream(at(relative))) digest.update(chunk);
  return digest.digest('hex');
}

const [manifest, timeline, features, tones, supplied, html, player] = await Promise.all([
  json('source/media-manifest.json'), json('src/timeline.json'),
  json('public/audio-features.json'), json('public/picture-tones.json'),
  readFile(at('source/lyrics-supplied.txt'), 'utf8'),
  readFile(at('review/index.html'), 'utf8'),
  readFile(at('src/player.js'), 'utf8'),
]);

// The user's frozen text is an independent editorial ledger. Punctuation and
// curly apostrophes can differ in display; the full 118-word order cannot.
const lines = timeline.sections.flatMap(section => section.lines);
const cues = createCues(timeline);
const words = lines.flatMap(line => line.words);
assert.equal(words.length, 118, 'complete supplied lyric word count');
assert.deepEqual(tokenize(words.map(word => word.text).join(' ')), tokenize(supplied),
  'timeline words must preserve the complete supplied lyric sequence');
assert.equal(cues.length, lines.length, 'each line creates one display cue');
assert.equal(new Set(lines.map(line => line.id)).size, lines.length, 'line IDs are unique');
assert.equal(new Set(words.map(word => word.id)).size, words.length, 'word IDs are unique');
assert.equal(timeline.sourceSha256, manifest.sha256, 'timeline belongs to this media identity');
assert.equal(timeline.sampleRate, manifest.audio.sampleRate, 'timeline follows locked audio samples');

let previousWordEnd = 0;
let previousDisplayEnd = 0;
for (const cue of cues) {
  assert.ok(cue.words.length > 0 && cue.text, `${cue.id} has words and display text`);
  assert.deepEqual(tokenize(cue.words.map(word => word.text).join(' ')), tokenize(cue.text),
    `${cue.id} text matches its word events`);
  assert.ok(cue.displayStart >= previousDisplayEnd - 1e-9, `${cue.id} does not overlap a previous cue`);
  assert.ok(cue.displayStart <= cue.words[0].start, `${cue.id} appears before its first sung word`);
  assert.ok(cue.displayEnd >= cue.words.at(-1).end, `${cue.id} covers its last sung word`);
  previousDisplayEnd = cue.displayEnd;
  for (const word of cue.words) {
    assert.ok(Number.isInteger(word.startSample) && Number.isInteger(word.endSample), `${word.id} sample anchors are integers`);
    assert.ok(word.startSample >= previousWordEnd, `${word.id} keeps sung order without word overlap`);
    assert.ok(word.endSample > word.startSample && word.endSample <= manifest.audio.sampleCount, `${word.id} is within decoded soundtrack`);
    close(word.start, word.startSample / timeline.sampleRate, 1e-6, `${word.id} start seconds/sample parity`);
    close(word.end, word.endSample / timeline.sampleRate, 1e-6, `${word.id} end seconds/sample parity`);
    assert.equal(cueAt(cues, (word.start + word.end) / 2)?.id, cue.id, `${word.id} is visible at its midpoint`);
    assert.ok(typeof word.basis === 'string' && word.basis.length > 0, `${word.id} has timing provenance`);
    previousWordEnd = word.endSample;
  }
}

const mediaPath = manifest.sourceVideo;
assert.equal(mediaPath, 'public/source.mp4');
assert.equal(manifest.sourceUrl, 'https://www.youtube.com/watch?v=BPy1NIiKKW0');
const mediaStat = await stat(at(mediaPath));
assert.equal(mediaStat.size, manifest.byteLength, 'locked source byte count');
assert.equal(await sha256(mediaPath), manifest.sha256, 'locked source SHA-256');
const probe = JSON.parse(execFileSync('ffprobe', [
  '-v', 'error', '-show_entries',
  'format=duration,size:stream=index,codec_type,codec_name,width,height,sample_aspect_ratio,avg_frame_rate,nb_frames,sample_rate,channels,duration',
  '-of', 'json', at(mediaPath),
], {encoding:'utf8'}));
const video = probe.streams.find(stream => stream.codec_type === 'video');
const audio = probe.streams.find(stream => stream.codec_type === 'audio');
assert.ok(video && audio, 'one source file supplies picture and soundtrack');
assert.equal(video.width, manifest.video.width);
assert.equal(video.height, manifest.video.height);
assert.equal(video.width / video.height, 4/3, 'native source picture is fully 4:3');
assert.equal(video.sample_aspect_ratio, manifest.video.sampleAspectRatio);
assert.equal(Number(video.nb_frames), manifest.video.frameCount);
assert.equal(audio.sample_rate, String(manifest.audio.sampleRate));
assert.equal(audio.channels, manifest.audio.channels);
assert.equal(Number(probe.format.size), manifest.byteLength);
close(Number(probe.format.duration), manifest.container.durationSeconds, 0.001, 'container duration');
close(Number(video.duration), manifest.video.durationSeconds, 0.001, 'video duration');
close(Number(audio.duration), manifest.audio.durationSeconds, 0.001, 'audio duration');

// Measurements can only be paired with the exact source from which they were
// produced. This checks their binary layout and clock coverage, not whether a
// chosen visual style or any given lyric boundary is artistically correct.
assert.equal(features.source.sha256, manifest.sha256);
assert.equal(features.source.sampleRate, manifest.audio.sampleRate);
assert.equal(features.source.sampleCount, manifest.audio.sampleCount);
assert.equal(features.data.dtype, 'uint16');
assert.equal(features.data.byteOrder, 'little-endian');
assert.equal(features.clock.framesPerSecond, 60);
assert.ok(features.data.frameCount / features.clock.framesPerSecond >= manifest.audio.durationSeconds);
assert.ok(features.data.frameCount / features.clock.framesPerSecond < manifest.audio.durationSeconds + 2 / features.clock.framesPerSecond);
const bandPath = path.join('public', features.data.path);
const bandStat = await stat(at(bandPath));
assert.equal(bandStat.size, features.data.byteLength);
assert.equal(bandStat.size, features.data.frameCount * features.data.bandCount * 2);
assert.equal(await sha256(bandPath), features.data.sha256);

assert.equal(tones.sourceSha256, manifest.sha256);
assert.equal(tones.framesPerSecond, 2);
assert.ok(tones.values.length >= Math.floor(manifest.container.durationSeconds * tones.framesPerSecond));
assert.ok(tones.values.length <= Math.ceil(manifest.container.durationSeconds * tones.framesPerSecond));
for (const [index, item] of tones.values.entries()) {
  close(item.time, index / tones.framesPerSecond, 1e-6, `picture tone sample ${index} clock`);
  assert.ok(Number.isFinite(item.medianLuma) && item.medianLuma >= 0 && item.medianLuma <= 255);
  assert.ok(['light', 'dark'].includes(item.mode));
  assert.ok(item.brightFraction >= 0 && item.brightFraction <= 1);
}

// Structural preview parity: original moving video, audio, lyrics, measured
// edge print, and portrait background all originate from this one source. A
// browser smoke review is still required to prove playback and visible motion.
assert.match(html, /<video\b[^>]*id="source"[^>]*>\s*<source\b[^>]*src="\/public\/source\.mp4"/);
assert.doesNotMatch(html, /<audio\b/i, 'no separate audio clock');
for (const id of ['backdrop', 'edgeprint', 'reading']) assert.match(html, new RegExp(`id="${id}"`));
assert.match(html, /#source\s*\{[^}]*object-fit:contain/s, 'native source frame is preserved');
assert.match(html, /\.stage\.portrait\s*\{[^}]*aspect-ratio:9\/16/s);
assert.match(html, /<script[^>]*src="\/src\/player\.js"/);
assert.match(player, /loadJson\('\/src\/timeline\.json'/);
assert.match(player, /loadJson\('\/public\/picture-tones\.json'/);
assert.match(player, /paint\(video\.currentTime\|\|0\)/, 'source video time drives frame paint');
assert.match(player, /cueAt\(cues,time\)/, 'lyrics use the same paint time');
assert.match(player, /spectrumAt\(featureValues,featureMetadata,time\)/, 'measured edge print uses the same paint time');
assert.match(player, /drawImage\(video,/);
await stat(at('public/source-poster.jpg'));

console.log(`Preview source verified: ${manifest.video.width}×${manifest.video.height}, ${manifest.container.durationSeconds.toFixed(3)} s, ${manifest.sha256}`);
console.log(`Lyrics: ${cues.length} visible lines, ${words.length} source-sample-anchored words; audio: ${features.data.frameCount} measured frames; picture: ${tones.values.length} tone samples.`);
console.log('Structural source parity passed. Browser motion and listening still require complete preview review.');
