import {createHash} from 'node:crypto';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {bindText, cueWindow, parseTimeline} from '../src/model.ts';
import {normalizeLyrics, parseLyrics} from '../src/lyrics.ts';

// Optional caption tracks for the posting kit, generated LOCALLY from the
// user's lyric file and the reviewed timeline. The output files contain the
// lyric text, so they are ignored by Git (publishing/*.srt, *.vtt) and belong
// only in the private Desktop kit. Cue times follow the film's reading windows.
const root = fileURLToPath(new URL('../', import.meta.url));
const lyricsPath = `${root}source/lyrics.local.txt`;
if (!existsSync(lyricsPath)) throw Error('source/lyrics.local.txt is required');
const normalized = normalizeLyrics(readFileSync(lyricsPath, 'utf8'));
const timeline = parseTimeline(JSON.parse(readFileSync(`${root}public/timeline.json`, 'utf8')));
const cues = bindText(timeline, parseLyrics(normalized), createHash('sha256').update(normalized, 'utf8').digest('hex'));
const stamp = (s: number, sep: string): string => {
  const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}${sep}${String(ms % 1000).padStart(3, '0')}`;
};
const rows = cues.map((q, i) => {
  const [a, b] = cueWindow(cues, i, timeline.duration);
  const lead = q.words.filter(w => w.voice === 'lead').map(w => w.text).join(' '), back = q.words.filter(w => w.voice === 'backing').map(w => w.text).join(' ');
  return {a, b, text: lead && back ? `${lead}\n(${back})` : lead || `(${back})`};
});
writeFileSync(`${root}publishing/Dawid-Podsiadlo-Let-You-Down.en.srt`, rows.map((r, i) => `${i + 1}\n${stamp(r.a, ',')} --> ${stamp(r.b, ',')}\n${r.text}\n`).join('\n') + '\n');
writeFileSync(`${root}publishing/Dawid-Podsiadlo-Let-You-Down.en.vtt`, 'WEBVTT\n\n' + rows.map(r => `${stamp(r.a, '.')} --> ${stamp(r.b, '.')}\n${r.text}\n`).join('\n') + '\n');
console.log(`${rows.length} caption cues written to publishing/ (local only, ignored by Git)`);
