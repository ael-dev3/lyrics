import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {parseCues} from '../src/schema.ts';
import {FONT,PHONETIC_FONT,WIDTH,HEIGHT,FPS,FRAMES} from '../src/config.ts';
import {textWidth} from './geometry.ts';
import {pronounce} from './pronunciation.ts';
const doc=JSON.parse(readFileSync('src/landscape-cues.json','utf8')),cues=parseCues(doc);
const pronunciation=JSON.parse(readFileSync('source/pronunciation-es-ar.json','utf8'));
const map=JSON.parse(readFileSync('source/semantic-map.json','utf8'));
const stamp=(t:number,separator=',')=>{const ms=Math.round(t*1000);return `${String(Math.floor(ms/3600000)).padStart(2,'0')}:${String(Math.floor(ms/60000)%60).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}${separator}${String(ms%1000).padStart(3,'0')}`;};
mkdirSync('output/subtitles',{recursive:true});
for(const lang of ['ru','es','phonetic','three-layers'] as const){
 const lines=cues.map((c,i)=>`${i+1}\n${stamp(c.displayStart??c.start)} --> ${stamp(c.displayEnd??c.end)}\n${lang==='three-layers'?[c.ru.join(' '),c.phonetic.join(' '),c.es.join(' ')].join('\n'):c[lang].join(' ')}\n`).join('\n');
 writeFileSync(`output/subtitles/Life-Letters-${lang}.srt`,lines);
}
const rows=cues.map(c=>({id:c.id,ru:c.ruRows.length,es:c.esRows.length,ruWidths:c.ruRows.map(r=>r.reduce((n,i)=>n+Math.max(textWidth(c.ru[i]??''),textWidth(c.phonetic[i]??'',PHONETIC_FONT,false)),0)+20*(r.length-1)),esWidths:c.esRows.map(r=>r.reduce((n,i)=>n+textWidth(c.es[i]??''),0)+20*(r.length-1))}));
const allEvents=cues.flatMap(c=>c.events);
for(const c of cues){
 for(const [i,w] of c.words.entries())if(w.end>w.start){
  if(w.start<c.start-.001||w.end>c.end+.001)throw Error('Word outside cue: '+c.id);
  if(!c.phonetic[i])throw Error('Missing word pronunciation');
 }
 if((c.displayStart??c.start)>c.start||(c.displayEnd??c.end)<c.end)throw Error('Display cuts vocal: '+c.id);
}
const coverage:{start:number,end:number,type:string,cue?:string}[]=[];let cursor=0;
for(const c of cues){if(c.start>cursor)coverage.push({start:cursor,end:c.start,type:cursor>231?'source tail / credits':'instrumental, breath, decay or unclassified processed texture'});coverage.push({start:c.start,end:c.end,type:c.texture?'reused vocal fragment with contextual lyric':'lexical lyric',cue:c.id});cursor=c.end;}
if(cursor<261.526)coverage.push({start:cursor,end:261.526,type:'fading source audio and original credit tail'});
writeFileSync('evidence/composition-audit.json',JSON.stringify({size:[WIDTH,HEIGHT],FPS,FRAMES,audioDuration:261.526,videoDuration:FRAMES/FPS,fontSizes:{ru:FONT,es:FONT,phonetic:PHONETIC_FONT},cues:cues.length,wordEntries:cues.reduce((n,c)=>n+c.words.length,0),focusEvents:allEvents.length,characterHolds:allEvents.filter(e=>e.held).length,rows,coverage,limits:'Model-based phoneme and lexical timing is not a native-listener ground truth; transformed vowel timbre is not always uniquely classifiable.'},null,2));
writeFileSync('output/Pronunciacion-para-Argentina.md',`# Life Letters · guía de pronunciación\n\nLa línea pequeña debajo del ruso ayuda a seguir la voz. Es una aproximación pensada para hablantes de español rioplatense; no es una transcripción fonética exacta.\n\n${pronunciation.rules.map((s:string)=>'- '+s).join('\n')}\n\nEn los tramos marcados «ECO VOCAL», la palabra tenue conserva el contexto: no se vuelve a cantar completa. El brillo acompaña el sonido real. La letra destacada indica las partes de la vocal que se pueden identificar con mayor seguridad; el resto del fragmento se sigue como una palabra.\n\n## Letra y lectura\n\n${map.phrases.map((p:{ru:string[],es:string[]},i:number)=>`${i+1}. **${p.ru.join(' ')}**  \n   ${pronounce(p.ru).join(' ')}  \n   ${p.es.join(' ')}\n`).join('\n')}\n\nLa grabación contiene repeticiones y fragmentos adicionales. Los subtítulos entregados siguen esa secuencia; la lista anterior conserva las frases del texto recibido. El final añade «на воде» — «sobre el agua», respaldado por la alineación y los fonemas del audio.\n\n## Referencias de pronunciación\n\n${pronunciation.sources.map((s:string,i:number)=>`- [Referencia ${i+1}](${s})`).join('\n')}\n`);
console.log({cues:cues.length,focusEvents:allEvents.length,characterHolds:allEvents.filter(e=>e.held).length,geometryMax:Math.max(...rows.flatMap(r=>[...r.ruWidths,...r.esWidths]))});
