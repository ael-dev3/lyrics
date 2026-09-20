import {AbsoluteFill,Audio,staticFile,useCurrentFrame} from 'remotion';
import {sceneSvg} from './scene.ts';
import {timedLyrics} from './timed-lyrics.ts';
import type {Format} from './schema.ts';
import type {Layouts} from './layout-types.ts';
import layouts from './layout.json';
import bands from '../public/science.json';
export function LyricFilm({format}:{format:Format}){
 const frame=useCurrentFrame();
 return <AbsoluteFill><style>{`@font-face{font-family:EmberSerif;font-weight:600;src:url(${staticFile('fonts/CormorantGaramond-Semibold.ttf')})}`}</style><AbsoluteFill dangerouslySetInnerHTML={{__html:sceneSvg(frame,format,timedLyrics,layouts as Layouts,bands,staticFile('artwork.png').replace('artwork.png',''))}}/><Audio src={staticFile('soundtrack.m4a')}/></AbsoluteFill>;
}
