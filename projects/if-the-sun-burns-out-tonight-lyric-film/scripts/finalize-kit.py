#!/usr/bin/env python3
"""Assemble only independently verified masters and current posting assets."""
import hashlib,json,pathlib,shutil,datetime
ROOT=pathlib.Path(__file__).resolve().parents[1]
def digest(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
 return h.hexdigest()
def read(p):return json.loads((ROOT/p).read_text())
kit=ROOT/'output/posting-kit';kit.mkdir(parents=True,exist_ok=True)
payloads={'YouTube/If-The-Sun-Burns-Out-Tonight-landscape.mp4','TikTok/If-The-Sun-Burns-Out-Tonight-portrait.mp4','YouTube/title.txt','YouTube/description.txt','YouTube/thumbnail.jpg','TikTok/title.txt','TikTok/description.txt','TikTok/profile-cover.jpg','Captions/english.srt','Captions/english.vtt','START-HERE.md'}
for p in kit.rglob('*'):
 if p.is_symlink() or (p.is_file() and str(p.relative_to(kit)) not in payloads|{'DELIVERY.json','SHA256SUMS.txt'}):raise SystemExit('Unexpected posting-kit entry: '+str(p.relative_to(kit)))
assets=read('evidence/publishing-assets.json')
if {e['path'] for e in assets['covers']}!={'publishing/youtube-thumbnail.jpg','publishing/tiktok-profile-cover.jpg'} or len(assets['covers'])!=2:raise SystemExit('Incomplete cover evidence')
for entry in assets['covers']:
 if digest(ROOT/entry['path'])!=entry['sha256']:raise SystemExit('Stale cover review')
for ext in ['srt','vtt']:
 if digest(ROOT/f'publishing/english.{ext}')!=assets['captions'][ext+'Sha256']:raise SystemExit('Stale caption validation')
if digest(ROOT/'src/timeline.json')!=assets['captions']['timelineSha256']:raise SystemExit('Stale caption timeline')
masters=[]
for fmt,platform in [('landscape','YouTube'),('portrait','TikTok')]:
 source=ROOT/f'output/if-the-sun-burns-out-tonight-{fmt}.mp4'
 technical=read(f'evidence/{fmt}-verification.json')
 focus=read(f'evidence/{fmt}-word-focus-audit.json')
 if technical['status']!='passed' or focus['status']!='passed':raise SystemExit(f'{fmt} verification requires resolution')
 if focus['inputSha256']!=digest(source) or technical['inputSha256']!=digest(source):raise SystemExit(f'{fmt} report is stale')
 if focus['format']!=fmt or technical['format']!=fmt:raise SystemExit('Wrong verification format')
 if technical['sourceSha256']!=read('source/media-manifest.json')['sha256']:raise SystemExit('Wrong source identity')
 if technical['metadata']['fps']!=60 or technical['metadata']['dimensions']!=([1920,818] if fmt=='landscape' else [1080,1920]) or technical['presentationGrid']['packetCount']!=14056:raise SystemExit('Unexpected delivery dimensions/cadence')
 if focus['timelineSha256']!=digest(ROOT/'src/timeline.json') or focus['layoutSha256']!=digest(ROOT/'src/production-layout.json'):raise SystemExit('Stale focus geometry/timeline')
 if focus['summary']['wordMidpointsCovered']!=254:raise SystemExit('Incomplete word check')
 target=kit/platform/f'If-The-Sun-Burns-Out-Tonight-{fmt}.mp4';target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(source,target)
 if digest(target)!=focus['inputSha256']:raise SystemExit('Copied master hash mismatch')
 masters.append({'technicalReportSha256':digest(ROOT/f'evidence/{fmt}-verification.json'),'wordFocusReportSha256':digest(ROOT/f'evidence/{fmt}-word-focus-audit.json'),'format':fmt,'path':str(target.relative_to(kit)),'sha256':digest(target),'technicalReport':f'evidence/{fmt}-verification.json','wordFocusReport':f'evidence/{fmt}-word-focus-audit.json'})
for original,target in [('youtube-title.txt','YouTube/title.txt'),('youtube-description.txt','YouTube/description.txt'),('youtube-thumbnail.jpg','YouTube/thumbnail.jpg'),('tiktok-title.txt','TikTok/title.txt'),('tiktok-description.txt','TikTok/description.txt'),('tiktok-profile-cover.jpg','TikTok/profile-cover.jpg'),('english.srt','Captions/english.srt'),('english.vtt','Captions/english.vtt'),('START-HERE.md','START-HERE.md')]:
 p=kit/target;p.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/'publishing'/original,p)
 if digest(p)!=digest(ROOT/'publishing'/original):raise SystemExit('Copied asset hash mismatch')
files=[{'path':str(p.relative_to(kit)),'bytes':p.stat().st_size,'sha256':digest(p)} for p in sorted(kit.rglob('*')) if p.is_file() and p.name not in {'SHA256SUMS.txt','DELIVERY.json'}]
if {str(p.relative_to(kit)) for p in kit.rglob('*') if p.is_file() and p.name not in {'DELIVERY.json','SHA256SUMS.txt'}}!=payloads:raise SystemExit('Posting kit inventory mismatch')
manifest={'timelineSha256':digest(ROOT/'src/timeline.json'),'layoutSha256':digest(ROOT/'src/production-layout.json'),'edition':'word-atmosphere-v5 / production-v1','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'verified posting kit','framesPerMaster':14056,'fps':60,'durationSeconds':234.266667,'originalAudio':'AAC stream copy; decoded PCM hash identical to source','landscapeDimensions':[1920,818],'portraitDimensions':[1080,1920],'sourceBlackReference':'A single near-black source frame at 209.416667–209.458333 seconds remains source imagery; no introduced dropout detected.','files':files,'masters':masters}
(kit/'DELIVERY.json').write_text(json.dumps(manifest,indent=2)+'\n')
checks=files+[{'path':'DELIVERY.json','sha256':digest(kit/'DELIVERY.json')}]
(kit/'SHA256SUMS.txt').write_text(''.join(f"{x['sha256']}  {x['path']}\n" for x in checks))
manifest['kitFileCount']=len(files)+2;manifest['checksumManifestSha256']=digest(kit/'SHA256SUMS.txt');manifest['desktopCopy']='pending'
(ROOT/'evidence/delivery-receipt.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'status':manifest['status'],'fileCount':manifest['kitFileCount'],'bytes':sum(x['bytes'] for x in files)}))
