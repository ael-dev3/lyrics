import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film.tsx';
import data from './cues.json';
export const Root:React.FC=()=> <>
 <Composition id="TvoiGlazaLandscape" component={Film} width={1920} height={1080} fps={60} durationInFrames={data.frames} defaultProps={{format:'landscape' as const}}/>
 <Composition id="TvoiGlazaPortrait" component={Film} width={1080} height={1920} fps={60} durationInFrames={data.frames} defaultProps={{format:'portrait' as const}}/>
</>;
