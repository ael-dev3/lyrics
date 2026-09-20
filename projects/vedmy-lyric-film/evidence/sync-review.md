# Preview timing review

Current edition: **preview-v5-autumn-sync**. No full-length film has been captured or encoded.

The full source AAC remains the playback clock, beginning at zero. Its presented duration is 201.133991 seconds. Decoded PCM contains codec padding through 201.141406 seconds; that padding does not lengthen media playback. The scene has 12,069 frames at 60 fps, and the nearest-frame rounding error is at most 8.300 ms. This is a clock quantization bound, not an acoustic accuracy claim or a hardware latency measurement.

All 54 performed-reference cues and 218 Russian words have separate source intervals; all 281 translated words have explicit source correspondence. Four choruses are independently aligned. MMS on the isolated stem is the provisional primary, original-mix MMS and bounded Whisper remain separate candidates. The v5 comparison includes full large-v3 and expanded-context MMS; one stable original-mix candidate corrects the short negation in VE-012. Every word remains marked for actual-audio review. Inspect candidate disagreement, audible consonants and vowel releases at normal and reduced speeds in both layouts.

Eight long vowel continuations are documented in `analysis/held-vowel-candidates.json`. Their stem periodicity/energy traces support extending the original short model spans, but are not human listening evidence. Inspect both repetitions of **стоило / утони** and all four chorus-opening **На** events first. Also check VE-028 against the unusual supplied “Жаль, в конце ждёт ничего”, the short **в / с / и** events, and the final **небеса** release. Automatic transcription errors over instrumental gaps were rejected; the supplied lyrics contain no scraped recommendation blocks.

Translation editorial review covers all unique constructions and their repeated mappings. In VE-032, the idiom's separated events complete **you were deceiving** in both language lanes, while the independently sung **мне** highlights **me** alone. A silent gap never acquires a fabricated English acoustic event.

The production review record stays incomplete until actual listening review and current-revision authorization exist. Automated geometry, color, source-audio identity and motion checks cannot change those statuses. Saving proposed edits or merging source into the repository is not render approval.

The [three-pass report](three-pass-review.md) distinguishes the completed editorial and technical checks from unresolved listening work.

## Production review completion

The reviewer subsequently explicitly attested full normal-speed listening, reduced-speed checks of uncertain words and held endings, and both delivery layouts for this exact frozen preview, then authorized production and local delivery. The prior pending status above describes the machine-review stage. The current signed-by-role review scope and input hashes are in `cross-language-sync-review.json`; no automated listening telemetry is invented.
