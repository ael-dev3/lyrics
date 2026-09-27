export const SALUTE_WINDOWS = Object.freeze([[16, 20], [84, 88], [162, 166], [242, 246]].map(Object.freeze));

/** Evaluate weights before the mixer paints a pose. A seek out of a salute must
 * not render once with the previous frame's blend, even when playback is paused. */
export function sampleGuardianPose(mixer, idle, salute, saluteClip, sourceTime, motionScale = 1) {
  const window = SALUTE_WINDOWS.find(([start, end]) => sourceTime >= start && sourceTime < end);
  idle.weight = salute && window ? .15 : 1;
  if (salute) salute.weight = window ? .85 : 0;
  mixer.setTime(sourceTime * motionScale);
  if (salute && window) {
    salute.time = (sourceTime - window[0]) % saluteClip.duration;
    mixer.update(0);
  }
}
