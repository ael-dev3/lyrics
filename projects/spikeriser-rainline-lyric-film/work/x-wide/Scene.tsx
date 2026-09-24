import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import {paintCity, setCityAirship, setCityBackground, setCitySprites, setCityTrain} from '../../src/city.ts';

// The accepted 1920x1080 landscape scene is sampled on its original 60 Hz clock.
export const XScene: React.FC<{deliveryPermit: boolean}> = ({deliveryPermit}) => {
  if (!deliveryPermit) throw new Error('A verified current-preview delivery permit is required');
  const frame = useCurrentFrame();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('Decoding accepted city artwork'));
  const released = useRef(false);
  useEffect(() => {
    let cancelled = false;
    const decode = async (name: string) => {
      const picture = new Image();
      picture.src = staticFile(name);
      await picture.decode();
      if (!picture.naturalWidth || !picture.naturalHeight) throw new Error(`Empty image: ${name}`);
      return picture;
    };
    void Promise.all(['city-landscape.png','city-portrait.png','city-airship.png','city-train.png','city-sprites.png'].map(decode)).then(([landscape,portrait,airship,train,sprites]) => {
      if (cancelled) return;
      setCityBackground('landscape', landscape!);
      setCityBackground('portrait', portrait!);
      setCityAirship(airship!); setCityTrain(train!); setCitySprites(sprites!);
      setReady(true);
    }).catch(error => cancelRender(error));
    return () => {cancelled = true;};
  }, []);
  useLayoutEffect(() => {
    if (!ready) return;
    const ctx = canvas.current?.getContext('2d', {alpha:false});
    if (!ctx) throw new Error('City canvas unavailable');
    paintCity(ctx, frame * 2, 'landscape');
    if (!released.current) {released.current=true;continueRender(handle);}
  }, [ready, frame, handle]);
  return <AbsoluteFill style={{background:'#081019',overflow:'hidden'}}><canvas ref={canvas} width={1920} height={1080} style={{position:'absolute',left:0,top:0,width:1920,height:1080,imageRendering:'pixelated'}}/></AbsoluteFill>;
};
