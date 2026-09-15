# Moyka — Moon: frame and synchronization study

**Reference:** [Moyka’s official video](https://www.youtube.com/watch?v=6jzieFirHpY), published 9 July 2026. **Study:** 15 September 2026. Video shot, directed and edited by **Sara Westergaard Karlsen**, according to the official description. [Source identity and full credits](source.json).

The strongest reusable idea is **independent choreography on one audio clock**: words enter at selected vocal events, complete phrases stay legible across picture cuts, and larger graphic gestures distinguish sections. The film also contains deliberate frame-alternating effects. Those effects must not be mistaken for extra sung words or copied into our normal bilingual reading layer.

This is a completed reference analysis with stated limits, not a production synchronization approval. Our [mandatory cross-language gate](../../cross-language-sync-gate.md) and [cinematic default](../../cinematic-lyric-workflow.md) remain authoritative.

## Evidence and scope

| Item | What was actually checked |
| --- | --- |
| Download | Available 2560×1440 VP9 video and 48 kHz stereo Opus audio, merged without re-encoding; original media kept locally |
| Video timeline | All **3,831 decoded frames**, zero-based `f0–f3830`, presentation times `0–153.200 s`, constant **25 fps / 40 ms** spacing |
| Audio timeline | Full decoded stereo signal: **7,355,525 presented samples**, **153.240104 s**; container duration is 153.261 s |
| Frame analysis | Grayscale measurements on every frame at 160×90; text recognition attempted successfully on every frame at 960×540 |
| Visual review | Whole-song overview at every integer second; before/after pairs for all **198 large-change candidates**; **355 consecutive frames** across five detailed windows; two native-resolution checks. **852 distinct frame indices** across these reviews |
| Audio analysis | Whole-track Whisper transcription; bounded MMS alignment of 22 passages; a second alignment method on five passages; full-track mixed-audio attack measurements |
| Limits | This does **not** mean every full-resolution frame received individual visual inspection, or that a human listening/lip-sync review was completed. Acoustic boundaries below are model estimates. The original edit project, stems and effect settings are unavailable. |

[Review coverage and exact inspected frame IDs](review-coverage.json) · [Every-frame measurements](frame-metrics.csv) · [Audio measurements](audio-features.csv) · [Word-event comparison](word-event-comparison.json).

The 198 candidates are **not a shot count**. Fast camera motion, alternating images and typography can all create large frame differences. OCR found something in 1,990 frames, but also confuses texture and outlined type with words. A missed OCR detection is not evidence that a lyric disappeared.

Candidate extraction uses 8-bit grayscale mean absolute difference greater than 25, retaining local maxima within two frames on either side. This is a discovery threshold, not a perceptual or musical accuracy standard.

## Whole-song structure

These are observed presentation sections, not an author-supplied musical score. Times are entry frames where checked precisely; broader ranges describe the section.

| Time / frame reference | Observed treatment | What it contributes |
| --- | --- | --- |
| 0–13.00 s / before f325 | Performance footage; close/wide alternation; blue environment and a recurring fragmented circular overlay; no main lyric line in the overview | Establishes the visual motif before text competes for attention |
| 13.00–36.96 s | Small italic phrases accumulate words in reserved positions. Phrases split into short readable units; occasional large graphic interjections interrupt the verse treatment | A calm reading rule makes later emphasis noticeable |
| 36.96–47.32 s | Large outlined interjections and prominent individual words; a held word appears at f1054 / 42.16 s and stays across a cut at f1102 / 44.08 s | Scale and persistence emphasize a vocal moment without requiring a new scene for each word |
| 47.32–63.68 s | Alternation between a larger cumulative title-related phrase, brief repeated phrases and large replacement words; text survives several picture changes | Different textual units get different presentation durations |
| 64.08–87.56 s, approximately | Smaller cumulative lines return; close-ups, hands and wider views continue to change underneath; larger interjections punctuate the section | The visual vocabulary repeats while footage and density vary |
| Around 87.6–115.96 s | Chorus vocabulary returns with stronger image alternation. The second measured five-word phrase starts at f2460 / 98.40 s | Repetition gives recognition without requiring identical picture editing |
| 115.96–about 140 s | Chopped-hook typography builds into stacked copies, changes surface color and alternates with text-free frames | The lyric graphic becomes a rhythmic motif as well as readable text |
| About 140–150.04 s | Typography largely clears; performance and the circular treatment carry the ending | Creates a visual release rather than maintaining maximum density |
| 150.04–153.20 s / f3751–f3829 | Closing title and circular motif; f3830 at 153.20 s is black | Resolves the established identity; title timing is a separate presentation event |

## 1. Reserve the whole phrase, then reveal words

In the opening six-word phrase, successive additions occur at **13.00, 13.20, 13.48, 14.08, 14.92 and 15.28 s**: frames **325, 330, 337, 352, 373 and 382**. The complete phrase is replaced at **16.08 s / f402**.

The existing words do not re-center each time a word is added. At the first and completed states, OCR places the left edge at approximately **19.6% of frame width**; the completed phrase occupies about 59.8%. This supports the inference that the phrase is laid out as a complete block and revealed in place. It does not identify the editor’s software or implementation.

The reveal gaps are **0.20, 0.28, 0.60, 0.84 and 0.36 s**. They are not equal divisions of a line duration. The scene cut at **13.04 s / f326** follows the first text appearance by one frame; later additions happen within the same shot. Picture cuts and word events are plainly separate.

**Apply to our workflow:** compute final line geometry before animation, with stable word IDs and fixed positions. Keep our full source and translated lines readable in the inactive state, then change focus using the reviewed semantic map. The useful feature is stable geometry; progressively hiding the English sentence would hinder reordered translations and is not our default.

## 2. Distinguish reveal, vocal activity and phrase persistence

The five-word example **“I’m wishing on the moon”** is particularly clear. Word numbers below refer to that single phrase; all values are decoded-video presentation times.

| Event | First measured occurrence | Later occurrence | Offset within either occurrence |
| --- | --- | --- | --- |
| Word 1 appears | f1183 / 47.32 s | f2460 / 98.40 s | 0.00 s |
| Word 2 appears | f1189 / 47.56 s | f2466 / 98.64 s | 0.24 s |
| Word 3 appears | f1199 / 47.96 s | f2476 / 99.04 s | 0.64 s |
| Word 4 appears | f1205 / 48.20 s | f2482 / 99.28 s | 0.88 s |
| Word 5 appears | f1216 / 48.64 s | f2493 / 99.72 s | 1.32 s |
| Next phrase replaces it | f1260 / 50.40 s | f2545 / 101.80 s | 3.08 / 3.40 s |

The five reveal spacings match exactly in these two occurrences. **The completed-phrase holds differ: 1.76 versus 2.08 seconds.** Do not infer that every repeated passage shares all timings. This observation supports reusing a presentation vocabulary while checking reveal, sustain and release independently.

At **48.64 s**, the first phrase gains its final word on a picture cut, while its preceding four words retain their positions. At **50.40 s**, both the scene and phrase change. In the later occurrence, a cut at **100.16 s** occurs during the completed-phrase hold. These are three distinct useful relationships: word-plus-cut, phrase-plus-cut and cut-with-persistent-text.

**Apply:** maintain separate `visibleFrom`, `visibleUntil`, semantic active intervals and picture-event times. Persistence of a complete line is not evidence that every word remains actively sung. Preserve natural translation order and complete English grammatical spans; do not derive English focus by copying the reference’s displayed word count.

## 3. Audio comparison: use models to locate questions, not certify offsets

The frame observations are much firmer than the estimated phonetic boundaries. At 25 fps, visual changes can be located to a particular 40 ms frame interval; this does not make the acoustic onset equally certain.

| Example | Visible reveal | MMS onset estimate | Stable alignment estimate | Interpretation |
| --- | --- | --- | --- | --- |
| First phrase, word 2 | 13.20 s | 13.225 s | 13.16 s | Both estimates put the event nearby; finer acoustic precision is unverified |
| First phrase, word 4 | 14.08 s | 14.270 s | 13.84 s | The models disagree by about 430 ms; no universal lead/lag can be inferred |
| First title-related phrase, word 2 | 47.56 s | 47.606 s | 47.62 s | Both estimates are about 50–60 ms later than the visible appearance |
| First title-related phrase, word 3 | 47.96 s | 48.088 s | 47.86 s | Estimated direction of lead/lag changes with the model |
| Later title-related phrase, word 3 | 99.04 s | 99.648 s | 99.04 s | Approximately **608 ms disagreement**: reject an automatic offset conclusion |

The source contains music, breath, sustained vowels and processed vocals. Whole-track recognition mistranscribed several phrases and generated a spurious ending. Bounded alignment also shows window-edge anchoring and low-confidence words. Neither method proves that a displayed lyric is correct or that the final vocal has ended.

**Apply:** keep acoustic candidates, chosen source events and presentation timings in separate records. Log model disagreement and review the actual audio around those events. Never shift every lyric by a model-derived average, snap sung words to drum peaks, or treat a contact sheet as completed listening. This reference study does not pass the listening part of any future production gate.

## 4. Some edits coincide with attacks; others serve the phrase

The audio script measures a descriptive attack proxy: positive rises in stereo RMS and first-difference energy, using centered 20 ms windows every 10 ms. First-difference energy is sensitive to rapid signal changes; it is not a calibrated frequency band or a vocal detector.

Selected visible cuts can be compared with the strongest proxy peak within ±120 ms:

| Picture event | Nearby proxy peak | Picture minus peak |
| --- | --- | --- |
| 0.84 s / f21 | 0.79 s | +50 ms |
| 1.60 s / f40 | 1.60 s | 0 ms |
| 2.36 s / f59 | 2.40 s | −40 ms |
| 16.64 s / f416 | 16.60 s | +40 ms |
| 19.84 s / f496 | 19.80 s | +40 ms |
| 28.80 s / f720 | 28.80 s | 0 ms |
| 115.96 s / f2899 | 115.99 s | −30 ms |

These are examples of nearby mixed-audio attacks, **not a statistical proof that all cuts follow beats**. Searching a short window in dense music often finds a peak. Large-change detection also includes fast movement and frame alternation; counting every result as a musical edit would substantially overstate the evidence. No certified BPM or original audio-reactivity algorithm is claimed.

**Apply:** choose camera accents from reviewed musical events and phrase structure. Give vocals authority over lyric focus; let instrumental accents influence artwork or a separately named motion envelope. Keep our calibrated spectrum values independent of that expressive envelope. The circular reference motif is an observed graphic treatment, not evidence of a measured spectrum.

## 5. The large typography has a second, much faster animation clock

Consecutive frames **f1054–f1108 / 42.16–44.32 s** show a held word alternating between a sharper outlined state and a broader glowing state. The two states are also present in native 1440p frame checks. The word remains recognizable while this two-frame cycle repeats, including across the cut at **44.08 s**.

In the hook window **f2910–f2940 / 116.40–117.60 s**, typography is repeatedly absent on one frame and present on the next. The visible copies then build from one row to two, with later sections reaching three. For example, **f2922 / 116.88 s** has no main type, **f2923 / 116.92 s** has a partial second row, **f2924 / 116.96 s** clears it, and **f2925 / 117.00 s** restores it. A two-frame cycle at 25 fps is **80 ms / 12.5 Hz**.

This is visual modulation layered over phrase progression. It does not mean that the singer performs another complete word on each flash. Single snapshots and every-second thumbnails can conceal this behavior or make a hold look like a fade.

**Apply:** distinguish a semantic event from its decorative envelope. Use restrained background or halo changes to create intensity while keeping both language rows continuously legible. Rapid on/off type, large duplicated lyrics and outline/glow alternation are reference-specific choices, not new defaults. If an expressive exception is requested, review it audiovisually at native cadence; a static approval is insufficient. Never translate a source two-frame pattern to a two-frame pattern at 60 fps: that changes its rate to 30 Hz.

## 6. Coherence comes from a limited visual vocabulary

Observed ingredients recur across the entire film: a blue environment, dark clothing, close/wide performance views, hands crossing the frame, a fragmented circular surface, pale italic text and larger outlined lettering. The image treatment changes continuously inside that vocabulary. The ending resolves to the same circular motif and title rather than introducing a new design language.

The circular element sometimes appears over the performer and sometimes alongside or around the body. Texture, fragmentation and alternate images change its apparent depth. A mask/composite treatment is a plausible explanation; the available video cannot establish a specific plugin, shader, keying method or production technique. Facial performance suggests synchronization was part of filming/editing, but this study does not certify mouth-to-phoneme accuracy.

**Apply:** define a small motif and a restrained set of camera/texture treatments per song. Plan lower-density verse states, a stronger chorus state and a controlled outro. Let the surrounding scene carry escalation while the bilingual reading geometry remains stable. Use original assets and the current song’s identity; the study does not provide permission or a request to reuse this footage, branding or effects wholesale.

## Required workflow application for the next song

| Stage | Concrete action | Evidence before production rendering |
| --- | --- | --- |
| Lock the recording | Preserve the source sample clock and exact performance; retain native reference PTS | Audio identity and no hidden offset or tempo changes |
| Complete lyric/translation map | Review every source event and every target word, including grammatical expansions | Full target-span ledger and resolved meaning/highlight gaps |
| Finalize acoustic timing | Review actual audio, repeats, fast phrases, sustained endings and ambiguous model results | Chosen onset/release, rejected candidates, method and uncertainty |
| Design presentation separately | Reserve complete line geometry; define line visibility, active focus and optional decorative envelopes separately | No layout movement on word changes; no style timing overwriting acoustic timing |
| Plan picture changes | Label each accent as vocal/phrase, instrumental, section or independent editorial motion | An explicit event map; no blind beat-snapping of words |
| Review at native cadence | Inspect onset/previous-frame/next-frame states, holds, cuts under persistent text, repetitions and end releases | Both aspect ratios and all languages; normal-speed audio review plus detailed boundary checks |
| Close the existing gate | Finish the [cross-language review](../../cross-language-sync-gate.md), resolve defects and freeze input hashes | Missing or stale review blocks the full production render |

The next-song prototype should include a quiet phrase, a cut beneath held text, an independently timed repetition, a long translated grammatical span, an instrumental accent and the final vocal release. Keep the existing Russian/English equal emphasis and no-pronunciation default. These are implementation/review requirements for the next production, not a request to re-render the accepted Прости за любовь edition.

## Reproduction and files

Run measurements against a separately obtained copy of the reference. The exact locally studied file has SHA-256 **`0e45e34ef46a3c4f3cbb1e155a7edc527551788360eba2ca1453fa5fb2d4fbf0`**; another container or delivery encode can have a different hash and must be recorded separately.

```sh
yt-dlp --js-runtimes node --no-playlist -f '271+251' --merge-output-format mkv -o 'Moyka-Moon.%(ext)s' 'https://www.youtube.com/watch?v=6jzieFirHpY'
node analyze-frames.ts Moyka-Moon.mkv analysis
node analyze-audio.ts Moyka-Moon.mkv analysis
mkdir -p review-frames
ffmpeg -i Moyka-Moon.mkv -map 0:v:0 -vf 'scale=960:540' -fps_mode passthrough -q:v 3 review-frames/%05d.jpg
```

`%05d.jpg` is one-based: **`00326.jpg` corresponds to zero-based frame 325**. Source PTS remain authoritative; use frame index divided by 25 only after verifying the constant cadence. The scripts measure decoded media; they do not certify lyric truth or audiovisual quality. Local OCR and model outputs are retained as supporting analysis but are not published as a lyric transcript. [Tool versions, checksums and derived measurements](study-manifest.json) describe this run.

| File | Purpose |
| --- | --- |
| [source.json](source.json) | Official source, credits, selected formats and downloaded identity |
| [review-coverage.json](review-coverage.json) | What was examined, exact frame IDs and method limitations |
| [word-event-comparison.json](word-event-comparison.json) | Sixteen visually checked word appearances and two acoustic candidate methods |
| [frame-metrics.csv](frame-metrics.csv), [analysis-summary.json](analysis-summary.json) | Full-frame grayscale change measurements and largest candidates |
| [cut-candidates.json](cut-candidates.json) | 198 inspected large-change candidates; not an authoritative shot list |
| [audio-features.csv](audio-features.csv), [audio-summary.json](audio-summary.json) | Full-recording descriptive energy/attack data, parameters and limits |
| [analyze-frames.ts](analyze-frames.ts), [analyze-audio.ts](analyze-audio.ts) | Reproducible measurement scripts |

Only original analysis, numerical evidence and scripts are included in this repository update. The downloaded film, audio, extracted frames, full lyric/recognition text and raw download metadata stay local. This study does not change prior releases or claim endorsement by the original creators.
