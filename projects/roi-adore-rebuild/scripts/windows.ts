import {readFileSync,writeFileSync} from 'node:fs';
type Window={start:number;end:number;text:string};
const french:Window[]=[];
const refrainA="Aime-moi dans la neige, aime-moi sous le soleil";
const refrainB="Aime-moi la peau beige dans les fleurs de vermeille";
const english:Window[]=[];
function add(target:Window[],start:number,end:number,text:string){target.push({start,end,text});}
const sourceF=JSON.parse(readFileSync('../french-lines.json','utf8')) as string[];
const sourceE=JSON.parse(readFileSync('../english-lines.json','utf8')) as string[];
const verseTimes=[42.35,44.8,46.92,49.04,51.14,53.16,55.26,57.46,59.7,61.76,63.82,66.16,68.26];
for(let i=0;i<12;i++)add(french,verseTimes[i]??0,verseTimes[i+1]??0,sourceF[i+4]??'');
for(const times of [[68.26,72.60,76.96,81.2,85.65],[119.7,123.95,128.34,132.52,136.94,141.22,145.24],[248.25,252.6,256.66,261.08,265.5]]){
 for(let i=0;i<times.length-1;i++)add(french,times[i]??0,times[i+1]??0,sourceF[16+i%2]??'');
}
const v2=[145.24,146.5,148.62,149.2,152.02,154.22,156.5,158.72,160.92,163.1,164.72,165.84,166.90,168.05];
for(let i=0;i<13;i++)add(french,v2[i]??0,v2[i+1]??0,sourceF[20+i]??'');
const e1=[7.7,12.45,17.2,22.75,25.8];
for(let i=0;i<4;i++)add(english,e1[i]??0,e1[i+1]??0,sourceE[i]??'');
for(const start of [31.05,39.5,100.0,108.15,116.65])add(english,start,start+3.2,sourceE[3]??'');
const e2=[85.55,89.5,94.2,100.0];
for(let i=0;i<3;i++)add(english,e2[i]??0,e2[i+1]??0,sourceE[i+5]??'');
for(const [name,rows] of [['fr',french],['en',english]] as const){
 rows.sort((a,b)=>a.start-b.start);
 const expanded=rows.map(s=>({...s,start:Math.max(0,s.start-.22),end:s.end+.18}));
 for(let i=0;i<expanded.length-1;i++){const a=expanded[i],b=expanded[i+1];if(a&&b&&a.end>b.start){const boundary=(a.end+b.start)/2;a.end=boundary;b.start=boundary;}}
 writeFileSync(`../windows-${name}.json`,JSON.stringify(expanded,null,2));
}
