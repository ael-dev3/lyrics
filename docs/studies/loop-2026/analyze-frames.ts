/** CC BY 4.0 — Ael / Lyrics workflow. Node 24+, FFmpeg and FFprobe. */
import {spawn, spawnSync} from 'node:child_process';
import {writeFileSync, mkdirSync} from 'node:fs';
import {join} from 'node:path';
const [source, out] = process.argv.slice(2);
if (!source || !out) throw new Error('Usage: node analyze-frames.ts SOURCE OUTPUT_DIR');
mkdirSync(out, {recursive:true});
const probe = spawnSync('ffprobe',['-v','error','-select_streams','v:0','-show_frames','-show_entries','frame=best_effort_timestamp_time','-of','json',source],{encoding:'utf8',maxBuffer:32*1024*1024});
if(probe.status !== 0) throw new Error(probe.stderr);
const parsed: unknown = JSON.parse(probe.stdout);
if(typeof parsed !== 'object' || parsed === null || !('frames' in parsed) || !Array.isArray(parsed.frames)) throw new Error('Invalid frame probe');
const pts = parsed.frames.map((f: unknown) => {
 if(typeof f !== 'object' || f===null || !('best_effort_timestamp_time' in f)) throw new Error('Missing timestamp');
 const n=Number(f.best_effort_timestamp_time); if(!Number.isFinite(n)) throw new Error('Invalid timestamp'); return n;
});
const width=160,height=122,size=width*height;
const child=spawn('ffmpeg',['-v','error','-i',source,'-map','0:v:0','-vf',`scale=${width}:${height}:flags=area,format=gray`,'-fps_mode','passthrough','-f','rawvideo','pipe:1']);
let pending=Buffer.alloc(0),previous:Buffer|undefined,frame=0;
const rows=['frame,pts_seconds,gray_mean,mean_absolute_difference'];
const changes: {frame:number,pts:number,mad:number}[]=[];
for await (const chunk of child.stdout) {
 pending=Buffer.concat([pending,chunk]);
 while(pending.length>=size){
  const current=Buffer.from(pending.subarray(0,size)); pending=pending.subarray(size);
  let sum=0,diff=0; for(let i=0;i<size;i++){const p=current[i]??0;sum+=p;diff+=previous?Math.abs(p-(previous[i]??0)):0;}
  const time=pts[frame];if(time===undefined) throw new Error('More decoded frames than timestamps');
  rows.push(`${frame},${time.toFixed(3)},${(sum/size).toFixed(4)},${(diff/size).toFixed(4)}`);
  changes.push({frame,pts:time,mad:diff/size});previous=current;frame++;
 }
}
const code = await new Promise<number|null>(resolve=>child.on('close',resolve));
if(code!==0 || pending.length || frame!==pts.length) throw new Error('Decode incomplete');
writeFileSync(join(out,'frame-metrics.csv'),rows.join('\n')+'\n');
const ranked=[...changes].sort((a,b)=>b.mad-a.mad).slice(0,30);
writeFileSync(join(out,'analysis-summary.json'),JSON.stringify({frames:frame,firstPTS:pts[0],lastPTS:pts.at(-1),proxy:{width,height,format:'gray',scale:'area'},metric:'8-bit grayscale mean absolute difference; motion/cut candidate, not beat or vocal accuracy',largestChanges:ranked},null,2)+'\n');
console.log(JSON.stringify({frames:frame,lastPTS:pts.at(-1),largestChanges:ranked.slice(0,8)},null,2));
