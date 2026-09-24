import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {DURATION_SECONDS} from '../../src/config.ts';
import {XScene} from './Scene.tsx';
registerRoot(() => <Composition id="Rainline-X" component={XScene} width={1080} height={1900} fps={30} durationInFrames={Math.ceil(DURATION_SECONDS*30)} defaultProps={{deliveryPermit:false}}/>);
