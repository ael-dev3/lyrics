# По камушку — reusable production lessons

This film treats the photographed stones as the musical instrument: their existing surfaces catch a restrained, frequency-driven warm light while the complete original artwork remains intact. Russian and English lyrics share source-word timing, equal visual emphasis and stable reading positions. The reusable principle is to find a responsive material already present in the source, then make the music change that material without replacing the scene.

The production continuation uses the approved `po-kamushku-preview-v6-full-onset-visibility` inputs. **Both final films passed independent encoded-file and decoded-scene verification.** The verified upload kit has been delivered to a fresh Desktop folder. Authorization, rendering, encoded-file checks, Desktop delivery and remote archival remain separate records; consult the current evidence and publication receipt for their exact scopes. Earlier signal and browser audits retain their historical preview-only scope. They are not retroactively converted into listening or production evidence.

[Exact production notes](PRODUCTION-NOTES.md) · [Agent handoff](AGENT-HANDOFF.md) · [Source-clocked workflow](../../docs/source-clocked-word-effects-workflow.md) · [Scene integration](../../docs/scene-integrated-visuals.md)

## 1. Study the actual source before proposing a world

The official recording uses a square photograph: a woman in white curled on granular dark earth inside an asymmetric circle of stones. The supplied lyrics describe windows, furniture, a plank and a blizzard; those images do not establish footage of those places. The design therefore follows the real artwork rather than inventing an illustrated room or forest.

The source is intentionally still. All 5,220 original video frames were fingerprinted; small codec variations create different hashes without meaningful depicted movement. Distributed source-frame inspection distinguishes this from a frozen decoder. The complete preview nevertheless decodes the actual video, exposes advancing picture presentation timestamps and animates the measured stone response. Production decodes every original frame rather than substituting a canonical photograph. Only the material masks use a frozen lossless source reference.

**Next-track procedure:** inspect the opening, transitions, large musical gaps and ending; identify the source's actual aspect ratio, subjects, receiving surfaces, existing light and motion. Name what is directly observed and what is artistic inference. A still source can support purposeful animation, but a player advancing over a black or stale picture is a different defect.

See [source-motion study](evidence/source-motion-study.md) for the bounded observation method. Metadata credits the recording contributors and label; it does not identify a separate photographer. Do not guess an artwork author.

## 2. Environmental response needs real receiving surfaces

Thirty conservative polygons lie inside photographed stones. Together their interiors cover 52,834 source pixels, approximately 4.53% of the square image. The central figure and white cloth are protected. Twenty-four logarithmic frequency bands follow a fixed clockwise spatial ordering; nearby stones share bands where thirty receiving surfaces exceed twenty-four measurements.

The polygons define receiving regions, not generated stone shapes. Each mask keeps the source's luminance detail, feathers inward by 7 source pixels and follows qualitative upper-left light. The direction is an authored interpretation of the picture, not a measured 3D reconstruction. Stone radii normalize the directional shading; they do not impose an elliptical rim over the source.

The exact display response is:

```text
bandDb = -96 + encodedBand * 96 / 255
bandLevel = clamp((bandDb + 57) / 34, 0, 1)
rmsDb = -96 + encodedRms * 96 / 255
response = bandLevel^1.45 * (.38 + .62 * clamp((rmsDb + 35) / 22, 0, 1))

maskAlpha = insidePolygon * clamp(distanceToEdge / 7, 0, 1)
            * sourceLuminance^.6 * authoredDirectionalLight
screenCompositeAlpha = response * .92 * readingWeight
```

The light pigment is RGB 230/198/168. In the native layout, lower stones with centers below source y=760 receive a .48 reading multiplier while a lyric cue is present. The central white subject remains brighter than the added stone light. The raw measurements remain unchanged; artistic response, pigment and compositing are separate from audio analysis.

The feature file also stores a transient observation, and the anchor plan retains design metadata. The current stone animation uses assigned band power and RMS; it does not pretend that those unused fields drive another effect. It adds no complete glowing ring, bars, invented rocks, moving anchors, expanding outlines or camera shake.

**Failures to prevent:** a hard polygon edge reads as an overlay; lighting every dark region flattens material; max-normalizing a quiet passage destroys dynamics; equal energy on every stone becomes decorative noise. Inspect both quiet and strong sections at a realistic player size. Increase the useful material response before adding unrelated particles or geometry.

## 3. Preserve the picture and reserve a calm reading surface

The native composition stays 1080×1080. Both languages occupy the lower earth, with continuous lower-edge shading and a protected central subject. The portrait composition is 1080×1920: the full source square is positioned at y=212–1292, and the text has more breathing room below it. Dimmed, blurred samples of the source's empty soil fill the remaining stage. They do not crop, stretch or duplicate the readable person and stone circle.

Both language lanes use the same Alegreya face, weight, perceived size, resting contrast and active clay color. Words keep their positions; only the selected word or complete grammatical meaning changes emphasis. The treatment has no lyric boxes, underline, bouncing glyphs, cumulative karaoke fill or separator that competes with the photograph. The continuous shade exists independently of cue visibility, so it does not appear as a rectangular caption panel.

Typography remains a deliberate foreground reading layer. It is not described as physically carved into stones. Integration comes from the source material, shared warm tones, restrained light, stable placement and contrast that protects reading. False claims of physical embedding are unnecessary.

**Next-track procedure:** choose a source-native composition first; establish a protected subject region and reading surface; fit both complete languages together. Reflow the pair before shrinking or dimming English alone. Check the longest phrase, rapid repetitions and late quiet words in every delivery layout.

## 4. Inventory errors can survive convincing alignment

The final inventory has 30 performed cues, 163 Russian source events and 206 English target tokens. The supplied reference remains intact. Advertisements, recommendations and section labels do not become performed lyrics; punctuation is typography, not an acoustic word.

Two early failures show why transcript-conditioned alignment cannot determine lexical truth:

| Failure | Why it was misleading | Retained treatment |
| --- | --- | --- |
| An extra provisional Яна near 6.127 s | Recognizers allocated a name to a physical burst or a broad empty region; a conditioned path can force supplied text onto noise. | Targeted listening rejected that event. Both language lanes remove it; the sole audible name begins at sample 323,165, approximately 7.328 s. |
| Тёплый allocated near 14.060 or at the 13.300 s crop boundary | Broad recognition omitted much of the verse; conditioned timing attached the first word to accompaniment before the direct vocal. | Original-mix and estimated-vocal context support sample 722,579, approximately 16.385 s. No early focus is placed over the preceding music. |
| An additional late И suggested by weak recognition | One uncertain full-recording result supplied an extra word that bounded unprompted recognition did not support. | The disagreement remains documented; no unsupported lyric is added. |

**Next-track procedure:** use unprompted recognition to audit coverage, then bounded recognition and independent alignment to locate disputed material. Preserve rejected allocations and the supplied reference. Inspect spoken introductions, quiet entrances and the complete instrumental tail before freezing the inventory. An alignment score is an uncalibrated model observation, not a probability that the word was sung.

## 5. Inspect quiet entrances and complete endings independently

Whisper and MMS_FA provide competing timing observations. Original audio is authoritative; zero-lag HTDemucs vocals help reveal masked detail but contain leakage, residual voice and separation artifacts. The primary pass reviewed 109 events; the independent scope originally contained 55 proposals, one of which was the subsequently rejected introduction event. Their current retained scope is therefore 54. The complete final signal round re-inspected all 163 retained onsets and releases without finding a supported acoustic sample adjustment.

Quiet consonants, reduced vowels and continuous handoffs precede many strong character cores. Conversely, a final CTC character can stop long before a performed held vowel. The run/carry phrases, all four pebble refrains, short negations and prepositions, chorus пески/куски and final земли each retain independently selected events. No chorus-wide offset or shared fixed tail is copied between performances.

The final земли begins at sample 8,628,959, approximately 195.668 s, and focus ends at sample 8,819,559, exactly 199.990 s. A sparse core ending near 196.137 s would have cropped most of the held vowel. The complete neutral line remains readable through 201.400 s and clears at 201.900 s. The remaining music receives no invented text.

Connected vowel ownership, the quiet человечка opening, the adjacent s sounds in встречусь с, and breath versus initial z around late земли remain uncertain. The source/stem spectra have roughly 23.22 or 11.61 ms support; dense hops do not create millisecond physical certainty. Exact sample storage records the chosen interpretation precisely. It does not make that interpretation uniquely measurable.

**Next-track procedure:** inspect the complete preceding-word release → quiet opening → internal consonant → stressed body for every word. Widen ending crops to the next real phrase. Classify direct body, soft carry, breath, accompaniment and residual decay without treating every nonzero signal as more phonation. Keep point selections and plausible ownership ranges together.

## 6. Requested soft focus tails need an honest separate record

The three себя / myself occurrences received the same kind of treatment, with individually chosen amounts. Both language lanes use the same exclusive focus end. Their onsets and following из / from starts remain unchanged.

| Cue | Prior direct-body estimate | Current focus end | Extension | Gap before unchanged из |
| --- | ---: | ---: | ---: | ---: |
| PK-011 | 58.135 s | 58.385 s | 250 ms | 75 ms |
| PK-026 | 149.405 s | 149.700 s | 295 ms | 140 ms |
| PK-028 | 164.430 s | 164.820 s | 390 ms | 270 ms |

These are bounded soft-carry display-focus refinements. The earlier direct-body samples remain recorded separately, and the evidence does not claim fresh vocal production throughout each extension. A consistent treatment means independently examining the related occurrences; it does not mean adding the same duration to every word.

**Next-track procedure:** separate lexical/body evidence, any explicitly accepted soft focus carry, neutral reading hold and decorative release. Name which quantity changed. Check the following word and both languages after every extension. A longer readable line should not require changing acoustic focus.

## 7. Complete English meaning shares source events

English follows meaning rather than a second invented word clock. Individually sung Russian words remain independent. Necessary English articles, auxiliaries and inflection completions activate with the source word expressing that meaning.

| Source meaning | English focus | Ownership rule |
| --- | --- | --- |
| песенку | a song | Both English tokens share the noun; no invented us/me object. |
| сложено | is folded | Auxiliary and participle share the passive-result event. |
| забудет | will forget | Future auxiliary and verb share one source event. |
| земли | of the earth | Complete genitive meaning, including grammar, follows the noun. |
| по камушку | pebble by pebble | By follows по; both displayed pebble tokens follow the noun. |
| Пока … не | Until | Union of the two contributing events; it releases during the intervening сердцем. |
| с тобой | you in meet you | Union of those two separately timed source words, rather than a broad encompassing hold. |
| встречусь | I meet | The first-person inflection supplies I; both tokens share the verb. |

Natural English order can cause focus to move backward within a fixed line. That is preferable to flattening all words into one phrase or translating unnatural word order solely to make a visual sweep. The source's unusual concrete/pieces metaphor remains explicit rather than being silently rewritten into a different sentiment.

`targetActive` evaluates the union of referenced source intervals, not the interval from the first contributor to the last. Both languages release over real gaps and unrelated words. Text-authored semantic fixtures check negation, articles, repeated noun expansions, passive constructions and source ownership independently of the renderer.

**Next-track procedure:** audit the entire translated meaning for each event, including function words. Check the exclusions as well as the intended focus: words between two contributing events must stay neutral unless they have their own source ownership.

## 8. Correct samples can still be drawn late or incompletely

The last review found presentation defects rather than a supported acoustic correction. V6 preserves all 163 acoustic sample intervals and every neutral-hold sample from v5.

| Defect | Correction | Regression boundary |
| --- | --- | --- |
| Atomic cue replacement still applied a synthetic 1 ms entrance fade | If no pre-vocal reveal interval remains, the incoming line is fully opaque at its first source sample. Separated phrases retain a neutral pre-vocal reveal. | All 30 exact cue entrances; 9,592 active-voice frames at rational 60 fps. Twenty-three cue entrances use the atomic policy. |
| Pausing could leave the canvas slightly behind stopped media time | Redraw immediately from stopped `video.currentTime`. | A previously observed 5.342 ms stale canvas sample is replaced by matched stopped media/word time. |
| A glyph outline could borrow the preceding glyph's active shadow | Assign the current glyph shadow before drawing both outline and body. | Every cue in both complete layouts. |

Reading lifetime remains separate: up to 220 ms neutral pre-reveal, an occurrence-specific full-opacity hold, and a 420–500 ms gentle fade when enough space remains. Otherwise the old line stays readable until the next vocal and hands off atomically. No midpoint blank or compressed exit is inserted into a continuous vocal sequence.

The timing function uses start-inclusive/end-exclusive source samples and preserves genuine fractional playback positions. It repairs only multiplication error at machine precision near an exact integer; it does not round an entire half sample early. Tests examine exact entrances, exclusive endings, sample fractions and actual output-cadence frames. Interval ordering alone would not have caught an invisible first word.

**Next-track procedure:** after acoustic review, verify that the selected word is visible at full opacity on its first active frame, remains readable through its selected end, and clears cleanly. Include glyph paint state, cue visibility and pause/resume behavior in the audit rather than adjusting sound timing to conceal a display defect.

## 9. Cache static work before playback and prove loaded identity

Lazy source-pixel readback at the first musical entrance initially caused a measured multi-second paint stall. All static stone masks are now prepared before revealing the complete picture. A frozen lossless material reference makes a fresh seek use the same masks despite harmless codec noise. This reference never replaces the main video.

The native video's current time owns sound, word focus and measured response. `requestVideoFrameCallback` independently records original 25 fps picture PTS; display-cadence repaint reads the finer media clock. A held original picture frame does not hold the previous word's focus. Seek/recovery rejects a stale decoded picture rather than accepting advancing audio over a missing scene.

Canvas diagnostics report the actual loaded revision, source hash, source intervals, active words in each language, media word time, picture PTS, cue opacity and paint cost. A query parameter or an old open tab is not identity evidence. Complete browser inspections cover source visibility, seeking, both layouts, reduced-speed samples, pause and recovery. They do not continuously measure audio-device output latency or prove every final encoded pixel.

**Next-track procedure:** freeze static resources, warm expensive caches before playback, verify the loaded hashes, then reproduce the disputed moment. Diagnose transport/display errors separately from phonetic ownership. Preserve genuine source imagery throughout the complete preview; never silently substitute a black lyrics diagnostic for user review.

## 10. Production needs a fresh encoded-file audit

The production adapter uses the same model and scene renderer, pinned font, canonical material masks, editorial meanings and measured features. It decodes the 5,220 original square frames and maps them to 60 fps using `min(5219, floor(frameIndex * 5 / 12))`. The extra output sampling improves the cadence of lyric/light changes; it does not invent extra photographed motion.

Mathematical scene time is `frameIndex / 60`, corresponding to exact source sample `frameIndex * 735`. Binary floating-point can multiply that time back just below a canonical sample or original-picture boundary. The adapter moves only to the next representable float when needed; the recorded maximum is approximately 2.84×10⁻¹⁴ seconds. This numerical normalization is not authored anticipation, an extra frame hold or a changed acoustic selection. Verify the integer cadence and canonical sample states independently of the scene implementation.

The production extent is 12,530 frames, derived from the unchanged 9,209,280 decoded audio samples. The video therefore lasts 208.833333 s. Original AAC is stream-copied with its priming/skip metadata, retaining the 208.809002 s container extent. The approximately 24.331 ms final CFR difference is held last-picture coverage, not a global lyric offset. Never apply a second 36.281 ms compensation for the original 1,600 priming samples.

Before claiming delivery, verify full decode, frame count, dimensions, final picture, complete soundtrack, first/last timestamps, source-audio preservation, encoded-scene proof samples, all semantic focus transitions, platform cover readability and copied/uploaded SHA-256 values. Shared-renderer stills, inspected browser pictures and frames decoded from a final MP4 have different evidentiary roles; label them accordingly.

Both complete files passed the final technical and decoded-scene checks: 12,530 frames each, unchanged original AAC packets and PCM, no introduced black intervals, artwork present on every frame, and 829 decoded scene samples per layout covering all 163 source events and 206 target tokens. The current listening and authorization records bind the production request to frozen v6 inputs; acceptance does not erase the uncertainties preserved in earlier acoustic evidence.

## 11. A concise brief for the next film

> Study the repository's current agent handoff, preview/render rule, connected-phoneme timing, bilingual meaning mapping and scene-integration guides. Inspect the complete new recording and derive a visual treatment from its actual imagery, material, light and arrangement. Preserve source zero and native framing; make the visualizer respond through purposeful existing surfaces, keep reading stable, and give both languages equal emphasis when a translation is requested. Inventory the whole recording before alignment. Review both edges of every source word and every repeat against the original audio; preserve uncertainty and complete translated grammar. Separate lexical focus, accepted soft carry, neutral line lifetime and decorative response. Verify exact first-active-frame opacity, exclusive releases, source picture, loaded identities, transport recovery and both layouts. Deliver a complete playable preview before production. Honor current authorization and record supplied review scope without fabricating listening evidence or repeatedly asking for already supplied confirmation. After authorized production, verify final bytes, prepare platform files/covers/copy, archive reproducible inputs with checksums, and finish verified repository integration.

This brief specifies the desired process and proof boundaries. It does not prescribe stones, this palette, these time intervals or a copied previous-song visual style.

Before any remote operation that can start Actions, the coordinator performs a fresh all-workflow/all-branch/all-actor current-UTC-day run and rerun-attempt inventory, including queued/running/completed runs and older attempts, then estimates downstream runs and runner minutes. Unknown monthly use stays unknown. Apply the current user policy, preserve required checks and do not change triggers merely to fit a budget. Verified authorized source work must be merged and the remote default branch checked; source handoff alone does not authorize an unrelated media release or platform post.
