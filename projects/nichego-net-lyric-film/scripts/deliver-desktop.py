"""Copy a fully verified kit to a new destination; refuse replacement."""
from pathlib import Path
import argparse,hashlib,json,shutil,datetime
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--destination',type=Path,required=True);args=parser.parse_args()
source=root/'publishing-kit';target=args.destination.resolve();assert not target.exists(),'Destination exists; refusing replacement.'
def digest(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
rows=[]
for line in (source/'CHECKSUMS.sha256').read_text().splitlines():
 sha,name=line.split('  ',1);part=Path(name);assert not part.is_absolute() and '..' not in part.parts
 assert digest(source/part)==sha;rows.append({'file':name,'sha256':sha})
manifest=json.loads((source/'DELIVERY.json').read_text());assert len(rows)==16
for movie in manifest['movies']:assert movie['status']=='pass'
shutil.copytree(source,target)
for row in rows:assert digest(target/row['file'])==row['sha256']
assert digest(target/'CHECKSUMS.sha256')==digest(source/'CHECKSUMS.sha256')
files=[p for p in target.rglob('*') if p.is_file()];assert len(files)==17
report={'status':'pass','copiedAtUtc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'destinationLabel':'Desktop/'+target.name,'files':len(files),'bytes':sum(p.stat().st_size for p in files),'checksumsSha256':digest(target/'CHECKSUMS.sha256'),'identity':manifest['identity'],'verification':'All copied payloads and checksum manifest hashed against the verified upload kit.','platformUploadPerformed':False}
(root/'evidence/desktop-delivery.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(json.dumps(report,ensure_ascii=False))
