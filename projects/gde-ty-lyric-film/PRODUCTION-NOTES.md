# Production record

## Make the existing room carry the music

The canonical recording contains a held square photograph: a woman seated before a dark piano, dense gray/rose/burgundy flowers, a blue-gray wall and a warm crystal chandelier. A separate spectrum rail would introduce an unrelated visual language. The chandelier's existing bright facets therefore carry the main frequency response; only uncovered piano keys supply a secondary response.

The complete source is decoded: 5,025 native pictures at 25 fps, with six decoded pixel hashes across the held photograph. Small codec variations do not imply intentional camera movement. A canonical frame at 30 seconds supplies deterministic masks; picture PTS still advances in the complete preview and final renderer.

## Scene parameters

| Component | Implemented behavior |
| --- | --- |
| Crystal hosts | 18 horizontal material clusters inside measured chandelier row boundaries, source bounds (351, 0, 389, 175). Luminance and warm-channel masks retain real facet texture and dark hardware. |
| Bulbs / glints | Three existing bulbs receive bounded warm radial light. At most three separated actual bright facets per cluster receive small restrained glints. No new floating particles, camera shake or color cycling. |
| Secondary hosts | 17 exposed left keys and four right keys, sampled near source y=680–685. Source-luminance masks leave occluded keys, dress and flowers untouched. |
| Subject protection | Response does not reach source rectangle (449, 228, 286, 647). On/off diagnostics count changed pixels, rather than relying on a label saying “protected.” |
| Raw measurements | Stereo mean power; 24 logarithmic bands, 40–10,000 Hz; 2,048-point Hann analysis; 50 measured rows/second. Raw quantized levels cover −96 to 0 dBFS. |
| Display transform | Per-host 8th/98th percentile energy bounds; RMS gate −61 to −32 dBFS; exponent 1.12; causal 65 ms attack / 280 ms release. This is an artistic frequency-to-light mapping, not note recognition. |
| Determinism | Complete envelopes and masks are prepared before playback. Arbitrary source-time lookups make pause, seek, restart and native rendering agree; browser wall time never accumulates animation state. |
| Text | Cormorant Garamond Semibold, weight 600; rest `#dce1e5`, focus `#ffd493`, isolated shadow `#222c38`. Russian and English share size, weight, opacity and contrast. |
| Layout | Wide preserves the source at (0, 0) and puts reading in the extended wall; portrait keeps the square above a continued wall. Broad source color averages and a low-opacity original texture patch avoid repeated subjects and thin stretched strips. |

Balanced wrapping avoids stranded grammatical words. A cue reserves its entire geometry before focus changes; English is never independently shrunk or dimmed. First words are fully visible at their selected sample. Complete-line persistence is independent of lexical focus: long gaps keep a neutral 280 ms reading hold followed by a 500 ms fade; tight vocal handoffs replace the line atomically.

The duet reservation starts with the question at 153 seconds, before the female answer enters. Lead and backing each keep a complete RU/EN block. An encoded portrait test caught an incoming source line crossing the previous English last row: the former layout reserved duet space too late. Reserving the earlier question removes the collision without moving word events. The regression now checks actual glyph bounds across every pair of overlapping visible lanes, including pre-vocal fades.

## Translation and acoustic ownership

[Editorial text](source/lyrics-editorial.json) owns complete source/target correspondence; [timeline](public/timeline.json) owns original-sample events and reading windows. Each independently sung source word has one event. Necessary English morphology shares that event; explicit pronouns retain their separate source ownership. Irreducible constructions use the union of their contributors, not the surrounding continuous span.

Examples: “searched for” follows **искал** while “you” follows **тебя**; “glassy empty” follows the performed compound **стеклянно-пустые**; “from / sunset” stays separate for **до / заката**. Winter is the referent of **она**, translated “it.” Perfective **дождусь** supplies the wait-until-completion construction while its explicit object still owns “you.” English focus may move backward in natural English order; invented target-syllable timestamps would be misleading.

The female reply at 156.754–160.061 seconds overlaps the male entry at 158.771 seconds. Quiet female closing phrases also keep their own events and complete translated block. Models often follow the louder male voice; a single global lyric list would lose those backing phrases.

## Timing preparation and mistakes caught

1. Freeze exact video bytes, picture extent and original 44.1 kHz PCM before analysis. Estimated vocals are derived from that decode without changing speed or offset.
2. Compare original and estimated-vocal CTC character observations with complementary conditioned and unprompted Whisper runs. Use wider contexts around doubtful crop entrances and held endings.
3. Inspect bounded original/vocal spectral panels around the intro, first chorus, sustained words, female answer and closing duet. Select each onset/release independently, then store inclusive/exclusive original samples.
4. Review the complete recording normally, uncertainty at reduced speed, both layouts and the complete translated focus. Human review remains separate from machine evidence.

- Unprompted recognition omitted the opening verse. Absence from a transcript was not treated as silence.
- A conditioned opening **Я** aligned to the crop start near 10.5 seconds, before its real entrance near 14.669 seconds. Crop boundaries are not acoustic onsets.
- Forced Whisper placed introductory **Когда** on instruments. Wider original/vocal evidence supported the quieter vocal body near five seconds; the opening remains interpretively less certain than isolated lead speech.
- First-chorus **Когда** was omitted by recognition. Wider unforced consonant observations and supplied text supported retaining its stretched event rather than deleting it automatically.
- **Здесь** stays focused through its held body before **полежу**; a model had advanced to the next word prematurely.
- The last male **Не** was attracted to the preceding phrase in the original mix. Estimated-vocal evidence and wider context supported a separate later entrance.
- Closing female words cannot borrow louder male boundaries. Their ownership and full meanings remain independent, with acoustic ambiguity documented.
- A generated “continuation follows” phrase near the end was excluded as a recognition hallucination.
- The encoded duet-entry collision described above was a presentation defect, not an acoustic error. Static midpoint proofs alone would miss it.

The retained [word-boundary proposals](source/word-boundary-proposals.json) are the acoustic selection record, with scores, observation hashes and review priorities. Their preparation-stage pending labels are historical. [REVIEW.json](source/REVIEW.json) records the later complete current-song human review and approval. Storage to one sample does not establish one-sample perceptual accuracy: CTC stride is 20 ms, FFT windows smear boundaries and estimated stems can suppress quiet consonants.

## Production and actual-file verification

The renderer paints the shared scene at `outputFrame / 60` against every original decoded picture. Picture selection is `min(5024, floor(outputFrame * 5 / 12))`; native frames are held for two or three output frames without interpolation. Original decoded sound lasts 201.025306 seconds; 12,062 output frames last 201.033333 seconds. The last picture persists through the AAC tail.

RGBA streams directly to FFmpeg. H.264 uses medium CRF 17, six threads, a 120-frame GOP, square pixels, limited-range BT.709 YUV420P and MP4 fast-start. Original AAC is copied without filtering, trimming or reencoding. No `-shortest` can truncate the soundtrack. Frozen source/timeline/scene/review/renderer identities are rechecked before atomic completion.

Final verification checks codecs, dimensions, color/range, zero starts, every frame PTS, strict full video/audio decoding and missing-picture intervals. It compares original AAC payloads/timestamps/side data and decoded PCM. Selected onset, midpoint, release, intro, instrumental, overlap and final frames supply independent integer-sample/contributor glyph expectations; both gold and neutral states and delayed controls must be observed. Each visible simultaneous lane is checked. Finite scene/glyph checks support full decoding; they do not replace human listening.

## Delivery and reusable lessons

YouTube thumbnail is 1280×720; TikTok profile cover is 1200×1600 **portrait**. The title, both artists and subject are reviewed at small player/profile sizes and in a 5% portrait crop simulation. Artist size was increased after the initial profile-size proof. Covers reuse the official photograph and native typography, without generated replacement imagery.

Optional SRTs merge simultaneous singers into non-overlapping complete blocks. The two MP4s, thumbnails, publishing copy, captions and inventory form a checksum-verified 13-file kit. README stills are extracted from the actual encoded MP4s, with output frame, PTS, source frame and file hash recorded.

For future duet films: retain separate acoustic ownership, reserve complete upcoming blocks before their first visible fade, inspect actual glyph extents between all active voices, and verify those transitions after encoding. For material visualization: select hosts already explained by the image, preserve dark hardware and source texture, prepare deterministic masks early, and compare emission separately from raw frequency energy. Document listening, technical verification and publication as distinct evidence.
