from pathlib import Path
import argparse,json,zlib,struct,subprocess
import numpy as np,soundfile as sf
H=Path(__file__).resolve().parent
p=argparse.ArgumentParser();p.add_argument('--all-russian',action='store_true');p.add_argument('--window',nargs=3);args=p.parse_args()
x,sr=sf.read(str(H/'original-mix-44100.wav'));v,vs=sf.read(str(H/'stems/htdemucs/source/vocals.wav'));assert sr==vs==44100
x=x.mean(axis=1);v=v.mean(axis=1)
if args.all_russian:windows=[(row['id'],max(0,row['crop'][0]-.6),min(len(x)/sr,row['crop'][1]+.7)) for row in json.loads((H.parent/'russian-phrases.json').read_text())]
else:windows=[(args.window[0],float(args.window[1]),float(args.window[2]))]
W=1900;HEIGHT=760;LEFT=88;RIGHT=35;BW=W-LEFT-RIGHT
OUT=H/'panels';OUT.mkdir(exist_ok=True)
def chunk(tag,data):return struct.pack('!I',len(data))+tag+data+struct.pack('!I',zlib.crc32(tag+data)&0xffffffff)
def write_png(path,rgb):
 hh,ww,_=rgb.shape;raw=b''.join(b'\0'+row.tobytes() for row in rgb)
 path.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',ww,hh,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw,6))+chunk(b'IEND',b''))
for name,lo,hi in windows:
 rgb=np.zeros((HEIGHT,W,3),dtype=np.uint8)+[15,17,22];annotations=[]
 words=[];cp=H/f'ctc-{name}.json'
 if cp.exists():words=json.loads(cp.read_text())['words']
 def xp(t):return int(round(LEFT+(t-lo)/(hi-lo)*BW))
 for row,data in enumerate([x,v]):
  yy=58+row*320;a,b=round(lo*sr),round(hi*sr);part=data[a:b]
  frames=np.lib.stride_tricks.sliding_window_view(part,1024)[::88];fft=np.abs(np.fft.rfft(frames*np.hanning(1024),axis=1))/512
  freqs=np.fft.rfftfreq(1024,1/sr);want=np.geomspace(100,10000,205)[::-1];positions=np.arange(fft.shape[0]);centers=(np.arange(len(frames))*88+512)/sr+lo
  columns=np.linspace(lo,hi,BW)
  spec=np.array([np.interp(columns,centers,np.interp(f,freqs,fft.T),left=0,right=0) for f in want]) if False else None
  # Interpolate frequency and display columns independently; window support
  # remains23.22ms even though numerical hop is1.995ms.
  fp=want/(sr/1024);i=np.floor(fp).astype(int);u=fp-i
  levels=(fft[:,i]*(1-u)+fft[:,i+1]*u).T
  rows=np.array([np.interp(columns,centers,z,left=0,right=0) for z in levels]);db=20*np.log10(rows+1e-9);norm=np.clip((db+82)/65,0,1)
  color=np.stack([np.clip(norm*1.7,0,1),np.clip((norm-.2)*1.65,0,1),np.clip((norm-.48)*2.3,0,1)],axis=2)
  rgb[yy:yy+205,LEFT:LEFT+BW]=np.uint8(color*255)
  # Min/max original samples in each display pixel retain quiet closures.
  for col in range(BW):
   aa=max(0,int(col*len(part)/BW));bb=min(len(part),max(aa+1,int((col+1)*len(part)/BW)));z=part[aa:bb]
   mn,mx=float(z.min()),float(z.max());center=yy+241
   y1=max(yy+211,min(yy+271,int(center-mx*70)));y2=max(yy+211,min(yy+271,int(center-mn*70)))
   rgb[min(y1,y2):max(y1,y2)+1,LEFT+col]=[100,184,195]
  for j,w in enumerate(words):
   for key,color in [('startSeconds',[246,186,93]),('endSeconds',[129,95,56])]:
    xx=xp(w[key]);
    if LEFT<=xx<LEFT+BW:rgb[yy:yy+274,xx:xx+2]=color
   annotations.append({'x':xp(w['startSeconds'])+2,'y':yy+279,'text':f"{j}:{w['text']}",'color':'#efbd76'})
  for t in np.arange(np.ceil(lo*2)/2,hi,.5):
   xx=xp(t);rgb[yy+268:yy+275,max(0,xx):min(W,xx+1)]=[210,220,227]
   if hi-lo<=9 or round(t*2)%2==0:annotations.append({'x':xx-11,'y':yy+305,'text':f'{t:.1f}','color':'#d7dde5'})
  annotations.append({'x':7,'y':yy+8,'text':'mix' if row==0 else 'vocal','color':'#d7dde5'})
 annotations.append({'x':LEFT,'y':10,'text':f'{name} | original source/stem on unchanged clock | amber CTC core bounds | FFT1024 / hop88 @44100 (23.22ms support)','color':'#d7dde5'})
 png=OUT/(name+'.png');write_png(png,rgb.astype('uint8'));specification=OUT/(name+'.labels.json');specification.write_text(json.dumps(annotations,ensure_ascii=False))
 code="""import sys,json\nfrom PIL import Image,ImageDraw,ImageFont\np=sys.argv[1];im=Image.open(p);d=ImageDraw.Draw(im);font=ImageFont.truetype('/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc',17)\nfor row in json.load(open(sys.argv[2])):d.text((row['x'],row['y']),row['text'],font=font,fill=row['color'])\nim.save(p)\n"""
 subprocess.run(['python3','-c',code,str(png),str(specification)],check=True)
 print(name,flush=True)
