import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {geometry} from '../src/lunar-motion.ts';
import {revision} from '../src/identity.ts';
const results=[];
for(const format of ['landscape','portrait'] as const){
 const size=format==='landscape'?'1920x1080':'1080x1920',file=`output/La-Lune-Celestial-v3-${format}-${size}-60fps.mp4`,g=geometry(format==='portrait');
 // Sample the fixed central lunar surface, clear of spectrum and stars, twice per second.
 const bytes=execFileSync('ffmpeg',['-v','error','-threads','4','-i',file,'-an','-vf',`select=between(t\\,30\\,190)*not(mod(n\\,30)),crop=128:128:${g.cx-64}:${g.cy-64},scale=1:1:flags=area,format=rgb24`,'-fps_mode','passthrough','-f','rawvideo','pipe:1'],{maxBuffer:1024*1024});
 assert.equal(bytes.length,321*3);
 const channels=[0,1,2].map(c=>Array.from({length:321},(_,i)=>bytes[i*3+c]!));
 const ranges=channels.map(c=>Math.max(...c)-Math.min(...c));
 let maxChannelSpread=0;for(let i=0;i<321;i++)maxChannelSpread=Math.max(maxChannelSpread,Math.max(...channels.map(c=>c[i]!))-Math.min(...channels.map(c=>c[i]!)));
 assert.ok(Math.max(...ranges)<=2,'Unexpected central Moon brightness modulation');
 assert.ok(maxChannelSpread<=2,'Unexpected color cast');
 results.push({format,file:file.split('/').pop(),sha256:createHash('sha256').update(readFileSync(file)).digest('hex'),samples:321,fromSeconds:30,toSeconds:190,roi:{x:g.cx-64,y:g.cy-64,width:128,height:128},rgbMinimum:channels.map(c=>Math.min(...c)),rgbMaximum:channels.map(c=>Math.max(...c)),ranges,maxChannelSpread});
}
writeFileSync('evidence/encoded-moon-illumination.json',JSON.stringify({status:'PASS',revision,results,method:'Decode final HEVC; area-average the fixed central 128×128 Moon region to one RGB pixel every 30 frames from 30–190 seconds. Maximum permitted per-channel range and RGB separation: two 8-bit levels.',limits:'Checks sampled central-surface illumination and neutral color. Separate all-frame source audit establishes fixed Moon and halo opacity. Intro reveal, final fade, moving spectrum and stellar scintillation are intentional and excluded from this ROI.'},null,2)+'\n');console.log(results);
