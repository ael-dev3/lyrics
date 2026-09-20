import raw from './cues.json' with {type:'json'};
import {parseData} from './schema.ts';
export const timedLyrics=parseData(raw);
