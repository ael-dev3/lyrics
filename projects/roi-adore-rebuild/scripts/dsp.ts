export type Band={low:number;high:number;center:number;b0:number;a1:number;a2:number;pad:number;window:number};
export const SR=48000;
export function bandFilter(low:number,high:number):Band{
 const l=Math.tan(Math.PI*low/SR),h=Math.tan(Math.PI*high/SR),o=l*h,b=(h-l)/Math.sqrt(Math.SQRT2-1),d=1+b+o;
 const b0=b/d,a1=2*(o-1)/d,a2=(1-b+o)/d,center=Math.atan(Math.sqrt(o))*SR/Math.PI;
 const pole=Math.sqrt(Math.max(0,a2));const pad=Math.ceil(10/Math.max(1e-6,1-pole));
 return {low,high,center,b0,a1,a2,pad,window:Math.round(SR*Math.max(.025,4/center))};
}
export const bands=Array.from({length:64},(_,i)=>bandFilter(20*1000**(i/64),20*1000**((i+1)/64)));
export function response(b:Band,f:number){const w=2*Math.PI*f/SR,c=Math.cos(w),s=Math.sin(w),c2=Math.cos(2*w),s2=Math.sin(2*w);return ((b.b0*(1-c2))**2+(b.b0*s2)**2)/((1+b.a1*c+b.a2*c2)**2+(b.a1*s+b.a2*s2)**2);}
export function filtered(pcm:Float32Array,channel:number,b:Band):Float64Array{
 const count=pcm.length/2,pad=Math.min(count-1,b.pad),out=new Float64Array(count+2*pad);
 for(let j=0;j<out.length;j++){let i=j-pad;if(i<0)i=-i;if(i>=count)i=2*count-2-i;out[j]=pcm[i*2+channel]??0;}
 for(const reverse of [false,true]){let x1=0,x2=0,y1=0,y2=0;for(let k=0;k<out.length;k++){const i=reverse?out.length-1-k:k,x=out[i]??0,y=b.b0*(x-x2)-b.a1*y1-b.a2*y2;out[i]=y;x2=x1;x1=x;y2=y1;y1=y;}}
 return out.subarray(pad,pad+count);
}
export const db=(power:number)=>10*Math.log10(Math.max(1e-12,power));
export function measure(pcm:Float32Array,b:Band,fps=60){const l=filtered(pcm,0,b),r=filtered(pcm,1,b),n=l.length,prefix=new Float64Array(n+1);for(let i=0;i<n;i++)prefix[i+1]=(prefix[i]??0)+((l[i]??0)**2+(r[i]??0)**2)/2;return Array.from({length:Math.ceil(n/SR*fps)},(_,f)=>{const c=Math.round(f*SR/fps),a=Math.max(0,c-Math.floor(b.window/2)),z=Math.min(n,c+Math.ceil(b.window/2));return db(((prefix[z]??0)-(prefix[a]??0))/Math.max(1,z-a));});}
