# Cinematic lyric presentation

**Preview before render:** follow [the mandatory preview-first workflow](preview-before-render.md). Deliver a playable review preview before full production. Complete synchronization review and obtain explicit render approval for the current song and reviewed revision before capture or encoding. A preview-only request stops at review delivery; passing tests, positive feedback, saved review notes, a merged PR or approval of an earlier song do not authorize rendering.

**Mandatory for future multilingual productions:** pass the [complete cross-language synchronization gate](cross-language-sync-gate.md) before starting full-length production rendering. Review the entire recording in all languages, including complete translated highlight spans. Diagnostic previews are review evidence, not permission to skip unfinished synchronization.

**Default for current and future productions, established with Midnight Love v1.1.0 on 12 September 2026.** Keep the image expressive and the reading position calm. Precisely timed color emphasis follows the performed word or short semantic group without adding karaoke decoration.

This standard takes precedence over underline, progress-fill and subordinate-English treatments in older prototypes and implementation notes. Published films and immutable release archives remain records of their own editions. Apply an explicitly requested style exception to the relevant project and document it there.

## Visual treatment

| Element | Production default |
| --- | --- |
| Word focus | Change text color and luminance while preserving glyph positions, spacing, size and weight. Active and inactive words must both remain readable. |
| Decorations | Omit active-word underlines, boxes, pills, bouncing glyphs and cumulative karaoke sweeps unless explicitly requested. |
| Timing | Keep independently reviewed vocal onsets, handoffs and releases. A quieter visual treatment does not justify looser timing or a delayed color change. |
| Complex vocals | Use explicit short word or semantic groups when connected delivery or translation makes individual boundaries uncertain. Record the grouping and its evidence. |
| Bilingual lyrics | Give English and the original language equal perceived size, weight, contrast and focus intensity. Drive corresponding meanings from the same source events. |
| Contrast | Blend readability shading continuously into the scene. Avoid cue-shaped panels or dark patches that appear and disappear with the words. |
| Artwork and motion | Use the current song's imagery and palette. Let camera movement, source animation and restrained effects carry expression without moving or obscuring the reading area. |
| Audio-reactive graphics | Keep measured spectrum data separate from artistic motion. A visual style choice does not change the measured values or establish an objective emotional reading. |
| Aspect ratios | Compose landscape and portrait separately around the shared soundtrack and timing data. Review lyric placement and source-edge blending in each format. |

Color-only focus includes a visible luminance difference; do not rely on hue alone or make inactive lyrics faint. Reflow long translations or rebalance the composition while maintaining [equal bilingual emphasis](bilingual-lyric-workflow.md).

Use track-specific colors, fonts and motion. Midnight Love's blue, silver and pale gold are a reference for that recording, not a universal palette. Decorative spectrum or composition lines are distinct from active-word underlines.

### Single-language editions

Follow the language scope commissioned for the current edition. When a translation lane is removed, recompose the available area: enlarge the source lyrics, distinguish lead and backing voices, and consider a stronger spectrum or section-level scale changes. Freeze each phrase's geometry before word highlighting; a more expressive composition must preserve the original acoustic boundaries and readable inactive words. Review quiet sections, choruses, overlaps and the ending in every format. Single-language editions retain the full listening and render-approval gates; cross-language correspondence checks apply when translations are included.

## Match motion intensity to the song

Choose the visualizer's role before tuning its response. Gentle, intimate or contemplative arrangements benefit from a small supporting spectrum, limited vertical travel and subdued opacity. Let source animation, composition and lyric meaning provide the expression. A sustained or emotionally important passage may retain that restraint throughout.

Use **Твои глаза** as an implemented example of this approach: 64 square-ended pale-gold bars, maximum group opacity 0.60, height caps of 24 px in landscape and 42 px in portrait, and equal, stable bilingual text. The spectrum and title fade out together before the source ending. The [production lessons](../projects/tvoi-glaza-lyric-film/PRODUCTION-LESSONS.md#the-restrained-visualizer) record the actual formula, geometry and limits.

For more forceful arrangements, larger reach or reviewed transient accents may suit the composition. Historical hero gestures and large analyzer rails remain available techniques; choose them deliberately. Numerical loudness alone cannot decide the song's emotional treatment. Keep raw audio measurements unchanged, describe any nonlinear artistic mapping, and preserve the same acoustic precision and bilingual prominence at every motion intensity.

During the short style review, include quiet material, a musical peak, dense bilingual text and the ending in both formats. Check that bars remain visible after encoding and at mobile size, that their movement supports the picture, and that the ending has room for original credits. Record the chosen intensity and its reason in neutral production language.

### Reserve impact for selected sections

For arrangements with distinct energy tiers, define baseline, supporting emphasis and climax windows on the audio timeline before tuning bar size. Let measured frequency shape and vocal energy operate within those artistic limits. Keep transitions within the reviewed windows and join adjacent tiers without an unintended dip. Review the frames immediately before, at and after each boundary with actual-cadence playback.

The completed [каждый, кто делал тебе больно treatment](../projects/kazhdyy-lyric-film/PRODUCTION-LESSONS.md) demonstrates this approach: the largest response is reserved for one climax, the illustration stays fixed, and brief vocal-linked grain changes remain inside protected shadow interiors. The reusable decision is to assign a clear purpose to each moving layer. Choose the next recording's windows, geometry and effects from its own arrangement and imagery.

Give each effect a reason to exist: section energy, a discernible change in vocal texture, or a meaningful picture transition. Compare it enabled and disabled during review. Protect artwork landmarks and the reading area; remove motion that distracts without strengthening the relationship to the music. Texture events, lyric timing and translated meaning remain separate data, even when they share the same audio clock.

A limited palette can still support strong contrast through luminance, scale, negative space and texture. Record authored base colors separately from intermediate raster and encoded values. Keep the commissioned palette local to its project, and preserve equal bilingual focus through every intensity tier. Review dense text and fine shadow detail at native and mobile size in both formats, including decoded diagnostics.

## Timing and coverage

Audit the complete recording, including gaps and the tail after the supplied reference ends. A lyric sheet ending, missing automatic captions or a `[Music]` label does not establish that a passage is instrumental. Preserve the supplied reference separately, document confirmed performed repeats and align each performance independently. Follow the [complete-recording coverage requirements](track-workflow-preferences-and-known-issues.md#vocal-coverage-across-the-complete-recording).

Keep line visibility separate from word focus: the incoming line should be readable when its vocal begins, and the closing title must leave room for the final sung word. Evaluate sustained-vowel release separately from trailing reverberation. Preserve the locked audio timeline when revising visuals.

At 60 fps, nearest-frame rounding can stay within about 8.33 ms; that describes display quantization, not acoustic alignment accuracy. Record uncertain vocal boundaries and the actual review methods. Do not describe model or still-frame checks as a human listening review.

### Applying the Moon reference

The [Moyka — Moon frame study](studies/moyka-moon-2026/README.md) separates word reveals, line holds, picture changes and decorative cycles. Reserve complete lyric geometry before animation. Keep full inactive bilingual lines legible while their semantic spans receive focus; a source-language reveal pattern cannot substitute for translated meaning correspondence. A cut beneath persistent text must not reset its focus or position.

Review each repeated performance’s onset, sustain and release separately, even when its reveal spacing matches another occurrence. Keep picture accents and decorative envelopes separate from the acoustic event map. The reference’s rapid alternating typography is a documented stylistic choice, not our default; adapting a reference to 60 fps must preserve intended durations in seconds rather than blindly copying frame counts. Review actual-cadence playback as well as boundary frames before production rendering.

## Review before delivery

1. Render short previews covering a quiet line, a rapid handoff, the longest line, a bright or busy background, an uncertain boundary and the final vocal release. Include reordered English groups when relevant.
2. Inspect active and inactive text at native and mobile size in every delivery format. Check stable geometry, comparable bilingual prominence, smooth source-edge blending and the absence of lyric decorations.
3. Review synchronization with the audio. Record the methods, timestamps, observations and unresolved uncertainty; a contact sheet alone does not verify what is heard.
4. Check every cue's coverage and geometry. After rendering, verify media decoding, frame cadence and soundtrack identity, then inspect selected decoded frames around handoffs, joins and the outro.
5. Document the selected style, palette, cue authority, review results, final screenshot, reproduction commands, release links and file hashes. Preserve historical evidence under its correct edition.

Use the [first-pass workflow](first-pass-song-workflow.md) for production order and the [general workflow](production-workflow.md) for the complete pipeline. Follow the [portrait TikTok cover specification](tiktok-cover-workflow.md) for publishing kits.

## Implemented reference: Midnight Love v1.1.0

![Midnight Love final frame: stable silver lyrics with pale-gold color focus beside the source figure and flame](../projects/midnight-love-lyric-film/evidence/youtube-final-44.png)

*Decoded final YouTube frame at 44 seconds. Original song and footage: [girl in red's official upload](https://www.youtube.com/watch?v=9256X67IQdQ); the upload credits the photograph to Fabian Fjeldvik. Added lyric presentation by Ael, assisted with Codex. See the [full creator and software credits](../projects/midnight-love-lyric-film/README.md#original-creators).*

Both complete films remove active-word underlines and retain stable pale-gold/silver focus. The revision also restores six closing reprise cues after 2:34, bringing the sequence to 38 cues, 185 performed words and 161 focus groups. The selected final held-vocal endpoint is 185.4 s; the closing title begins after 188 s. The audio timeline is unchanged.

The delivery record contains 152 checked layout states, 48 visually reviewed decoded frames, 16 exact sampled viewport comparisons and 64 sampled lossless pixel comparisons. Both films passed full decoding, every-frame timestamp checks and locked AAC packet comparisons. All 16 published release assets matched local hashes after download. Sampled visual and pixel checks do not establish exhaustive visual equality or exact acoustic timing.

[Production decisions and reproduction](../projects/midnight-love-lyric-film/README.md) · [Final verification and limits](../projects/midnight-love-lyric-film/evidence/final-verification.md) · [Publication receipt](../projects/midnight-love-lyric-film/evidence/release-upload-verification.json) · [Download v1.1.0](https://github.com/ael-dev3/lyrics/releases/tag/midnight-love-v1.1.0)
