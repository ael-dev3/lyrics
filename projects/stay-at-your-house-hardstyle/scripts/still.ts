import {createCanvas,GlobalFonts,loadImage} from '@napi-rs/canvas';import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';import {execFileSync} from 'node:child_process';import {drawScene} from '../src/scene.ts';import {parseData,type Format} from '../src/schema.ts';import {montages} from '../src/trailer.ts';
const t=Number(process.argv[2]??64),format=(process.argv[3]??'landscape') as Format,out=process.argv[4]??'evidence/preview-landscape.png';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));const data=parseData(read('src/cues.json')),layouts=read('src/layout.json');
GlobalFonts.registerFromPath('public/SpaceGrotesk.ttf','StaySans');GlobalFonts.registerFromPath('public/Oswald-Bold.ttf','StayDisplay');mkdirSync('analysis/stills',{recursive:true});
const images=[];
for(const m of montages){const path=`analysis/stills/${m.id}.png`;execFileSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss',String(Math.max(0,Math.min(m.duration-1/60,t-m.songStart))),'-i',`public/${m.id}.mp4`,'-frames:v','1',path]);images.push(await loadImage(path));}
const canvas=createCanvas(layouts[format].width,layouts[format].height),art=await loadImage('public/source-artwork.png');
drawScene(canvas.getContext('2d') as unknown as CanvasRenderingContext2D,t,format,data,layouts,read('public/science.json'),read('public/motion.json'),{art:art as unknown as CanvasImageSource,dropOne:images[0] as unknown as CanvasImageSource,dropTwo:images[1] as unknown as CanvasImageSource});writeFileSync(out,canvas.toBuffer('image/png'));console.log(out);
