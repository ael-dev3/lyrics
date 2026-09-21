import {readFileSync,readdirSync} from 'node:fs';import {createHash} from 'node:crypto';
export function currentIdentity(){
 const files=[...readdirSync('src').filter(x=>/\.(ts|json)$/.test(x)).map(x=>'src/'+x),...readdirSync('source').filter(x=>/\.(json|txt)$/.test(x)).map(x=>'source/'+x),'review/index.html',...['soundtrack.m4a','source-artwork.png','drop-one.mp4','drop-two.mp4','science.json','motion.json','beat-pulses.json','SpaceGrotesk.ttf','Oswald-Bold.ttf'].map(x=>'public/'+x)].sort();
 const hashes=Object.fromEntries(files.map(p=>[p,createHash('sha256').update(readFileSync(p)).digest('hex')]));
 return {identity:{song:'stay-hardstyle',revision:'trailer-preview-v4-fresh-second-edit',inputsSha256:createHash('sha256').update(JSON.stringify(hashes)).digest('hex')},hashes};
}
