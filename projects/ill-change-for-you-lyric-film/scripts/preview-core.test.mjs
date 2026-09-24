import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createCues, cueAt, wordIndexAt, spectrumAt,
  createVideoFramePump, createSettledFrameRefresh,
} from '../src/preview-core.js';
import {paintEdgeprint} from '../src/edgeprint.js';

test('a word stays in its own cue and highlight interval, including tight handoffs', () => {
  const cues = createCues({sections:[{name:'test', lines:[
    {id:'A', text:'How', words:[{id:'A1', text:'How', start:1, end:1.4}]},
    {id:'B', text:'Do I', words:[
      {id:'B1', text:'Do', start:1.6, end:1.85},
      {id:'B2', text:'I', start:1.85, end:2.1},
    ]},
  ]}]});
  assert.equal(cueAt(cues, 1.2)?.id, 'A');
  assert.equal(cueAt(cues, 1.6)?.id, 'B');
  assert.equal(wordIndexAt(cues[1].words, 1.6), 0);
  assert.equal(wordIndexAt(cues[1].words, 1.85), 1, 'next word starts exactly as previous releases');
  assert.equal(wordIndexAt(cues[1].words, 2.1), -1, 'word end is exclusive');
  assert.equal(cueAt(cues, 2.5), null, 'ended lyrics clear instead of hanging indefinitely');
});

test('audio bands interpolate on source time and silence outside soundtrack', () => {
  const metadata = {
    source:{durationSeconds:1},
    clock:{framesPerSecond:2},
    data:{frameCount:2, bandCount:2, dbfsOffset:-96, dbfsStep:.01},
  };
  const values = new Uint16Array([0,100,200,300]);
  const midway = spectrumAt(values, metadata, .25);
  assert.deepEqual(Array.from(midway), [-95, -94]);
  assert.deepEqual(Array.from(spectrumAt(values, metadata, 0)), [-96, -95]);
  assert.deepEqual(Array.from(spectrumAt(values, metadata, -.01)), [-96, -96]);
  assert.deepEqual(Array.from(spectrumAt(values, metadata, 1)), [-96, -96]);
});

test('film edge responds to measured energy while preserving a quiet frame', () => {
  const strokes=[];
  const context={
    clearRect(){}, beginPath(){}, moveTo(){}, lineTo(){},
    stroke(){strokes.push({color:this.strokeStyle,width:this.lineWidth});},
  };
  paintEdgeprint(context, 24, 360, new Float32Array(64).fill(-96), 'dark');
  assert.equal(strokes.length, 0, 'quiet audio produces no decorative strokes');
  paintEdgeprint(context, 24, 360, new Float32Array(64).fill(-20), 'light');
  assert.ok(strokes.length > 0 && strokes.length <= 28);
  assert.ok(strokes.every(stroke => stroke.color.startsWith('rgba(63,31,45,')));
  assert.ok(strokes.every(stroke => stroke.width >= .7 && stroke.width <= 1.55));
});

test('source video frame callbacks do not survive a seek or format restart', () => {
  let nextId=0;
  const callbacks=new Map(), cancelled=[];
  const video={
    paused:false, seeking:false,
    requestVideoFrameCallback(callback){const id=++nextId;callbacks.set(id,callback);return id;},
    cancelVideoFrameCallback(id){cancelled.push(id);},
  };
  const painted=[];
  const pump=createVideoFramePump(video,(_,metadata)=>painted.push(metadata.mediaTime));
  pump.start();
  assert.equal(pump.pending(),true);
  callbacks.get(1)(0,{presentedFrames:10,mediaTime:1});
  callbacks.get(2)(0,{presentedFrames:12,mediaTime:1.08});
  assert.deepEqual(painted,[1,1.08]);
  assert.equal(pump.metrics().skippedSourceFrames,1);
  assert.equal(pump.metrics().maximumFrameGap,1);
  pump.stop();
  assert.ok(cancelled.includes(3));
  callbacks.get(3)(0,{presentedFrames:13,mediaTime:1.12});
  assert.deepEqual(painted,[1,1.08], 'stale callback cannot repaint after stop');
  video.seeking=true;
  pump.start();
  assert.equal(pump.pending(),false, 'seeking waits for a decoded source frame');
});

test('paused source frame refresh draws immediately and after layout settles', () => {
  let nextId=0, draws=0, canDraw=true;
  const callbacks=new Map(), cancelled=[];
  const refresh=createSettledFrameRefresh({
    requestFrame(callback){const id=++nextId;callbacks.set(id,callback);return id;},
    cancelFrame(id){cancelled.push(id);},
    draw(){draws++;},canDraw:()=>canDraw,
  });
  refresh.refresh();
  assert.equal(draws,1);
  refresh.refresh();
  assert.equal(draws,2);
  assert.deepEqual(cancelled,[1]);
  callbacks.get(1)();
  assert.equal(draws,2, 'stale layout refresh does not overwrite new picture');
  callbacks.get(2)();
  assert.equal(draws,3);
  canDraw=false;
  refresh.refresh();
  assert.equal(draws,3, 'hidden or unavailable source does not redraw');
});
