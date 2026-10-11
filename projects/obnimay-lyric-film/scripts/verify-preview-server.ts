/** Bounded HTTP checks against this project's existing localhost preview. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {currentIdentity,projectFile} from './project-identity.ts';
const root='http://127.0.0.1:4338',identity=currentIdentity();
const source=readFileSync(projectFile('public/source.mp4'));
const checks:{name:string;status:number}[]=[];
async function request(path:string,options:RequestInit={}){
 return fetch(root+path,{...options,signal:AbortSignal.timeout(5000)});
}
const page=await request('/');assert.equal(page.status,200);assert.match(await page.text(),/Обнимай/);checks.push({name:'complete preview page',status:page.status});
const timeline=await request('/public/timeline.json');assert.equal(timeline.status,200);assert.deepEqual(await timeline.json(),JSON.parse(readFileSync(projectFile('public/timeline.json'),'utf8')));checks.push({name:'current timing JSON',status:timeline.status});
const head=await request('/public/source.mp4',{method:'HEAD'});assert.equal(head.status,200);assert.equal(head.headers.get('content-type'),'video/mp4');assert.equal(Number(head.headers.get('content-length')),source.length);assert.equal((await head.arrayBuffer()).byteLength,0);checks.push({name:'original MP4 HEAD and MIME',status:head.status});
const range=await request('/public/source.mp4',{headers:{Range:'bytes=100-199'}});assert.equal(range.status,206);assert.equal(range.headers.get('content-range'),`bytes 100-199/${source.length}`);assert.equal(Number(range.headers.get('content-length')),100);assert.deepEqual(Buffer.from(await range.arrayBuffer()),source.subarray(100,200));checks.push({name:'exact original MP4 range bytes',status:range.status});
const suffix=await request('/public/source.mp4',{headers:{Range:'bytes=-16'}});assert.equal(suffix.status,206);assert.deepEqual(Buffer.from(await suffix.arrayBuffer()),source.subarray(-16));checks.push({name:'MP4 suffix range',status:suffix.status});
const invalid=await request('/public/source.mp4',{headers:{Range:`bytes=${source.length+1}-`}});assert.equal(invalid.status,416);checks.push({name:'invalid range rejection',status:invalid.status});
for(const path of ['/source/REVIEW.json','/analysis/stereo44100.f32','/package.json','/node_modules/typescript/package.json']){
 const response=await request(path);assert.equal(response.status,404);checks.push({name:`private/nonpublic route ${path}`,status:response.status});
}
const post=await request('/',{method:'POST'});assert.equal(post.status,405);checks.push({name:'unsupported method rejection',status:post.status});
writeFileSync(projectFile('evidence/server-check.json'),JSON.stringify({...identity,status:'passed',scope:'Local HTTP page/data, original range transport and public-asset allowlist only; no actual listening or full-film render.',checks},null,2)+'\n');
console.log(JSON.stringify({status:'passed',checks:checks.length}));
