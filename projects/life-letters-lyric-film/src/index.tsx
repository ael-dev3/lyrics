import React from 'react';
import {registerRoot,Composition} from 'remotion';
import {Film} from './Film';
import {FPS,WIDTH,HEIGHT,FRAMES} from './config';
const Root:React.FC=()=> <Composition id="LifeLettersPhone" component={Film} durationInFrames={FRAMES} fps={FPS} width={WIDTH} height={HEIGHT}/>;
registerRoot(Root);
