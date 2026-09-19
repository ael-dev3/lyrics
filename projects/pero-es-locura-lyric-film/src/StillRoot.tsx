import React from 'react';import {Composition,registerRoot} from 'remotion';import {PreviewStill} from './Still.tsx';
// Single-frame review images. These are not full-film production compositions.
function Root(){return <><Composition id="PreviewLandscape" component={PreviewStill} durationInFrames={1} fps={60} width={1920} height={1080} defaultProps={{format:'landscape' as const,at:109}}/><Composition id="PreviewPortrait" component={PreviewStill} durationInFrames={1} fps={60} width={1080} height={1920} defaultProps={{format:'portrait' as const,at:109}}/></>;}
registerRoot(Root);
