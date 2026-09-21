import edit from '../source/trailer-edit.json' with {type:'json'};
export const montages=edit.montages;
export function montageAt(t:number){return montages.find(m=>t>=m.songStart&&t<m.songStart+m.duration);}
export function shotAt(t:number){const m=montageAt(t);if(!m)return undefined;const frame=Math.floor((t-m.songStart)*60+1e-6);return m.shots.find(s=>frame>=s.startFrame&&frame<s.startFrame+s.frames);}
