export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const smooth=(a,b,t)=>{const x=clamp((t-a)/(b-a));return x*x*(3-2*x)};
export function cueAt(cues,t){return cues.find(c=>t>=c.displayStart&&t<c.displayEnd)||null}
export function wordAt(words,t){return words.findIndex(w=>t>=w.start&&t<w.end)}
export function featuresAt(data,t){if(!data||t<0||t>data.duration)return [0,0,0,0,0];const p=t*data.sampleRate,i=Math.min(data.frames.length-1,Math.floor(p)),j=Math.min(data.frames.length-1,i+1);return data.frames[i].map((a,k)=>a+(data.frames[j][k]-a)*(p-i))}
export function seedRandom(seed=17){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return (seed>>>0)/4294967296}}
export const SEMANTIC_TARGETS=Object.freeze({lamps:['L10-W05','L48-W06','L65-W03'],rain:['L14-W07','L28-W07'],core:['L27-W02','L31-W02'],door:['L58-W05']});
export function effectTargetsForCue(cueId){return Object.entries(SEMANTIC_TARGETS).filter(([,ids])=>ids.some(id=>id.startsWith(cueId+'-'))).map(([effect])=>effect)}
export function semanticEffectsAt(cues,t){const words=cues.flatMap(c=>c.words),find=id=>words.find(w=>w.id===id);const envelope=(id,tail)=>{const w=find(id);return w?smooth(w.start-.15,w.start+.12,t)*(1-smooth(w.end+tail-.6,w.end+tail,t)):0};return {lamps:Math.max(...SEMANTIC_TARGETS.lamps.map(id=>envelope(id,1.5))),rain:Math.max(...SEMANTIC_TARGETS.rain.map(id=>envelope(id,3))),core:Math.max(...SEMANTIC_TARGETS.core.map(id=>envelope(id,7))),door:find('L58-W05')?smooth(find('L58-W05').start,find('L58-W06')?.end||find('L58-W05').end,t):0}}
export function frameState(t,features,options={}){
 const semantics=options.cues?semanticEffectsAt(options.cues,t):{core:0,rain:0,door:0,lamps:0};
 const core=semantics.core;
 const bridge=smooth(175,180,t)*(1-smooth(210,215,t));
 const chorus=Math.max(smooth(68,72,t)*(1-smooth(99,104,t)),smooth(145,149,t)*(1-smooth(172,176,t)),smooth(213,217,t)*(1-smooth(249,256,t)));
 const ending=smooth(255,270,t),rain=semantics.rain;
 const signal=(options.effects===false?0:1)*(1-ending*.85);
 return {t,core,bridge,chorus,ending,rain,door:semantics.door,lamps:semantics.lamps,community:smooth(181,201,t),light:smooth(4,22,t),energy:features?.[0]||0,low:(features?.[1]||0)*signal,mid:(features?.[2]||0)*signal,high:(features?.[3]||0)*signal,attack:(features?.[4]||0)*signal,reduced:!!options.reduced,effects:options.effects!==false};
}
export const CHAPTERS=[{t:0,label:'First contact'},{t:24.495,label:'Somewhere to return to'},{t:59.362,label:'Room for another'},{t:69.335,label:'Something that stays'},{t:103.005,label:'Dreamed in stone'},{t:136.277,label:'The work is close'},{t:146.09,label:'Recognition'},{t:175.452,label:'A way to get to you'},{t:204.282,label:'The signal'},{t:214.149,label:'The door exists now'},{t:254.84,label:'Leave the light on'}];
