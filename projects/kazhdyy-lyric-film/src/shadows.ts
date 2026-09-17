import raw from '../public/shadow-events.json' with {type:'json'};
if(raw.fps!==60||raw.events.some((e,i)=>!Number.isSafeInteger(e.frame)||e.frame<0||(i>0&&e.frame<=raw.events[i-1]!.frame)))throw Error('Invalid shadow event map');
export function shadowSeed(frame:number){
 let index=-1;for(let i=0;i<raw.events.length;i++){if(raw.events[i]!.frame>frame)break;index=i;}
 if(index<0)return 1;
 const age=frame-raw.events[index]!.frame,phase=Math.floor(Math.min(4,age)/2);
 return 7+(index*3+phase)*17;
}
export const shadowOpacity=.2;
