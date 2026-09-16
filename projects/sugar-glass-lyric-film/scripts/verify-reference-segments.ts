import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
const format=process.argv[2];if(!['portrait','landscape'].includes(format??''))throw Error('Expected format');
const root=`output/${format}-reference`,manifest=JSON.parse(readFileSync(root+'/manifest.json','utf8')),rows=[];
for(const chunk of manifest.chunks){
 const path=root+'/'+chunk.filename,record=JSON.parse(readFileSync(path+'.json','utf8'));
 const stream=JSON.parse(execFileSync('ffprobe',['-v','error','-count_packets','-select_streams','v:0','-show_streams','-of','json',path],{encoding:'utf8'})).streams[0];
 const frames=chunk.last-chunk.first+1;
 if(+stream.nb_read_packets!==frames||stream.profile!=='4444'||!stream.pix_fmt.includes('444')||stream.width!==(format==='portrait'?2160:3840)||stream.height!==(format==='portrait'?3840:2160)||stream.time_base!=='1/90000')throw Error('Reference contract '+chunk.filename);
 if(record.fingerprint!==manifest.fingerprint||record.first!==chunk.first||record.last!==chunk.last)throw Error('Stale capture receipt '+chunk.filename);
 const hash=createHash('sha256');for await(const bytes of createReadStream(path))hash.update(bytes);const actual=hash.digest('hex');if(record.sha256!==actual)throw Error('Segment hash '+chunk.filename);
 rows.push({...chunk,frames,sha256:actual,profile:stream.profile,pixelFormat:stream.pix_fmt,width:stream.width,height:stream.height,timeBase:stream.time_base});
}
let next=0;for(const row of rows){if(row.first!==next)throw Error('Noncontiguous join');next=row.last+1;}if(next!==13881)throw Error('Incomplete reference');
writeFileSync(`evidence/${format}-reference-verification.json`,JSON.stringify({status:'passed',fingerprint:manifest.fingerprint,frames:next,segments:rows,method:'All capture packets counted; continuous global frame ranges and complete segment SHA-256 verification. The final HEVC file receives strict full decoding.'},null,2)+'\n');
console.log(format,rows.length,'complete continuous reference segments verified');
