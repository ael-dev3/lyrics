# Sugar Glass — preview synchronization review

**Preview available. Synchronization review incomplete. Production not authorized.**

The current draft covers the complete 231.340408-second recording in landscape and portrait. It contains 71 cues, 424 source tokens and 405 Russian words. Lead and backing lines can be visible simultaneously. Both languages share source events; multi-source target groups use the union of participating intervals, preserving intervening gaps.

## Completed preparation

- Supplied lyrics preserved separately from the normalized performed-text draft. Pasted recommendation links removed; mixed-script letters normalized; “then one” normalized provisionally to “the one.” No unrelated song is used as an artistic inspiration.
- Assistant meaning review and complete target-word mapping, including Russian grammatical completions, negation, reordered words and phrasal verbs.
- Independent unforced recognition on the mix and isolated vocals; bounded MMS alignment on vocals/mix, Whisper word alignment and a separate English wav2vec acoustic encoder. Revised windows correct obvious instrumental-gap and outro errors.
- Sample-indexed source events on the original 44.1 kHz clock. A boundary ledger preserves candidates, selected intervals, zero-length/rejected candidates and uncertainty. All 424 tokens have candidate spread above 25 ms and require listening review; the preview does not claim acoustic perfection.
- All-frame event/focus tests, complete word coverage, strict TypeScript checks and browser geometry review in both layouts. A small portrait overlap at the outgoing post-chorus/backing handoff was corrected before handoff.
- Source playback remux strictly decodes; production commands refuse before capture or output creation.

## Review questions

1. **Both choruses, approximately 1:27–1:29 and 2:31–2:33:** the supplied text says “sleeve”; both recognizers propose “sleep.” The preview retains the supplied wording and its Russian meaning. Decide from the recording.
2. **Bridge, approximately 2:07:** confirm the provisional normalization “the one.” The original pasted “then one” remains in the supplied reference.
3. **Post-chorus, approximately 2:54–3:18:** overlapping voices reduce model reliability. Check every “sugar / glass,” the non-lexical vowels, the three supplied backing declarations and the later “but baby…” line. Do not infer that alignment success proves the supplied repetition inventory matches the recording.
4. **Opening, verse starts and outro:** inspect word onsets and held-vowel releases, especially around 0:06.9, 0:58.3, 3:18 and 3:44–3:46. A corrected initial outro window prevents the main words from attaching to the backing refrain.
5. **Translation:** feminine narrator and masculine addressee are editorial Russian grammatical choices, not artist-certified interpretation. Review the colloquial idioms and negation in the airport/wish passage. “Sugar glass” retains the literal sugar-glass image.
6. Review the complete intro, vocal gaps, every independent chorus performance and the final tail. Unforced recognition and a lyric sheet alone cannot certify that an uncovered span is instrumental.

## Actual review status

No assistant or user listening completion is claimed for this revision. No user cue marks or ratings have been fabricated. The player provides normal/slow playback, both layouts, word inspection, candidate times, waveform/spectrogram support, local draft notes and explicit progress saving. These support actual-audio review; they do not replace it.

`preview-identity.json` binds the draft to its inputs. `render-authorization.json` explicitly remains `preview-only` with `fullRenderAuthorized: false`. `cross-language-sync-review.json` separately records incomplete listening and audiovisual review. Source/workflow PR completion does not change those states.

Full production must wait for completed review, resolved findings and explicit authorization for the current song and revision under the repository's [preview-before-render workflow](../../../docs/preview-before-render.md).
