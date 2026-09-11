import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,statSync,createReadStream,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const hash=async(p:string)=>{const h=createHash('sha256');for await(const b of createReadStream(p))h.update(b);return h.digest('hex');};
const names=readdirSync('release').sort();assert.deepEqual(readdirSync('remote-verified').sort(),names);
const assets=[];
for(const name of names){const local=await hash('release/'+name),remote=await hash('remote-verified/'+name);assert.equal(local,remote,name);assert.equal(statSync('release/'+name).size,statSync('remote-verified/'+name).size);assets.push({name,bytes:statSync('remote-verified/'+name).size,sha256:remote,matchedAfterDownload:true,url:'https://github.com/ael-dev3/lyrics/releases/download/pozhary-v1.0.0/'+name});}
assert.equal(await hash('evidence/readme-screenshot-remote.png'),await hash('../lyrics/assets/pozhary-16-2.png'));
assert.equal(await hash('evidence/readme-remote.md'),await hash('../lyrics/README.md'));
const sourceCommit=JSON.parse(readFileSync('release/release-assets.json','utf8')).sourceCommit;
writeFileSync('evidence/release-upload-verification.json',JSON.stringify({release:'https://github.com/ael-dev3/lyrics/releases/tag/pozhary-v1.0.0',sourceCommit,tagCommitObservedViaGitHubAPI:'8591719616eb212f11be96d1f7ea978bcc8e1803',assets,publicReadmeMatchesCommittedSource:true,publicScreenshotMatchesDecodedFrame:true},null,2));
console.log({assets:assets.length,allRemoteHashesMatched:true,publicReadmeAndScreenshotMatched:true,sourceCommit});
