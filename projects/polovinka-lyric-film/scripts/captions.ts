import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const cues=JSON.parse(readFileSync('src/cues.json','utf8')) as {startSample:number;endSample:number;ruText:string;enText:string}[];
mkdirSync('publishing/captions',{recursive:true});
const stamp=(s:number,web=false)=>{const ms=Math.round(s*1000),h=Math.floor(ms/3600000),m=Math.floor(ms/60000)%60,sec=Math.floor(ms/1000)%60;return [h,m,sec].map(x=>String(x).padStart(2,'0')).join(':')+(web?'.':',')+String(ms%1000).padStart(3,'0');};
for(const lang of ['ru','en','ru-en'])for(const ext of ['srt','vtt']){
 const lines=cues.map((c,i)=>`${ext==='srt'?i+1+'\n':''}${stamp(c.startSample/48000,ext==='vtt')} --> ${stamp(Math.min(c.endSample/48000+.25,cues[i+1]?cues[i+1]!.startSample/48000-.04:Infinity),ext==='vtt')}\n${lang==='ru'?c.ruText:lang==='en'?c.enText:c.ruText+'\n'+c.enText}\n`).join('\n');
 writeFileSync('publishing/captions/Polovinka-'+lang+'.'+ext,(ext==='vtt'?'WEBVTT\n\n':'')+lines);
}
console.log('Created Russian, English and bilingual SRT / VTT files.');
