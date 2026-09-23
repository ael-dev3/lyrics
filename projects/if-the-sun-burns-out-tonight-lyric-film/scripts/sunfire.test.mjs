import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {drawSunfire} from '../src/sunfire.js';
import {validateFireDynamics, fireDynamicsAt} from '../src/fire-dynamics.js';

// Pure-data and Canvas-command behavior. Pixel appearance and browser playback
// performance require the separate composed-preview review.
const root=new URL('../',import.meta.url);
const data=JSON.parse(readFileSync(new URL('public/fire-dynamics.json',root),'utf8'));
const timelineBytes=readFileSync(new URL('src/timeline.json',root));
const timeline=JSON.parse(timelineBytes);
const manifest=JSON.parse(readFileSync(new URL('source/media-manifest.json',root),'utf8'));
const near=(actual,expected,epsilon=1e-6)=>assert(Math.abs(actual-expected)<epsilon,`${actual} differs from ${expected}`);

function recorder() {
  const commands=[],fills=[],gradients=[],stack=[];
  let path=[],state={globalAlpha:1,globalCompositeOperation:'source-over',lineWidth:7,shadowBlur:9,shadowColor:'initial',fillStyle:'initial'};
  const record=(name,args)=>commands.push([name,...args]);
  const context={
    save(){stack.push({...state});record('save',[]);},
    restore(){assert(stack.length);state=stack.pop();record('restore',[]);},
    beginPath(){path=[];record('beginPath',[]);},
    closePath(){path.push(['closePath']);record('closePath',[]);},
    rect(...args){path.push(['rect',...args]);record('rect',args);},
    clip(){record('clip',[]);},
    moveTo(...args){path.push(['moveTo',...args]);record('moveTo',args);},
    bezierCurveTo(...args){path.push(['bezierCurveTo',...args]);record('bezierCurveTo',args);},
    quadraticCurveTo(...args){path.push(['quadraticCurveTo',...args]);record('quadraticCurveTo',args);},
    ellipse(...args){path.push(['ellipse',...args]);record('ellipse',args);},
    fill(){fills.push({path:structuredClone(path),alpha:state.globalAlpha,style:state.fillStyle});record('fill',[state.globalAlpha,state.fillStyle]);},
    createLinearGradient(...args){
      const gradient={id:gradients.length,coordinates:args,stops:[]};gradients.push(gradient);record('gradient',args);
      return {id:gradient.id,addColorStop(...stop){gradient.stops.push(stop);record('colorStop',[gradient.id,...stop]);}};
    },
  };
  for(const property of Object.keys(state))Object.defineProperty(context,property,{
    get:()=>state[property],set:value=>{state[property]=value&&typeof value==='object'&&'id'in value ? 'gradient-'+value.id : value;record(property,[state[property]]);},
  });
  return {context,commands,fills,gradients,get state(){return {...state};},get stackDepth(){return stack.length;}};
}

const anchor=(overrides={})=>({x:80,y:115,width:16,fontSize:32,maxRise:60.8,seed:'glyph-a',wordStart:10,wordEnd:11,role:'burns',...overrides});
const anchors=Array.from({length:18},(_,index)=>anchor({x:45+index*21,seed:'glyph-'+index,width:index%4?16:8,role:['sun','burns','out','tonight'][index%4]}));
function render({time=10.4,drive=.7,phase=12.37,presence=1,width=450,height=145,glyphs=anchors}={}) {
  const result=recorder();drawSunfire(result.context,width,height,glyphs,time,drive,{phase,presence});return result;
}
function pointsOf(fills) {
  const points=[];
  for(const {path} of fills)for(const [operation,...v] of path){
    if(operation==='ellipse') {
      const [x,y,rx,ry,rotation]=v;
      const dx=Math.hypot(rx*Math.cos(rotation),ry*Math.sin(rotation));
      const dy=Math.hypot(rx*Math.sin(rotation),ry*Math.cos(rotation));
      points.push([x-dx,y-dy],[x+dx,y+dy]);
    } else if(operation==='moveTo'||operation==='bezierCurveTo'||operation==='quadraticCurveTo') {
      for(let index=0;index<v.length;index+=2)points.push([v[index],v[index+1]]);
    }
  }
  return points;
}

test('fire data is complete, matches source/timeline identity and integrates its stored burn rate',()=>{
  assert(validateFireDynamics(data));
  assert.equal(data.source.sha256,manifest.sha256);
  assert.equal(data.timelineSha256,createHash('sha256').update(timelineBytes).digest('hex'));
  assert.equal(data.rows.length,14057);assert.equal(data.rows[0][7],0);
  for(let index=1;index<data.rows.length;index++) {
    const previous=data.rows[index-1],current=data.rows[index];
    assert(current[7]>previous[7]);
    near(current[7]-previous[7],(previous[6]+current[6])/(2*data.frameRate),2e-6);
  }
});

test('fire data validation rejects incomplete, nonfinite and out-of-range inputs',()=>{
  const fixture={schema:data.schema,frameRate:60,durationSeconds:1/60,firstFrameSeconds:0,frameCount:2,columns:[...data.columns],rows:[[-50,-40,-50,.2,.1,.1,.45,0],[-50,-40,-50,.2,.1,.1,.45,.0075]]};
  assert(validateFireDynamics(fixture));
  for(const mutate of [
    value=>value.rows.pop(),value=>value.columns.reverse(),value=>value.rows[0][5]=1.01,
    value=>value.rows[0][6]=2.81,value=>value.rows[1][7]=-.1,value=>value.rows[0][0]=NaN,
  ]) {const corrupted=structuredClone(fixture);mutate(corrupted);assert.equal(validateFireDynamics(corrupted),false);}
  assert.equal(validateFireDynamics(null),false);
});

test('fire lookup uses source-time interpolation and survives nonsequential seeks',()=>{
  for(const frame of [0,1600,4600,7000,12000]) {
    const exact=fireDynamicsAt(data,frame/60),half=fireDynamicsAt(data,(frame+.5)/60);
    for(const [key,column] of [['drive',5],['rate',6],['phase',7],['mixDbfs',0],['vocalDbfs',1]]) {
      near(exact[key],data.rows[frame][column]);
      near(half[key],(data.rows[frame][column]+data.rows[frame+1][column])/2);
    }
  }
  const original=fireDynamicsAt(data,77.91);
  for(const time of [219.5,33.0,200.1,0,113.5])fireDynamicsAt(data,time);
  assert.deepEqual(fireDynamicsAt(data,77.91),original);
  for(const speed of [.5,.75,1])assert.deepEqual(fireDynamicsAt(data,(77.91/speed)*speed),original);
  for(const time of [-1,Infinity,NaN,data.durationSeconds+.01])assert.equal(fireDynamicsAt(data,time).drive,0);
});

test('measured quiet and forceful hooks receive different size and burn-rate inputs',()=>{
  const lines=timeline.sections.flatMap(section=>section.lines);
  const medianDrive=id=>{
    const cue=lines.find(line=>line.id===id),values=[];
    const start=cue.words.find(word=>word.text.toLowerCase()==='sun').start;
    for(let time=start;time<cue.words.at(-1).end;time+=1/60)values.push(fireDynamicsAt(data,time).drive);
    return values.sort((a,b)=>a-b)[Math.floor(values.length/2)];
  };
  const quiet=medianDrive('L02'),forceful=medianDrive('L42');
  assert(quiet<.2);assert(forceful>.6);assert(forceful>quiet*5);
  assert(fireDynamicsAt(data,201).rate>fireDynamicsAt(data,33).rate);
});

test('draw commands reconstruct exactly from the same source time after arbitrary seeks',()=>{
  const before=structuredClone(anchors),dynamics=fireDynamicsAt(data,76.7);
  const first=render({drive:dynamics.drive,phase:dynamics.phase});
  render({time:50,drive:.9,phase:200});render({time:0,drive:.1,phase:0});
  const returned=render({drive:dynamics.drive,phase:dynamics.phase});
  assert.deepEqual(returned.commands,first.commands);
  assert.deepEqual(anchors,before,'rendering cannot move or mutate measured glyph anchors');
});

test('periodic motion uses integrated phase while word focus stays on source seconds',()=>{
  const glyphs=[anchor({wordStart:9,wordEnd:15})];
  assert.deepEqual(render({glyphs,time:10,phase:100}).commands,render({glyphs,time:11,phase:100}).commands,'fixed phase must hold motion despite elapsed wall/media time inside one sustained word');
  assert.notDeepEqual(render({glyphs,time:10,phase:100}).commands,render({glyphs,time:10,phase:100.1}).commands);
  const before=render({glyphs,time:8,phase:100}),active=render({glyphs,time:10,phase:100});
  assert(Math.max(...active.fills.map(fill=>fill.alpha))>Math.max(...before.fills.map(fill=>fill.alpha))*3,'a large phase must not ignite a word before its source-time focus');
});

test('forceful drive makes flames higher and stronger at an identical animation phase',()=>{
  const low=render({drive:.05}),high=render({drive:.95});
  const lowTop=Math.min(...pointsOf(low.fills).map(point=>point[1]));
  const highTop=Math.min(...pointsOf(high.fills).map(point=>point[1]));
  assert(highTop<lowTop-20,'loud response must increase measured path height, not just opacity');
  assert(Math.max(...high.fills.map(fill=>fill.alpha))>Math.max(...low.fills.map(fill=>fill.alpha))*2);
});

test('landscape and wrapped-portrait geometry stays inside its allotted crop',()=>{
  const fixtures=[
    {width:450,height:145,glyphs:anchors},
    {width:210,height:125,glyphs:Array.from({length:16},(_,index)=>anchor({x:30+(index%8)*20,y:index<8?45:95,width:8,fontSize:18,maxRise:index<8?34.2:20,seed:index}))},
    {width:160,height:95,glyphs:Array.from({length:12},(_,index)=>anchor({x:24+(index%6)*21,y:index<6?32:71,width:7,fontSize:14,maxRise:index<6?26.6:15,seed:index}))},
  ];
  for(const fixture of fixtures)for(let step=0;step<180;step++) {
    const result=render({...fixture,phase:step*.061,drive:step%2?.98:.04});
    for(const [x,y]of pointsOf(result.fills)) {
      assert(Number.isFinite(x)&&Number.isFinite(y));
      assert(x>=0&&x<=fixture.width&&y>=0&&y<=fixture.height,'a tongue or complete ember must fit the allocated crop');
    }
  }
});

test('wrapped lower-row flame and ember rise respects previous-line clearance',()=>{
  const glyphs=[anchor({x:80,y:95,fontSize:24,width:12,maxRise:18})];
  for(let step=0;step<240;step++) {
    const result=render({glyphs,width:160,height:115,drive:1,phase:step*.043});
    for(const [,y]of pointsOf(result.fills))assert(y>=76,'lower-row fire must not touch the previous row ending at75px');
  }
});

test('fire respects caller state, zero presence and bounded glyph/ember work',()=>{
  const recording=recorder(),initial=recording.state;
  drawSunfire(recording.context,450,145,anchors,10.4,.8,{phase:12,presence:.5});
  assert.deepEqual(recording.state,initial);assert.equal(recording.stackDepth,0);
  for(const options of [{drive:0},{presence:0},{phase:NaN},{time:NaN},{width:0}])assert.equal(render(options).fills.length,0);
  const many=Array.from({length:120},(_,index)=>anchor({x:45+index%18*21,seed:index}));
  const bounded=render({glyphs:many,drive:1,phase:20});
  assert.deepEqual(bounded.commands,render({glyphs:many.slice(0,64),drive:1,phase:20}).commands);
  assert(bounded.fills.length<=64*4+6,'at most two two-layer tongues per glyph and six embers');
  assert(bounded.gradients.length<=2,'shared row geometry must reuse its two gradients');
});
