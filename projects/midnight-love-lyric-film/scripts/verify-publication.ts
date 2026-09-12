import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,statSync,createReadStream,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const hash=async(p:string)=>{const h=createHash('sha256');for await(const b of createReadStream(p))h.update(b);return h.digest('hex');};
const names=readdirSync('release').sort();assert.deepEqual(readdirSync('remote-verified').sort(),names);
const assets=[];
for(const name of names){const local=await hash('release/'+name),remote=await hash('remote-verified/'+name);assert.equal(local,remote,name);assert.equal(statSync('release/'+name).size,statSync('remote-verified/'+name).size);assets.push({name,bytes:statSync('remote-verified/'+name).size,sha256:remote,matchedAfterDownload:true,url:'https://github.com/ael-dev3/lyrics/releases/download/midnight-love-v1.0.0/'+name});}
assert.equal(await hash('evidence/readme-screenshot-remote.png'),await hash('../lyrics/assets/midnight-love-44.png'));
assert.equal(await hash('evidence/readme-remote.md'),await hash('../lyrics/README.md'));
const inventory:unknown=JSON.parse(readFileSync('release/release-assets.json','utf8'));assert(inventory&&typeof inventory==='object'&&'sourceCommit' in inventory&&typeof inventory.sourceCommit==='string');
const tag:unknown=JSON.parse(readFileSync('evidence/release-tag-remote.json','utf8'));assert(tag&&typeof tag==='object'&&'object' in tag&&tag.object&&typeof tag.object==='object'&&'sha' in tag.object);assert.equal(tag.object.sha,inventory.sourceCommit);
writeFileSync('evidence/release-upload-verification.json',JSON.stringify({release:'https://github.com/ael-dev3/lyrics/releases/tag/midnight-love-v1.0.0',sourceCommit:inventory.sourceCommit,tagCommitObservedViaGitHubAPI:tag.object.sha,assets,publicReadmeMatchesCommittedSource:true,publicScreenshotMatchesDecodedFrame:true},null,2));
console.log({assets:assets.length,allRemoteHashesMatched:true,publicReadmeAndScreenshotMatched:true,sourceCommit:inventory.sourceCommit});
