# Browser preview review — 2026-09-24

## Observed in the local player

- The source decoded at 1440×1080 with `readyState=4`. In 4:3 playback, the browser media clock and decoded-frame callback advanced together from about 45.15 s to 50.32 s. The picture, lyric and edge print all used that same `<video>` clock.
- At 45 s the room scene and two-line lyric remained readable; at 74.6 s the pale, high-exposure shot retained readable text. Checks at 37 s and 75.5 s confirmed that unvoiced gaps clear the lyrics while the source film stays visible.
- The portrait view retained the whole source image. At 26 s, 45 s and 147.8 s, its lower lyric area used moving source-derived fill, and the picture decoded after direct URL seeks.
- Switching formats retained source time. Play/pause, `0.5×`, direct time/format/ink links and Restore picture worked. Restore picture recovered the source at 45 s and later at 60.01 s without losing the selected time.
- In the initial candidate, the cue at 60.01 s highlighted “For” before the next vocal entrance. The subsequent acoustic revision corrected that defect; the original observation is retained here as the reason for the change, not as the current behavior.

## Revised map sampled in the live browser

- The revised player loaded the exact 1440×1080 source with `readyState=4` and no media, data or background error. At 61.30 s the first-refrain pause had no active lyric; at 62.10 s “For” was active, and at 65.15 s “again” was active.
- Other revised checkpoints selected held “be” at 103.10 s, “all” at 129.60 s and the second “again” at 153.50 s. The complete source picture remained visible at those original-format seeks and at 62.10 s in portrait.
- During portrait playback near 153.58 s, the decoded source-frame time was 153.570 s while the playback clock was 153.581 s, with source-derived background paints advancing and no reported errors. This is a sampled clock/picture check, not a measure of vocal onset accuracy.

## Scope and remaining review

These are sampled browser observations, not a whole-film visual or acoustic certification. The 25-line/118-word revised map passes structural source-sample and evidence-ledger checks, but actual normal-speed full-recording listening, slow review of the [priority windows](timing-review.md), and continuous inspection in both layouts remain open. No complete production film was rendered. The [README image](../../../assets/ill-change-for-you-preview-45.png) is an editorial static reference generated from the source and cue map, not a browser capture or final-film frame.
