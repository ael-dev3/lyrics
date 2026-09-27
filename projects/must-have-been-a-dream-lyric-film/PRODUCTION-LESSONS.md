# Source-integrated lyric and light treatment

This edition uses the selected [original video](https://www.youtube.com/watch?v=AK6duyCPU50) as the moving composition. The added lyrics and audio response must be judged against that specific picture; the settings here are an implemented example, not a palette or geometry preset for another song.

## Build from the visible source image

The source MP4 stores a 1920×672 active image at y=204–876 inside a 1920×1080 frame. [The scene](src/scene.ts) covers each delivery canvas from that active image, without stretching it or leaving the encoded matte bands. [The shot map](src/shots.ts) sets 65 contiguous source-clock intervals. Each shot has landscape and portrait centers, a lyric zone, a picture mood and, where necessary, a source-lettering protection flag. Reframe at a cut or a clear subject move, then hold the crop long enough for the footage to feel filmed rather than chased by the overlay.

The original picture includes very dark passages and authored title/credit text. Six stills from the same source and one 60-frame source-footage sprite carry selected black intervals, including the 151.25–156.32-second gap. An image bridge supplies visible source material; it does not introduce an unrelated scene. Keyed source title pixels are retained over those bridges, while narrow-format versions rearrange wording only where the source-wide type would be cut off. Added response and lyrics end before the final credits. Check these transitions in moving playback because a still can hide a dropped frame or truncated word.

## Put the visual response where the camera found light

The measured input has one RMS, one positive-rise proxy and 24 spectral bands per source-clock picture frame; [AUDIO-FEATURES.md](AUDIO-FEATURES.md) defines the windows and their limits. The renderer samples the *current cropped picture* at 160×90 before drawing effects. It scores real bright, pale/cyan pixels against their neighbors and adds at most nine bounded glows to separated source lights. A band is chosen from each light's horizontal picture position. Short rays appear only on stronger rises.

Other bands seek existing bright material in shot-specific regions. Street/day shots receive small pavement reflections, transit shots short glass streaks, and stage shots softened beams from recorded light positions. A separate low-resolution color mask brightens red or blue pixels already present. These layers use restrained `screen` compositing, energy thresholds and opacity caps; they stop for protected lettering or credits. The point is a spectrum **expressed through real surfaces in the shot**, without a detached graph that has to be placed over the video.

Individual English words keep stable geometry. Their sung interval controls the bright red-to-warm focus; RMS, local band energy and rise vary the ink's warmth and a tiny transient echo. Unspoken words remain neutral and previously spoken words remain readable. A dim complete line may enter just before the first word for reading context, but it is not the active-word highlight. Timing always comes from [the 156-event timeline](public/timeline.json), never from RMS or a beat detector.

## Preserve one media clock

The browser uses the original video element's decoded `mediaTime` for picture, words and audio-feature lookup. Both formats share the same word boundaries. The native renderer paints the same scene at source frames `n × 1001/24000`, and copies the original AAC packets. The final two picture frames hold source imagery across the short soundtrack tail. A global timing shift would move already-correct words; [the onset audit](TIMING-REVIEW.md) instead documents 34 local start corrections after multiple model/stem comparisons and full-song owner review.

## Reusable checks

1. Confirm source dimensions, active image, exact audio/video clock and rights/creator credits before arranging text.
2. Map source cuts and areas where words can read at actual player size in both ratios. Give original title or credit regions explicit protection.
3. Keep word timing, dim line visibility, picture cuts and measured audio response as separate tracks. Verify every word entrance against the recording; do not use a global offset to repair local errors.
4. Sample real source lights and surfaces to locate a visualizer. Bound the number, radius and opacity of responses, then compare the result through quiet and loud sections at normal speed.
5. Provide the entire source moving picture in the preview, including dark intervals, all requested visuals, ending and recovery. Verify seek and format changes in the actual browser.
6. Bind render authorization to the reviewed input hashes. Compare native renderer frames with the browser, then verify full decoded masters and copied posting files independently. One attractive screenshot proves only that frame's composition.

The [project README](README.md) records source identity, reproduction, posting and final-delivery status; [TIMING-REVIEW.md](TIMING-REVIEW.md) records the word-boundary evidence and uncertainty.
