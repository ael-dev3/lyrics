"""Create or verify an authenticated recovery set; never upload or publish it."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import zipfile

PROJECT = Path(__file__).resolve().parents[1]
REPO = PROJECT.parents[1]
PREFIX = PROJECT.relative_to(REPO).as_posix()

def stream_digest(stream):
    h = hashlib.sha256()
    for block in iter(lambda: stream.read(1024 * 1024), b''):
        h.update(block)
    return h.hexdigest()

def digest(path):
    with open(path, 'rb') as stream:
        return stream_digest(stream)

def record(path, name):
    return {'file': name, 'bytes': path.stat().st_size, 'sha256': digest(path)}

def seal(path):
    with zipfile.ZipFile(path, 'a', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        payloads = []
        for entry in z.infolist():
            if entry.is_dir():
                continue
            with z.open(entry) as stream:
                payloads.append({'file': entry.filename, 'bytes': entry.file_size,
                                 'sha256': stream_digest(stream)})
        manifest = f'BACKUP-METADATA/{path.stem}-manifest.json'
        z.writestr(manifest, json.dumps({'payloads': payloads}, ensure_ascii=False, indent=2) + '\n')
    return {**record(path, path.name), 'payloadFiles': len(payloads), 'manifest': manifest}

def verify(directory, restore=None):
    receipt = json.loads((directory / 'BACKUP.json').read_text())
    if restore:
        assert not restore.exists(), 'Restore directory already exists.'
        restore.mkdir(parents=True)
    verified = 0
    for archive in receipt['archives']:
        path = directory / archive['file']
        assert path.stat().st_size == archive['bytes'] and digest(path) == archive['sha256']
        with zipfile.ZipFile(path) as z:
            assert z.testzip() is None
            rows = json.loads(z.read(archive['manifest']))['payloads']
            expected = {x['file'] for x in rows} | {archive['manifest']}
            assert {x.filename for x in z.infolist() if not x.is_dir()} == expected
            for row in rows:
                member = Path(row['file'])
                assert not member.is_absolute() and '..' not in member.parts
                with z.open(row['file']) as stream:
                    assert stream_digest(stream) == row['sha256']
                assert z.getinfo(row['file']).file_size == row['bytes']
                verified += 1
                if restore:
                    target = restore / member
                    target.parent.mkdir(parents=True, exist_ok=True)
                    if target.exists():
                        assert digest(target) == row['sha256']
                    else:
                        with z.open(row['file']) as stream, target.open('wb') as output:
                            while block := stream.read(1024 * 1024):
                                output.write(block)
    if restore:
        for alias in receipt['deduplicatedAliases']:
            target = restore / alias['file']
            source = restore / alias['storedAs']
            assert digest(source) == alias['sha256']
            target.parent.mkdir(parents=True, exist_ok=True)
            os.link(source, target)
        for row in receipt['projectInventory']:
            assert digest(restore / row['file']) == row['sha256'], row['file']
    return {'status': 'pass', 'archives': len(receipt['archives']), 'payloadHashesVerified': verified,
            'uniqueProjectFilesCovered': len(receipt['projectInventory']), 'freshRestoreVerified': bool(restore),
            'sourceCommit': receipt['sourceCommit'], 'identity': receipt['identity']}

def create(destination):
    assert destination != PROJECT and PROJECT not in destination.parents, 'Archive destination must be outside the project to avoid including its own files.'
    assert not destination.exists(), 'Archive directory already exists.'
    assert not subprocess.check_output(['git', 'diff', 'HEAD', '--', PREFIX], cwd=REPO), 'Project has uncommitted tracked edits.'
    destination.mkdir(parents=True)
    commit = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=REPO, text=True).strip()
    tracked = set(subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', 'HEAD'], cwd=REPO, text=True).splitlines())
    assert f'{PREFIX}/scripts/render-production.ts' in tracked, 'Production source must be committed first.'
    identity = json.loads((PROJECT / 'public/preview-identity.json').read_text())
    source = destination / 'Razuchimsya-Plakat-v1.1-Source.zip'
    context = [PREFIX, 'AGENTS.md', 'README.md', 'AI-DISCLOSURE.md', 'CREDITS.md', 'LICENSE.md', 'LICENSES',
               'assets/readme-screenshots.json', 'docs']
    subprocess.run(['git', 'archive', '--format=zip', f'--output={source}', commit, '--', *context], cwd=REPO, check=True)
    with zipfile.ZipFile(source, 'a', compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr('BACKUP-METADATA/source-revision.json', json.dumps({'sourceCommit': commit, 'identity': identity}, indent=2) + '\n')
    inventory, recovery, aliases = [], [], []
    kit_paths = {}
    for path in (PROJECT / 'publishing-kit').rglob('*'):
        if path.is_file():
            kit_paths[digest(path)] = path.relative_to(REPO).as_posix()
    for directory, folders, files in os.walk(PROJECT, followlinks=False):
        for folder in folders:
            if folder != 'node_modules':
                assert not (Path(directory) / folder).is_symlink(), 'Unexpected source-directory symlink.'
        folders[:] = [x for x in folders if x != 'node_modules']
        for name in files:
            path = Path(directory) / name
            assert not path.is_symlink(), 'Unexpected source-file symlink.'
            relative = path.relative_to(REPO).as_posix()
            row = record(path, relative)
            inventory.append(row)
            if relative in tracked or relative.startswith(PREFIX + '/publishing-kit/'):
                continue
            if path.parent == PROJECT / 'renders' and path.suffix == '.mp4' and row['sha256'] in kit_paths:
                aliases.append({**row, 'storedAs': kit_paths[row['sha256']]})
            else:
                recovery.append((path, relative))
    media = destination / 'Razuchimsya-Plakat-v1.1-Media-Recovery.zip'
    with zipfile.ZipFile(media, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for path, relative in recovery:
            z.write(path, relative)
    kit = destination / 'Razuchimsya-Plakat-v1.1-Upload-Kit.zip'
    with zipfile.ZipFile(kit, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        for path in sorted((PROJECT / 'publishing-kit').rglob('*')):
            if path.is_file():
                z.write(path, path.relative_to(REPO).as_posix())
    archives = [seal(path) for path in [source, media, kit]]
    receipt = {'schemaVersion': 1, 'sourceCommit': commit, 'identity': identity, 'archives': archives,
               'deduplicatedAliases': aliases, 'projectInventory': inventory,
               'dependencies': 'node_modules symlink omitted; exact dependencies retained in package-lock.json.',
               'distribution': 'Authenticated unpublished recovery assets; not a public media release.'}
    (destination / 'BACKUP.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
    return verify(destination)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--create', type=Path)
    parser.add_argument('--verify', type=Path)
    parser.add_argument('--restore-to', type=Path)
    args = parser.parse_args()
    assert bool(args.create) != bool(args.verify), 'Choose --create or --verify.'
    result = create(args.create.resolve()) if args.create else verify(args.verify.resolve(), args.restore_to.resolve() if args.restore_to else None)
    print(json.dumps(result, ensure_ascii=False))
