import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Film} from './Film';
import {LayoutAudit} from './LayoutAudit';
import {RevisionViewport,REVISION_VIEWPORTS} from './RevisionViewport';
import cues from './cues.json';
import {FRAMES,FPS} from './config';
const Root:React.FC=()=> <><Composition id="MidnightYouTube" component={Film} width={1920} height={1080} fps={FPS} durationInFrames={FRAMES}/><Composition id="MidnightTikTok" component={Film} defaultProps={{portrait:true}} width={1080} height={1920} fps={FPS} durationInFrames={FRAMES}/><Composition id="MidnightYouTubeViewport" component={RevisionViewport} width={REVISION_VIEWPORTS.youtube.width} height={REVISION_VIEWPORTS.youtube.height} fps={FPS} durationInFrames={FRAMES}/><Composition id="MidnightTikTokViewport" component={RevisionViewport} defaultProps={{portrait:true}} width={REVISION_VIEWPORTS.tiktok.width} height={REVISION_VIEWPORTS.tiktok.height} fps={FPS} durationInFrames={FRAMES}/><Composition id="LayoutYouTube" component={LayoutAudit} width={1920} height={1080} fps={FPS} durationInFrames={Math.max(2,cues.length*2)}/><Composition id="LayoutTikTok" component={LayoutAudit} defaultProps={{portrait:true}} width={1080} height={1920} fps={FPS} durationInFrames={Math.max(2,cues.length*2)}/></>;
registerRoot(Root);
