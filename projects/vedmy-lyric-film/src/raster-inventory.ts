import raw from './cues.json' with {type:'json'};
export const rasterEntries=[...['background','labels','idle'].map(layer=>({key:layer,layer,cueId:'',active:''})),...raw.cues.flatMap(c=>['',...c.ru.map(w=>w.id)].map(active=>({key:c.id+'-'+(active||'idle'),layer:'lyrics',cueId:c.id,active})))];
