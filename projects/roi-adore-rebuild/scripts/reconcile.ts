import {readFileSync,writeFileSync} from 'node:fs';
type W={word:string;start:number;end:number;probability:number};type S={text:string;words:W[]};type Word={text:string;start:number;end:number};type Cue={id:string;lang:string;text:string;start:number;end:number;words:Word[];evidence:string};
const cues=JSON.parse(readFileSync('src/cues.json','utf8')) as Cue[],features=JSON.parse(readFileSync('../vocal-features.json','utf8')) as number[][];
const norm=(x:string)=>x.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z]/g,'');
const newer=new Map<string,W[]>(),older=new Map<string,W[]>();
for(const lang of ['fr','en']){const a=(JSON.parse(readFileSync(`../rechecked-${lang}.json`,'utf8')) as {segments:S[]}).segments;cues.filter(c=>c.lang===lang).forEach((c,i)=>{const s=a[i]!;if(norm(s.text)!==norm(c.text))throw Error('Text mismatch');newer.set(c.id,s.words.map((w,j)=>({...w,start:j===0?c.start:w.start+.0365,end:w.end+.0365})));});}
const read=(p:string)=>(JSON.parse(readFileSync(p,'utf8')) as {segments:S[]}).segments;
read('../aligned-fr.json').forEach((s,i)=>older.set(`fr-${String(i+1).padStart(3,'0')}`,s.words.map(w=>({...w,start:w.start+.0365,end:w.end+.0365}))));
read('../aligned-en.json').forEach((s,i)=>older.set(`en-${String(i+40).padStart(3,'0')}`,s.words.map(w=>({...w,start:w.start+.0365,end:w.end+.0365}))));
read('../extra-aligned-en.json').forEach((s,i)=>older.set(`en-${String(i+52).padStart(3,'0')}`,s.words.map(w=>({...w,start:w.start+.0365,end:w.end+.0365}))));
const verse=read('../verse3-aligned.json');[-34.2334,-25.6667,-17.1,-8.5667,0].forEach((shift,i)=>verse.forEach((s,j)=>older.set(`fr-${62+i*2+j}`,s.words.map(w=>({...w,start:w.start+.0365+shift,end:w.end+.0365+shift})))));
function clip(c:Cue){const start=Math.round((c.start-.0365-.08)*100),end=Math.round((c.end-.0365+.08)*100),rows=features.slice(start,end),mean=Array.from({length:32},(_,i)=>rows.reduce((s,r)=>s+(r[i]??0),0)/rows.length);return {start,rows:rows.map(r=>{const v=r.map((x,i)=>x-(mean[i]??0)),len=Math.sqrt(v.reduce((s,x)=>s+x*x,0));return v.map(x=>x/Math.max(1e-9,len));})};}
function warp(a:Cue,b:Cue){const x=clip(a),y=clip(b),n=x.rows.length,m=y.rows.length,dp=new Float64Array(n*m).fill(Infinity),path=new Uint8Array(n*m);const dot=(i:number,j:number)=>x.rows[i]!.reduce((s,v,k)=>s+v*(y.rows[j]?.[k]??0),0);
 for(let i=0;i<n;i++)for(let j=Math.max(0,Math.floor(i*m/n)-40);j<Math.min(m,Math.ceil(i*m/n)+41);j++){const p=i*m+j,cost=1-dot(i,j);if(i===0&&j===0){dp[p]=cost;continue;}let val=Infinity,dir=0;for(const [v,d] of [[i>0&&j>0?dp[(i-1)*m+j-1]!:Infinity,0],[i>0?dp[(i-1)*m+j]!+.08:Infinity,1],[j>0?dp[i*m+j-1]!+.08:Infinity,2]])if(v!<val){val=v!;dir=d!;}dp[p]=cost+val;path[p]=dir;}
 const links:number[][]=Array.from({length:n},()=>[]);let i=n-1,j=m-1,total=0,count=0;while(i>=0&&j>=0){links[i]!.push(j);total+=dot(i,j);count++;if(i===0&&j===0)break;const d=path[i*m+j];if(d===0){i--;j--;}else if(d===1)i--;else j--;}
 const map=(t:number)=>{const k=Math.max(0,Math.min(n-1,Math.round((t-.0365)*100)-x.start)),hits=links[k]!;return (y.start+hits.reduce((s,v)=>s+v,0)/Math.max(1,hits.length))/100+.0365;};return {score:total/count,map};}
const audit:unknown[]=[];let individual=0,grouped=0;
for(const c of cues){const nw=newer.get(c.id)!,old=older.get(c.id)??[],pool=cues.filter(p=>p.id!==c.id&&p.lang===c.lang&&norm(p.text)===norm(c.text)&&Math.abs((p.end-p.start)/(c.end-c.start)-1)<.2&&(newer.get(p.id)??[]).reduce((s,w)=>s+w.probability,0)/(newer.get(p.id)?.length??1)>.55);
 let best:{source:Cue;score:number;map:(t:number)=>number}|undefined;
 for(const p of pool){const match=warp(p,c);if(!best||match.score>best.score)best={source:p,...match};}
 const source=best?newer.get(best.source.id):undefined,words:Word[]=[],details:unknown[]=[];
 for(let i=0;i<nw.length;i++){const w=nw[i]!,o=old[i],r=source?.[i],agreement=o&&norm(o.word)===norm(w.word)?Math.max(Math.abs(w.start-o.start),Math.abs(w.end-o.end)):Infinity;
 let start=w.start,end=w.end,method='vocal-stem alignment';let reliable=(w.probability>=.35||agreement<=.10)&&end-start>=.045;
 if(best&&best.score>.62&&r&&norm(r.word)===norm(w.word)){const a=best.map(r.start),b=best.map(r.end),spread=Math.max(Math.abs(a-start),Math.abs(b-end));if(best.score>.88||spread<.16){start=a;end=b;reliable=end-start>=.045;method='measured repeat DTW';}}
 if(i===0)start=c.start;start=Math.max(c.start,start);end=Math.min(c.end,end);
 const previous=words.at(-1);if(previous&&start<previous.end)previous.end=Math.max(previous.start+.0167,start);
 if((!reliable||end-start<.035)&&previous){previous.text+=' '+w.word.trim();previous.end=Math.max(previous.end,end);grouped++;}else{words.push({text:w.word.trim(),start,end:Math.max(start+.0167,end)});individual++;}
 details.push({text:w.word.trim(),method,modelProbability:w.probability,alignmentSpreadSeconds:Number.isFinite(agreement)?agreement:null,reliable});
 }
 c.words=words;c.end=Math.max(c.end,words.at(-1)?.end??0);c.evidence='Vocal-stem re-alignment; independent prior timing comparison; measured repeat DTW where corroborated; uncertainty groups retained';audit.push({id:c.id,repeat:best?{source:best.source.id,score:best.score}:null,groups:words.length,lexicalWords:nw.length,details});
}
writeFileSync('../reconciled-cues.json',JSON.stringify(cues,null,2));writeFileSync('../reconciliation-audit.json',JSON.stringify({individual,grouped,cues:audit},null,2));console.log({individual,grouped});console.log(audit.map(x=>{const a=x as {id:string;repeat:unknown;groups:number};return {id:a.id,repeat:a.repeat,groups:a.groups};}));
