import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const rows=[];
for(const [name,width,height] of [['YouTube-Thumbnail-1920x1080',1920,1080],['TikTok-Cover-Profile-1200x1600',1200,1600]] as const){
 const file=`output/Midnight-Love-${name}.jpg`,buffer=readFileSync(file);
 const data=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-of','json',file]).toString()) as {streams:{width:number;height:number;codec_name:string}[]};
 const stream=data.streams[0];assert(stream);assert.equal(stream.width,width);assert.equal(stream.height,height);assert.equal(stream.codec_name,'mjpeg');
 rows.push({file:file.replace('output/',''),width,height,bytes:buffer.length,sha256:createHash('sha256').update(buffer).digest('hex')});
}
writeFileSync('evidence/cover-verification.json',JSON.stringify({assets:rows,profileOrientation:'Portrait 3:4 width:height; upload UI label is 4:3',review:{profile:'evidence/profile-150x200.png',centerCrop:'evidence/profile-crop-300x400.png',thumbnail:'evidence/thumbnail-320x180.png',observation:'Full title, artist and focal figure remain visible and readable at these reviewed sizes. The crop removes 5% from each edge.',livePlatformPreview:false},prompts:'analysis/cover-prompts.json'},null,2));
console.log('Cover dimensions and hashes recorded.');
