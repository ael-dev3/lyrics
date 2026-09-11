export type Word={text:string;startSample:number;endSample:number};
export type Cue={id:string;section:string;words:Word[];groups:number[][];en:{text:string;words:number[]}[];startSample:number;endSample:number;echo?:boolean};
