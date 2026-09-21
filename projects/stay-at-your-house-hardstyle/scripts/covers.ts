import {createCanvas,GlobalFonts,loadImage} from '@napi-rs/canvas';import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';import {createHash} from 'node:crypto';
GlobalFonts.registerFromPath('public/SpaceGrotesk.ttf','StaySans');GlobalFonts.registerFromPath('public/Oswald-Bold.ttf','StayDisplay');const art=await loadImage('public/source-artwork.png');mkdirSync('publishing',{recursive:true});mkdirSync('evidence/stills/covers',{recursive:true});const files=[];
for(const p of [false,true]){
 const w=p?1200:1920,h=p?1600:1080,canvas=createCanvas(w,h),ctx=canvas.getContext('2d');ctx.fillStyle='#03050b';ctx.fillRect(0,0,w,h);
 const targetH=p?1080:h,scale=Math.max(w/art.width,targetH/art.height),sw=w/scale,sh=targetH/scale;ctx.drawImage(art,(art.width-sw)*(p?1:.5),(art.height-sh)*.5,sw,sh,0,0,w,targetH);
 const shade=ctx.createLinearGradient(0,0,p?0:w,p?h:0);if(p){shade.addColorStop(0,'rgba(3,5,11,.12)');shade.addColorStop(.43,'rgba(3,5,11,0)');shade.addColorStop(.62,'rgba(3,5,11,.95)');shade.addColorStop(1,'#03050b');}else{shade.addColorStop(0,'rgba(3,5,11,.98)');shade.addColorStop(.48,'rgba(3,5,11,.80)');shade.addColorStop(.78,'rgba(3,5,11,0)');shade.addColorStop(1,'rgba(3,5,11,.06)');}ctx.fillStyle=shade;ctx.fillRect(0,0,w,h);
 ctx.textAlign=p?'center':'left';const x=p?w/2:115;ctx.fillStyle='#fcee0a';ctx.font=`700 ${p?109:130}px StayDisplay`;
 const lines=['I REALLY WANT','TO STAY AT','YOUR HOUSE'],ys=p?[1050,1176,1302]:[400,552,704];for(let i=0;i<lines.length;i++){if(ctx.measureText(lines[i]!).width>(p?960:960))throw Error('Cover title exceeds safe width');ctx.fillText(lines[i]!,x,ys[i]!);}
 ctx.fillStyle='#f1f3ed';ctx.font=`600 ${p?58:43}px StaySans`;ctx.fillText('LAAEMEL / OBLIVION',x,p?1388:809);
 ctx.fillStyle='#fcee0a';ctx.font=`600 ${p?44:36}px StaySans`;ctx.fillText('H A R D S T Y L E',x,p?1456:885);
 const file=p?'Stay-at-Your-House-TikTok-Cover-Profile-1200x1600.jpg':'Stay-at-Your-House-YouTube-Thumbnail-1920x1080.jpg';writeFileSync('publishing/'+file,canvas.toBuffer('image/jpeg',95));
 for(const width of p?[150,300]:[320,640]){const small=createCanvas(width,Math.round(width*h/w));small.getContext('2d').drawImage(canvas,0,0,small.width,small.height);writeFileSync(`evidence/stills/covers/${p?'TikTok':'YouTube'}-${width}.png`,small.toBuffer('image/png'));}
 if(p){const crop=createCanvas(300,400);crop.getContext('2d').drawImage(canvas,w*.05,h*.05,w*.9,h*.9,0,0,300,400);writeFileSync('evidence/stills/covers/TikTok-crop.png',crop.toBuffer('image/png'));}
 const bytes=readFileSync('publishing/'+file);files.push({file,width:w,height:h,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
writeFileSync('evidence/cover-assets.json',JSON.stringify({method:'Code-native poster composition using the approved source artwork and bundled fonts; no generated replacement imagery.',sourceArtworkSha256:createHash('sha256').update(readFileSync('public/source-artwork.png')).digest('hex'),files,review:'Pending visual inspection; local profile-size and crop proofs only, no platform upload test.'},null,2)+'\n');
