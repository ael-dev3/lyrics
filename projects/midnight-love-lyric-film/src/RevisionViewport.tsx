import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Film} from './Film';
import {REVISION_VIEWPORTS} from './viewport-config';
export {REVISION_VIEWPORTS} from './viewport-config';

// The composition controls only the capture rectangle. The positioned parent
// preserves Film's original layout and percentage-gradient coordinate system.
// No Sequence/Freeze shifts the global frame clock or the source video time.
export const RevisionViewport: React.FC<{portrait?: boolean}> = ({portrait = false}) => {
  const viewport = REVISION_VIEWPORTS[portrait ? 'tiktok' : 'youtube'];
  return <AbsoluteFill style={{overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: -viewport.x, top: -viewport.y, width: viewport.fullWidth, height: viewport.fullHeight, willChange: 'transform'}}>
      <Film portrait={portrait}/>
    </div>
  </AbsoluteFill>;
};
