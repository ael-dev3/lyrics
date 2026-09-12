export function parseMatrix(value:unknown,columns:number,name:string):readonly (readonly number[])[]{
 if(!Array.isArray(value)||!value.length)throw Error(name+' must contain frames');
 return value.map((row:unknown,i)=>{if(!Array.isArray(row)||row.length!==columns||!row.every((v:unknown)=>typeof v==='number'&&Number.isFinite(v)))throw Error(name+' invalid row '+i);return row as number[];});
}
