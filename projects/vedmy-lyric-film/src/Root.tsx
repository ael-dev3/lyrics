import {Composition} from 'remotion';
import {LyricFilm} from './LyricFilm.tsx';
import {timedLyrics} from './timed-lyrics.ts';
export function Root(){return <><Composition id="VedmyLandscape" component={LyricFilm} defaultProps={{format:'landscape' as const}} width={1920} height={1080} fps={60} durationInFrames={timedLyrics.frames}/><Composition id="VedmyPortrait" component={LyricFilm} defaultProps={{format:'portrait' as const}} width={1080} height={1920} fps={60} durationInFrames={timedLyrics.frames}/></>;}
