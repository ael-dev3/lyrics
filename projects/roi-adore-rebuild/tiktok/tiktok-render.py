from pathlib import Path
import subprocess,sys
root=Path.cwd();preview='--preview' in sys.argv
# Recompose the approved film's timed layers, retaining every lyric pixel and clock.
mask=root/'work/tiktok-art-mask.pgm';w,h=1080,850
mask.write_bytes(f'P5\n{w} {h}\n255\n'.encode()+b''.join(bytes([round(255*max(0,min(1,(850-y)/130)))])*w for y in range(h)))
start=124 if preview else 0;length=10 if preview else 379.366667
f='''[0:v]split=3[lyrics0][rail0][spectrum0];
[lyrics0]crop=1904:1240:104:412,scale=860:560:flags=lanczos,setsar=1[lyrics];
[rail0]crop=3840:140:0:220,scale=960:35:flags=lanczos,setsar=1[rail];
[spectrum0]crop=3600:380:110:1684,scale=860:90:flags=lanczos,setsar=1[spectrum];
[1:v]DELAYscale=1080:1080:flags=lanczos,crop=1080:850:0:40,setsar=1,format=rgba[art0];
[2:v]format=gray[mask];[art0][mask]alphamerge[art];
color=c=0xe8f5ff:s=1080x1920:r=60:d=DURATION[bg];
[bg][art]overlay=0:0:format=auto[b];[b][rail]overlay=0:795:shortest=1:format=auto[c];
[c][lyrics]overlay=48:850:shortest=1:format=auto[d];[d][spectrum]overlay=48:1475:shortest=1:format=auto,
FADEformat=yuv420p,setsar=1[v]'''.replace('DELAY','' if preview else 'tpad=start_duration=0.033333333:start_mode=clone,').replace('DURATION',str(length)).replace('FADE','' if preview else 'fade=t=in:st=0:d=1.2:color=white,fade=t=out:st=376.883333:d=2.5:color=white,')
out=root/('work/Roi-TikTok-Preview.mp4' if preview else 'outputs/Roi-x-Adore-TikTok-1080x1920-60fps.mp4')
args=['ffmpeg','-y','-v','warning','-filter_complex_threads','4','-framerate','60','-start_number',str(start*60),'-i',str(root/'work/frames-v4/element-%05d.png'),'-ss',str(max(0,start-2/60)),'-i',str(root/'work/film/public/artwork.mp4'),'-i',str(mask),'-ss',str(start),'-i',str(root/'work/film/public/soundtrack.m4a'),'-filter_complex',f,'-map','[v]','-map','3:a:0','-t',str(length),'-c:v','libx264','-preset','fast','-crf','17','-profile:v','high','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-color_range','tv','-c:a','copy','-movflags','+faststart','-progress',str(root/'work/tiktok-progress.txt'),str(out)]
subprocess.run(args,check=True)
print(out)
