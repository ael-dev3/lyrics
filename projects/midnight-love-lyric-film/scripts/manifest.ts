import {createHash} from 'node:crypto';
import {createReadStream,readFileSync,writeFileSync,statSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {SR,SAMPLE_COUNT,FRAMES,FPS,TRACK,P} from '../src/config.ts';
import {parseCues} from '../src/schema.ts';
import assert from 'node:assert/strict';
const hash=async(p:string)=>{const h=createHash('sha256');for await(const b of createReadStream(p))h.update(b);return h.digest('hex');};
const paths=['source/original.mkv','source/soundtrack.opus','public/source-video.webm','public/soundtrack.m4a','analysis/lyrics-user-en.txt','analysis/lyrics-performance-en.txt','analysis/performed-repeat-map.json','src/cues.json','public/SpaceGrotesk.ttf','public/CormorantGaramond-Semibold.ttf','public/CormorantGaramond-Italic.ttf'];
const files=[];for(const path of paths)files.push({path,bytes:statSync(path).size,sha256:await hash(path)});
const probe=JSON.parse(readFileSync('analysis/source-probe.json','utf8')) as {streams:{codec_type:string;codec_name:string;width?:number;height?:number;avg_frame_rate?:string}[]};
writeFileSync('source.json',JSON.stringify({track:TRACK,uploadDate:'2020-04-14',sourceUrl:TRACK.source,artistUrl:'https://www.worldinred.com',supportUrl:'https://girlinred.ffm.to/midnightlove-single',artistChannel:'https://www.youtube.com/channel/UCwlHDQ83jgF1crd6XXzSmIA',photographCredit:'Fabian Fjeldvik, as credited in original upload description',acquisition:{formats:'616 + 251',video:probe.streams.find(s=>s.codec_type==='video'),audio:'Original Opus audio; timestamps retained on decode'},audio:{sampleRate:SR,retainedSamples:SAMPLE_COUNT,durationSeconds:SAMPLE_COUNT/SR,gainDb:-2.7,deliveryEncode:'AAC stereo 320 kb/s target; single encode',integratedLUFS:-12.34,truePeakDBTP:-1.79},delivery:{fps:FPS,frames:FRAMES,youtube:[1920,1080],tiktok:[1080,1920],tiktokCover:[1200,1600]},visuals:{palette:P,sourceMotion:'Official source animation, nominal 24 fps; existing frame cadence preserved on the 60 fps delivery clock. Newly authored camera, word highlights, particles and measured spectrum run at 60 fps. No optical-flow claim.',filmSource:'Original official video retained; no generated background replacement',covers:'AI-assisted referenced adaptations; exact prompts in analysis/cover-prompts.json'},tools:{node:process.version,typescript:JSON.parse(readFileSync('node_modules/typescript/package.json','utf8')).version,remotion:JSON.parse(readFileSync('node_modules/remotion/package.json','utf8')).version,ffmpeg:execFileSync('ffmpeg',['-version'],{encoding:'utf8'}).split('\n')[0]},files},null,2));

// Revision metadata is derived from the actual finalized cue map.
const cues=parseCues(JSON.parse(readFileSync('src/cues.json','utf8')));
const suppliedWords=readFileSync('analysis/lyrics-user-en.txt','utf8').trim().split(/\s+/).length;
const performedWords=cues.reduce((n,c)=>n+c.words.length,0);
assert.equal(cues.length,38);assert.equal(performedWords,185);assert.equal(suppliedWords,151);
const source=JSON.parse(readFileSync('source.json','utf8'));
source.visuals.lyricFocus='Stable color-only word or explicit connected-group emphasis; no active-word underline, word box or bouncing glyphs.';
source.productionRevision={version:JSON.parse(readFileSync('package.json','utf8')).version,previous:'1.0.0',reason:'Restore six performed ending phrases and refine earlier word focus/onset',performedWords,providedWords:suppliedWords,addedRepeatedWords:performedWords-suppliedWords,cues:cues.length,focusGroups:cues.reduce((n,c)=>n+c.groups.length,0),finalHeldVocalEndSeconds:cues.at(-1)!.endSample/SR,recordingAndMeasuredFeaturesUnchanged:true};
writeFileSync('source.json',JSON.stringify(source,null,2)+'\n');
