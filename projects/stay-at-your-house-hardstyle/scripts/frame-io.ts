import {spawn} from 'node:child_process';
import type {Readable,Writable} from 'node:stream';
import {once} from 'node:events';
export async function* rawFrames(stream:Readable,bytes:number){
 let parts:Buffer[]=[],length=0;
 for await(const value of stream){let chunk=value as Buffer;
  while(chunk.length){const take=Math.min(bytes-length,chunk.length);parts.push(chunk.subarray(0,take));length+=take;chunk=chunk.subarray(take);
   if(length===bytes){yield Buffer.concat(parts,bytes);parts=[];length=0;}
  }
 }
 if(length)throw Error('Truncated raw video frame');
}
export function decodeVideo(path:string,width:number,height:number){
 const child=spawn('ffmpeg',['-v','error','-xerror','-threads','2','-i',path,'-map','0:v:0','-an','-f','rawvideo','-pix_fmt','rgba','pipe:1'],{stdio:['ignore','pipe','inherit']});
 const done=new Promise<void>((resolve,reject)=>{child.once('error',reject);child.once('close',code=>code===0?resolve():reject(Error(`Decode failed: ${code}`)));});
 void done.catch(()=>{});return {child,frames:rawFrames(child.stdout,width*height*4),done};
}
export async function writeFrame(stream:Writable,bytes:Uint8Array|Uint8ClampedArray){if(!stream.write(Buffer.from(bytes.buffer,bytes.byteOffset,bytes.byteLength)))await once(stream,'drain');}
