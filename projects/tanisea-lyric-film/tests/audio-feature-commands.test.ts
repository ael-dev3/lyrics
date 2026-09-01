import {describe, expect, test} from 'vitest';
import {
  assertLockedAudioFeatureArtifact,
  buildAudioFeaturePcmArgs,
  buildAudioFeatureSpectrumArgs,
} from '../scripts/audio-feature-commands';

describe('audio-feature locked AAC decode commands', () => {
  test('retains the locked post-edit PCM geometry on FFmpeg 9', () => {
    expect(buildAudioFeaturePcmArgs('source.m4a', 'features.f32le')).toEqual([
      '-v',
      'error',
      '-flags2',
      '+skip_manual',
      '-i',
      'source.m4a',
      '-af',
      'atrim=start_sample=1600,asetpts=PTS-STARTPTS',
      '-f',
      'f32le',
      '-acodec',
      'pcm_f32le',
      '-ac',
      '2',
      '-ar',
      '44100',
      'features.f32le',
      '-y',
    ]);
  });

  test('uses the same locked geometry before spectrum analysis', () => {
    const argumentsList = buildAudioFeatureSpectrumArgs(
      'source.m4a',
      'spectrum.gray',
    );
    expect(argumentsList.slice(0, 6)).toEqual([
      '-v',
      'error',
      '-flags2',
      '+skip_manual',
      '-i',
      'source.m4a',
    ]);
    expect(argumentsList).toContain(
      'atrim=start_sample=1600,asetpts=PTS-STARTPTS,showspectrumpic=s=9180x64:mode=combined:color=intensity:scale=log:fscale=log:win_func=hann:legend=0:start=20:stop=20000:drange=80:limit=0',
    );
    expect(argumentsList.slice(-8)).toEqual([
      '-frames:v',
      '1',
      '-pix_fmt',
      'gray',
      '-f',
      'rawvideo',
      'spectrum.gray',
      '-y',
    ]);
  });

  test('locks the FFmpeg 9 feature geometry and artifact identity', () => {
    expect(() =>
      assertLockedAudioFeatureArtifact(
        6_747_584,
        'c9453f8c6fb3de3f16e691b51b4155c5db7e313f5aac1cc7942904754d29b7cf',
      ),
    ).not.toThrow();
    expect(() =>
      assertLockedAudioFeatureArtifact(
        6_747_300,
        'c9453f8c6fb3de3f16e691b51b4155c5db7e313f5aac1cc7942904754d29b7cf',
      ),
    ).toThrow(/sample|geometry/i);
    expect(() =>
      assertLockedAudioFeatureArtifact(
        6_747_584,
        '0a0f32526c89ea7c65e925f78d40f8c48ca9b865e2ce39991c256045abb4a683',
      ),
    ).toThrow(/sha|identity/i);
  });
});
