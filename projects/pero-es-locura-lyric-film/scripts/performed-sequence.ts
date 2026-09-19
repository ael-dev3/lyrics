import {readFileSync,writeFileSync} from 'node:fs';
type Template={id:string;es:string;en:string;targets:{text:string;sourceIndices:number[]}[];note:string};
const templates=JSON.parse(readFileSync('source/translation-templates.json','utf8')) as Template[];
const all: {id:string;section:string;start:number;end:number;text:string;displayGroups:string[][]}[]=[];
function add(section:string,start:number,end:number,displayGroups:string[][]){
 const text=displayGroups.map(group=>{const joined=group.map(id=>{const t=templates.find(t=>t.id===id);if(!t)throw Error(id);return t.es;}).join(' ');return joined.replace(/^\p{L}/u,c=>c.toLocaleUpperCase('es'));}).join(' ');
 all.push({id:'P'+String(all.length+1).padStart(3,'0'),section,start,end,text,displayGroups});
}
function refrain(section:string,starts:number[],endings:number[]){
 for(let i=0;i<starts.length;i++){const start=starts[i],end=endings[i];if(start===undefined||end===undefined)throw Error('Refrain inventory');add(section,start,end,[['R1','R2'],i===3&&section!=='Opening refrain'?['R3']:['R3','R4']]);}
}
refrain('Opening refrain',[.25,5.1,9.95,14.75],[5.22,9.99,14.83,19.5]);
for(let i=0;i<4;i++)add('Opening heart refrain',[19.55,24.25,29.05,33.82][i]??0,[24.25,29.02,33.87,38.6][i]??0,[['B01'],['B02']]);
refrain('First returning refrain',[57.55,62.36,67.05,71.75],[62.4,67.0,71.75,75.65]);
add('Verse 1',99.25,103.06,[['V01'],['V02']]);
add('Verse 1',102.94,105.5,[['V03','V04']]);
add('Verse 1',105.22,107.72,[['V05']]);
add('Verse 1',107.59,109.61,[['V06']]);
add('Verse 1',109.48,111.88,[['V07']]);
add('Verse 1',111.72,113.97,[['V08']]);
add('Verse 1',113.78,117.16,[['V09','V10']]);
add('Verse 1',117.08,119.41,[['V11']]);
add('Verse 1',119.20,121.42,[['V12']]);
add('Verse 1',121.30,123.77,[['V13']]);
add('Verse 1',123.71,126.13,[['V14','V15']]);
add('Verse 1',125.99,128.45,[['V16','V17']]);
add('Verse 1',128.34,131.02,[['V18','V19']]);
refrain('Middle returning refrain',[132.29,137,141.6,146.31],[137.1,141.83,146.43,150.2]);
add('Verse 2',173.58,176.92,[['V20','V21']]);
add('Verse 2',176.80,179.33,[['V22']]);
add('Verse 2',179.25,181.03,[['V23']]);
add('Verse 2',180.95,184.25,[['V24'],['V25']]);
add('Verse 2',184.26,187.71,[['V26'],['V27']]);
add('Verse 2',187.67,190.09,[['V28','V29']]);
add('Verse 2',189.77,192.37,[['V30']]);
add('Verse 2',192.29,196.49,[['V31'],['V32']]);
add('Verse 2',197.29,199.1,[['V33']]);
add('Verse 2',198.97,201.1,[['V34']]);
add('Verse 2',201.03,203.66,[['V35','V36']]);
add('Verse 2',203.57,207,[['V37']]);
refrain('Final returning refrain',[207.08,211.82,216.42,221.02],[211.88,216.5,221.1,225.18]);
for(let i=0;i<4;i++)add('Final heart refrain',[225.54,230.18,234.81,239.46][i]??0,[230.46,235.12,239.76,244.2][i]??0,[['B01'],['B02']]);
add('Final verse',244.13,248.47,[['B03'],['B04']]);
add('Final verse',248.68,253.12,[['B05'],['B04']]);
add('Final verse',253.24,257.76,[['B06'],['B07']]);
add('Final verse',257.76,260.18,[['B08']]);
add('Final verse',260.30,267,[['B07']]);
add('Closing tag',288.6,290.45,[['B09']]);
writeFileSync('source/performed-sequence.json',JSON.stringify(all,null,2)+'\n');
writeFileSync('analysis/alignment-windows.json',JSON.stringify(all.map(({id,start,end,text})=>({id,start,end,text})),null,2)+'\n');
console.log({windows:all.length,displayCues:all.reduce((n,r)=>n+r.displayGroups.length,0),words:all.reduce((n,r)=>n+r.text.split(/\s+/).length,0)});
