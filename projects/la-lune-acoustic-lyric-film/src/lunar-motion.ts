import motion from '../public/lunar-motion.json' with {type:'json'};
import type {ProductionData} from './schema.ts';
export const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export const smooth=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
export const geometry=(portrait:boolean)=>({cx:portrait?540:960,cy:portrait?605:362,r:portrait?367:278});
export function lunarState(frame:number,data:ProductionData){
 const t=frame/data.fps,vocal=motion.vocal[Math.min(motion.vocal.length-1,Math.max(0,frame))]??0;
 const event=[...motion.events].reverse().find(e=>e.time<=t),age=event?t-event.time:10;
 const ripple=age<.65?{progress:age/.65,opacity:(event?.strength??0)*.16*(1-age/.65)**2}:{progress:0,opacity:0};
 const first=(data.cues[0]?.startSample??0)/data.sampleRate;
 return {vocal,reveal:smooth(t/Math.max(1,first)),ripple,moonOpacity:.78+.17*vocal,haloOpacity:.10+.12*vocal+ripple.opacity*.35,fade:1-smooth((t-(data.duration-2.5))/2.5)};
}
export function titleOpacity(frame:number,data:ProductionData){
 const t=frame/data.fps,first=(data.cues[0]?.startSample??0)/data.sampleRate,verseEnd=(data.cues[6]?.endSample??0)/data.sampleRate,second=(data.cues[7]?.startSample??0)/data.sampleRate,last=(data.cues.at(-1)?.endSample??0)/data.sampleRate;
 return Math.max(...[[1,first-.7],[verseEnd+1,second-.7],[last+1,data.duration]].map(([start,end])=>smooth((t-(start??0))/1.2)*(1-smooth((t-((end??0)-1))/.9))));
}
export function spectrum(frame:number,bands:number[][],portrait:boolean){
 return (bands[Math.min(bands.length-1,Math.max(0,frame))]??Array<number>(64).fill(-100)).map(db=>1.5+clamp((db+62)/45)**1.7*(portrait?34:27));
}
export function barPath(i:number,height:number,portrait:boolean){const g=geometry(portrait),angle=(-240+i*300/63)*Math.PI/180,r=g.r+19;return 'M '+(g.cx+Math.cos(angle)*r).toFixed(3)+' '+(g.cy+Math.sin(angle)*r).toFixed(3)+' L '+(g.cx+Math.cos(angle)*(r+height)).toFixed(3)+' '+(g.cy+Math.sin(angle)*(r+height)).toFixed(3);}
