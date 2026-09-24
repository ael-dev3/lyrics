# I'll Change for You — lyric-film preview

An English-only, full-recording lyric preview for [Mitski's source video](https://www.youtube.com/watch?v=BPy1NIiKKW0). The current edition is **preview only**: the word map is a model-assisted candidate awaiting full normal-speed listening, reduced-speed review of uncertain words and review in both layouts. No production render is authorized by this project state. Follow the repository's [preview-before-render rule](../../docs/preview-before-render.md).

![Preview reference with Mitski in the original room scene and an individually focused lyric](../../assets/ill-change-for-you-preview-45.png)

*Static reference at 00:45, made from the locked source frame and current lyric map by [the gallery-still script](scripts/make-readme-still.py). The live browser preview remains the visual and timing review source; this still is not an encoded film frame.*

## Source and composition

The [release note from Dead Oceans and Mitski](https://thelabel.co.nz/mitski-presents-ill-change-for-you-single-video/) credits director Lexie Alley and editor Rena Johnson and describes the original footage as printed frame by frame with hand-drawn marks. That source texture motivates the small edge-print response and restrained type treatment; the source film remains the main visual work.

The locked local `public/source.mp4` is the complete moving picture and original soundtrack. Its SHA-256 is `5af79acdcb8d708a6d53f901dee814f2a8038e2c775e806635e4286a57d01309`; the [source manifest](source/media-manifest.json) records the complete stream identity. The source is **1440×1080, 4:3**, H.264 at regular 24000/1001 cadence, with 4,709 frames. Its 44.1 kHz stereo AAC stream has 8,664,064 samples and lasts 196.464036 seconds. The picture ends at 196.404533 seconds, about 60 ms before the audio; the complete preview keeps the final picture visible through that short audio tail.

The file is ignored by Git and is not in the source handoff. A fresh checkout needs an authorized local copy matching the manifest hash. Do not substitute another upload or encode without establishing a new timing and picture identity.

The Original view presents the entire 4:3 frame with lyrics in its lower picture area. The 9:16 view retains the full source frame above the words, over a moving, dimmed fill derived from the same video. Both have a steady reading position and word-by-word color/luminance focus. A compact, audio-shaped edge print supports the source image. The small displaced ink treatment belongs only to the highlighted word “change.” The palette and readability ink respond to measured picture brightness; verify those choices against actual shots at normal and mobile viewing sizes. See the [scene-integration guide](../../docs/scene-integrated-visuals.md).

## Preview

From this directory, with Node.js and the exact local source file present:

```sh
npm run preview
```

Open <http://127.0.0.1:4326/>. The page starts paused at the beginning. It offers play/pause, restart, full-duration seek, 1×/0.75×/0.5× playback, lyric-line jumps, Original 4:3 and 9:16 layout buttons, sound and edge-print controls, and **Restore picture**. A direct review link such as <http://127.0.0.1:4326/?t=78&format=portrait&speed=0.5> keeps the complete preview available. Use `PORT=4327 npm run preview` if port 4326 is occupied, then use that port in review links. Keep the server running during review.

After a fresh load, confirm the actual picture moves with the soundtrack in both formats, including after seeking, switching format and restoring the picture. A working clock or poster alone does not establish video visibility. Inspect a nonblack shot and the ending. The main preview includes the picture, lyrics, measured edge response and intended word treatment; isolated diagnostics do not replace it.

[Sampled browser review](evidence/browser-preview-review.md) records the picture, control and seek checks already completed, plus their limits.

## Timing and measured inputs

The supplied text is retained in [source/lyrics-supplied.txt](source/lyrics-supplied.txt). The [timeline](src/timeline.json) contains 25 display lines and 118 individually identified word intervals at 44.1 kHz. It preserves isolated opening words, two complete refrain performances and the closing phrase. The [preliminary alignment record](evidence/alignment-candidate-preliminary.json) remains as the baseline; the [acoustic revision ledger](evidence/alignment-revision-2026-09-24.json) records 72 revised boundaries and independent model observations. This revision corrects early short-word focus, a first-refrain word that crossed a vocal pause, and clipped held endings without changing the supplied wording. The map remains a model-assisted review candidate until checked against the actual mix; passing interval validation is not proof of acoustic accuracy.

The audio analysis stores 64 unsmoothed, logarithmic 20 Hz–16 kHz band measurements at 60 Hz in [audio-features.bin](public/audio-features.bin), with units and generator settings in [audio-features.json](public/audio-features.json) and [the audit](evidence/audio-features-audit.json). The display transform is separate in `src/edgeprint.js`; changing its shape or opacity does not change the measured data or lyric events. [Picture-tone samples](public/picture-tones.json) at 2 Hz propose light or dark lyric ink; [their audit](evidence/picture-tone-audit.json) records sampling limits and transitions. These measurements support design decisions but do not certify vocal boundaries or readability over every frame.

The reproducibility path is summarized in [AGENT-HANDOFF.md](AGENT-HANDOFF.md). Review the full recording with sound, revisit connected and held words slowly, check both layouts and record the actual scope before seeking explicit authorization to produce full-length files. Technical checks, positive reactions to the preview and GitHub integration do not open the render gate.
