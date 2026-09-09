from pathlib import Path
import json,subprocess,hashlib,shutil
base=Path.cwd();f=base/'outputs/Roi-x-Adore-TikTok-1080x1920-60fps.mp4'
def run(args):return subprocess.check_output(args,text=True)
p=json.loads(run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(f)]));v=next(x for x in p['streams'] if x['codec_type']=='video');a=next(x for x in p['streams'] if x['codec_type']=='audio')
assert (v['width'],v['height'],v['r_frame_rate'],v['codec_name'])==(1080,1920,'60/1','h264')
assert int(v['nb_frames'])==22762 and abs(float(v['duration'])-float(a['duration']))<1/60
subprocess.run(['ffmpeg','-v','error','-xerror','-err_detect','explode','-i',str(f),'-progress',str(base/'work/tiktok-decode-progress.txt'),'-f','null','-'],check=True)
def ah(p):return run(['ffmpeg','-v','error','-i',str(p),'-map','0:a:0','-c','copy','-f','hash','-hash','sha256','-']).strip()
assert ah(f)==ah(base/'work/film/public/soundtrack.m4a')
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as s:
  for chunk in iter(lambda:s.read(8388608),b''):h.update(chunk)
 return h.hexdigest()
h=sha(f);desktop=Path('<DELIVERY_DIRECTORY>')/f.name
if desktop.exists():assert sha(desktop)==h
else:
 with f.open('rb') as s,desktop.open('xb') as d:shutil.copyfileobj(s,d)
assert sha(desktop)==h
report={'file':f.name,'sha256':h,'video':v,'audioDuration':a['duration'],'fullDecode':'passed','audioPacketsIdentical':True,'desktopCopyVerified':True,'layout':'9:16 recomposition from original lossless transparent frames and animation; unchanged full timeline and cue timing'}
(base/'outputs/Roi-x-Adore-TikTok-Verification.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'file':str(f),'desktop':str(desktop),'sha256':h}))
