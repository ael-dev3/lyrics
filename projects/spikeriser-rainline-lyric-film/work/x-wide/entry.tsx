import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {DURATION_SECONDS} from '../../src/config.ts';
import {XScene} from './Scene.tsx';
registerRoot(() => <Composition id="Rainline-X-Wide" component={XScene} width={1920} height={1080} fps={30} durationInFrames={Math.ceil(DURATION_SECONDS*30)} defaultProps={{deliveryPermit:false}}/>);
