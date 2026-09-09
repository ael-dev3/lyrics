# Reproducible lyric-film workflow and production preferences

This is a sanitized operational record for future tracks. It describes the production requirements, review method, and handoff standard without reproducing private conversation or personal details.

## Documentation boundary

Project documentation should contain decisions that another contributor can apply:

- timing, layout, rendering, preview, validation, and publication requirements;
- known track-specific issues and the reference sections used to evaluate them;
- source files, reproducible commands, audit results, and release status.

It should not contain private thoughts or quotations, personal identifiers, account or contact details, exact local paths, token or cost information, or unpublished rights-sensitive links. Use neutral production language for subjective feedback, such as “below the approved reference standard” or “needs another preview pass.”

## Current track follow-up

The current v2.5.0 16:9 delivery is accepted as the working YouTube edition. No media changes are requested as part of this note.

The checkpoint around `00:47` remains a known imperfect lyric-highlighting/presentation moment. The surrounding `00:40–00:50` section is usable, but that checkpoint does not yet meet the reference quality demonstrated by `01:46–01:56`. Record it as a future refinement item rather than silently changing the approved file.

For a future pass, create a short preview and compare `00:47` directly with `01:46–01:56`. Inspect the source lyric cues and the derived presentation cues separately so that a timing problem is not obscured by a layout change.

## Production preferences

### Lyric timing and readability

- Lyric highlighting must follow the vocal performance closely enough to feel intentional at normal playback speed.
- Word-level emphasis, line handoffs, focus release, and cue-stage movement should be driven by explicit timing data rather than ad-hoc offsets.
- When a repeated section has a stronger approved performance, use it as a measured reference and fit the repeated section with an explicit, documented transform.
- Preserve independently reviewed source cues; derive presentation cues from them instead of overwriting the source timing.
- Short previews are the primary review unit for synchronization. A full render is not a substitute for checking a questionable ten-second window.

### Visual language

- Keep lyric lines stable, centered, and readable against the artwork; protect safe areas in every delivery aspect ratio.
- Do not introduce unnecessary word separation or a “words flying apart” effect. Outro motion should resolve to a controlled, centered settle with a consistent gap.
- Keep spectrum and other diagnostic-style visuals restrained, legible, and visually coherent; avoid rounded or noisy treatments when square-ended bars are the intended language.
- Treat the square master and native 16:9 edition as deliberate compositions. Do not stretch, crop, or letterbox one into the other without an explicit design decision.
- Keep public compositions clean. Put diagnostic overlays, measurement guides, and proof-only material in separate previews or proof renders.

### Media and handoff

- Preserve the approved audio timing and source-media identity through the render pipeline.
- Prefer a high-quality master render followed by a controlled delivery encode with recorded metadata and checksums.
- Make changes reversible and traceable: keep source data, scripts, composition variants, audit reports, and release notes together.
- Use concise progress updates focused on decisions, completed checks, and blockers; keep private conversation out of repository history.

## Repeatable workflow

1. Lock the source audio, artwork, lyric text, and project identity before editing.
2. Read the existing project notes and inspect prior approved reference windows.
3. Define the timing authority for each section. Keep source lyric cues distinct from presentation-only choreography.
4. Implement changes as explicit, named, reproducible composition or data updates.
5. Render short previews first, normally 10–15 seconds around the affected section and its approved comparison section.
6. Play the preview with the source audio and review lyric highlighting, line transitions, spacing, safe areas, and motion at normal speed.
7. For repeated sections, compare the candidate directly with the approved reference window; document any remaining checkpoint instead of masking it with unrelated changes.
8. Render the complete delivery only after the targeted previews are acceptable.
9. Run technical checks: typecheck, tests, composition discovery, timing/alignment checks, full decode, frame count, dimensions, frame rate, metadata, and checksums.
10. Run visual spot checks at intro, affected sections, transitions, and outro. Keep proof renders separate from the clean master.
11. Place the final local deliverable in the requested handoff location and publish source, workflow, audits, and checksums to GitHub.
12. Keep rights-sensitive media private or in draft release state until the necessary permission is confirmed.

## Per-track handoff checklist

Before calling a track complete, record:

- source media identity and duration;
- lyric and audio timing authority;
- approved comparison windows;
- aspect-ratio-specific composition decisions;
- short-preview review points and their status;
- known imperfections with timestamps and a neutral description;
- commands used to render and verify;
- final file properties, checksums, and publication status;
- rights and permission status for any included media.

This checklist is intended to make the workflow portable to additional tracks while preserving the current project’s timing discipline and visual standards.
