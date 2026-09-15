import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Film} from './Film';
import {LayoutAudit} from './LayoutAudit';
import {FRAMES,FPS} from './config';
const Root=()=> <><Composition id="PolovinkaYouTube" component={Film} durationInFrames={FRAMES} fps={FPS} width={1920} height={1080}/><Composition id="PolovinkaTikTok" component={Film} defaultProps={{portrait:true}} durationInFrames={FRAMES} fps={FPS} width={1080} height={1920}/><Composition id="LayoutYouTube" component={LayoutAudit} durationInFrames={24} fps={60} width={1920} height={1080}/><Composition id="LayoutTikTok" component={LayoutAudit} defaultProps={{portrait:true}} durationInFrames={24} fps={60} width={1080} height={1920}/></>;
registerRoot(Root);
