import raw from './cues.json' with {type:'json'};
export const rasterEntries=[...['stars','labels','moon-light','moon-atmosphere','moon-shade','title-layer'].map(layer=>({key:layer,layer,cueId:'',active:''})),...raw.cues.flatMap(c=>['',...c.fr.map(w=>w.id)].map(active=>({key:c.id+'-'+(active||'idle'),layer:'lyric-layer',cueId:c.id,active})))];
