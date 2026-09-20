import {bundle} from '@remotion/bundler';import {getCompositions,renderStill} from '@remotion/renderer';
import {createCanvas,loadImage} from '@napi-rs/canvas';import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
mkdirSync('publishing',{recursive:true});mkdirSync('evidence/stills/covers',{recursive:true});const serveUrl=await bundle({entryPoint:'src/CoverRoot.tsx'}),compositions=await getCompositions(serveUrl),results=[];
for(const [id,file,width,height] of [['YouTubeCover','Vedmy-YouTube-Thumbnail-1920x1080.jpg',1920,1080],['TikTokCover','Vedmy-TikTok-Cover-Profile-1200x1600.jpg',1200,1600]] as const){
 const output='publishing/'+file,composition=compositions.find(c=>c.id===id)!;await renderStill({serveUrl,composition,output,imageFormat:'jpeg',jpegQuality:95,logLevel:'warn'});
 const image=await loadImage(output);if(image.width!==width||image.height!==height)throw Error('Cover geometry changed');
 for(const small of [true,false]){const w=id==='TikTokCover'?(small?150:300):(small?320:640),h=Math.round(w*height/width),canvas=createCanvas(w,h),ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,w,h);writeFileSync(`evidence/stills/covers/${id}-${w}.png`,canvas.toBuffer('image/png'));}
 const canvas=createCanvas(300,400),ctx=canvas.getContext('2d');if(id==='TikTokCover'){ctx.drawImage(image,width*.05,height*.05,width*.9,height*.9,0,0,300,400);writeFileSync('evidence/stills/covers/TikTokCover-crop.png',canvas.toBuffer('image/png'));}
 const bytes=readFileSync(output);results.push({file,width,height,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
writeFileSync('evidence/cover-assets.json',JSON.stringify({method:'Dedicated code-native poster layouts with the original release photograph and the bundled lyric font; Chromium raster export. No generated replacement imagery.',artwork:'public/artwork.png',composition:'src/CoverRoot.tsx',files:results,review:'Pending visual inspection: YouTube 320px and TikTok 150×200px proofs and 5% crop simulation: title, artist and central figures remain identifiable. No platform upload preview claimed.'},null,2)+'\n');
