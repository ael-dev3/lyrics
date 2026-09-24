import rawCues from './word-cues.json';
export type Format='landscape'|'portrait';
export type Word={text:string;start:number;end:number;startSample?:number;endSampleExclusive?:number;requiresReview?:boolean};
export type Cue={id:string;text:string;start:number;end:number;uncertain?:boolean;words:Word[]};
export type Host='shop'|'tower'|'airship'|'train';
export type Box={x:number;y:number;w:number;h:number};
export type Surface={box:Box;indices:number[];unit:number;vertical?:boolean;name:string};
export type Placement={word:string;index:number;x:number;y:number;unit:number;vertical?:boolean;width:number;height:number;surface:Box};
export const cityCues=rawCues as Cue[];
const HOSTS:Record<string,Host>={
 'V1-01':'shop','V1-02':'tower','V1-03':'shop','V1-04':'shop','V1-05':'train','V1-06':'train','V1-07':'tower','V1-08':'train',
 'CH-01':'tower','CH-02':'tower','CH-03':'airship','CH-04':'train','CH-05':'tower','CH-06':'tower',
 'V2-01':'shop','V2-02':'shop','V2-03':'tower','V2-04':'train',
};
export const cueHost=(q:Cue|undefined):Host|undefined=>q?HOSTS[q.id]:undefined;
export function getCityCue(t:number):Cue|undefined{return cityCues.find(q=>t>=q.start&&t<q.end)??cityCues.find(q=>t>=q.start-.55&&t<q.start)??cityCues.find(q=>t>=q.end&&t<q.end+.9);}
const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const ease=(x:number)=>{const q=clamp(x);return q*q*(3-2*q);};
export function cityGeometry(format:Format){const portrait=format==='portrait';return {portrait,w:portrait?360:640,h:portrait?640:360,horizon:portrait?384:195,railY:portrait?407:222,shopY:portrait?450:245,roadY:portrait?551:315,
 tower:{x:portrait?68:231,y:portrait?300:157,w:portrait?224:177,h:portrait?41:28},
 shop:{x:portrait?11:178,y:portrait?450:246,w:portrait?332:303,h:portrait?17:15},
 airship:{x:0,y:0,w:portrait?82:108,h:portrait?11:15},train:{x:0,y:portrait?377.4:192.4,w:101,h:16},
 leftAd:{x:portrait?10:17,y:portrait?250:48,w:portrait?19:49,h:portrait?75:45},
 rightAd:{x:portrait?322:573,y:portrait?70:31,w:portrait?17:21,h:portrait?87:75},
 };}
export function shopSigns(format:Format){return format==='portrait'?[
 {x:11,y:450,w:54,h:17,name:'MONSOON',color:'#f269c9'},{x:88,y:450,w:42,h:17,name:'LAUNDRY',color:'#59d8ec'},
 {x:150,y:450,w:54,h:17,name:'ARCADE',color:'#f269c9'},{x:222,y:450,w:46,h:17,name:'LANTERN',color:'#edb366'},{x:293,y:450,w:49,h:17,name:'GLASS',color:'#59d8ec'},
 ]:[{x:0,y:248,w:46,h:10,name:'MONSOON',color:'#f269c9'},{x:64,y:249,w:48,h:10,name:'LAUNDRY',color:'#59d8ec'},
 {x:134,y:252,w:18,h:7,name:'AXIS',color:'#f269c9'},{x:178,y:247,w:55,h:13,name:'NOODLES',color:'#edb366'},
 {x:274,y:246,w:64,h:14,name:'LANTERN',color:'#f269c9'},{x:374,y:248,w:38,h:12,name:'GLASS',color:'#59d8ec'},
 {x:433,y:248,w:48,h:12,name:'ARCADE',color:'#8b78b8'},{x:502,y:248,w:48,h:12,name:'YELLOW',color:'#edb366'},{x:568,y:249,w:23,h:9,name:'CAT',color:'#59d8ec'}];}
export function catWindow(format:Format){return format==='portrait'?{x:270,y:245,w:76,h:76*1.27}:{x:410,y:98,w:84,h:84*1.27};}
// One consist follows one rail. It approaches, slows, then clears the whole frame before the next pass.
const TRAIN_TRIPS=[[-25,-13,-3,20],[22,34,43,60],[61,67.5,89.5,101],[102,108.5,117.8,142],[143,153,160,171],[172,179.5,188.5,211],[213,224,233,256]] as const;
function hermite(t:number,t0:number,t1:number,x0:number,x1:number,v0:number,v1:number){const d=t1-t0,u=clamp((t-t0)/d),u2=u*u,u3=u2*u;return (2*u3-3*u2+1)*x0+(u3-2*u2+u)*d*v0+(-2*u3+3*u2)*x1+(u3-u2)*d*v1;}
export function trainPose(t:number,format:Format){const g=cityGeometry(format),width=204,height=50,spacing=212,trip=TRAIN_TRIPS.find(k=>t>=k[0]&&t<=k[3]);
 const y=g.railY-height*.837,target=g.w/2-width*.532;let x=-1000;
 if(trip){const [enter,settle,depart,exit]=trip,v=60/(depart-settle);
  if(t<settle)x=hermite(t,enter,settle,-width-18,target-30,35,v);
  else if(t<depart)x=target-30+(t-settle)*v;
  else x=hermite(t,depart,exit,target+30,g.w+spacing*3+width+18,v,40);
 }
 return {x,y,width,height,spacing,count:4,railY:g.railY,visible:!!trip,box:{x:x+width*.286,y:y+height*.344-1.5,w:101,h:18}};
}
const FLIGHTS=[[13,17,18,24],[98,103.8,108.4,118],[138,142,143,149],[217,222,223,230]] as const;
export function airshipPose(t:number,format:Format){const g=cityGeometry(format),width=g.portrait?144:190,height=width/3,y=g.portrait?174:47,target=g.w/2-width/2,trip=FLIGHTS.find(k=>t>=k[0]&&t<=k[3]);let x=g.w+50;
 if(trip){const [enter,settle,depart,exit]=trip,v=-24/(depart-settle);
  if(t<settle)x=hermite(t,enter,settle,g.w+20,target+12,-35,v);
  else if(t<depart)x=target+12+(t-settle)*v;
  else x=hermite(t,depart,exit,target-12,-width-25,v,-40);
 }
 return {x,y,width,height,visible:!!trip,box:{x:x+width*.216,y:y+height*.362,w:width*.57,h:height*.25}};
}
function all(q:Cue){return q.words.map((_,i)=>i);}
const SHOP_GROUPS:Record<string,number[][]>={
 'V1-01':[[0],[1],[2,3],[4]],'V1-03':[[0],[1],[2,3],[4]],'V1-04':[[0],[1],[2],[3]],
 'V2-01':[[0],[1],[2],[3],[4,5]],'V2-02':[[0],[1],[2,3],[4]],
};
export function lyricSurfaces(q:Cue,t:number,format:Format):Surface[]{const g=cityGeometry(format),host=cueHost(q);const full=(box:Box,unit:number,name:string):Surface=>({box,unit,indices:all(q),name});
 if(host==='train')return[full(trainPose(t,format).box,1,'train-led')];
 if(host==='airship')return[full(airshipPose(t,format).box,1,'airship-led')];
 if(host==='shop'){
  const slots=shopSigns(format),groups=SHOP_GROUPS[q.id]??[all(q)];let choices:number[];
  if(format==='portrait')choices=groups.length===5?[0,1,2,3,4]:[0,2,3,4];
  else choices=groups.length===5?[1,3,4,6,7]:[3,4,5,6];
  // Keep the longest word in a header that can physically contain it.
  if(q.id==='V1-04')choices=format==='portrait'?[0,1,2,3]:[3,4,5];
  let mapped=groups;
  if(q.id==='V1-04'&&format==='landscape')mapped=[[0,1],[2],[3]];
  if(q.id==='V2-01'){mapped=[[0,1],[2],[3],[4],[5]];choices=format==='portrait'?[0,1,2,3,4]:[3,4,5,6,7];}
  const surfaces=mapped.map((indices,i)=>{const b=slots[choices[i]??0]!;return{box:{x:b.x,y:b.y,w:b.w,h:Math.max(b.h,indices.length>1?17:b.h)},indices,unit:1,name:`shop-${choices[i]}`};});
  // The portrait municipal board relays the line while the entire shop row sings it below.
  if(format==='portrait')surfaces.push(full(g.tower,2,'portrait-relay'));
  return surfaces;
 }
 if(q.id==='V1-07')return[full(format==='landscape'?g.leftAd:g.tower,format==='landscape'?1:2,'stellar-ad')];
 if(q.id==='CH-01'||q.id==='CH-05'){
  const side=q.id==='CH-01'?g.leftAd:g.rightAd;
  return[{box:side,indices:[0],unit:1,vertical:format==='portrait'||q.id==='CH-05',name:'tower-neon'},{box:g.tower,indices:[1],unit:2,name:'civic-response'}];
 }
 if(q.id==='V2-03')return[full(g.portrait?{x:151,y:300,w:119,h:41}:{x:283,y:157,w:122,h:28},1.5,'cat-apartment-sign')];
 return[full(g.tower,g.portrait?2:1.5,'civic-billboard')];
}
export function surfacePlacements(q:Cue,s:Surface):Placement[]{
 const displayWord=(index:number)=>s.name==='tower-neon'?q.words[index]!.text.replace(/[^a-z]/gi,''):q.words[index]!.text;
 if(s.vertical){const index=s.indices[0]!,word=q.words[index]!.text.replace(/[^a-z]/gi,'').toUpperCase(),height=(word.length*8-1)*s.unit,width=5*s.unit;
  return[{word,index,x:s.box.x+(s.box.w-width)/2,y:s.box.y+(s.box.h-height)/2,unit:s.unit,vertical:true,width,height,surface:s.box}];}
 let unit=s.unit;
 for(;;){const rows:number[][]=[[]];let width=0;
  for(const index of s.indices){const n=displayWord(index).length*6-1,space=width?unit*7:0;
   if(width&&width+space+n*unit>s.box.w-1){rows.push([]);width=0;}rows[rows.length-1]!.push(index);width+=(width?unit*7:0)+n*unit;}
  const height=(rows.length*9-2)*unit;
  if((height>s.box.h||rows.some(r=>r.some(i=>(displayWord(i).length*6-1)*unit>s.box.w)))&&unit>1){unit-=.5;continue;}
  const placements:Placement[]=[];
  rows.forEach((row,ri)=>{const rowWidth=(row.reduce((n,i)=>n+displayWord(i).length*6-1,0)+(row.length-1)*7)*unit;let x=s.box.x+(s.box.w-rowWidth)/2;
   for(const index of row){const word=displayWord(index).toUpperCase(),width=(word.length*6-1)*unit;placements.push({word,index,x,y:s.box.y+(s.box.h-height)/2+ri*9*unit,unit,width,height:7*unit,surface:s.box});x+=width+7*unit;}});
  return placements;
 }
}
export function lyricPose(q:Cue,t:number,format:Format){return lyricSurfaces(q,t,format).flatMap(s=>surfacePlacements(q,s));}
// Compatibility for callers that inspect a single box; the motion-aware API is lyricPose().
export function lyricLayout(q:Cue,box:Box,format:Format,host:Host){const p=surfacePlacements(q,{box,indices:all(q),unit:host==='tower'?(format==='portrait'?2:1.5):1,name:host});return{unit:p[0]?.unit??1,placements:p,height:Math.max(...p.map(v=>v.y+v.height))-Math.min(...p.map(v=>v.y))};}
// Planned camera marks produce continuous eased travel; no cue selection can snap the camera.
const SHOTS=[
 [0,320,180,1],[39,320,180,1],[46.8,327,243,1.48],[50.7,327,243,1.48],[53.5,320,181,1.72],
 [57.5,327,242,1.43],[66,327,242,1.43],[68.5,320,224,1.42],[78.5,320,224,1.42],
 [80.2,228,159,1.4],[83.8,228,159,1.4],[85,320,224,1.42],[89,320,224,1.42],
 [93,230,153,1.4],[98,230,153,1.4],[100,320,177,1.65],[103.5,320,177,1.65],
 [105.1,320,145,1.2],[108,320,145,1.2],[109.7,320,224,1.42],[114.8,320,224,1.42],[116.8,371,157,1.19],
 [119,418,149,1.4],[122.2,418,149,1.4],[124,320,178,1.65],[131,320,178,1.65],[140,320,180,1],
 [156,320,180,1],[162.7,327,248,1.43],[173.3,327,248,1.43],
 [175.1,380,176,2.2],[180.5,380,176,2.2],[183.2,320,224,1.42],[188.5,320,224,1.42],[197,320,180,1],[247.3,320,180,1],
] as const;
export function cityCamera(t:number,format:Format){const g=cityGeometry(format);let a:readonly [number,number,number,number]|undefined=SHOTS[0],b:readonly [number,number,number,number]|undefined=SHOTS[SHOTS.length-1];for(let i=1;i<SHOTS.length;i++){if(t<=SHOTS[i]![0]){a=SHOTS[i-1];b=SHOTS[i];break;}}
 if(!a||!b)throw new Error('No camera marks');const u=ease((t-a[0])/Math.max(.001,b[0]-a[0]));let x=a[1]+(b[1]-a[1])*u,y=a[2]+(b[2]-a[2])*u,zoom=a[3]+(b[3]-a[3])*u;
 if(g.portrait){const cat=ease((t-173.3)/1.8)*(1-ease((t-180.5)/2.7));zoom=1+.72*cat;x=180+62*cat;y=320+7*cat;}
 return{zoom,x:clamp(x,g.w/(2*zoom),g.w-g.w/(2*zoom)),y:clamp(y,g.h/(2*zoom),g.h-g.h/(2*zoom))};
}
