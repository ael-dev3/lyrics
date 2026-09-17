import React from 'react';
import {Composition,registerRoot,useCurrentFrame} from 'remotion';
import {PreviewStill} from './Still.tsx';
import raw from './cues.json';
import type {Format} from './schema.ts';
// Production evaluates the exact approved preview scene at each global frame.
function Film({format='landscape'}:{format?:Format}){return <PreviewStill format={format} at={useCurrentFrame()/raw.fps}/>;}
function Root(){return <>{(['landscape','portrait'] as const).map(format=><Composition key={format} id={format} component={Film} fps={raw.fps} durationInFrames={raw.frames} width={format==='landscape'?1920:1080} height={format==='landscape'?1080:1920} defaultProps={{format}}/>)}</>;}
registerRoot(Root);
