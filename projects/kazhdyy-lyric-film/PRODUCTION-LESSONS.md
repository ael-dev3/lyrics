# Production lessons

## What the finished treatment establishes

The accepted v6 film combines a steady illustration, equal bilingual lyrics, a three-color palette and selective increases in visualizer strength. Its useful precedent is the division of responsibilities: the spectrum carries section energy, shadow texture responds to changes in vocal character, and word color carries meaning. Each layer can become expressive without displacing the others.

| Decision in this film | Reusable lesson |
| --- | --- |
| Normal, medium and strongest sections have separate limits. | Reserve visible headroom for the climax. Choose emphasis windows from the arrangement before tuning the response inside them. |
| The artwork stays fixed while dark interiors briefly change texture. | A vocal change can be expressed through material or texture. Picture movement needs its own musical and compositional reason. |
| Ink, ivory and vermilion carry the complete treatment. | Under a limited palette, build impact with luminance, scale, spacing and texture. The three-color constraint belongs to this commission; it is not a default for future songs. |
| Both lyric rows retain equal, fixed geometry during the strongest passage. | Budget motion around the reading area and check the longest translation at maximum intensity. |
| Russian events drive complete English meaning spans. | Preserve natural translation order and grammatical completions; a target span may light up out of reading order without invented acoustic timestamps. |

The palette is three **authored base colors**, not three possible pixel values. Opacity, antialiasing, gradients and video encoding create intermediate values. The [project specification](README.md#palette-and-motion) and [final verification](evidence/final-verification.md) retain the implementation and evidence; the principles above do not prescribe the same palette, bar heights or shadow effect for another recording.

## Arrangement controls the visual hierarchy

The spectrum's normal, medium and strongest sections are an explicit artistic score. A local vocal peak does not override those boundaries. Keep raw frequency measurements separate from the artistic height budget, and verify every boundary frame so emphasis cannot spill into adjacent quiet material.

The accepted schedule is medium at 1:10–1:28 and 2:38–2:55, strongest at 2:55–3:10, and normal elsewhere. Transitions occur inside those intervals. The original illustration geometry and equal bilingual reading positions stay fixed.

The 300 ms transitions preserve that schedule: medium blends directly into strongest at 2:55, and the response returns to normal by 3:10. Vocal energy shapes the response within the selected range. A loud event outside those windows does not receive the climax's height budget. See the [section specification](evidence/motion-review-v5.md#visual-hierarchy) and [full-timeline checks](evidence/vocal-response-check.json); the v5 document remains a historical preview record, while [v6 delivery verification](evidence/final-verification.md) describes the finished files.

### Review procedure to carry forward

1. Mark baseline passages, supporting peaks and the main climax on the locked audio timeline. Record the intended role and spatial limit of every animated layer.
2. Compare a quiet passage with each intensity tier using the actual audio. Inspect just before, at and after every boundary, including adjacent emphasized sections. Keep the complete-song listening review as a separate requirement.
3. Review the longest bilingual cue, a sustained loud vocal, a rapid handoff and a vocal texture change in both layouts at native and mobile size. Check that the response is apparent without covering text or weakening either language's focus.
4. Compare each decorative effect enabled and disabled. Retain it only when its connection to the sound or imagery is clear and readability survives. Recheck after encoding: fine grain and dark gradients may reproduce differently from the browser.
5. Freeze the reviewed revision, then follow preview approval, production and final-file verification in order. The schedule and effects for the next song require their own review.

## Give shadow movement a narrow purpose

Brief grain changes inside broad dark interiors create vocal contact without shifting the picture. Detect spectral changes from the vocal analysis, space events, show only a few deterministic grain states, then hold. Exclude colored landmarks and erode the source-dark mask to protect edges. Preserve the source palette and keep this decorative map independent of lyric meaning and timing.

The current map has 384 acoustic events and 1,153 unique grain states including the initial state. These are signal-derived artistic events, not speaker labels or recognized phonemes. Stem leakage and uncertain acoustic word boundaries remain distinct limitations.

## Preserve the reviewed pixels while making rendering practical

Repeated SVG turbulence and masking are expensive at the 2× capture resolution. The production adapter rasterizes only the artwork panel once per unique state, then uses the approved persistent painter for spectrum geometry, bilingual focus, title visibility and ending opacity.

The comparison is stronger than a visual impression: direct and cached 120-frame ProRes diagnostics are byte-identical in both layouts. Their decoded pixels have zero difference in every channel. The pipeline verifies cache recipe and file hashes before each video segment. Small 24-state preparation batches bound retained filter surfaces; completed image hashes support safe resume. Hardware acceleration must be compared before adoption; the tested alternative changed pixels and was rejected.

This is a representation change within the production adapter. It does not alter the approved preview's source audio, typography, layout, word samples, semantic spans, palette or dynamics.

For long local runs, keep the host awake for the lifetime of the renderer and verify that frame progress remains continuous. Idle-sleep prevention alone did not prevent brief maintenance wakes followed by sleep in this run. A temporary full-wake assertion restored continuous rendering. Browser failures and artwork-request timeouts were recovered by restarting only the owned render processes and resuming segments whose recipe, frame range and file hashes still matched. A bounded watchdog prevents an error from leaving the pipeline silently stalled. An unfinished capture is never accepted merely because its output file exists; final verification still covers the assembled film.

The project wrapper for POSIX hosts is `node scripts/resume-production.ts landscape` (or `portrait`). Run only one supervisor per format at a time. It enforces the same authorization, allows at most eight attempts per invocation, preserves its attempt history, and terminates only the process group it created. On macOS, a temporary `caffeinate -disu -t 10800` wrapper can protect a three-hour work period; verify continuous progress and use a duration appropriate to the job. Do not change permanent power settings as part of the film workflow. Run final verification after successful assembly regardless of how many attempts were needed.

## Verify the actual delivery

Segment container durations are not a reliable master clock. Two portrait segments reported 13.333000 seconds for 800 frames at 60 fps, instead of the exact 13.333333… interval. Default concatenation inherited that rounding, and the full-frame timestamp check rejected the assembly at frame 1599. `scripts/assemble-delivery.ts` supplies durations from differences of rounded global frame boundaries, avoiding both millisecond metadata rounding and accumulated per-segment rounding. It stream-copies all 12,798 encoded video packets and checks that their payloads remain identical. The original AAC is copied independently. Run this assembly stage for both formats before final verification; no picture re-encoding or audio retiming is involved.

Check every final video timestamp and frame count, metadata and strict decode. Compare every original AAC packet payload and timestamp plus the complete decoded PCM identity. Decode the video and inspect the expected state of every displayed Russian and English word, using bundled-font glyph interiors and the actual colors.

A deliberately incorrect 100 ms diagnostic offset produced 92 highlight mismatches, confirming that the decoded-focus check can detect a timing error. Passing the correct offset proves agreement with the approved event map; it does not measure acoustic truth or complete an unknown listening checklist.

Evaluate the final fade against its intended appearance as well as numerical diagnostics. The delivered ending was visually reviewed as dark ink with faint compression residuals; neither decoded last frame is a uniform RGB field. Preserve that observation in the [ending inspection](evidence/final-ending-check.json). An exact-uniformity diagnostic must not be reported as passing, and a low-amplitude residual must still be inspected for a visible outline or flash.

Use decoded final-film frames for README illustrations, and keep promotional cover adaptations separate. Preserve the cover prompts, selected originals, export dimensions, small-size review and local crop checks. Verify every file again after copying the final upload kit to its destination.

## Approval and identity

Production follows explicit approval of `preview-v6-shadow-static`. Earlier approvals belong to their own revisions. The authorization binds unchanged preview hashes and the production adapter; overall acceptance remains separate from incomplete per-cue actual-audio telemetry. The default preview-first and full synchronization-review requirements remain unchanged for future work.
