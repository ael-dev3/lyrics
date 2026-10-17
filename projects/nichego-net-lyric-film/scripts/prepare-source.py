"""Verify the exact source and prepare reproducible local review inputs."""
from pathlib import Path
import argparse,hashlib,json,shutil,subprocess
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('source',nargs='?',help='Exact original recording to copy; omit when public/source.mp4 is already present.');args=parser.parse_args()
contract=json.loads((root/'source/recording.json').read_text());target=root/'public/source.mp4'
provided=Path(args.source).expanduser().resolve() if args.source else target
with provided.open('rb') as f:
 h=hashlib.sha256()
 for chunk in iter(lambda:f.read(1024*1024),b''):h.update(chunk)
if h.hexdigest()!=contract['sourceSha256']:raise SystemExit('Wrong source bytes; do not apply this recording’s timings to another file.')
if provided!=target.resolve():shutil.copy2(provided,target)
(root/'analysis').mkdir(exist_ok=True)
commands=[['ffmpeg','-v','error','-i',str(target),'-frames:v','1','-y',str(root/'public/artwork-reference.png')]]
for rate,channels,name in [(48000,2,'mix-48k.wav'),(16000,1,'mix-16k.wav')]:commands.append(['ffmpeg','-v','error','-i',str(target),'-vn','-ar',str(rate),'-ac',str(channels),'-c:a','pcm_f32le','-y',str(root/'analysis'/name)])
for command in commands:subprocess.run(command,check=True)
print('Exact recording verified; first decoded picture and analysis audio prepared.')
