export type Palette={name:string;ink:string;rest:string;active:string};
export const palette:Palette={name:'Autumn',ink:'#211411',rest:'#f0dfca',active:'#f4b47e'};
export const leafColors=['#ce824a','#c79b57','#b96342'] as const;
// The complete recording uses one fixed palette; arrangement changes never recolor the scene.
export function paletteAt(_time:number):Palette{return palette;}
