import {readFileSync,writeFileSync} from 'node:fs';
const data=JSON.parse(readFileSync('../vocal-features.json','utf8')) as number[][];
const start=Math.round(Number(process.argv[2]??22.75)*60),len=Math.round(Number(process.argv[3]??2.8)*60);
const values=data.map(row=>row.slice(22,52));
const template=values.slice(start,start+len);
const sums=new Float64Array(values.length+1),squares=new Float64Array(values.length+1);
for(let i=0;i<values.length;i++){const row=values[i]??[];sums[i+1]=(sums[i]??0)+row.reduce((a,b)=>a+b,0);squares[i+1]=(squares[i]??0)+row.reduce((a,b)=>a+b*b,0);}
const total=len*30,mean=((sums[start+len]??0)-(sums[start]??0))/total;
const varT=(squares[start+len]??0)-(squares[start]??0)-total*mean*mean;
const peaks:{time:number;score:number}[]=[];
for(let offset=0;offset<values.length-len;offset+=2){let dot=0;for(let t=0;t<len;t+=2){const a=template[t]??[],b=values[offset+t]??[];for(let band=0;band<30;band++)dot+=((a[band]??0)-mean)*(b[band]??0)*2;}
const sum=(sums[offset+len]??0)-(sums[offset]??0),variance=(squares[offset+len]??0)-(squares[offset]??0)-sum*sum/total;
peaks.push({time:offset/60,score:dot/Math.sqrt(varT*variance+1e-9)});}
peaks.sort((a,b)=>b.score-a.score);const selected:typeof peaks=[];
for(const p of peaks)if(selected.every(s=>Math.abs(s.time-p.time)>2.8))selected.push(p);
console.log(selected.slice(0,35).sort((a,b)=>a.time-b.time));
writeFileSync(`../matches-${start}.json`,JSON.stringify(selected));
