"""Copy a complete posting kit into a new destination and verify every byte."""
from pathlib import Path
import argparse, datetime, hashlib, json, shutil

parser = argparse.ArgumentParser()
parser.add_argument('source')
parser.add_argument('destination')
args = parser.parse_args()
source, destination = Path(args.source), Path(args.destination)
staging = destination.with_name(destination.name + '.copying')
if destination.exists() or staging.exists():
    raise SystemExit('Destination already exists; choose a new folder.')
def sha(path):
    h = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''): h.update(chunk)
    return h.hexdigest()
receipt = json.loads((source / 'Delivery-Manifest.json').read_text())
if receipt.get('status') != 'verified local posting kit': raise SystemExit('Kit is not verified.')
for item in receipt['files']:
    path = source / item['file']
    if not path.is_file() or sha(path) != item['sha256']:
        raise SystemExit('Source kit changed: ' + item['file'])
expected = set(item['file'] for item in receipt['files']) | {'Delivery-Manifest.json', 'CHECKSUMS.sha256'}
found = set(str(p.relative_to(source)) for p in source.rglob('*') if p.is_file())
if expected != found: raise SystemExit('Kit contains missing or unexpected files.')
shutil.copytree(source, staging)
files = []
for relative in sorted(expected):
    original, copied = source / relative, staging / relative
    if sha(original) != sha(copied): raise SystemExit('Copy verification failed: ' + relative)
    files.append({'file': relative, 'bytes': copied.stat().st_size, 'sha256': sha(copied)})
if destination.exists(): raise SystemExit('Destination appeared during copy; original kit is preserved.')
staging.rename(destination)
report = {'status': 'PASS', 'song': receipt['song'], 'edition': receipt['edition'], 'revision': receipt['revision'],
          'folderName': destination.name, 'files': files, 'copiedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'scope': 'Every delivered file matches the verified local posting kit. Local account paths are excluded.'}
Path('evidence/desktop-delivery-receipt.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'status': 'PASS', 'folder': str(destination), 'files': len(files)}, ensure_ascii=False))
