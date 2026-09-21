import {createCanvas,GlobalFonts,loadImage,ImageData} from '@napi-rs/canvas';
import {readFileSync,writeFileSync,mkdirSync,existsSync,createWriteStream} from 'node:fs';
import {spawn} from 'node:child_process';import {createHash} from 'node:crypto';
import {drawScene} from '../src/scene.ts';import {parseData,type Format} from '../src/schema.ts';import {montages} from '../src/trailer.ts';
import {decodeVideo,writeFrame} from './frame-io.ts';import {currentIdentity} from './identity.ts';import {assertProductionReady} from '../src/gate.ts';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8')),status=read('evidence/production-status.json'),identity=currentIdentity().identity;
assertProductionReady(status.review,status.authorization,identity);
const format=process.argv[2] as Format;if(!['landscape','portrait'].includes(format))throw Error('Usage: npm run render -- landscape|portrait');
const data=parseData(read('src/cues.json')),layouts=read('src/layout.json'),bands=read('public/science.json'),motion=read('public/motion.json'),l=layouts[format];
const out=`output/Stay-at-Your-House-${format}-${l.width}x${l.height}-60fps.mp4`;if(existsSync(out))throw Error('Output exists; preserve the previous delivery before rerendering');
mkdirSync('output',{recursive:true});mkdirSync(`evidence/stills/${format}`,{recursive:true});
GlobalFonts.registerFromPath('public/SpaceGrotesk.ttf','StaySans');GlobalFonts.registerFromPath('public/Oswald-Bold.ttf','StayDisplay');
const art=await loadImage('public/source-artwork.png'),canvas=createCanvas(l.width,l.height),ctx=canvas.getContext('2d'),video=createCanvas(1920,1080),vctx=video.getContext('2d');
const argumentsList=['-v','warning','-nostdin','-f','rawvideo','-pix_fmt','rgba','-video_size',`${l.width}x${l.height}`,'-framerate','60','-i','pipe:0','-i','public/soundtrack.m4a','-map','0:v:0','-map','1:a:0','-vf','scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p','-c:v','libx264','-preset','medium','-crf','16','-threads','4','-g','120','-color_range','tv','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-c:a','copy','-movflags','+faststart','-metadata','title=I Really Want to Stay at Your House (Hardstyle) — English Lyrics',out];
const encoder=spawn('ffmpeg',argumentsList,{stdio:['pipe','ignore','pipe']}),log=createWriteStream(`evidence/render-${format}.log`);encoder.stderr.pipe(log);
const encoded=new Promise<void>((resolve,reject)=>{encoder.once('error',reject);encoder.once('close',code=>code===0?resolve():reject(Error(`Encoder failed: ${code}; see render log`)));});void encoded.catch(()=>{});
let deck:ReturnType<typeof decodeVideo>|undefined,active='',videoCount=0;const counts:Record<string,number>={},started=Date.now();
const proofFrames=new Set([0,64,102.35,112,129.133333,179.15,181.366667,187.55,195.8,207.75,213.533333,217,227.7].map(t=>Math.round(t*60)));
try{
 for(let f=0;f<data.frames;f++){
  const t=f/60,m=montages.find(m=>f>=Math.round(m.songStart*60)&&f<Math.round(m.songStart*60)+m.frames);
  if(m){
   if(active!==m.id){if(deck)throw Error('Overlapping decoder');deck=decodeVideo(`public/${m.id}.mp4`,1920,1080);active=m.id;videoCount=0;}
   const next=await deck!.frames.next();if(next.done)throw Error('Early end of trailer asset');vctx.putImageData(new ImageData(new Uint8ClampedArray(next.value.buffer,next.value.byteOffset,next.value.byteLength),1920,1080),0,0);videoCount++;
   if(videoCount===m.frames){if(!(await deck!.frames.next()).done)throw Error('Unexpected trailer frames');await deck!.done;counts[active]=videoCount;deck=undefined;active='';}
  }
  drawScene(ctx as unknown as CanvasRenderingContext2D,t,format,data,layouts,bands,motion,{art:art as unknown as CanvasImageSource,dropOne:video as unknown as CanvasImageSource,dropTwo:video as unknown as CanvasImageSource,pictureTime:t});
  if(proofFrames.has(f))writeFileSync(`evidence/stills/${format}/expected-${f}.png`,canvas.toBuffer('image/png'));
  await writeFrame(encoder.stdin,ctx.getImageData(0,0,l.width,l.height).data);
  if(f%600===0)console.log(`${format}: ${f}/${data.frames} frames (${(f/Math.max(1,(Date.now()-started)/1000)).toFixed(1)} fps)`);
 }
 encoder.stdin.end();await encoded;if(deck)throw Error('Incomplete trailer decode');
 const rendererFiles=['scripts/render.ts','scripts/render-production.ts','scripts/frame-io.ts'],hashes=Object.fromEntries(rendererFiles.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]));
 writeFileSync(`evidence/render-${format}.json`,JSON.stringify({status:'encoded; final-file verification pending',identity,format,path:out,frames:data.frames,fps:60,width:l.width,height:l.height,trailerFramesConsumed:counts,rendererHashes:hashes,encoderArguments:argumentsList,elapsedSeconds:(Date.now()-started)/1000},null,2)+'\n');console.log('Encoded '+out);
}catch(error){deck?.child.kill();encoder.kill();throw error;}
