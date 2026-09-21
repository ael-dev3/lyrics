import {readFileSync} from 'node:fs';
import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
import {spectrumTravelAt} from '../src/scene.ts';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(p,'utf8')),data=read('src/cues.json'),layouts=read('src/layout.json'),bands=read('public/science.json'),motion=read('public/motion.json');
GlobalFonts.registerFromPath('public/SpaceGrotesk.ttf','StaySans');const ctx=createCanvas(10,10).getContext('2d');let collisions=[],closest=Infinity,checked=0;
for(const format of ['landscape','portrait']){const p=format==='portrait',l=layouts[format],baseline=p?1735:997,bw=p?8:16,step=p?14:26,origin=(l.width-step*63-bw)/2;
 for(let f=0;f<data.frames;f++){const sample=Math.round(f/60*data.sampleRate),cues=data.cues.filter(c=>sample>=c.visibleFrom&&sample<c.visibleUntil),m=motion[f];if(!cues.length)continue;
 for(const c of cues){const cl=l.cues[c.id];ctx.font=`600 ${cl.fontSize}px StaySans`;
  for(const word of cl.source){const desc=ctx.measureText(word.text).actualBoundingBoxDescent;const floor=word.y+desc;
   for(let k=0;k<64;k++){const x=origin+k*step;if(x+bw+3<word.x||x>word.x+word.width)continue;const amp=Math.max(0,Math.min(1,(bands[f][k]+65)/48)),h=2+amp**1.45*spectrumTravelAt(f/60,format,data,layouts,(p?38+212*m.strength**1.8:20+187*m.strength**1.8)*(1+.16*m.kick*m.strength));const gap=baseline-h-(m.strength>.55?4:0)-floor;checked++;closest=Math.min(closest,gap);if(gap<0)collisions.push({format,t:f/60,cue:c.id,word:word.text,gap});}
  }
 }
 }
}
assert.equal(collisions.length,0,'Spectrum intersects the actual glyph descenders');
assert.ok(closest>=24,'Less than 24 pixels of visual clearance');
const report={status:'passed',scope:'Every lyric-visible 60 Hz frame in both layouts; actual font descenders compared with measured bar extents and facets.',checkedBarWordPairs:checked,minimumClearancePixels:+closest.toFixed(3),collisions:collisions.length};
writeFileSync('evidence/visual-clearance.json',JSON.stringify(report,null,2)+'\n');console.log(report);
