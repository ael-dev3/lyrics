import {readFileSync,writeFileSync} from 'node:fs';
let s=readFileSync('scripts/encode-frames.ts','utf8').replaceAll('frames-v3','frames-v4').replaceAll('encode-v3-progress','encode-v4-progress');
s=s.replace("'-i','public/hero-alpha.pgm','-filter_complex'","'-i','public/hero-alpha.pgm','-i','../static-scrim.png','-filter_complex'");
s=s.replace('[art][0:v]overlay=0:0:shortest=1:format=auto,',"[4:v]format=rgba,loop=loop=-1:size=1:start=0,setpts=N/(60*TB)[static];[static][0:v]overlay=0:0:shortest=1:format=auto[gfx0];[gfx0]${test?'null':'fade=t=in:st=0:d=1.2:alpha=1,fade=t=out:st=376.883333:d=2.5:alpha=1'}[gfx];[art][gfx]overlay=0:0:shortest=1:format=auto,");
writeFileSync('scripts/encode-cached.ts',s);
s=readFileSync('scripts/finish-v3.ts','utf8').replaceAll('frames-v3','frames-v4').replace('scripts/encode-frames.ts','scripts/encode-cached.ts');writeFileSync('scripts/finish-cached.ts',s);
