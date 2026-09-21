export type SyncEvent={id:string;time:number;montage:string;kind:'cut'|'action'};
export type OnsetObservation=SyncEvent&{audioTime:number;pictureTime:number;delayMs:number};
/** Observe each edit event once per uninterrupted playback pass, never across a seek. */
export class PlaybackAudit{
 observations:OnsetObservation[]=[];private pending:SyncEvent[]=[];
 private readonly events:readonly SyncEvent[];
 constructor(events:readonly SyncEvent[]){this.events=events;}
 begin(time:number){this.observations=[];this.pending=this.events.filter(e=>e.time>=time-.0001).sort((a,b)=>a.time-b.time);}
 sample(audioTime:number,pictureTime:number,montage:string){
  const due=this.pending.filter(e=>e.montage===montage&&e.time<=pictureTime+.000001);
  for(const e of due)this.observations.push({...e,audioTime,pictureTime,delayMs:(audioTime-e.time)*1000});
  const done=new Set(due.map(e=>e.id));this.pending=this.pending.filter(e=>!done.has(e.id));
 }
}
