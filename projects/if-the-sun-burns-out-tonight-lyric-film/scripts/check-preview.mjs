import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,resolve} from 'node:path';
import {createCues,cueAt,wordIndexAt} from '../src/preview-core.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFileSync(resolve(root,path));
const json=path=>JSON.parse(read(path));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const supplied=read('source/lyrics-supplied.txt').toString().split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
const timeline=json('src/timeline.json'),manifest=json('source/media-manifest.json');
const alignment=json('evidence/alignment-v6.json'),features=json('public/audio-features.json');
const lines=timeline.sections.flatMap(s=>s.lines),words=lines.flatMap(l=>l.words);
assert.deepEqual(lines.map(l=>l.text),supplied,'Supplied lyric order/repeats changed.');
assert.equal(timeline.revision,'preview-v6-audio-evidence');
assert.equal(timeline.alignmentStatus,'provisional');
assert.equal(alignment.revision,timeline.revision);
assert.equal(alignment.words.length,words.length);
assert.equal(timeline.focusGroups,undefined);
let previousEnd=0;
for(const section of timeline.sections){
  assert(section.start>=previousEnd && section.end>section.start,'Sections overlap or run backwards.');
  previousEnd=section.end;
  for(const line of section.lines){
    assert(line.start>=section.start && line.end<=section.end,'Line escapes its section.');
    const tokens=line.text.match(/[\p{L}\p{N}’'-]+[,.!?…]?/gu)??[];
    assert.deepEqual(line.words.map(w=>w.text),tokens);
    let end=line.start;
    for(const word of line.words){
      assert(word.start>=end-.000001 && word.end>word.start && word.end<=line.end+.000001,`Invalid interval ${word.id}`);
      assert.equal(word.focusGroup,undefined);
      assert(Number.isInteger(word.startSample)&&Number.isInteger(word.endSample));
      assert(Math.abs(word.startSample-word.start*44100)<=.50001);
      assert(Math.abs(word.endSample-word.end*44100)<=.50001);
      const evidence=alignment.words.find(w=>w.id===word.id);
      assert(evidence,`Missing observations ${word.id}`);
      assert.equal(evidence.text,word.text);
      assert.deepEqual(evidence.selected,{start:word.start,end:word.end,startSample:word.startSample,endSample:word.endSample});
      assert(Object.keys(evidence.observations).length>=5,`Missing model observations ${word.id}`);
      end=word.end;
    }
  }
}
const cues=createCues(timeline);
for(const cue of cues){
  cue.words.forEach((word,index)=>{
    const midpoint=(word.start+word.end)/2;
    assert.equal(cueAt(cues,midpoint)?.id,cue.id);
    assert.equal(wordIndexAt(cue.words,midpoint),index);
  });
}
assert(previousEnd<=timeline.duration);
assert.equal(hash(read('public/source.mp4')),manifest.sha256);
assert.equal(features.source.sha256,manifest.sha256);
assert.equal(features.data.bandCount,64);
assert.equal(features.clock.framesPerSecond,60);
const binary=read('public/'+features.data.path);
assert.equal(binary.length,features.data.frameCount*features.data.bandCount*2);
assert.equal(hash(binary),features.data.sha256);
assert(features.clock.lastFrameSeconds>=features.source.durationSeconds);
const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-show_entries','stream=codec_type,codec_name,width,height,sample_rate,channels,start_time,duration','-of','json',resolve(root,'public/source.mp4')],{encoding:'utf8'}));
const video=probe.streams.find(s=>s.codec_type==='video'),audio=probe.streams.find(s=>s.codec_type==='audio');
assert.equal(video.codec_name,'h264');assert.equal(video.width,1920);assert.equal(video.height,818);
assert.equal(audio.codec_name,'aac');assert.equal(audio.channels,2);
assert.equal(Number(video.start_time),0);assert.equal(Number(audio.start_time),0);
assert(Math.abs(Number(probe.format.duration)-timeline.duration)<.2);
const html=read('review/index.html').toString(),player=read('src/player.js').toString();
assert.equal((html.match(/<video\b/g)||[]).length,1);
assert.match(html,/id="picture"/);assert.match(html,/id="recover"/);assert.match(html,/id="restart"/);
assert(!/AudioContext|createMediaElementSource/.test(player),'Keep soundtrack on the native media output path.');
assert(!/autoplay/i.test(html));
console.log(`PASS: ${lines.length} supplied lines, ${words.length} independent words, and all selected boundaries match the recorded alignment evidence.`);
console.log('PASS: original picture/audio identity, native playback architecture, and deterministic 64-band features verified.');
console.log('Acoustic uncertainty remains documented; these checks do not certify listening accuracy.');
