import React from 'react';
import {Composition,registerRoot} from 'remotion';
import {Film} from './Film';
import {LayoutAudit} from './LayoutAudit';
const Root:React.FC=()=> <><Composition id="PozharyYouTube" component={Film} width={1920} height={1080} fps={60} durationInFrames={9001}/><Composition id="PozharyTikTok" component={Film} defaultProps={{portrait:true}} width={1080} height={1920} fps={60} durationInFrames={9001}/><Composition id="LayoutYouTube" component={LayoutAudit} width={1920} height={1080} fps={60} durationInFrames={72}/><Composition id="LayoutTikTok" component={LayoutAudit} defaultProps={{portrait:true}} width={1080} height={1920} fps={60} durationInFrames={72}/></>;
registerRoot(Root);
