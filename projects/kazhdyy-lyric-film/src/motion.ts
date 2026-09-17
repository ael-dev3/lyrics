export const clamp=(n:number,a=0,b=1)=>Math.max(a,Math.min(b,n));
export const smooth=(n:number)=>{const t=clamp(n);return t*t*(3-2*t);};
// Deliberately still: all musical movement belongs to the measured visualizer.
export function artworkPose(_frame:number,portrait:boolean){
 const scale=portrait?1.06:1.10,width=portrait?1080:910;
 const anchorX=500,anchorY=500,screenX=width*.48,screenY=portrait?630:550;
 return {scale,x:screenX-anchorX*scale,y:screenY-anchorY*scale};
}
