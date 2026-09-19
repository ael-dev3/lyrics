import type {SourceWord, TargetWord} from './schema.ts';

export type FocusGroup = {id:string; targetIndices:number[]; sourceIndices:number[]; reason:string};
export type TranslationTemplate = {
  id:string; es:string; en:string;
  targets:{text:string; sourceIndices:number[]}[];
  note:string; focusGroups?:FocusGroup[];
};

// Lexical correspondence and complete English display focus are separate records.
// Group intervals are unions of real source events, never an enclosing time span.
export function translate(template:TranslationTemplate, words:SourceWord[], cueId:string, offset:number):TargetWord[] {
  const sourceIds=(indices:number[])=>indices.map(index=>{
    const word=words[index-1];
    if(!word)throw Error('Unknown source index in '+template.id);
    return word.id;
  });
  return template.targets.map((target,index)=>{
    const groups=template.focusGroups?.filter(group=>group.targetIndices.includes(index+1))??[];
    if(groups.length>1)throw Error('Overlapping English focus groups in '+template.id);
    const group=groups[0];
    return {id:cueId+'-e'+String(offset+index+1).padStart(2,'0'),text:target.text,
      sourceIds:sourceIds(target.sourceIndices),
      ...(group?{focusGroup:template.id+'/'+group.id,focusSourceIds:sourceIds(group.sourceIndices)}:{})};
  });
}
