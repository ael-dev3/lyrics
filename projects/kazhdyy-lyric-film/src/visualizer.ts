import raw from '../public/vocal-energy.json' with {type:'json'};
import {clamp,smooth} from './motion.ts';
if(raw.fps!==60||raw.frames!==12798||raw.dbfs.length!==raw.frames||raw.dbfs.some(v=>!Number.isFinite(v))||raw.calibration.ceilingDb<=raw.calibration.floorDb)throw Error('Invalid vocal-energy artifact');
export function vocalDrive(frame:number){
 const db=raw.dbfs[Math.max(0,Math.min(raw.frames-1,frame))]??-120;
 return clamp((db-raw.calibration.floorDb)/(raw.calibration.ceilingDb-raw.calibration.floorDb))**raw.calibration.exponent;
}
export function emphasisAt(frame:number){
 const t=frame/60;
 // Transition ramps stay inside the requested intervals. At 2:55 medium
 // moves directly into high emphasis; there is no dip through normal size.
 const first=t>=70&&t<88?smooth((t-70)/.3)*(1-smooth((t-87.7)/.3)):0;
 const second=t>=158&&t<175?smooth((t-158)/.3):0;
 const high=t>=175&&t<190?smooth((t-175)/.3)*(1-smooth((t-189.7)/.3)):0;
 const join=t>=175&&t<175.3?1-smooth((t-175)/.3):0;
 return {medium:Math.max(first,second,join),high};
}
export function travelAt(frame:number){
 const e=emphasisAt(frame),vocal=vocalDrive(frame);
 return 36+e.medium*(54+18*vocal)+e.high*(134+124*vocal);
}
export function barHeight(db:number,travel:number){return 3+clamp((db+64)/55)**1.35*travel;}
export function spectrumHeights(frame:number,values:number[]){const travel=travelAt(frame);return values.map(db=>barHeight(db,travel));}
