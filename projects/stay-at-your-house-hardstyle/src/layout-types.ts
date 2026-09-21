import type {Format} from './schema.ts';
export type WordBox={id:string;text:string;x:number;y:number;width:number};
export type CueLayout={fontSize:number;source:WordBox[];rows:number};
export type Layout={width:number;height:number;safeX:number;cues:Record<string,CueLayout>};
export type Layouts=Record<Format,Layout>;
