import {mkdirSync,readFileSync,readdirSync,copyFileSync,writeFileSync,statSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const root='output/portable/Polovinka-Editable';
mkdirSync(root,{recursive:true});
const paths:string[]=[];
const walk=(d:string)=>{for(const e of readdirSync(d,{withFileTypes:true})){const p=join(d,e.name);if(e.isDirectory())walk(p);else if(e.isFile())paths.push(p);}};
for(const d of ['src','scripts','public','publishing','repair-src'])walk(d);
paths.push('README.md','package.json','package-lock.json','tsconfig.json','.gitignore');
for(const f of readdirSync('source'))if(!f.endsWith('.info.json'))paths.push('source/'+f);
for(const f of readdirSync('analysis'))if(/\.(json|txt)$/.test(f))paths.push('analysis/'+f);
for(const f of readdirSync('evidence'))if(/^(render-inputs|base-render-inputs|opening-inputs|opening-repair|render-options|render-preflight|timing-checks|timing-boundary-checks|layout-YouTube|layout-TikTok|delivery-verification|youtube-delivery-verification|tiktok-delivery-verification|color-spot-check|visual-review|final-still-times)\.json$/.test(f)||/^(performer-reference|performance-reference|timed-contact|tiktok-cover-small|tiktok-cover-crop-small|youtube-cover-small|preview-landscape-mobile|preview-portrait-mobile|supersampled-landscape-check|final-contact-youtube|final-contact-tiktok)\.(png|jpg)$/.test(f))paths.push('evidence/'+f);
const report=JSON.parse(readFileSync('evidence/delivery-verification.json','utf8'));assert.equal(report.passed,true);
const sums=[];
for(const p of [...new Set(paths)].sort()){
 assert(!p.startsWith('/')&&!p.split('/').includes('..'));assert(!/(\.venv|node_modules|\.info\.json$|\.log$)/.test(p));
 const dest=join(root,p);mkdirSync(dirname(dest),{recursive:true});copyFileSync(p,dest);
 sums.push(createHash('sha256').update(readFileSync(p)).digest('hex')+'  '+p);
}
writeFileSync(join(root,'SHA256SUMS.txt'),sums.join('\n')+'\n');
execFileSync('zip',['-q','-r','../Polovinka-Editable-Project.zip','Polovinka-Editable'],{cwd:'output/portable',stdio:'inherit'});
execFileSync(process.execPath,['scripts/verify-archive.ts','output/Polovinka-Editable-Project.zip'],{stdio:'inherit'});
console.log('PACKAGED',sums.length,'files',statSync('output/Polovinka-Editable-Project.zip').size,'bytes');
