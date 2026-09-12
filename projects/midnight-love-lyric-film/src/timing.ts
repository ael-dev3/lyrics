export type TimedLine={startSample:number;endSample:number};
export const SR=48000,FPS=60,SPF=SR/FPS;
export const sampleToFrame=(sample:number)=>Math.round(sample/SPF);
export function displayWindow(c:TimedLine,previous:TimedLine|undefined,next:TimedLine|undefined){
 const lead=Math.min(11520,Math.max(0,(c.startSample-(previous?.endSample??0))/2));
 const nextLead=next?Math.min(11520,Math.max(0,(next.startSample-c.endSample)/2)):11520;
 const start=c.startSample-lead,end=Math.min(c.endSample+11520,next?next.startSample-nextLead:Infinity);
 return {start,end,settled:c.startSample-Math.min(1600,lead*.25)};
}
