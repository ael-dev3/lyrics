import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {basename,resolve} from 'node:path';
import {createHash} from 'node:crypto';

const destination=resolve(process.argv[2]??'output');
mkdirSync(destination,{recursive:true});
const assets:Record<string,string>={};
for(const name of ['city-landscape.png','city-portrait.png','city-airship.png','city-train.png','city-sprites.png']){
  assets[name]=`data:image/png;base64,${readFileSync(`public/${name}`).toString('base64')}`;
}
const audio=`data:audio/mp4;base64,${readFileSync('public/soundtrack.m4a').toString('base64')}`;
assets['soundtrack.m4a']=audio;
const identity=JSON.parse(readFileSync('evidence/preview-identity.json','utf8')) as {identitySha256:string};
const json=(value:unknown)=>JSON.stringify(value).replace(/</g,'\\u003c');
const client=readFileSync('review/client.js','utf8').replace(/<\/script/gi,'<\\/script');
let html=readFileSync('review/index.html','utf8');
html=html.replace('src="/public/soundtrack.m4a"','');
html=html.replace('<script type="module" src="/review/client.js"></script>',`<script type="application/json" id="embedded-assets">${json(assets)}</script>\n<script type="application/json" id="embedded-identity">${json(identity)}</script>\n<script type="module">${client}</script>`);
const name='Rainline Preview.html';
writeFileSync(resolve(destination,name),html);
const sha256=createHash('sha256').update(html).digest('hex');
writeFileSync(resolve(destination,'preview-manifest.json'),JSON.stringify({artifact:basename(name),status:'complete moving preview; synchronization review and production authorization pending',revision:'preview-v2-city',previewIdentitySha256:identity.identitySha256,sha256,bytes:Buffer.byteLength(html),soundtrack:'original source AAC embedded without re-encoding',artwork:'five original generated PNGs; in-world Canvas animation; same painter as Remotion',formats:['1920x1080','1080x1920']},null,2)+'\n');
console.log(`Wrote ${name} (${(Buffer.byteLength(html)/1048576).toFixed(1)} MiB), SHA-256 ${sha256}`);
