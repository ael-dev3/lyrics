import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {dirname, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {hashFile, verifyFrozenInputs} from './record-render-inputs.ts';
import {parseCues} from '../src/schema.ts';
import {FPS, FRAMES} from '../src/config.ts';

export const TAG='joyride-v1.0.0', PROJECT='projects/joyride-lyric-film';
export const URL=`https://github.com/ael-dev3/lyrics/releases/tag/${TAG}`;
export const OUTPUTS=[
 'Joyride-YouTube-1920x1080-60fps.mp4','Joyride-TikTok-1080x1920-60fps.mp4',
 'Joyride-YouTube-Thumbnail-1920x1080.jpg','Joyride-TikTok-Cover-Profile-1200x1600.jpg',
 'Joyride-YouTube-Title.txt','Joyride-YouTube-Description.txt','Joyride-TikTok-Title.txt','Joyride-TikTok-Description.txt',
 'Joyride.en.srt','Joyride-YouTube-Verification.json','Joyride-TikTok-Verification.json',
];
export type Asset={file:string;bytes:number;sha256:string};
export const asset=async(path:string,file=path):Promise<Asset>=>({file,bytes:statSync(path).size,sha256:await hashFile(path)});
const json=(path:string)=>JSON.parse(readFileSync(path,'utf8'));
const save=(path:string,value:unknown)=>writeFileSync(path,JSON.stringify(value,null,2));
const hashBytes=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
const walk=(dir:string):string[]=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
 const p=join(dir,e.name);if(e.isDirectory())return walk(p);assert(e.isFile(),`Non-regular entry: ${p}`);return[p];
});

export async function validateDelivery(){
 await verifyFrozenInputs('evidence/render-inputs.json');
 const reuse=json('evidence/recovery/capture-reuse.json');assert.equal(reuse.encodedPixelChecks.length,3);assert(reuse.encodedPixelChecks.every((x: {matchedFreshRenderer:boolean})=>x.matchedFreshRenderer));
 const cues=parseCues(json('src/cues.json'));
 assert.equal(cues.length,70);assert.equal(cues.flatMap(c=>c.words).length,395);assert.equal(cues.flatMap(c=>c.groups).length,323);
 const timing=json('evidence/timing-checks.json');assert.equal(timing.fullyVisibleFirstFocusContacts,323);assert(timing.userTextCoverage);
 assert.equal(json('analysis/vocal-coverage.json').confirmedOmissionsRemaining,0);
 const reviewed=json('evidence/encoded-frame-review.json');
 assert(reviewed.visuallyReviewed===true);assert(reviewed.frames.length>=48);assert.equal(reviewed.cueSha256,await hashFile('src/cues.json'));
 const assets:Asset[]=[];
 for(const file of OUTPUTS)assets.push(await asset('output/'+file,file));
 for(const kind of ['YouTube','TikTok']){
  const proof=json(`evidence/${kind.toLowerCase()}-verification.json`);
  assert(proof.strictFullDecodePassed&&proof.constantFrameRateVerifiedForEveryFrame&&proof.aacPacketIdentity&&proof.fastStart);
  const media=assets.find(a=>a.file===proof.file);assert(media);assert.equal(media.sha256,proof.sha256);assert.equal(Number(proof.video.nb_read_frames),FRAMES);assert.equal(proof.video.avg_frame_rate,`${FPS}/1`);
  assert.equal(proof.sha256,reviewed.videos[kind.toLowerCase()]);
  assert.equal(await hashFile(`output/Joyride-${kind}-Verification.json`),await hashFile(`evidence/${kind.toLowerCase()}-verification.json`));
 }
 const covers=json('evidence/cover-verification.json');assert.equal(covers.assets.length,2);
 for(const c of covers.assets){assert.equal(c.sha256,assets.find(a=>a.file===c.file)?.sha256);assert.equal(c.width,c.file.includes('TikTok')?1200:1920);assert.equal(c.height,c.file.includes('TikTok')?1600:1080);}
 const summary=readFileSync('evidence/final-verification.md','utf8');
 for(const a of assets.filter(a=>a.file.endsWith('.mp4')))assert(summary.includes(a.sha256),'Stale final written report');
 for(const row of reviewed.frames)assert.equal(await hashFile(row.file),row.sha256,'Reviewed frame changed');
 return{releaseTag:TAG,version:'1.0.0',cueSha256:await hashFile('src/cues.json'),filmSha256:await hashFile('src/Film.tsx'),frozenInputManifestSha256:await hashFile('evidence/render-inputs.json'),assets};
}

export function stagedFiles(){
 const files:{source:string;target:string}[]=[];
 const add=(source:string,target=source)=>{assert(statSync(source).isFile(),`Missing ${source}`);files.push({source,target});};
 for(const dir of ['src','scripts','analysis/covers'])for(const p of walk(dir))add(p);
 for(const p of ['README.md','SOFTWARE.md','CREDITS-SOURCE.md','RELEASE-NOTES.md','source.json','package.json','package-lock.json','tsconfig.json'])add(p);
 for(const p of readdirSync('analysis').filter(p=>/\.(json|md|txt)$/.test(p)))add('analysis/'+p);
 for(const p of readdirSync('public').filter(p=>!['source-video.webm','soundtrack.m4a'].includes(p)))add('public/'+p);
 const evidence=[
  'render-inputs.json','render-options.json','render-preflight.json','timing-checks.json','timing-boundary-checks.json','layout-YouTube.json','layout-TikTok.json','audio-timing-check.json',
  'cover-verification.json','source-stream-identity.json','style-preview-review.json','encoded-frame-review.json','youtube-verification.json','tiktok-verification.json','final-verification.md',
  'source-contact.jpg','source-120.png','youtube-preview-contact.png','tiktok-preview-contact.png','youtube-corrected-preview.png','tiktok-corrected-preview.png',
  'youtube-cover-small.png','tiktok-cover-150x200.png','tiktok-cover-300x400.png','tiktok-cover-crop-300x400.png',
  'youtube-final-contact-sheet.png','tiktok-final-contact-sheet.png','youtube-final-120.png','tiktok-final-120.png',
 ];
 for(let n=1;n<=4;n++){evidence.push(`vocal-onsets-${n}.png`,`vocal-onsets-${n}.svg`);}
 for(const kind of ['youtube','tiktok'])for(let n=1;n<=json('evidence/render-options.json').segmentsPerComposition;n++)evidence.push(`${kind}-part-${n}.json`);
 for(const p of ['original-render-inputs.json','capture-reuse.json','png-proof.json'])if(existsSync('evidence/recovery/'+p))evidence.push('recovery/'+p);
 for(const p of evidence)add('evidence/'+p);
 for(const p of OUTPUTS.filter(p=>!p.endsWith('.mp4')))add('output/'+p,'publishing/'+p);
 for(const p of ['desktop-verification.json','release-upload-verification.json'])if(existsSync('evidence/'+p))add('evidence/'+p);
 return files;
}
export const stagedBytes=(source:string)=>source==='README.md'?Buffer.from(readFileSync(source,'utf8').replaceAll('](output/','](publishing/')):readFileSync(source);

async function stage(){
 const production=await validateDelivery(),files=stagedFiles();
 const repo=resolve(process.env.LYRICS_REPO??'../lyrics'),dest=join(repo,PROJECT);
 for(const {source,target}of files){const p=join(dest,target);mkdirSync(dirname(p),{recursive:true});writeFileSync(p,stagedBytes(source));}
 mkdirSync(join(repo,'assets'),{recursive:true});cpSync('evidence/youtube-final-120.png',join(repo,'assets/joyride-120.png'));
 console.log({staged:files.length,...production,assets:production.assets.length});
}

async function desktop(destination:string){
 const production=await validateDelivery(),dest=resolve(destination);mkdirSync(dest,{recursive:true});
 const copied:Asset[]=[];
 for(const expected of production.assets){const p=join(dest,expected.file);cpSync('output/'+expected.file,p);const actual=await asset(p,expected.file);assert.equal(actual.sha256,expected.sha256);copied.push(actual);}
 const original='Joyride-Original-Source.mkv';cpSync('source/original.mkv',join(dest,original));const copiedSource=await asset(join(dest,original),original);assert.equal(copiedSource.sha256,await hashFile('source/original.mkv'));copied.push(copiedSource);
 writeFileSync(join(dest,'START-HERE.txt'),`Oliver Tree — Joyride · v1.0.0

YouTube: Joyride-YouTube-1920x1080-60fps.mp4
Thumbnail: Joyride-YouTube-Thumbnail-1920x1080.jpg
Use the matching YouTube Title and Description text files.

TikTok: Joyride-TikTok-1080x1920-60fps.mp4
Profile cover: Joyride-TikTok-Cover-Profile-1200x1600.jpg
The cover is PORTRAIT 1200 wide by 1600 tall (3:4 width:height), matching the established tall upload preview labelled 4:3.
Use the matching TikTok Title and Description text files.

Both complete films share the original recording, with fixed -3.8 dB gain and identical AAC packets. Source footage remains 25 fps; new graphics run at 60 fps. Lyrics use stable cream/coral color-only focus. All 395 supplied words are retained in 70 cues and 323 focus groups. Model and waveform timing review does not establish perfect acoustic alignment.

The optional SRT is a separate caption track; it need not be burned over the existing lyrics. Pronunciation is excluded.

Original song and video: https://www.youtube.com/watch?v=TIipwQUU9mc
Listen/support Oliver Tree: https://olivertree.lnk.to/Joyride
Original video directed and written by Oliver Tree, production WMW studio.
Added lyric presentation by Ael, assisted by OpenAI Codex (GPT-6 Astra). Covers are AI-assisted adaptations. We take no credit for the original music, lyrics, recording, performance or video. No affiliation or endorsement is implied.

Source archive, credits and production evidence:
${URL}

CHECKSUMS.sha256 verifies the copied media and publishing files.
`);
 copied.push(await asset(join(dest,'START-HERE.txt'),'START-HERE.txt'));
 writeFileSync(join(dest,'CHECKSUMS.sha256'),copied.map(a=>`${a.sha256}  ${a.file}\n`).join(''));
 save('evidence/desktop-verification.json',{...production,destination:'User-requested Desktop folder',assets:copied,allCopiedHashesMatch:true});
 console.log({copied:copied.length,allCopiedHashesMatch:true});
}

async function packageRelease(){
 const production=await validateDelivery(),repo=resolve(process.env.LYRICS_REPO??'../lyrics');
 const git=(args:string[])=>execFileSync('git',['-C',repo,...args],{maxBuffer:64*1024*1024});
 const commit=git(['rev-parse','HEAD']).toString().trim(),legal=['LICENSE.md','CREDITS.md','AI-DISCLOSURE.md','LICENSES'];
 assert.equal(git(['status','--porcelain','--untracked-files=all','--',PROJECT,'README.md','assets/joyride-120.png',...legal]).toString().trim(),'','Commit the completed source, screenshot and credits before packaging.');
 for(const {source,target}of stagedFiles())assert.equal(hashBytes(git(['show',`${commit}:${PROJECT}/${target}`])),hashBytes(stagedBytes(source)),`Stale committed source: ${target}`);
 assert.equal(hashBytes(git(['show',`${commit}:assets/joyride-120.png`])),await hashFile('evidence/youtube-final-120.png'));
 const root=resolve('package/Joyride-Complete-Production');assert(!existsSync(root),'Use a fresh package directory.');assert(!existsSync('release')||readdirSync('release').length===0,'Use an empty release directory.');
 mkdirSync(root,{recursive:true});mkdirSync('release',{recursive:true});
 git(['archive','--format=tar',`--output=${resolve('package/source.tar')}`,commit,PROJECT]);execFileSync('tar',['-xf','package/source.tar','--strip-components=2','-C',root]);
 const source=json('source.json');
 for(const row of source.files){const p=join(root,row.path);mkdirSync(dirname(p),{recursive:true});cpSync(row.path,p);assert.equal(await hashFile(p),row.sha256);}
 cpSync('source.json',join(root,'source/source-metadata.json'));
 for(const row of production.assets){const p=join(root,'output',row.file);mkdirSync(dirname(p),{recursive:true});cpSync('output/'+row.file,p);assert.equal(await hashFile(p),row.sha256);}
 for(const row of json('evidence/encoded-frame-review.json').frames){const p=join(root,row.file);mkdirSync(dirname(p),{recursive:true});cpSync(row.file,p);assert.equal(await hashFile(p),row.sha256);}
 for(const p of ['evidence/Joyride-YouTube-Preview.mp4','evidence/Joyride-TikTok-Preview.mp4'])cpSync(p,join(root,p));
 for(const p of legal.filter(p=>p!=='LICENSES'))writeFileSync(join(root,'REPOSITORY-'+p),git(['show',`${commit}:${p}`]));
 for(const p of ['AGENTS.md','docs/cinematic-lyric-workflow.md','docs/track-workflow-preferences-and-known-issues.md','docs/bilingual-lyric-workflow.md','docs/tiktok-cover-workflow.md','docs/first-pass-song-workflow.md','docs/production-workflow.md']){
  const out=join(root,'repository-context',p);mkdirSync(dirname(out),{recursive:true});writeFileSync(out,git(['show',`${commit}:${p}`]));
 }
 writeFileSync(join(root,'repository-context/README.md'),`# Workflow context\n\nExact workflow documents from source commit ${commit}. Their relative links describe the full repository; reference images and other tracks are available at https://github.com/ael-dev3/lyrics/tree/${commit}. The complete editable Joyride project is at the archive root.\n`);
 for(const p of git(['ls-tree','-r','--name-only',commit,'--','LICENSES']).toString().trim().split('\n').filter(Boolean)){const out=join(root,p);mkdirSync(dirname(out),{recursive:true});writeFileSync(out,git(['show',`${commit}:${p}`]));}
 writeFileSync(join(root,'SOURCE-REVISION.txt'),commit+'\n');
 const entries:Asset[]=[];for(const p of walk(root).sort())entries.push(await asset(p,relative(root,p)));
 save(join(root,'MANIFEST.json'),{sourceCommit:commit,...production,files:entries});
 writeFileSync(join(root,'CHECKSUMS.sha256'),entries.map(a=>`${a.sha256}  ${a.file}\n`).join(''));
 execFileSync('zip',['-q','-r','-6',resolve('release/Joyride-Complete-Production.zip'),'Joyride-Complete-Production'],{cwd:resolve('package')});
 execFileSync('unzip',['-tq','release/Joyride-Complete-Production.zip']);
 for(const p of OUTPUTS)cpSync('output/'+p,'release/'+p);
 cpSync('source/original.mkv','release/Joyride-Original-Source.mkv');cpSync('analysis/cover-prompts.json','release/Joyride-Cover-Prompts.json');
 const assets:Asset[]=[];for(const p of readdirSync('release').sort())assets.push(await asset('release/'+p,p));
 writeFileSync('release/CHECKSUMS.sha256',assets.map(a=>`${a.sha256}  ${a.file}\n`).join(''));
 save('release/release-assets.json',{sourceCommit:commit,...production,assets});
 console.log({sourceCommit:commit,packageFiles:entries.length,releaseAssets:assets.length+2});
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const mode=process.argv[2];
 if(mode==='stage')await stage();
 else if(mode==='desktop'){assert(process.argv[3],'Provide the destination directory.');await desktop(process.argv[3]);}
 else if(mode==='package')await packageRelease();
 else if(mode==='check')console.log(await validateDelivery());
 else throw Error('Use stage, desktop <directory>, package, or check.');
}
