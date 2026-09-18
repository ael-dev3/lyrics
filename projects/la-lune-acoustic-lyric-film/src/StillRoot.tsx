import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {PreviewStill} from './Still.tsx';
// One-frame diagnostic compositions only. Full-film rendering has a separate closed gate.
function Root(){return <><Composition id="PreviewLandscape" component={PreviewStill} durationInFrames={1} fps={60} width={1920} height={1080} defaultProps={{format:'landscape' as const,at:46.8}}/><Composition id="PreviewPortrait" component={PreviewStill} durationInFrames={1} fps={60} width={1080} height={1920} defaultProps={{format:'portrait' as const,at:103.5}}/></>;}
registerRoot(Root);
