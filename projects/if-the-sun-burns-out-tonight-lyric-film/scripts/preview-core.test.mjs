import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import test from 'node:test';
import {createCues, cueAt, wordIndexAt, spectrumAt, spectrumGeometry, createVideoFramePump, createSettledFrameRefresh} from '../src/preview-core.js';

// Behavioral coverage only. These tests do not establish acoustic alignment or
// substitute for viewing the composed preview and listening to the recording.
const root = new URL('../', import.meta.url);
const timeline = JSON.parse(readFileSync(new URL('src/timeline.json', root), 'utf8'));
const metadata = JSON.parse(readFileSync(new URL('public/audio-features.json', root), 'utf8'));
const bytes = readFileSync(new URL('public/' + metadata.data.path, root));
const values = new Uint16Array(bytes.length / 2);
for (let index = 0; index < values.length; index++) values[index] = bytes.readUInt16LE(index * 2);

const words = [
  {id:'would', text:'Would', start:36.95, end:36.98},
  {id:'you', text:'you', start:36.98, end:37.25},
  {id:'let', text:'let', start:37.30, end:37.60},
];
const line = (id, start, end) => ({id, text:id, start, end, words:[{id:id + '-word', text:id, start, end}]});
const createFixture = lines => ({sections:[{name:'Fixture', lines}]});
const close = (actual, expected, message, epsilon = 1e-5) => assert(Math.abs(actual - expected) < epsilon, `${message}: ${actual} versus ${expected}`);

test('each word has an exclusive, independent interval, including a 30ms word', () => {
  for (const [time, expected] of [
    [36.949999,-1], [36.95,0], [36.979999,0], [36.98,1],
    [37.249999,1], [37.25,-1], [37.299999,-1], [37.30,2], [37.60,-1],
    [NaN,-1], [Infinity,-1], [-Infinity,-1],
  ]) assert.equal(wordIndexAt(words,time),expected,`word focus at ${time}`);
  assert.equal(wordIndexAt([],37),-1);
});

test('readable pre-roll preserves word timing and clips before the preceding performance', () => {
  for (const [name, lines, expectedStarts] of [
    ['isolated',[line('a',10,11),line('b',12,13)],[9.82,11.82]],
    ['short gap',[line('a',10,11),line('b',11.10,12)],[9.82,11]],
    ['touching',[line('a',10,11),line('b',11,12)],[9.82,11]],
    ['opening',[line('a',.10,1)],[0]],
  ]) {
    const input = createFixture(lines), original = structuredClone(input);
    const cues = createCues(input);
    assert.deepEqual(input,original,'display preparation must not mutate acoustic inputs');
    cues.forEach((cue,index) => {
      close(cue.displayStart,expectedStarts[index],`${name} display onset`);
      assert.equal(cue.start,lines[index].start);
      assert.equal(cue.end,lines[index].end);
      assert.deepEqual(cue.words,lines[index].words);
      assert(cue.displayEnd >= cue.words.at(-1).end,'display must retain the final held word');
      if (index) assert(cue.displayStart >= cues[index-1].displayEnd,'display windows must not overlap');
      if (cue.displayStart < cue.start) {
        const preRoll = (cue.displayStart+cue.start)/2;
        assert.equal(cueAt(cues,preRoll)?.id,cue.id,'incoming full line is readable during pre-roll');
        assert.equal(wordIndexAt(cue.words,preRoll),-1,'pre-roll must not anticipate word focus');
      }
    });
  }
});

test('cue display uses exclusive ends and leaves actual gaps empty', () => {
  const cues = createCues(createFixture([line('a',10,11),line('b',12,13)]));
  assert.equal(cueAt(cues,9.819999),null);
  assert.equal(cueAt(cues,9.82)?.id,'a');
  assert.equal(cueAt(cues,11.199999)?.id,'a');
  assert.equal(cueAt(cues,11.20),null);
  assert.equal(cueAt(cues,11.819999),null);
  assert.equal(cueAt(cues,11.82)?.id,'b');
  assert.equal(cueAt(cues,13.20),null);
  for (const time of [NaN,Infinity,-Infinity]) assert.equal(cueAt(cues,time),null);
  const touching = createCues(createFixture([line('a',10,11),line('b',11,12)]));
  assert.equal(cueAt(touching,11)?.id,'b','zero-gap handoff must show only the incoming line');
});

test('every real lyric event remains individually addressable through the display timeline', () => {
  const cues = createCues(timeline);
  assert.equal(cues.length,44);
  let checked = 0;
  for (const cue of cues) {
    cue.words.forEach((word,index) => {
      const midpoint = (word.start + word.end) / 2;
      assert.equal(cueAt(cues,midpoint)?.id,cue.id,`visible line for ${word.id}`);
      assert.equal(wordIndexAt(cue.words,midpoint),index,`independent word focus for ${word.id}`);
      assert.equal(wordIndexAt(cue.words,word.start),index,`inclusive onset for ${word.id}`);
      assert.notEqual(wordIndexAt(cue.words,word.end),index,`exclusive release for ${word.id}`);
      checked++;
    });
  }
  assert.equal(checked,254);
});

test('all 64 visualizer bars remain inside narrow and large canvases at silence and full peak', () => {
  for (const [width,height] of [[24,1],[64,5],[132,15],[256,48],[510,60],[1024,100]]) {
    for (const energy of [Array(64).fill(0),Array(64).fill(1),Array.from({length:64},(_,i)=>i/63),Array.from({length:64},(_,i)=>i%2?-3:4)]) {
      const bars = spectrumGeometry(width,height,energy);
      assert.equal(bars.length,64);
      bars.forEach((bar,index) => {
        for (const value of Object.values(bar)) assert(Number.isFinite(value),'geometry must be finite');
        assert(bar.x >= 0 && bar.y >= 0 && bar.width > 0 && bar.height >= 0);
        assert(bar.x+bar.width <= width+1e-9,`band ${index} escapes right edge at ${width}×${height}`);
        assert(bar.y+bar.height <= height+1e-9,`band ${index} escapes bottom edge at ${width}×${height}`);
        assert(bar.level>=0 && bar.level<=1,'artistic amplitude must be bounded');
        if (index) assert(bar.x >= bars[index-1].x+bars[index-1].width,'bands must not overlap');
      });
    }
  }
});

test('bass and treble each visibly respond, including the outermost bands', () => {
  const baseline = spectrumGeometry(320,32,Array(64).fill(0));
  for (const selected of [0,63]) {
    const energy = Array(64).fill(0); energy[selected]=1;
    const bars = spectrumGeometry(320,32,energy);
    assert(bars[selected].height>baseline[selected].height);
    bars.forEach((bar,index) => {
      if (index !== selected) assert.deepEqual(bar,baseline[index],'unrelated bands do not change');
    });
  }
});

test('real deterministic audio data matches its manifest and exact frame samples', () => {
  assert.equal(bytes.length,metadata.data.byteLength);
  assert.equal(values.length,metadata.data.frameCount*64);
  assert.equal(metadata.data.bandCount,64);
  assert.equal(metadata.clock.framesPerSecond,60);
  assert.equal(createHash('sha256').update(bytes).digest('hex'),metadata.data.sha256);
  for (const frame of [0,1,1600,4674,7000,12000]) {
    const result = spectrumAt(values,metadata,frame/60);
    assert.equal(result.length,64);
    for (let band=0;band<64;band++) close(result[band],values[frame*64+band]*.01-96,`frame ${frame} band ${band}`);
  }
});

test('real source spectra interpolate predictably and survive nonsequential paused seeks', () => {
  const frame = 4674;
  const midpoint = spectrumAt(values,metadata,(frame+.5)/60);
  for (let band=0;band<64;band++) {
    const expected = (values[frame*64+band]+values[(frame+1)*64+band])*.005-96;
    close(midpoint[band],expected,`interpolated band ${band}`);
  }
  const timeA=77.9,timeB=0;
  const firstA=spectrumAt(values,metadata,timeA);
  const second=spectrumAt(values,metadata,timeB);
  const lastA=spectrumAt(values,metadata,timeA);
  assert.notDeepEqual(firstA,second,'different source moments must not retain stale analyser state');
  assert.deepEqual(firstA,lastA,'paused backward/forward seeks reproduce identical source data');
  firstA[0]=12345;
  assert.deepEqual(spectrumAt(values,metadata,timeA),lastA,'consumer mutation must not corrupt later lookups');
  for (const speed of [.5,.75,1]) {
    const wallElapsed=timeA/speed,mediaTime=wallElapsed*speed;
    assert.deepEqual(spectrumAt(values,metadata,mediaTime),lastA,'same media time is independent of playback speed');
  }
});

test('source spectrum is at floor outside the half-open source interval', () => {
  for (const time of [-1,metadata.source.durationSeconds,metadata.source.durationSeconds+1,Infinity,-Infinity,NaN]) {
    const result=spectrumAt(values,metadata,time);
    assert.equal(result.length,64);
    assert(result.every(value=>value===metadata.data.dbfsOffset),`floor expected outside source at ${time}`);
  }
});

function fakeVideo() {
  let next=0;
  const callbacks=new Map(), canceled=[];
  return {
    paused:false,seeking:false,canceled,callbacks,
    requestVideoFrameCallback(callback) { const handle=next++;callbacks.set(handle,callback);return handle; },
    cancelVideoFrameCallback(handle) { canceled.push(handle); },
    deliver(handle, extraMetadata={}) { const callback=callbacks.get(handle);assert(callback,`callback ${handle} exists`);callbacks.delete(handle);callback(100,{mediaTime:77.9,expectedDisplayTime:100,...extraMetadata}); },
  };
}

test('frame pump accepts handle 0 and does not duplicate callbacks on repeated starts', () => {
  const video=fakeVideo(),frames=[];
  const pump=createVideoFramePump(video,(...args)=>frames.push(args));
  pump.start();pump.start();pump.start();
  assert.equal(video.callbacks.size,1);
  assert.equal(pump.pending(),true);
  pump.stop();
  assert.deepEqual(video.canceled,[0],'zero is a valid pending callback handle');
  assert.equal(pump.pending(),false);
  video.deliver(0);
  assert.equal(frames.length,0,'already queued canceled callback must not draw');
  assert.equal(video.callbacks.size,0,'stale callback must not schedule another chain');
});

test('old frame generation cannot overwrite or duplicate a fresh play/seek generation', () => {
  const video=fakeVideo(),frames=[];
  const pump=createVideoFramePump(video,(...args)=>frames.push(args));
  pump.start(); // 0
  video.paused=true;pump.stop();
  video.paused=false;pump.start(); // 1
  video.deliver(0);
  assert.equal(frames.length,0);assert.equal(pump.pending(),true);
  video.deliver(1); // successor 2
  assert.equal(frames.length,1);assert.deepEqual([...video.callbacks.keys()],[2]);
  video.seeking=true;pump.stop();pump.start();
  assert.equal(pump.pending(),false,'seeking must not schedule new callbacks');
  video.seeking=false;pump.start(); // 3
  video.deliver(2);
  assert.equal(frames.length,1);assert.equal(pump.pending(),true);
  video.deliver(3); // successor 4
  assert.equal(frames.length,2);assert.deepEqual([...video.callbacks.keys()],[4]);
  video.paused=true;pump.stop();video.deliver(4);
  assert.equal(frames.length,2);assert.equal(pump.pending(),false);
});

test('rapid transport toggles retain a single current source frame chain', () => {
  const video=fakeVideo();let draws=0;
  const pump=createVideoFramePump(video,()=>draws++);
  for(let cycle=0;cycle<20;cycle++) {
    video.paused=false;pump.start();pump.start();
    video.paused=true;pump.stop();
  }
  video.paused=false;pump.start();
  for(let handle=0;handle<20;handle++)video.deliver(handle);
  assert.equal(draws,0);
  video.deliver(20);
  assert.equal(draws,1);
  assert.deepEqual([...video.callbacks.keys()],[21]);
});

test('frame pump remains inert without callback API, or while paused', () => {
  const unsupported={paused:false,seeking:false};
  const pump=createVideoFramePump(unsupported,()=>assert.fail('unexpected callback'));
  pump.start();pump.stop();assert.equal(pump.pending(),false);
  const video=fakeVideo();video.paused=true;
  const pausedPump=createVideoFramePump(video,()=>assert.fail('unexpected callback'));
  pausedPump.start();assert.equal(pausedPump.pending(),false);assert.equal(video.callbacks.size,0);
});

test('foreground frame gaps count consecutive compositor frames independently of callback count', () => {
  const video=fakeVideo(),pump=createVideoFramePump(video,()=>{});
  pump.start();
  video.deliver(0,{presentedFrames:100});
  video.deliver(1,{presentedFrames:101});
  video.deliver(2,{presentedFrames:105});
  assert.equal(pump.metrics().callbackCount,3);
  assert.equal(pump.metrics().skippedSourceFrames,3,'frames 102–104 received no foreground callback');
  assert.equal(pump.metrics().maximumFrameGap,3);
  assert.equal(pump.metrics().lastPresentedFrame,105);
  assert(!('droppedVideoFrames' in pump.metrics()),'foreground gaps must not claim native decoding drops');
});

test('paused, seeked and visibility-stopped intervals do not inflate foreground frame gaps', () => {
  const video=fakeVideo(),pump=createVideoFramePump(video,()=>{});
  pump.start();video.deliver(0,{presentedFrames:10});
  pump.stop();pump.start();
  video.deliver(1,{presentedFrames:200}); // Already queued callback from old generation.
  video.deliver(2,{presentedFrames:210}); // First current callback is a new baseline.
  video.deliver(3,{presentedFrames:211});
  pump.stop();
  video.seeking=true;pump.start();assert.equal(pump.pending(),false);
  video.seeking=false;pump.start();
  video.deliver(4,{presentedFrames:500});
  video.deliver(5,{presentedFrames:600});
  video.deliver(6,{presentedFrames:602});
  assert.equal(pump.metrics().callbackCount,5);
  assert.equal(pump.metrics().skippedSourceFrames,1,'only frame 601 belongs to an active callback gap');
  assert.equal(pump.metrics().maximumFrameGap,1);
});

test('missing metadata and late callbacks after paused state cannot create false foreground gaps', () => {
  const video=fakeVideo(),pump=createVideoFramePump(video,()=>{});
  pump.start();video.deliver(0,{presentedFrames:1});
  video.deliver(1); // Unsupported/missing presentedFrames invalidates comparison baseline.
  video.deliver(2,{presentedFrames:100});
  assert.equal(pump.metrics().skippedSourceFrames,0);
  video.paused=true;
  video.deliver(3,{presentedFrames:103}); // Pause state can precede the queued pause event.
  assert.equal(pump.metrics().callbackCount,3,'paused callbacks are not active foreground presentations');
  assert.equal(pump.metrics().skippedSourceFrames,0);
  assert.equal(pump.pending(),false);
});

function fakeAnimationFrames() {
  let next=0;
  const callbacks=new Map(),canceled=[];
  return {
    callbacks,canceled,
    requestFrame(callback) {const handle=next++;callbacks.set(handle,callback);return handle;},
    cancelFrame(handle) {canceled.push(handle);},
    deliver(handle) {const callback=callbacks.get(handle);assert(callback);callbacks.delete(handle);callback(100);},
  };
}

test('paused canvas refresh draws immediately and once after the final native frame settles', () => {
  const scheduler=fakeAnimationFrames(),painted=[];
  let nativeFrame=100;
  const refresh=createSettledFrameRefresh({...scheduler,draw:()=>painted.push(nativeFrame)});
  refresh.refresh();
  assert.deepEqual(painted,[100]);assert.equal(refresh.pending(),true);
  nativeFrame=101;scheduler.deliver(0);
  assert.deepEqual(painted,[100,101],'settled draw captures the final frame even without a new rVFC');
  assert.equal(refresh.pending(),false);assert.equal(scheduler.callbacks.size,0);
});

test('play, seeking and teardown cancel pending settled refresh including handle 0', () => {
  for(const reason of ['play','seek','pagehide']) {
    const scheduler=fakeAnimationFrames();let draws=0;
    const refresh=createSettledFrameRefresh({...scheduler,draw:()=>draws++});
    refresh.refresh();refresh.cancel();
    assert.deepEqual(scheduler.canceled,[0],`${reason} must cancel handle zero`);
    scheduler.deliver(0);
    assert.equal(draws,1,`${reason} must suppress a previously queued settled callback`);
    assert.equal(refresh.pending(),false);
  }
});

test('consecutive pause and end refreshes retain only the newest settled draw', () => {
  const scheduler=fakeAnimationFrames();let draws=0;
  const refresh=createSettledFrameRefresh({...scheduler,draw:()=>draws++});
  for(let cycle=0;cycle<20;cycle++)refresh.refresh();
  assert.equal(draws,20,'each requested final state has one immediate draw');
  for(let handle=0;handle<19;handle++)scheduler.deliver(handle);
  assert.equal(draws,20,'obsolete queued callbacks cannot paint or accumulate');
  assert.equal(refresh.pending(),true);
  scheduler.deliver(19);assert.equal(draws,21);assert.equal(refresh.pending(),false);
});

test('settled refresh rechecks transport state when the deferred callback executes', () => {
  const scheduler=fakeAnimationFrames();let allowed=true,draws=0;
  const refresh=createSettledFrameRefresh({...scheduler,draw:()=>draws++,canDraw:()=>allowed});
  refresh.refresh();allowed=false;scheduler.deliver(0);
  assert.equal(draws,1,'play/seeking state can change before its event handler is dispatched');
  refresh.refresh();assert.equal(draws,1);assert.equal(refresh.pending(),false);
});
