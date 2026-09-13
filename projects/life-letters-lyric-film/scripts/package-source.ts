import {spawnSync} from 'node:child_process';
import {copyFileSync,existsSync,lstatSync,mkdirSync,mkdtempSync,readFileSync,readdirSync,renameSync,rmSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {dirname,join,resolve} from 'node:path';

const run=(program:string,args:string[],cwd=process.cwd())=>{
 const result=spawnSync(program,args,{cwd,encoding:'utf8',maxBuffer:32*1024*1024});
 if(result.status!==0)throw Error(`${program}: ${result.stderr}`);
 return result.stdout.trim();
};
const hash=(file:string)=>createHash('sha256').update(readFileSync(file)).digest('hex');
const revision=run('git',['rev-parse','HEAD']);
const root=run('git',['rev-parse','--show-toplevel']);
const prefix=run('git',['rev-parse','--show-prefix']).replace(/\/$/,'');
if(!prefix.endsWith('projects/life-letters-lyric-film'))throw Error('Run from the committed repository project directory.');
if(run('git',['status','--porcelain','--untracked-files=all','--','.']))throw Error('Commit project changes before packaging.');
const media=['source/visuals.mp4','source/audio-original.opus','public/footage-1080p.mp4','public/soundtrack.m4a'];
const manifest=JSON.parse(readFileSync('evidence/assets-manifest.json','utf8')) as {path:string,sha256:string}[];
for(const file of media){
 if(!existsSync(file)||hash(file)!==manifest.find(item=>item.path===file)?.sha256)throw Error('Missing or changed media: '+file);
}
const staging=mkdtempSync(join(tmpdir(),'life-letters-package-'));
const tree=join(staging,'project');mkdirSync(tree);
mkdirSync('output',{recursive:true});
try{
 const tar=join(staging,'source.tar');
 run('git',['archive','--format=tar',`--output=${tar}`,`${revision}:${prefix}`],root);
 run('tar',['-xf',tar,'-C',tree]);
 for(const file of ['README.md','src/Film.tsx','src/landscape-cues.json','package-lock.json','scripts/render.ts','evidence/final-qa.json']){
  if(!existsSync(join(tree,file)))throw Error('Committed archive is missing '+file);
 }
 for(const file of media){mkdirSync(dirname(join(tree,file)),{recursive:true});copyFileSync(file,join(tree,file));}
 writeFileSync(join(tree,'SOURCE-REVISION.txt'),`Repository: https://github.com/ael-dev3/lyrics\nCommit: ${revision}\nProject: ${prefix}\n`);
 const files:string[]=[];
 function walk(dir:string){for(const entry of readdirSync(join(tree,dir)).sort()){
  const rel=join(dir,entry),stat=lstatSync(join(tree,rel));
  if(stat.isSymbolicLink())throw Error('Archive must not contain symlinks: '+rel);
  if(stat.isDirectory())walk(rel);else if(stat.isFile())files.push(rel);
 }}
 walk('');
 writeFileSync(join(tree,'PACKAGE-CHECKSUMS.sha256'),files.map(file=>`${hash(join(tree,file))}  ${file}`).join('\n')+'\n');
 const zip=join(staging,'Life-Letters-Editable.zip');
 run('zip',['-q','-X','-r',zip,'.'],tree);
 run('unzip',['-tq',zip]);
 const target=resolve('output/Life-Letters-Editable.zip');renameSync(zip,target);
 writeFileSync('output/Life-Letters-Editable.sha256',`${hash(target)}  Life-Letters-Editable.zip\n`);
 console.log(JSON.stringify({revision,files:files.length+1,archive:'output/Life-Letters-Editable.zip',sha256:hash(target)},null,2));
}finally{rmSync(staging,{recursive:true,force:true});}
