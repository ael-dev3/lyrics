import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {AbsoluteFill, Audio, cancelRender, continueRender, delayRender, getRemotionEnvironment, staticFile, useCurrentFrame} from 'remotion';
import authorization from '../evidence/render-authorization.json';
import review from '../evidence/sync-review.json';
import {DIMENSIONS, REVISION, SONG_ID, type Format} from './config.ts';
import {paintCity, setCityAirship, setCityBackground, setCitySprites, setCityTrain} from './city.ts';

export const Film: React.FC<{format: Format; renderPermit?: boolean}> = ({format, renderPermit = false}) => {
  if (getRemotionEnvironment().isRendering && (
    !renderPermit ||
    authorization.song !== SONG_ID ||
    authorization.revision !== REVISION ||
    authorization.status !== 'authorized' ||
    authorization.fullRenderAuthorized !== true ||
    review.song !== SONG_ID ||
    review.revision !== REVISION ||
    review.status !== 'complete' ||
    review.actualAudioReviewComplete !== true ||
    review.allCuesAllFormatsComplete !== true
  )) throw new Error('PRODUCTION BLOCKED: current-song sync review and explicit render authorization are required.');

  const frame = useCurrentFrame();
  const {width, height} = DIMENSIONS[format];
  const canvas = useRef<HTMLCanvasElement>(null);
  const [artState, setArtState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [artError, setArtError] = useState('');
  const [artHandle] = useState(() => delayRender('Decoding city artwork'));
  const artHandleReleased = useRef(false);
  useEffect(() => {
    let cancelled = false;
    const decode = async (name: string) => {
      const picture = new Image();
      picture.src = staticFile(name);
      try {
        await picture.decode();
        if (!picture.naturalWidth || !picture.naturalHeight) throw new Error('Empty image');
        return picture;
      } catch (error) {
        throw new Error(`${name} could not be decoded: ${String(error)}`);
      }
    };
    void Promise.all([
      decode('city-landscape.png'), decode('city-portrait.png'), decode('city-airship.png'),
      decode('city-train.png'), decode('city-sprites.png'),
    ]).then(([landscape, portrait, airship, train, sprites]) => {
      if (cancelled) return;
      setCityBackground('landscape', landscape);
      setCityBackground('portrait', portrait);
      setCityAirship(airship);
      setCityTrain(train);
      setCitySprites(sprites);
      setArtState('ready');
    }).catch(error => {
      if (cancelled) return;
      const message = `City artwork unavailable: ${String(error)}`;
      setArtError(message);
      setArtState('error');
      cancelRender(new Error(message));
    });
    return () => {cancelled = true;};
  }, [artHandle]);
  useLayoutEffect(() => {
    if (artState !== 'ready') return;
    const context = canvas.current?.getContext('2d', {alpha: false});
    if (!context) throw new Error('City canvas is unavailable');
    paintCity(context, frame, format);
    if (!artHandleReleased.current) {
      artHandleReleased.current = true;
      continueRender(artHandle);
    }
  }, [artHandle, artState, frame, format]);
  return <AbsoluteFill style={{background: '#081019', overflow: 'hidden'}}>
    <Audio src={staticFile('soundtrack.m4a')}/>
    <canvas ref={canvas} width={width} height={height} style={{position: 'absolute', inset: 0, width, height, imageRendering: 'pixelated'}}/>
    {artState === 'error' && <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', color: '#ffc588', font: '28px monospace'}}>{artError}</AbsoluteFill>}
  </AbsoluteFill>;
};
