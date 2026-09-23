# If The Sun Burns Out Tonight — reusable production lessons

The accepted direction preserves the official moving picture, adds stable English word focus and gives selected lyric images their own small, source-clocked effects. Stronger vocals increase fire intensity without moving the text or shaking the picture. These are track-specific choices; the reusable method is to match meaning, sound and source imagery before choosing an effect.

This document describes `preview-v6-audio-evidence` timing and `word-atmosphere-v5` visuals. The current preview has received acceptance and an explicit production request. That request does not make an encoded file verified: consult the current review/authorization and final delivery records for their separate statuses. Earlier evidence files retain the scope and revision they actually tested.

[Agent quickstart](AGENT-HANDOFF.md) · [Project overview](README.md) · [Next-song guide](../../docs/source-clocked-word-effects-workflow.md)

## 1. Preserve the picture before decorating it

The [locked source](source/media-manifest.json) is the official [VALORANT music video](https://www.youtube.com/watch?v=x8jAY2CoOBg), featuring Grabbitz, Oli Sykes and Courtney LaPlante. Its picture is **1920×818 at 24 fps**, with 5,621 source frames. The stereo AAC soundtrack is 44.1 kHz; its declared duration is **234.266122 s**, slightly longer than the 234.208333 s video stream. Preserve that relationship when making the delivery; a 60 fps composition does not create extra motion detail in the original 24 fps picture.

The Original composition uses the complete 1920:818 frame. Do not turn this into a cropped 16:9 film or add a black caption extension. Lyrics and spectrum sit directly over the picture with continuous lower-edge shading. The 1080×1920 portrait composition keeps the full panoramic picture at 17% of stage height and fills the remaining area with a softly blurred, darker sample of the same video frame. That background fill is decorative; the foreground retains the full source frame.

One native video element owns both picture and soundtrack. A matching foreground canvas draws its decoded frames, with the native video still underneath. This addresses browser compositing failures that can otherwise leave audio playing over a black or stale picture. The separate `requestVideoFrameCallback` pump has one generation-guarded callback chain; transport changes cancel the previous chain. A pause refresh draws immediately and once after composition settles. Restore picture retains position, playback rate and prior playing state.

**Operational lesson:** inspect actual moving pixels after loading, seeking, pausing, resuming, switching formats and restoring. Advancing `currentTime`, a successful decoder or a screenshot from another renderer does not prove visible playback. Distinguish intentional dark source frames from an added black dropout. Keep the entire introduction and closing card visible; do not replace the review with isolated lyric diagnostics.

## 2. Keep four clocks separate on the same source timeline

| Layer | Authority | What may change |
| --- | --- | --- |
| Audio and source picture | Native media time, originating at zero | Delivery sampling of the original frames; no invented source offset |
| Word focus | `src/timeline.json`, start-inclusive/end-exclusive intervals | Only evidence-backed timing revisions with renewed affected review |
| Line visibility | `createCues()` in `src/preview-core.js` | Up to 180 ms neutral pre-roll and 200 ms post-roll, constrained by adjacent cues |
| Decorative motion | Source-time envelopes and measured-feature lookup | Effect shape, gain, smoothing and bounded release, without altering word intervals |

Every line reserves its geometry before focus changes. All 44 supplied lines and 254 independent word events remain in order. The display uses no cumulative highlight, moving letters, word boxes or karaoke underlines. Pale inactive words remain readable; gold focus is `#ffda85`, with cool-white rest text `#eef0ec`.

The first word begins at 26.905 s and the final selected word ends at 221.900 s. Added shading and spectrum ease in from 26.105–26.705 s and out from 222.100–222.700 s; this envelope is separate from cue visibility. Those limits preserve the original intro and ending, rather than stretching lyrics across instrumental material.

## 3. Timing evidence supports review; it does not replace listening

The [v6 timing audit](evidence/timing-audit-v6.md) records a substantial correction to earlier small-model estimates: 242 onsets moved by more than 50 ms. Structural tests had passed despite compressed phrases and implausibly short word windows. Testing interval order alone cannot establish acoustic accuracy.

The retained evidence includes transcript-conditioned MMS_FA on the original mix and estimated vocals; English wav2vec2 CTC on those inputs; independent large-v3-turbo alignment; unforced recognition of difficult passages; spectrogram observations; and selected local waveform comparisons. Two inputs to one model are two observations, not independent model families. Model scores are not interchangeable accuracy probabilities. Estimated HTDemucs vocals contain leakage and separation artifacts.

Selected sample indices preserve decisions on the 44.1 kHz grid. They do not certify sample-accurate phonetic boundaries. Model disagreements over 25 ms, connected pronouns, processed hooks and uncertain held releases remain in [alignment-v6.json](evidence/alignment-v6.json). Do not average known model failures or apply a global offset to conceal them.

The last two processed hooks share measured audio at exactly +9.600000 s. [Local correlation](evidence/repeat-correlation-v6.json) justified their relative alignment, including moving the last “sun” earlier by 380 ms. This establishes a relationship between those occurrences, not absolute acoustic truth. [Moderate repeated-chorus correlations](evidence/repeated-chorus-relative-audit-v6.json) did not justify transferring disputed anchors. Repeats retain independent timing unless stronger evidence demonstrates actual sampled material.

The v6 review record originally documented targeted listening acceptance while leaving full-recording, exact playback-rate and both-layout details unrecorded. Later overall acceptance and production authorization belong in their current records; do not retroactively rewrite earlier muted playback or model audits as listening. Preserve uncertainty even after acceptance, and distinguish accepted interpretation from a known correctable defect.

## 4. Measured spectrum, artistic depth

`scripts/analyze-audio.py` produces 64 logarithmic bands from **20 Hz to 16 kHz**, stored at 60 Hz in `public/audio-features.bin` with its companion metadata. The upper limit follows this source's effective cutoff: extending to 20 kHz left the top bands almost entirely at the floor. Recalibrate for a new recording rather than copying this limit blindly.

Analysis uses centered 4,096-sample Hann windows (92.88 ms), averages stereo channel powers to avoid phase cancellation, and integrates fractional FFT-bin coverage. Low-frequency bands share resolution; they are not 64 independently resolved narrow filters. Values are little-endian unsigned 16-bit, representing −96 to 0 dBFS in 0.01 dB increments. Lookup interpolates adjacent source-time rows; outside the recording it returns the floor. Centered windows include nearby future samples and do not establish exact transient or syllable onsets.

`src/spectrum-view.js` applies the display transform `clamp((dBFS + 58) / 34, 0, 1)^1.6`. The spectrum has gold front faces, small shaded sides, lit caps, one bounded bloom pass and a short fading reflection. It has no separate peak trail or rail. Original-format geometry is 70% width and 13.5% height, 2% above the bottom; portrait uses 74% width and 10% height, 11% above the bottom. The baseline and internal insets reserve room for caps, glow and reflection. All components read the same instantaneous feature lookup.

This is an artistic display of measured energy, not a calibrated meter, beat detector or vocal timing source. No browser audio-processing graph is introduced, so the visualization does not delay or reroute the soundtrack.

## 5. Exact word-effect contract

All intervals below are seconds in the locked source. Starts are inclusive and ends exclusive. They identify the current selected word events, not a claim that the original model uncertainty disappeared. `src/timeline.json` remains authoritative if a future revision changes them.

### Solar fire: twelve hooks

The selector requires consecutive `sun` + `burns` or `burnt` + `out` + `tonight` tokens. It does not trigger on every mention of warmth or destruction. L02 uses “burnt”; the other hooks use “burns”. Each column below is that word's exact highlight interval.

| Cue | sun | burns / burnt | out | tonight |
| --- | --- | --- | --- | --- |
| L01 | 27.406–28.028 | 28.028–28.751 | 28.751–29.136 | 29.136–29.560 |
| L02 | 32.226–32.848 | 32.848–33.350 | 33.591–34.032 | 34.032–34.855 |
| L17 | 75.444–76.066 | 76.066–76.665 | 76.665–77.186 | 77.186–78.100 |
| L19 | 85.043–85.666 | 85.666–86.284 | 86.284–87.001 | 87.001–88.176 |
| L23 | 104.243–104.875 | 104.875–105.360 | 105.360–106.079 | 106.079–107.354 |
| L24 | 113.802–114.425 | 114.425–115.167 | 115.167–115.669 | 115.669–117.355 |
| L28 | 133.044–133.620 | 133.620–134.400 | 134.400–134.832 | 134.832–135.850 |
| L30 | 142.603–143.236 | 143.236–143.580 | 143.580–144.335 | 144.335–145.475 |
| L34 | 161.804–162.447 | 162.447–163.085 | 163.085–163.663 | 163.663–164.140 |
| L42 | 200.201–200.845 | 200.845–201.387 | 201.808–201.960 | 201.960–203.293 |
| L43 | 209.820–210.423 | 210.423–211.100 | 211.100–211.560 | 211.560–212.300 |
| L44 | 219.420–220.023 | 220.023–220.700 | 220.700–221.160 | 221.160–221.900 |

Fire is a **phrase decoration**, distinct from the one-word focus. Its envelope starts at “sun”, rises over 120 ms, and releases over 200 ms toward `min(cue.displayEnd, tonight.end + 180 ms)`. Individual glyph ignition and attenuation add local variation; they do not extend acoustic word focus. Record this bounded decorative tail explicitly instead of describing all fire as confined to each word interval.

DOM range measurements attach orange outer flames and cream cores to individual glyphs. Unequal widths, irregular shoulders and curved tips avoid evenly spaced metallic-looking spikes. One or two tongues per glyph, shared gradients, a cropped canvas and one small blur keep the effect affordable. Words stay stationary. Wrapped portrait hooks get additional line spacing; per-glyph rise is limited by the preceding row so the lower flames cannot pass through earlier lyrics.

`scripts/analyze-fire.py` measures the locked mix and time-matched estimated vocal stem using centered 2,048-sample windows (46.44 ms) at 60 Hz. Track-relative vocal RMS is the main contribution; high-mid power, broadband texture and a smaller mix contribution refine it. The mapping is:

```text
force = clamp(.78*vocalLevel + .14*highMidLevel + .08*mixLevel
              + .10*roughness*vocalLevel^2, 0, 1)
rawDrive = force^2.2 * clamp((vocalDbfs + 65)/18, 0, 1)
drive = source-time one-pole envelope(rawDrive, attack=70ms, release=180ms)
burnRate = .45 + 2.35*drive^.78
phase = precomputed trapezoidal integral(burnRate)
```

The integrated phase is essential: multiplying current time by a changing rate causes jumps; integrating browser elapsed time makes slow playback and seeks disagree. Lookup of stored phase reproduces the same flame at the same source time. A quiet verse hook near 32 s has median drive 0.076/rate 0.764; the climactic hook near 200 s has 0.794/2.414. Nominal reach varies from 0.4 to 1.7 font heights before glyph variation and clearance caps. Quiet passages emit no embers; forceful peaks allow at most six small embers. These are artistic responses to energy and texture, not an automatic scream or emotion classifier.

### Local atmosphere effects

| Effect | Exact targets and intervals | Envelope and behavior |
| --- | --- | --- |
| Sunbeam | `L04-W07 light` 43.955–44.420 | Feathered diagonal shafts, fixed landing glow; 100 ms entry / 140 ms release, shortened to 30% / 35% of short word durations |
| Phrase-specific sunbeam | `L16-W05 you` 74.020–74.480; `L22-W09 you` 102.800–103.000; `L27-W05 you` 131.520–131.800; `L33-W09 you` 160.360–160.680 | Same beam, only when the five tokens ending here are exactly “all I need is you”; darkness-prefixed lines qualify, “all I see is you” and other “you” contexts do not |
| Frost | `L11-W03 colder` 59.827–60.320; `L12-W02 freezing` 61.684–62.449 | Pale ice tint spreads across stationary letters; small ice branches grow on alternating measured glyphs, below 0.17 font heights; entry ≤120 ms and release ≤150 ms, each capped at 30% of word duration |
| Purple halo | `L18-W01 Supernova` 79.002–81.270; `L29-W01 Supernova` 136.501–138.810 | Two lavender/violet shadows around unchanged gold fill; 180 ms entry / 280 ms release; no pulse, scale or shake |
| Darkness | `L22-W04 darkness` 99.065–100.149; `L33-W04 darkness` 156.765–157.829 | Five soft charcoal wisps move locally behind the word; 180 ms entry / 220 ms release; no global picture dimming |
| Gentle damage | `L14-W05 hurts` 68.252–68.620; `L25-W05 hurts` 125.803–126.520 | Small copper contact glow, fine cuts clipped inside letters and three tiny flecks; entry ≤70 ms/20% duration, release ≤140 ms/30%; fracture develops over ≤160 ms/40%; travel stays within 0.24 font heights |
| Combined void | `L20-W03 void` 89.523–90.040; `L31-W03 void` 147.153–148.077 | Darkness wisps plus purple halo, each with its own envelope; explicit combined CSS preserves both shadows instead of allowing one rule to overwrite the other |

These effects activate only for the current word and clear at its exclusive end. The damage selector accepts exact `hurt` or `hurts` tokens, but this recording contains only the two `hurts` events above. Broader metaphor matches are intentionally absent. Every target is anchored to its measured word box; anchors invalidate on layout changes. Every frame is reconstructed from source time, so reverse seeks leave no particles or color residue.

Frost and damage use clipped text fills. Their readability shadow is applied behind the rendered text with `drop-shadow`, rather than painting an opaque shadow into the transparent glyph fill. Preserve that distinction in any compositor port. Preserve explicit combined styles for overlapping effects such as “void”.

## 6. Approaches to improve before another full render

| Failure pattern | Reusable correction |
| --- | --- |
| Attractive interval tests hide bad acoustic anchors | Inspect real line durations and use independent audio evidence; reject collapsed words and align each performance |
| Full preview shows black while audio continues | Repair visible source rendering and transport lifecycle; retain picture recovery and test both layouts |
| Generic 16:9 template removes source information | Probe the source ratio first and retain it when it is the approved composition |
| Spectrum looks shallow or uniformly busy | Separate measured bands from a bounded nonlinear display transform; use modest face depth and reflection without extra trails |
| Uniform fire fails to distinguish quiet and forceful vocals | Calibrate drive from the actual recording and preserve dynamic range; do not infer emotion from amplitude alone |
| Flame tips resemble repeated sharp spikes | Vary bodies and rounded curls, reduce symmetry, and inspect in motion at mobile size |
| Portrait fire enters the preceding lyric row | Reserve line spacing and derive local clearance from measured glyph rows |
| Too many independent blur passes interrupt picture delivery | Share gradients, crop canvases, bound particle count and use one softening pass per layer |
| A broad word selector fires in unrelated contexts | Specify exact normalized token/phrase matches and test exclusions as well as intended targets |
| Two CSS effects silently replace each other | Add an explicit combined treatment and test the composed state |
| A long fixed fade hides a very short word effect | Scale fades to duration while preserving the acoustic interval |
| Old playback evidence is presented as current | Bind each audit to the files/revision it tested; recheck affected behavior and run final-current playback before delivery |

## 7. Verification and continuation

Use [AGENT-HANDOFF.md](AGENT-HANDOFF.md) for the file map and [WORKFLOW.md](WORKFLOW.md) for the native production commands. `npm run check` validates supplied text/order, selected timing against the evidence, source hashes, spectrum data, deterministic focus, transport/effect logic and rejection of missing or stale production authorization. Browser audits establish actual picture motion, geometry and targeted effect behavior within their recorded scope. Neither check type establishes acoustic listening by itself.

Before delivery, bind the approved complete preview to input and renderer hashes; check original-ratio and portrait proofs, short encoded diagnostics and final bytes. Preserve source audio identity, full duration, native framing, stable word focus, effect cleanup and the ending. Document the actual resolved font and rendering environment: the current preview uses an Avenir Next Condensed/Avenir Next/system fallback stack, so a different machine cannot assume identical metrics. A font substitution needs layout review.

Keep final technical reports, decoded-frame screenshots, platform covers, posting text, copied-file hashes and repository integration status separate. No statement in this lesson file substitutes for an actual final render or delivery receipt. Original music, lyrics, footage, characters, fonts and marks retain their respective rights.

## 8. Native rendering needs its own visual proof

The production adapter shares the deterministic effect functions but reconstructs text, shadows and composition in native canvas. [Production adoption](evidence/production-adoption.json) records the inspected stills, short encoded visual diagnostics, renderer inputs and environment. It accepts the adapter's presentation; it does not claim browser/native pixel identity or completed final-file verification.

- **Freeze a face, not only a family name.** Loading the complete Avenir collection selected Bold despite the requested 600 weight. Explicit extraction of Avenir Next Condensed DemiBold corrected the face. The private runtime font has its own hash, remains outside public source, and may not silently fall back to another face.
- **Retain browser measurements.** `src/production-layout.json` records all 44 cues in both layouts at canonical 1160×494.203125 and 540×960 review sizes. Each row stores its top, first-word left and successive word widths. Native glyph widths fit those reviewed boxes. Regenerating this file requires resolved fonts, the actual browser wrapping/word boxes and fresh both-layout proof; it is not a license to estimate new positions from text length.
- **Paint the glyph body once.** Repeated glyph-plus-shadow draws thicken antialiased edges. Render tinted alpha masks behind a single body instead.
- **Keep shadow masks on-canvas.** The native engine culled fully off-canvas glyph bodies even when a large shadow offset should have returned the shadow to view. This silently removed purple halos and readability shading. Tinted masks placed within the canvas, blurred and then composited below the body preserve the intended treatment.
- **Check gradient semantics.** Duplicate-stop gradients did not reproduce the tiny clipped damage cuts consistently. Explicit narrow strips inside the alpha mask made the native result predictable.
- **Verify the encoded result.** Different font rasterizers, blur kernels and blend implementations can diverge despite shared effect math. Inspect every effect class, composed “void”, wrapped fire, neutral gaps and the source ending. The short diagnostic MP4s contain no audio and therefore establish visual behavior and decode health, not listening or final audio-mux correctness.

The production gate binds all 15 approved preview inputs, the exact song/revision and completed owner review. Its separate adapter record binds the authorization hash, renderer, layout, native loader, extracted font and package files. Negative tests reject empty hash maps, omitted inputs, changed bytes, foreign/stale records, path traversal and unapproved font overrides. Runtime module/binding hashes are retained as environment provenance; final output verification remains a separate step.

## 9. Future scene-integration comparisons

The delivered spectrum's faces, caps, bloom and reflection are distinct display layers over the same measured bands. For a future treatment, compare reduced cap/bloom and reflected brightness in intimate or dark imagery while retaining band timing and response. Added depth can improve a graphic's finish without establishing a convincing place for it in the source scene. Evaluate any reflection against an actual receiving surface or choose a simpler supporting graphic.

Solar fire and frost provide useful primary motifs for this lyric vocabulary. Fine damage marks, wisps and halos should be evaluated for their contribution during ordinary playback at realistic player sizes. They can remain quiet texture, but increasing their count is not evidence of greater impact. If small details disappear while the spectrum keeps attracting attention, prioritize text, subject and spectrum balance before adding more effects.

These are prospective artistic comparisons from design review, not a new render, a demonstrated improvement or a technical fault in the accepted files. Existing synchronization and soundtrack evidence retains its documented scope. Use the shared [scene-integration guide](../../docs/scene-integrated-visuals.md) for the next song's visual brief, A/B review and compact decision record; choose its own imagery and motifs.
