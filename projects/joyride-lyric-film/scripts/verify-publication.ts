import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,readdirSync,writeFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {validateDelivery,asset,TAG,URL,OUTPUTS} from './delivery-kit.ts';
import {hashFile} from './record-render-inputs.ts';

// Read-only remote verification. Download all assets and API responses first.
const production=await validateDelivery(),inventory=JSON.parse(readFileSync('release/release-assets.json','utf8'));
for(const k of ['releaseTag','version','cueSha256','filmSha256','frozenInputManifestSha256'] as const)assert.equal(inventory[k],production[k]);
assert(/^[a-f0-9]{40}$/.test(inventory.sourceCommit));
const declared=[...OUTPUTS,'Joyride-Original-Source.mkv','Joyride-Cover-Prompts.json','Joyride-Complete-Production.zip'].sort();
assert.deepEqual(inventory.assets.map((a: {file:string})=>a.file).sort(),declared);
const expected=[...declared,'CHECKSUMS.sha256','release-assets.json'].sort();
assert.deepEqual(readdirSync('release').sort(),expected);assert.deepEqual(readdirSync('remote-verified').sort(),expected);
const assets=[];
for(const file of expected){
 const local=await asset('release/'+file,file),remote=await asset('remote-verified/'+file,file);assert.deepEqual(remote,local,`Remote mismatch: ${file}`);
 const entry=inventory.assets.find((a: {file:string})=>a.file===file);if(entry)assert.deepEqual(local,entry);
 const delivered=production.assets.find(a=>a.file===file);if(delivered)assert.equal(delivered.sha256,local.sha256);
 assets.push({...remote,matchedAfterDownload:true,url:`https://github.com/ael-dev3/lyrics/releases/download/${TAG}/${encodeURIComponent(file)}`});
}
assert.equal(readFileSync('release/CHECKSUMS.sha256','utf8'),inventory.assets.map((a: {file:string;sha256:string})=>`${a.sha256}  ${a.file}\n`).join(''));
const repo=resolve(process.env.LYRICS_REPO??'../lyrics'),git=(a:string[])=>execFileSync('git',['-C',repo,...a],{maxBuffer:16*1024*1024});
const commit=git(['rev-parse','HEAD']).toString().trim();git(['merge-base','--is-ancestor',inventory.sourceCommit,commit]);
const hashBytes=(b:Buffer)=>createHash('sha256').update(b).digest('hex');
const publicFiles=[['README.md','evidence/readme-remote.md'],['assets/joyride-120.png','evidence/readme-screenshot-remote.png'],['projects/joyride-lyric-film/README.md','evidence/project-readme-remote.md']];
for(const [path,download]of publicFiles){assert(path&&download);assert.equal(await hashFile(download),hashBytes(git(['show',`${commit}:${path}`])));}
assert.equal(await hashFile('evidence/readme-screenshot-remote.png'),await hashFile('evidence/youtube-final-120.png'));
const tag=JSON.parse(readFileSync('evidence/release-tag-remote.json','utf8'));assert.equal(tag.ref,`refs/tags/${TAG}`);
let object=tag.object;const annotated:string[]=[];
while(object.type==='tag'){
 assert(/^[a-f0-9]{40}$/.test(object.sha)&&annotated.length<8&&!annotated.includes(object.sha));annotated.push(object.sha);
 const file=`evidence/release-tag-object-${object.sha}-remote.json`;assert(existsSync(file),`Save GitHub API /git/tags/${object.sha} as ${file}`);const value=JSON.parse(readFileSync(file,'utf8'));assert.equal(value.sha,object.sha);object=value.object;
}
assert.equal(object.type,'commit');assert.equal(object.sha,inventory.sourceCommit);
writeFileSync('evidence/release-upload-verification.json',JSON.stringify({
 ...production,release:URL,sourceCommit:inventory.sourceCommit,readmeCommit:commit,tagCommitObservedViaGitHubAPI:object.sha,annotatedTagObjects:annotated,assets,
 allRemoteHashesMatched:true,publicReadmeMatchesCommittedSource:true,publicScreenshotMatchesDecodedFrame:true,publicProjectReadmeMatchesCommittedSource:true,
 inventorySha256:await hashFile('release/release-assets.json'),limits:'Verifies freshly downloaded GitHub assets and recorded public content, not YouTube/TikTok playback or future availability.',
},null,2));
console.log({releaseAssets:assets.length,allRemoteHashesMatched:true,publicReadmeAndScreenshotMatched:true,sourceCommit:inventory.sourceCommit});
