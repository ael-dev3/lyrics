import {readFileSync} from 'node:fs';
import {FONT,PHONETIC_FONT,LANE} from '../src/config.ts';
const metrics=JSON.parse(readFileSync('analysis/font-metrics.json','utf8')) as {unitsPerEm:number;widths:Record<string,number>};
export const textWidth=(s:string,size=FONT,upper=true)=>Array.from(upper?s.toUpperCase():s).reduce((a,c)=>a+(metrics.widths[c]??metrics.widths[c.normalize('NFD')[0]??'']??metrics.unitsPerEm*.6)*size/metrics.unitsPerEm+.1,0);
export function wrap(words:string[],phonetics?:string[]):number[][]{
 const result:number[][]=[];let row:number[]=[],used=0;
 for(const [i,word] of words.entries()){
  const w=Math.max(textWidth(word),phonetics?textWidth(phonetics[i]??'',PHONETIC_FONT,false):0);
  if(w>LANE)throw Error('Unbreakable token '+word);
  if(row.length&&used+20+w>LANE){
   // Keep short prepositions with the following word when the pair fits.
   const last=row.at(-1)??0;
   if(row.length>1&&/^(в|с|на|у|до|и|а|не|de|en|a|y|que|la|los|las|el|un|una|se|sin)$/i.test(words[last]??'')){
    row.pop();result.push(row);row=[last];used=Math.max(textWidth(words[last]??''),phonetics?textWidth(phonetics[last]??'',PHONETIC_FONT,false):0);
   }else{result.push(row);row=[];used=0;}
  }
  row.push(i);used+=w+(row.length>1?20:0);
 }
 if(row.length)result.push(row);return result;
}
