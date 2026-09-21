/** Decode slightly ahead, then choose an actual decoded frame on the audio clock.
 * A running HTMLVideoElement.currentTime is not a reliable picture timestamp.
 */
export type Picture={time:number;image:CanvasImageSource;close:()=>void};
export function chooseFrame<T extends {time:number}>(frames:readonly T[],target:number):T|undefined{
 let result:T|undefined;for(const f of frames){if(f.time<=target+.0001&&(!result||f.time>result.time))result=f;}return result;
}
export const DECODE_LEAD=.20;
export class FrameDeck{
 readonly video:HTMLVideoElement;frames:Picture[]=[];lastPTS=Number.NaN;decoded=0;private epoch=0;private waiters=new Set<()=>void>();
 constructor(video:HTMLVideoElement,onFrame:()=>void){
  this.video=video;
  let request=0;
  const arm=()=>{if(request)video.cancelVideoFrameCallback(request);request=video.requestVideoFrameCallback(callback);};
  const callback=(_now:number,meta:VideoFrameCallbackMetadata)=>{
   this.lastPTS=meta.mediaTime;this.capture(meta.mediaTime);this.decoded++;for(const f of [...this.waiters])f();onFrame();request=video.requestVideoFrameCallback(callback);
  };
  video.addEventListener('seeked',()=>{this.capture();for(const f of [...this.waiters])f();onFrame();});
  video.addEventListener('loadeddata',()=>{
   // A fresh load exposes the clip's first decoded frame even when a paused
   // video has no subsequent compositor callback. Re-arm after load as well.
   if(video.currentTime<.001){this.lastPTS=0;this.capture(0);for(const f of [...this.waiters])f();}
   arm();
  });
  arm();
 }
 private capture(time?:number){
  if(this.video.readyState<2||!this.video.videoWidth||this.video.seeking)return;
  let image:CanvasImageSource,close=()=>{};
  if(typeof VideoFrame==='function'){// Preserve the decoded frame's native timestamp; never relabel pixels with a clock estimate.
   const frame=new VideoFrame(this.video);time=frame.timestamp/1e6;image=frame;close=()=>frame.close();}
  else{if(time===undefined)return;const canvas=document.createElement('canvas');canvas.width=this.video.videoWidth;canvas.height=this.video.videoHeight;canvas.getContext('2d')!.drawImage(this.video,0,0);image=canvas;}
  const pts=time!;this.lastPTS=pts;
  const duplicate=this.frames.findIndex(f=>Math.abs(f.time-pts)<.00001);if(duplicate>=0)this.frames.splice(duplicate,1)[0]!.close();
  this.frames.push({time:pts,image,close});this.frames.sort((a,b)=>a.time-b.time);
  while(this.frames.length>24)this.frames.shift()!.close();
 }
 clear(){this.epoch++;this.lastPTS=Number.NaN;for(const f of this.frames)f.close();this.frames=[];for(const f of [...this.waiters])f();}
 private waitFor(test:()=>boolean,epoch:number){return new Promise<void>((resolve,reject)=>{
  if(test()||epoch!==this.epoch){resolve();return;}
  const check=()=>{if(test()||epoch!==this.epoch){clearTimeout(timer);this.waiters.delete(check);resolve();}};
  const timer=setTimeout(()=>{this.waiters.delete(check);reject(Error('Decoded footage did not become ready; use Restore visuals.'));},2000);this.waiters.add(check);
 });}
 async prime(local:number,ahead:boolean){
  const v=this.video,target=Math.max(0,Math.min(v.duration-1/60,local));let epoch=++this.epoch;v.pause();
  const existing=chooseFrame(this.frames,target);
  if(!existing||target-existing.time>1/30||Math.abs(v.currentTime-target)>.32){
   this.clear();epoch=this.epoch;v.currentTime=target+.00001;
   this.capture();
   await this.waitFor(()=>!!chooseFrame(this.frames,target)&&target-chooseFrame(this.frames,target)!.time<1/30,epoch);
  }
  if(epoch!==this.epoch)return;
  const end=Math.min(v.duration-1/30,target+DECODE_LEAD);
  if(ahead&&target<end&&!(this.frames.at(-1)&&this.frames.at(-1)!.time>=end)){
   v.playbackRate=1;await v.play();await this.waitFor(()=>this.frames.some(f=>f.time>=end),epoch);if(epoch===this.epoch)v.pause();
  }
 }
 picture(local:number){return chooseFrame(this.frames,local);}
 sync(local:number,speed:number,playing:boolean){
  const v=this.video,active=local>=-DECODE_LEAD&&local<v.duration;
  if(!playing||!active){v.pause();if(!active&&this.frames.length>1){const keep=local<0?this.frames[0]!:this.frames.at(-1)!;for(const f of this.frames)if(f!==keep)f.close();this.frames=[keep];}return;}
  // Sample on the display tick too: compositor callbacks can skip a native frame.
  this.capture();
  const target=Math.max(0,Math.min(v.duration-1/60,local+DECODE_LEAD)),error=target-v.currentTime;
  // Native playback runs ahead solely to feed the cache. Gentle rate correction
  // changes decoding lead, never the timestamp of the picture selected below.
  v.playbackRate=speed*(1+Math.max(-.04,Math.min(.04,error*.5)));
  if(v.paused&&!v.ended)void v.play().catch(()=>{});
 }
}
