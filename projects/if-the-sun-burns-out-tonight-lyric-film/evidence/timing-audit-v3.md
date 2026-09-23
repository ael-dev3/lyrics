# Timing audit — preview v3

## Result

The first draft was not aligned to the song. Its guessed section windows delayed the first vocal verse, refrain, second void passage, bridge, and final refrain. The preview now uses explicit per-word spans across all 44 supplied lyric lines (254 words). The lyric text, capitalization, punctuation, and repeats are kept verbatim from `source/lyrics-supplied.txt`.

The first pass used `whisper.cpp` 1.9.2 / `small.en` experimental one-word output (`-ml 1 -sow`). A separate token-level DTW pass was then compared with those word windows. No model transcription replaced the supplied lyric text.

## Second timing pass

The DTW cross-check exposed cue starts that had inherited a leading music note instead of the first lyric word: “Would you let me go…” now begins at 36.95 rather than 35.88; both “Now the void…” lines begin at 90.03 and 147.44 rather than 88.98 and 146.54; and later “Hit me…” / “All I need…” entries also moved to their first aligned word.

It also exposed pauses flattened inside the combined “And in the darkness all I need is you” lines. The map now preserves the pause before “All” at 101.45 and 158.89. Clear DTW word anchors replace proportional spans; split contractions and model-split words are grouped. Where the speech model disagrees with the supplied text, the lyric remains unchanged and is aligned by phrase position. Collapsed tokens are interpolated between neighboring anchors or repeated-line shapes and remain estimates.

The player refreshes lyric timing on each animation frame during playback, with a timer fallback, so short spans do not depend only on the browser’s coarser `timeupdate` cadence.

## Human-review flags

- Both model passes missed the opening “If the sun burns out tonight.” That occurrence borrows the word timing shape from a later clear repetition and is placed at 0:26.91–0:30.84. Treat this as an estimate until heard against the opening.
- “I wonder if the sun burnt out tonight” has collapsed early word anchors. Its first seven words are spread over 0:30.84–0:31.91 by syllable weight, followed by the anchored “tonight” at 0:31.91–0:32.94.
- The model disagreed with the supplied text at “Help me kill the curse,” “So pull me closer,” both “Supernova” lines, both “Now the void…” lines, the first “It gets louder…” line, “Please drag me out,” “The end’s approaching for me and you,” and “We’ll survive.” Those supplied words remain unchanged; their timings follow matching positions in the performed phrases. The two “Supernova” model word groups are bundled under the single supplied word.
- Listen to the complete recording at normal speed, check these words and held endings at reduced speed, then review both aspect ratios before treating timing as approved.

## Source and picture checks

The original full-length video file contains both H.264 picture and AAC stereo audio. The preview seeks and plays the same source element, so the picture and soundtrack share one playback clock. There is no separate edited audio track to drift against the picture. Structural checks verify the source hash, all supplied lyric lines and repeats, word order, and that each word span remains inside its cue.

No full render has been made.
