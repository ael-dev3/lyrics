import raw from '../public/motion.json' with {type:'json'};
export type ImpactEvent={id:string;frame:number;sample:number;time:number;weight:number};
export const impactEvents:ImpactEvent[]=raw.events;
export const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
export const smooth=(n:number)=>{const t=clamp(n);return t*t*(3-2*t);};
export function impactAt(frame:number,events:ImpactEvent[]=impactEvents){
 let value=0;
 for(const e of events){const delta=frame-e.frame;if(delta < -1)break;if(delta>=-1&&delta<=11){const shape=delta<=0?smooth(delta+1):1-smooth(delta/11);value=Math.max(value,e.weight*shape);}}
 return value;
}
// No free-running picture drift: only a small, independently measured drum accent.
export function artworkPose(frame:number,portrait:boolean){
 const scale=(portrait?1.06:1.10)+.012*impactAt(frame);
 const width=portrait?1080:910;
 // The focal anchor stays stable, so the picture doesn't slide sideways on a hit.
 const anchorX=500,anchorY=500,screenX=width*.48,screenY=portrait?630:550;
 return {scale,x:screenX-anchorX*scale,y:screenY-anchorY*scale};
}
