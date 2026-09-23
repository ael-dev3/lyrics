"""Extract locally installed Avenir DemiBold for private native rendering.
Usage: python3 extract-demi.py /absolute/output/AvenirNextCondensed-DemiBold.ttf
No font is redistributed; keep generated output ignored.
"""
from pathlib import Path
import struct, hashlib, sys, json
source=Path('/System/Library/Fonts/Avenir Next Condensed.ttc')
b=source.read_bytes()
u16=lambda o:struct.unpack_from('>H',b,o)[0]
u32=lambda o:struct.unpack_from('>I',b,o)[0]
for index in range(u32(8)):
 base=u32(12+index*4); nt=u16(base+4)
 entries=[]
 for j in range(nt):
  p=base+12+j*16
  entries.append((b[p:p+4],*struct.unpack_from('>III',b,p+4)))
 names=next(e for e in entries if e[0]==b'name')[2]
 postscript=[]
 for j in range(u16(names+2)):
  p=names+6+j*12; platform,enc,lang,nid,length,offset=struct.unpack_from('>6H',b,p)
  if nid==6:
   raw=b[names+u16(names+4)+offset:names+u16(names+4)+offset+length]
   postscript.append(raw.decode('utf-16-be' if platform in (0,3) else 'mac_roman'))
 if 'AvenirNextCondensed-DemiBold' not in postscript:continue
 out=bytearray(b[base:base+12]); data=bytearray(); head=None
 for tag,check,start,length in entries:
  offset=12+16*nt+len(data)
  out.extend(tag+struct.pack('>III',check,offset,length))
  data.extend(b[start:start+length]);data.extend(b'\0'*((-length)%4))
  if tag==b'head':head=offset
 out.extend(data);struct.pack_into('>I',out,head+8,0)
 words='>'+str(len(out)//4)+'I'
 checksum=sum(struct.unpack(words,out))&0xffffffff
 struct.pack_into('>I',out,head+8,(0xb1b0afba-checksum)&0xffffffff)
 assert sum(struct.unpack(words,out))&0xffffffff==0xb1b0afba
 target=Path(sys.argv[1]);target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(out)
 print(json.dumps({'path':str(target),'sha256':hashlib.sha256(out).hexdigest(),'sourceSha256':hashlib.sha256(b).hexdigest(),'face':index,'bytes':len(out)}))
 break
else:raise SystemExit('DemiBold face missing')
