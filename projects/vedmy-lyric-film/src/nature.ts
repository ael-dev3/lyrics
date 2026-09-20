import type {Format} from './schema.ts';
export type NatureFrame={phase:number;breeze:number;gust:number};
export function natureAt(frame:number,rows:number[][]):NatureFrame{const row=rows[Math.min(rows.length-1,Math.max(0,frame))];if(!row||row.length!==3)throw Error('Missing nature motion');return {phase:row[0]??0,breeze:row[1]??0,gust:row[2]??0};}
const seed=(n:number)=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const smooth=(x:number)=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
export function leafAt(index:number,m:NatureFrame,format:Format){
 const portrait=format==='portrait',width=portrait?1080:1920,height=portrait?1920:1080,life=17+seed(index+10)*16;
 const age=(m.phase+seed(index+7)*life)%life,p=age/life;
 const side=index%4,base=side===0?seed(index+3)*170:side===1?790+seed(index+3)*210:side===2?width-80+seed(index+3)*80:180+seed(index+3)*540;
 const x=base+Math.sin(age*.36+index)*42+(seed(index+80)-.5)*p*130,y=-100+p*(height+200);
 const reading=portrait?smooth((y-1050)/110)*smooth((1790-y)/110):smooth((x-1030)/80)*smooth((y-325)/70)*smooth((830-y)/80);
 const faces=portrait?smooth((y-250)/70)*smooth((980-y)/100):smooth((y-80)/80)*smooth((880-y)/100);
 const center=smooth((x-160)/90)*smooth((880-x)/90);
 const clearance=(1-reading)*(1-.88*faces*center);
 const alpha=Math.sin(Math.PI*p)**.7*(index<20?.38:.65)*clearance;
 const size=(index<20?.32:.58)+seed(index+55)*.25,turn=age*(19+seed(index+5)*12)+index*38;
 const flip=.48+.52*Math.abs(Math.cos(age*.44+index));
 return {transform:`translate(${x.toFixed(3)} ${y.toFixed(3)}) rotate(${turn.toFixed(3)}) scale(${(size*flip).toFixed(4)} ${size.toFixed(4)})`,opacity:alpha};
}
export const leafSymbols=`<g id="birch-leaf"><path d="M0 0 C-29 -10 -30 -43 -3 -64 C2 -45 35 -28 0 0Z" fill="currentColor"/><path d="M0 5 L-3 -56 M-2 -16 L-15 -26 M-2 -30 L-17 -38 M-2 -21 L12 -36 M-3 -41 L4 -49" fill="none" stroke="var(--forest-ink)" stroke-width="1.25" opacity=".65"/></g><g id="oak-leaf"><path d="M0 0 C-14 -4 -19 -15 -10 -18 C-33 -26 -26 -39 -14 -36 C-24 -52 -12 -64 -6 -57 C-4 -74 10 -74 9 -56 C27 -66 26 -43 17 -42 C37 -32 28 -19 13 -22 C24 -10 11 -1 0 0Z" fill="currentColor"/><path d="M0 4 Q4 -27 2 -62 M3 -20 L-13 -30 M3 -32 L17 -42 M2 -43 L-9 -51" fill="none" stroke="var(--forest-ink)" stroke-width="1.3" opacity=".6"/></g>`;
// A single-sided, flat spectrum keeps organic scenery separate from measured sound.
export function spectrumPath(index:number,value:number,max:number,cx:number,base:number,width:number){const x=cx-width/2+index*width/64,height=2+value*max;return `M${x} ${base} L${x} ${base-height} L${x+4} ${base-height} L${x+4} ${base}Z`;}
