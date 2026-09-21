export const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export const ease=(x:number)=>{const p=clamp(x);return p*p*(3-2*p);};
// Artistic intensity belongs to the arrangement; it never edits lyric timing.
export const score=[
 [0,.10],[24.8,.10],[26,.30],[43,.43],[47.7,.15],[50.2,.52],
 [75.8,.58],[77.1,.76],[96,.86],[101.05,.86],[101.55,.10],
 [102.40,.10],[102.70,1],[128.55,1],[129.1,.16],[132.8,.16],
 [134,.34],[156.6,.34],[159,.60],[172.5,.65],[173.3,.25],
 [178.8,.55],[179.55,1],[211.6,1],[213.3,.14],[222.2,.14],[227.718,0]
] as const;
export function strengthAt(t:number){for(let i=1;i<score.length;i++){const a=score[i-1]!,b=score[i]!;if(t<b[0])return a[1]+(b[1]-a[1])*ease((t-a[0])/(b[0]-a[0]));}return 0;}
export const chapters=[{time:0,name:'Opening'},{time:25.5,name:'Lift'},{time:50.5,name:'Chorus I'},{time:77,name:'Build'},{time:102.7,name:'Drop I'},{time:133.5,name:'Verse II'},{time:159,name:'Chorus II'},{time:179.6,name:'Drop II'},{time:217,name:'Ending'}];
export function mixAt(t:number){return Math.max(...[[102.4,102.7,128.55,129.1],[179.25,179.55,211.6,213.3]].map(([a,b,c,d])=>ease((t-a!)/(b!-a!))*(1-ease((t-c!)/(d!-c!)))));}
