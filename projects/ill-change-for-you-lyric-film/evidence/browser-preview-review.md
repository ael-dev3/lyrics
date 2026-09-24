# Browser preview review — 2026-09-24

## Observed in the local player

- The source decoded at 1440×1080 with `readyState=4`. In 4:3 playback, the browser media clock and decoded-frame callback advanced together from about 45.15 s to 50.32 s. The picture, lyric and edge print all used that same `<video>` clock.
- At 45 s the room scene and two-line lyric remained readable; at 74.6 s the pale, high-exposure shot retained readable text. Checks at 37 s and 75.5 s confirmed that unvoiced gaps clear the lyrics while the source film stays visible.
- The portrait view retained the whole source image. At 26 s, 45 s and 147.8 s, its lower lyric area used moving source-derived fill, and the picture decoded after direct URL seeks.
- Switching formats retained source time. Play/pause, `0.5×`, direct time/format/ink links and Restore picture worked. Restore picture recovered the source at 45 s and later at 60.01 s without losing the selected time.
- The adjacent cue handoff at 60.01 s displayed “For you to love me again” and highlighted “For”; the line selector remained on the chosen cue. Browser console inspection showed no warning or error at the sampled state.

## Scope and remaining review

These are sampled browser observations, not a whole-film visual or acoustic certification. The 25-line/118-word map passes structural source-sample and midpoint checks, but actual normal-speed full-recording listening, slow review of the [priority windows](timing-review.md), and continuous inspection in both layouts remain open. No complete production film was rendered. The [README image](../../../assets/ill-change-for-you-preview-45.png) is an editorial static reference generated from the source and cue map, not a browser capture or final-film frame.
