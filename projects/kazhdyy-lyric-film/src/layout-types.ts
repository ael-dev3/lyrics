import type {Format} from './schema.ts';
export type Box={id:string;text:string;x:number;y:number;width:number};
export type CueLayout={ru:Box[];en:Box[];ruRows:number;enRows:number};
export type Layout={width:number;height:number;fontSize:number;lineHeight:number;safeX:number;cues:Record<string,CueLayout>};
export type Layouts=Record<Format,Layout>;
