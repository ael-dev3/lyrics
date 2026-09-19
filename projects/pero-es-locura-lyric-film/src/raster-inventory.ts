import raw from './cues.json' with {type:'json'};
export const rasterEntries=[{key:'metadata',cueId:'',mode:'metadata'},...raw.cues.flatMap(c=>['idle','active'].map(mode=>({key:c.id+'-'+mode,cueId:c.id,mode})))];
