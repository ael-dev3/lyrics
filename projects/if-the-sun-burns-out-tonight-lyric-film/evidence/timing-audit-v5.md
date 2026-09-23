# Timing and picture audit — preview v5

## Status

**Provisional candidate map.** The preview has a full source-clock player and explicit word windows, but this audit does not claim perfect word alignment. No complete human listening review has been recorded for this project.

The source file is one MP4 containing 1920×818 H.264 at 24 fps and stereo 44.1 kHz AAC. Both streams start at 0. Video duration is 234.208333 s; audio duration is 234.266122 s, a 57.8 ms tail difference. The browser plays both through one native video element, so there is no independently started audio file or second video clock. The audio may continue through the source container’s final 58 ms while the last picture frame is held.

## Lyric and timing evidence

- The timeline retains all 44 user-supplied lyric lines, their capitalization, punctuation, and repeats in order.
- A full-length, unforced whisper.cpp 1.9.2 pass using small.en and word-window output was compared with the prior token-level DTW candidate map. The word timing windows are model estimates; converting them to 44.1 kHz sample indices gives a stable timebase but does not increase acoustic certainty.
- The first “If the sun burns out tonight” hook is absent from the unforced transcript. Its candidate word shape is reused from later occurrences and remains a high-priority listening check.
- The unforced model misrecognizes supplied wording at “Help me kill the curse,” “So pull me closer,” both “Supernova” lines, both “Now the void” lines, one “It gets louder” line, “Please drag me out,” “The end’s approaching for me and you,” and “We’ll survive.” The supplied text is retained; those phrase positions are not model-approved lyrics.
- Every supplied word now receives its own independent highlight window. There is no co-highlighting: when a window is active, exactly one word changes color. Very short candidate windows can still pass quickly, so this behavior makes the word separation exact in the player but does not establish that the estimated boundaries are acoustically exact.
- Longer candidates such as “Supernova” and held “tonight” endings are preserved instead of being clipped by a generic maximum duration. Their releases still need listening review.
- The timeline separates a line’s readable display window from each word event. Playback focus is color-only and is driven by the source media clock.

For reproducibility, the local word pass used the equivalent of:

~~~sh
whisper-cli -ng -m ggml-small.en.bin -ml 1 -sow -oj -of unforced-words source.wav
~~~

Word-window and DTW experiments are useful for locating questions, not for certifying them. No independent vocal-separation model, per-boundary waveform/spectrogram adjudication, or human reduced-speed listening is represented as complete here.

## Visual and player review

The source video overview was sampled at 10-second intervals and six individual scenes were checked across the opening, first chorus, eclipse imagery, bridge, and final lift. It contains a strong cool-night / solar-amber vocabulary. The redesign keeps the original video and uses stable left-aligned editorial serif typography, warm-ivory inactive words, amber active words, continuous shading, and a shallow 64-tick corona arc driven by the source audio analyser. The corona is the only added animation; it has no strobing or scene cuts.

The landscape player contains the entire original panoramic frame. In portrait, the foreground retains its original aspect ratio and the surrounding fill is drawn from the very same decoded source frame. A poster frame prevents an empty/black stage before video decoding. Structural tests verify exactly one source video element, same-source audio analysis, full media hash, supplied lyric sequence, timing bounds, stable IDs, sample-index fields, and absence of grouped focus metadata.

The source overview, six individual frames, browser preview, and structural tests do **not** amount to complete audiovisual listening review. Both formats and word highlights still require review at normal speed; uncertain words and held endings need reduced-speed listening before timing can be called final.

## Full-render boundary

This is a preview-only revision. No production video, short review movie, or final delivery file has been rendered.
