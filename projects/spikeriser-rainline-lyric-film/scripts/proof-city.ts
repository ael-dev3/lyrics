import {createCanvas,loadImage} from '@napi-rs/canvas';
import {mkdirSync,writeFileSync} from 'node:fs';
import {paintCity,setCityBackground,setCityAirship,setCityTrain,setCitySprites,type Format} from '../src/city.ts';
const folder=process.argv[2]??'work/proofs';
mkdirSync(folder,{recursive:true});
setCityAirship(await loadImage('public/city-airship.png') as unknown as CanvasImageSource);
setCityTrain(await loadImage('public/city-train.png') as unknown as CanvasImageSource);
setCitySprites(await loadImage('public/city-sprites.png') as unknown as CanvasImageSource);
for(const format of ['landscape','portrait'] as Format[]){
  setCityBackground(format,await loadImage(`public/city-${format}.png`) as unknown as CanvasImageSource);
  for(const time of [12,48.8,52,60.5,64,70.5,94.8,101,106,124.5,165.8,172,177,184,221]){
    const canvas=createCanvas(format==='portrait'?1080:1920,format==='portrait'?1920:1080);
    paintCity(canvas.getContext('2d') as unknown as CanvasRenderingContext2D,Math.round(time*60),format);
    writeFileSync(`${folder}/${format}-${time}.png`,canvas.toBuffer('image/png'));
  }
}
console.log(`Wrote city still proofs to ${folder}`);
