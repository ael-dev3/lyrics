"""Assemble a verified local posting kit; no publishing or Desktop writes."""
from pathlib import Path
import argparse, datetime, hashlib, json, shutil, subprocess

parser = argparse.ArgumentParser()
parser.add_argument('--source-commit', required=True)
parser.add_argument('--destination', default='output/posting-kit-v1.0.0')
args = parser.parse_args()
root = Path('.').resolve()
def sha(path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for block in iter(lambda: f.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()
subprocess.run(['node', 'scripts/production-gate.ts'], check=True)
subprocess.run(['git', 'cat-file', '-e', args.source_commit + '^{commit}'], check=True)
destination = Path(args.destination)
if destination.exists():
    raise SystemExit('Destination already exists; select a new kit path instead of overwriting.')
identity = json.loads(Path('evidence/preview-identity.json').read_text())
project_prefix = subprocess.check_output(['git', 'rev-parse', '--show-prefix'], text=True).strip()
source_omissions = {'public/soundtrack.m4a', 'review/client.js'}
for relative, expected in identity['hashes'].items():
    if relative in source_omissions: continue
    committed = subprocess.check_output(['git', 'show', args.source_commit + ':' + project_prefix + relative])
    if hashlib.sha256(committed).hexdigest() != expected:
        raise SystemExit('Source commit does not contain reviewed input: ' + relative)
cover_report = json.loads(Path('evidence/cover-assets.json').read_text())
if cover_report.get('visualReview', {}).get('status') != 'Passed local visual inspection':
    raise SystemExit('Upload cover review incomplete.')
cover_hashes = {item['path']: item['sha256'] for item in cover_report['files']}
caption_report = json.loads(Path('evidence/caption-assets.json').read_text())
if caption_report['sourceCueSha256'] != identity['hashes']['src/cues.json'] or caption_report['cueCount'] != 33:
    raise SystemExit('Caption review belongs to different cues.')
caption_hashes = {item['path']: item['sha256'] for item in caption_report['files']}
for relative, expected in {**cover_hashes, **caption_hashes}.items():
    if sha(Path(relative)) != expected:
        raise SystemExit('Reviewed posting asset changed: ' + relative)
files = []
videos = []
planned = []
for format, platform, width, height in [('landscape', 'YouTube', 1920, 1080), ('portrait', 'TikTok', 1080, 1920)]:
    name = f'Lyubi-Menya-Lyubi-{format}-{width}x{height}-60fps.mp4'
    source = Path('output') / name
    report = json.loads((Path('evidence/production') / f'{format}-verification.json').read_text())
    focus = json.loads((Path('evidence/production') / f'{format}-focus-audit.json').read_text())
    if report.get('status') != 'PASS' or report.get('format') != format:
        raise SystemExit('Incomplete technical verification: ' + name)
    if report.get('inputIdentitySha256') != sha(Path('evidence/preview-identity.json')) or report.get('verifierSha256') != sha(Path('scripts/verify-production.ts')):
        raise SystemExit('Stale technical verification: ' + name)
    if report['sha256'] != sha(source):
        raise SystemExit('Video does not match verification: ' + name)
    if report.get('frames') != 11245 or report.get('aacPackets') != 8073:
        raise SystemExit('Unexpected verified media inventory: ' + name)
    if (focus.get('status') != 'PASS' or focus.get('diagnostic') is not False
            or focus.get('inputSha256') != report['sha256'] or focus.get('format') != format
            or focus.get('inputIdentitySha256') != sha(Path('evidence/preview-identity.json'))
            or focus.get('verifierSha256') != sha(Path('scripts/audit-decoded-focus.ts'))
            or focus.get('decodedFrames') != 11245 or focus.get('seenCueCount') != 33
            or focus.get('missingWordStates') != []):
        raise SystemExit('Decoded focus audit is not complete: ' + name)
    capture = json.loads((Path('evidence') / f'render-{format}.json').read_text())
    if capture['outputSha256'] != report['sha256'] or capture['inputIdentity']['hashes'] != identity['hashes']:
        raise SystemExit('Capture does not match current inputs and delivered video: ' + name)
    for relative, expected in capture['rendererHashes'].items():
        committed = subprocess.check_output(['git', 'show', args.source_commit + ':' + project_prefix + relative])
        if hashlib.sha256(committed).hexdigest() != expected:
            raise SystemExit('Source commit does not contain the production renderer: ' + relative)
    planned.append((source, Path(platform) / name))
    videos.append({'format': format, 'file': str(Path(platform) / name), 'width': width, 'height': height,
                   'frames': report['frames'], 'fps': 60, 'bytes': source.stat().st_size,
                   'sha256': report['sha256'], 'audioIdentity': report.get('audioIdentity'),
                   'decodedSamples': report.get('decodedSamples'), 'decodedPcmSha256': report.get('decodedPcmSha256'),
                   'focusVerification': focus})
for platform, cover in [('YouTube', 'Lyubi-Menya-Lyubi-YouTube-Thumbnail-1920x1080.jpg'), ('TikTok', 'Lyubi-Menya-Lyubi-TikTok-Cover-Profile-1200x1600.jpg')]:
    for name in [cover, platform + '-Title.txt', platform + '-Description.txt']:
        source = Path('publishing') / name
        if name == cover and str(source) not in cover_hashes: raise SystemExit('Missing cover identity: ' + str(source))
        if not source.is_file(): raise SystemExit('Missing posting asset: ' + str(source))
        planned.append((source, Path(platform) / name))
for language in ['ru', 'en', 'bilingual']:
    source = Path('publishing/captions') / ('Lyubi-Menya-Lyubi-' + language + '.srt')
    if str(source) not in caption_hashes: raise SystemExit('Missing caption identity: ' + str(source))
    planned.append((source, Path('Captions') / source.name))
if len([p for p in planned if p[1].suffix == '.srt']) != 3:
    raise SystemExit('Expected Russian, English and bilingual captions.')
for source, relative in planned:
    out = destination / relative
    out.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, out)
    if sha(out) != sha(source): raise SystemExit('Copy verification failed: ' + str(relative))
readme = destination / 'START-HERE.txt'
readme.write_text('ГРЕЧКА — ЛЮБИ МЕНЯ, ЛЮБИ\nRose paper edition · Russian + English\n\nYouTube/: full landscape video, thumbnail, title and description.\nTikTok/: full vertical video, portrait profile cover, title and description.\nCaptions/: optional Russian, English and bilingual SRT files. The videos already include both lyric rows and word highlighting.\n\nChoose the matching video and cover for each platform, then copy the supplied title and description. All files in this folder are final upload assets; no platform upload has been performed.\n\nOriginal recording and artwork: Гречка and their respective creators.\nSource: https://www.youtube.com/watch?v=DBGCHjBSNzo\n', encoding='utf-8')
for source in sorted(destination.rglob('*')):
    if source.is_file(): files.append({'file': str(source.relative_to(destination)), 'bytes': source.stat().st_size, 'sha256': sha(source)})
receipt = {'status': 'verified local posting kit', 'edition': 'rose-paper-v1.0.0', 'song': identity['song'],
           'revision': identity['revision'], 'sourceCommit': args.source_commit, 'previewHashes': identity['hashes'],
           'videos': videos, 'files': files, 'builtAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
           'scope': 'Comprehensive human review of the frozen preview plus independent encoded-file verification; local delivery and source repository update. No public media release or platform upload.'}
encoded = json.dumps(receipt, ensure_ascii=False, indent=2) + '\n'
(destination / 'Delivery-Manifest.json').write_text(encoded)
Path('evidence/delivery-receipt.json').write_text(encoded)
manifest = destination / 'Delivery-Manifest.json'
checks = files + [{'file': manifest.name, 'sha256': sha(manifest)}]
text = ''.join(item['sha256'] + '  ' + item['file'] + '\n' for item in checks)
(destination / 'CHECKSUMS.sha256').write_text(text)
Path('evidence/delivery-checksums.sha256').write_text(text)
print(json.dumps({'folder': str(destination), 'files': len(checks) + 1, 'bytes': sum(f.stat().st_size for f in destination.rglob('*') if f.is_file())}, indent=2))
