# Cinematic lyric presentation

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

## Timing and coverage

Audit the complete recording, including gaps and the tail after the supplied reference ends. A lyric sheet ending, missing automatic captions or a `[Music]` label does not establish that a passage is instrumental. Preserve the supplied reference separately, document confirmed performed repeats and align each performance independently. Follow the [complete-recording coverage requirements](track-workflow-preferences-and-known-issues.md#vocal-coverage-across-the-complete-recording).

Keep line visibility separate from word focus: the incoming line should be readable when its vocal begins, and the closing title must leave room for the final sung word. Evaluate sustained-vowel release separately from trailing reverberation. Preserve the locked audio timeline when revising visuals.

At 60 fps, nearest-frame rounding can stay within about 8.33 ms; that describes display quantization, not acoustic alignment accuracy. Record uncertain vocal boundaries and the actual review methods. Do not describe model or still-frame checks as a human listening review.

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
