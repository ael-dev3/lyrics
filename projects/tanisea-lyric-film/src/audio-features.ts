import {useEffect, useState} from 'react';
import {
  cancelRender,
  continueRender,
  delayRender,
  staticFile,
} from 'remotion';

const EXPECTED_MAGIC = 'TLVF';
const EXPECTED_VERSION = 1;

export type AudioFeatureFrame = Readonly<{
  bands: Uint8Array;
  pressure: number;
  impact: number;
  lowEnd: number;
  brightness: number;
  emotion: number;
  hero: number;
  reach: number;
  momentaryDbfs: number;
  samplePeakDbfs: number;
}>;

export type AudioFeatureData = Readonly<{
  frameCount: number;
  fps: number;
  bandCount: number;
  sampleRate: number;
  getFrame: (frame: number) => AudioFeatureFrame;
}>;

let cachedData: AudioFeatureData | null = null;
let loadingPromise: Promise<AudioFeatureData> | null = null;

const parseFeatureData = (buffer: ArrayBuffer): AudioFeatureData => {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const magic = new TextDecoder().decode(bytes.subarray(0, 4));
  const version = view.getUint16(4, true);
  const headerSize = view.getUint16(6, true);
  const frameCount = view.getUint32(8, true);
  const fps = view.getUint16(12, true);
  const bandCount = view.getUint16(14, true);
  const sampleRate = view.getUint32(16, true);
  const recordSize = view.getUint16(20, true);

  if (magic !== EXPECTED_MAGIC) {
    throw new Error(`Invalid audio-feature magic: ${magic}`);
  }
  if (version !== EXPECTED_VERSION) {
    throw new Error(`Unsupported audio-feature version: ${version}`);
  }
  if (frameCount !== 9180 || fps !== 60 || bandCount !== 64) {
    throw new Error(
      `Unexpected feature geometry: ${frameCount} frames, ${fps} fps, ${bandCount} bands`,
    );
  }
  if (recordSize !== bandCount + 11) {
    throw new Error(`Unexpected audio-feature record size: ${recordSize}`);
  }
  if (buffer.byteLength !== headerSize + frameCount * recordSize) {
    throw new Error(
      `Audio-feature size mismatch: ${buffer.byteLength} bytes`,
    );
  }

  const getFrame = (requestedFrame: number): AudioFeatureFrame => {
    const frame = Math.max(0, Math.min(frameCount - 1, Math.round(requestedFrame)));
    const offset = headerSize + frame * recordSize;
    return {
      bands: bytes.subarray(offset, offset + bandCount),
      pressure: (bytes[offset + 64] ?? 0) / 255,
      impact: (bytes[offset + 65] ?? 0) / 255,
      lowEnd: (bytes[offset + 66] ?? 0) / 255,
      brightness: (bytes[offset + 67] ?? 0) / 255,
      emotion: (bytes[offset + 68] ?? 0) / 255,
      hero: (bytes[offset + 69] ?? 0) / 255,
      reach: (bytes[offset + 70] ?? 0) / 255,
      momentaryDbfs: view.getInt16(offset + 71, true) / 100,
      samplePeakDbfs: view.getInt16(offset + 73, true) / 100,
    };
  };

  return {frameCount, fps, bandCount, sampleRate, getFrame};
};

const loadFeatureData = (): Promise<AudioFeatureData> => {
  if (cachedData) return Promise.resolve(cachedData);
  if (!loadingPromise) {
    loadingPromise = fetch(staticFile('audio-features.bin'))
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Unable to load audio features: HTTP ${response.status}`,
          );
        }
        return response.arrayBuffer();
      })
      .then(parseFeatureData)
      .then((data) => {
        cachedData = data;
        return data;
      });
  }
  return loadingPromise;
};

export const useAudioFeatures = (): AudioFeatureData | null => {
  const [data, setData] = useState<AudioFeatureData | null>(() => cachedData);
  const [renderHandle] = useState<number | null>(() =>
    cachedData ? null : delayRender('Loading deterministic audio features'),
  );

  useEffect(() => {
    if (data) return;
    let cancelled = false;

    loadFeatureData()
      .then((loaded) => {
        if (!cancelled) setData(loaded);
        if (renderHandle !== null) continueRender(renderHandle);
      })
      .catch((error: unknown) => {
        cancelRender(
          error instanceof Error ? error : new Error(String(error)),
        );
      });

    return () => {
      cancelled = true;
    };
  }, [data, renderHandle]);

  return data;
};
