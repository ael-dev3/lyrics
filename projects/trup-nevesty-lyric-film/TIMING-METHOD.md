# Word timing method and limits

## Recording authority

The canonical H.264/AAC recording decodes to 9,053,184 stereo sample frames at 44,100 Hz, with a 205.287619-second audio extent. Picture starts at zero and lasts 205.24 seconds; the last picture remains through the short AAC tail. Source offset is zero.

[word-boundary-proposals.json](source/word-boundary-proposals.json) stores 184 separately selected events as original-audio samples, inclusive at onset and exclusive at release. [build-timeline.ts](scripts/build-timeline.ts) preserves explicit per-word edges. Integer precision is storage precision, not proof of millisecond perception. No global advance, half-sample anticipation or fixed tail applies.

## Evidence chain

1. Unprompted complete-recording recognition checked coverage against all 28 supplied lines. The first pass used an alternate AV1/Opus rendition for lexical inventory only; those times never became canonical boundaries.
2. Bounded canonical opening and closing recognition checked uncertain text. Closing **нету**, versus supplied **нет**, has large-v3-turbo recognition, a visible additional vowel after the consonant and original/vocal MMS support. The full and bounded recognitions share one model family. A small recognizer returned no closing text, providing no corroboration or contradiction.
3. Conditioned large-v3-turbo alignment supplied all 28 canonical phrase observations. Its gap-filled and crop-start first-word values were not accepted as complete phoneme ownership.
4. Multilingual MMS CTC supplied a different model-family observation on both original mix and a native-rate HTDemucs vocal estimate. Private normalization serves alignment only; no pronunciation or romanized reader layer is included.
5. Original/vocal envelopes and vocal spectra were inspected for every cue on seven bounded panels. Physical CTC centers use a 320-sample stride at 16 kHz (20 ms), with a 400-sample receptive-field center at 199.5 samples. Crop-length/frame-count stretching is rejected.
6. Each entrance/release was reconciled separately. HTDemucs preserves native sample length/rate and declared zero offset, but can smear consonants, leak instruments or carry echo. Original audio stays authoritative; continuing stem tone alone cannot establish continuing sung ownership.

Selected observations carry raw-file hashes and pending-listening labels. Raw diagnostics and rejected crops remain local. Committed observations reconstruct the selected preview; revising uncertain boundaries still needs the actual recording and signal evidence.

## Display ownership

English targets follow actual contributor unions. Articles, tense, inflected meanings and necessary grammar share their corresponding source event; no English timestamp is invented. Independently corresponding Russian words stay distinct. Multiple contributors do not fill a real source gap.

Lines enter neutrally 220 ms before the first word and reach full opacity before the sung entrance. Every held selected release remains fully readable. Close cues hand off atomically. Long gaps give a 300 ms neutral hold and 500 ms fade. Reading persistence never extends gold word focus.

One source video supplies sound and picture. Fractional `video.currentTime` drives words; native 25 fps picture PTS remains separate. Display-cadence redraw avoids delaying focus to the next source picture. Pause immediately commits stopped time; seeks wait for matching decoded pictures; recovery restores all layers.

## Pending listening priorities

| Interval | Review |
| --- | --- |
| 11.995–22.390 | Quiet first consonants, **Леса**, held endings. |
| 33.625–54.990 | Connected particles, **суженый**, **преисподней / мольбы**. |
| 55.315–75.985 | Sustained **Я / Мы / Ты**, **сердце / дверцу / место / невеста**, complete English focus. |
| 93.620–109.865 | Ring line, natural question order, articles/copulas. |
| 110.065–130.670 | Fast short words, **верности / пустоте**, guitar/echo ownership. |
| 130.975–151.390 | Changed refrain and quiet **Я** entrance near 135.77. |
| 175.360–197.680 | **нету** variant and closing edges after widened crops. |

Wordless passages around 76–88 and 151.5–175.3 seconds remain music-led, without invented lexical lines. The owner accepted and authorized the exact current preview for production; standardized full/slow/both-layout listening scope remains separately unattested. The listed priorities therefore stay available for acoustic review rather than being marked completed by technical checks.

## Encoded display evidence

Production uses the same scene at output time `frame / 60`, with 735 original sample frames per output frame. An arbitrary selected sample becomes visible at the first 60 fps frame at or after that sample; integer storage does not remove the display's 16.667 ms frame quantization. Original 25 fps pictures are held using `min(5130, floor(outputFrame * 5 / 12))`, while lyric time remains fractional.

The actual MP4s were decoded at the first frame before/at each entrance, the middle of each event, the last active frame and the first released frame. Integer sample comparisons independently determine expected source focus and English contributor unions; opaque glyph interiors distinguish gold from ivory. Each film passes 11,269 state checks, covers all 442 tokens in active/neutral states and rejects 63 deliberately delayed 100 ms controls. These checks catch display/capture errors in the selected map; they do not independently listen to or validate the acoustic selections.
