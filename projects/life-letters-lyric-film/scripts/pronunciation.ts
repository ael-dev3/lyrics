import pronunciation from '../source/pronunciation-es-ar.json' with {type:'json'};
export const normalize=(s:string)=>s.toLowerCase().replace(/[^а-яё]/g,'');
export function pronounce(words:string[]):string[]{return words.map((w,i)=>{
 const key=normalize(w),d=pronunciation.words as Record<string,string>;
 let value=d[key];if(!value)throw Error('Missing pronunciation: '+w);
 if(key==='в'&&/^[пфктшсцчщ]/i.test(words[i+1]??''))value='f';
 // Preserve source punctuation, but not a Russian hard/soft sign as a spoken vowel.
 return value+(w.match(/[,.;:!?»]+$/)?.[0]??'');
});}
