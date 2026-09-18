import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const raw=readFileSync('analysis/star-catalogue/bsc5.tsv'),provenance=JSON.parse(readFileSync('analysis/star-catalogue/provenance.json','utf8'));
assert.equal(createHash('sha256').update(raw).digest('hex'),provenance.sha256,'Catalogue source changed');
const rows=raw.toString('utf8').split(/\r?\n/).flatMap(line=>{
 const columns=line.split('\t').map(s=>s.trim()),[hr,ra,dec,mag]=columns;
 if(!hr||!/^\d+$/.test(hr)||!ra||!dec||!mag)return [];
 const r=/^(\d+) (\d+) ([\d.]+)$/.exec(ra),d=/^([+-])(\d+) (\d+) ([\d.]+)$/.exec(dec),m=Number(mag);
 if(!r||!d||!Number.isFinite(m)||m>6.5)return [];
 return [{hr:Number(hr),ra:Number(((Number(r[1])+Number(r[2])/60+Number(r[3])/3600)*15).toFixed(8)),dec:Number(((d[1]==='-'?-1:1)*(Number(d[2])+Number(d[3])/60+Number(d[4])/3600)).toFixed(8)),mag:m,name:columns[5]??''}];
});
assert.equal(rows.length,provenance.rows);assert.equal(new Set(rows.map(r=>r.hr)).size,rows.length);
const path='public/stars-bsc5.json';
if(process.argv.includes('--write'))writeFileSync(path,JSON.stringify(rows)+'\n');
else assert.deepEqual(rows,JSON.parse(readFileSync(path,'utf8')),'Compact catalogue differs from source');
console.log({catalogue:provenance.catalogue,rows:rows.length,status:'PASS'});
