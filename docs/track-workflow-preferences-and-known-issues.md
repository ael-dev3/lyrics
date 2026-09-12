# Reproducible lyric-film workflow and production preferences

This is a sanitized operational record for future tracks. It describes the production requirements, review method, and handoff standard without reproducing private conversation or personal details.

## Documentation boundary

Project documentation should contain decisions that another contributor can apply:

- timing, layout, rendering, preview, validation, and publication requirements;
- known track-specific issues and the reference sections used to evaluate them;
- source files, reproducible commands, audit results, and release status.

It should not contain private thoughts or quotations, personal identifiers, account or contact details, exact local paths, token or cost information, or unpublished rights-sensitive links. Use neutral production language for subjective feedback, such as “below the approved reference standard” or “needs another preview pass.”

## Tanisea v2.5.0 follow-up

The Tanisea v2.5.0 16:9 delivery is accepted as the working YouTube edition. No media changes are requested as part of this note.

The checkpoint around `00:47` remains a known imperfect lyric-highlighting/presentation moment. The surrounding `00:40–00:50` section is usable, but that checkpoint does not yet meet the reference quality demonstrated by `01:46–01:56`. Record it as a future refinement item rather than silently changing the approved file.

For a future pass, create a short preview and compare `00:47` directly with `01:46–01:56`. Inspect the source lyric cues and the derived presentation cues separately so that a timing problem is not obscured by a layout change.

## Production preferences

### Lyric timing and readability

- Production deliverables include original-language lyrics and meaning-based translations only. Pronunciation guides, phonetic respellings, romanized singing aids and pronunciation practice subtitles are excluded from current and future workflows, source archives and publishing assets.
- Lyric highlighting must follow the vocal performance closely enough to feel intentional at normal playback speed.
- Word-level emphasis, line handoffs, focus release, and cue-stage movement should be driven by explicit timing data rather than ad-hoc offsets.
- When a repeated section has a stronger approved performance, use it as a measured reference and fit the repeated section with an explicit, documented transform.
- Preserve independently reviewed source cues; derive presentation cues from them instead of overwriting the source timing.
- Short previews are the primary review unit for synchronization. A full render is not a substitute for checking a questionable ten-second window.

### Vocal coverage across the complete recording

- Audit the entire source audio for performed lyrics before locking the cue map. Check the intro, every gap between supplied lines, and the complete tail after the supplied text ends. The end of a lyric reference is not evidence that the remaining audio is instrumental.
- Compare the cue map with independent evidence from the actual recording, such as full-track transcription and targeted audio review of uncovered spans. A forced alignment of supplied text can establish where those words occur but cannot establish that no other words are sung. Automatic-caption labels such as `[Music]`, missing captions, and transcription silence are not proof of an instrumental passage.
- Investigate every uncovered span with apparent vocals. Record its time range, the evidence reviewed, and whether it contains omitted lyrics, a performed reprise, non-lexical vocals, or an instrumental passage. Keep unresolved passages explicit and resolve lyric omissions before the full render.
- Add confirmed performed repeats to the production text and align them to their actual occurrence. Reusing the wording does not justify copying another chorus's timestamps. Preserve the supplied reference separately and document any additions to the performed lyric sequence.

### Visual language

- Default to a cinematic lyric presentation with stable word positions and color-only emphasis on the current word or semantic group. Keep the source imagery, composition and broader motion expressive while the reading position stays calm.
- Do not add karaoke underlines, word boxes or pills, or bouncing glyphs unless explicitly requested. A historical reference containing these treatments does not override this default. Color and luminance should distinguish focus while both active and inactive words remain readable over the actual background, including bright or busy frames and mobile-size views.
- Apply this treatment to the current Midnight Love revision and future productions. Other published films, finalized timing data and release archives remain historical records; this default does not itself request their revision.
- Keep lyric lines stable, centered, and readable against the artwork; protect safe areas in every delivery aspect ratio.
- Do not introduce unnecessary word separation or a “words flying apart” effect. Outro motion should resolve to a controlled, centered settle with a consistent gap.
- Keep spectrum and other diagnostic-style visuals restrained, legible, and visually coherent; avoid rounded or noisy treatments when square-ended bars are the intended language.
- Treat the square master and native 16:9 edition as deliberate compositions. Do not stretch, crop, or letterbox one into the other without an explicit design decision.
- Keep public compositions clean. Put diagnostic overlays, measurement guides, and proof-only material in separate previews or proof renders.
- Blend lyric-area contrast into continuous full-frame shading. Avoid visible boxes or localized dark patches that appear and disappear with cues. Check occupied and empty reading areas, and fade cropped source edges completely into the surrounding background before they become visible, especially in portrait compositions.

### Equal emphasis for English lyrics

- Follow the [bilingual lyric workflow](bilingual-lyric-workflow.md) for future productions. English receives equal perceived size and weight, color/contrast, highlight intensity and synchronization precision alongside the original-language lyrics.
- Apply the same cinematic color-only focus to both languages, including comparable active and inactive contrast. Removing karaoke decoration must not reduce English prominence or loosen either language's timing.
- Share source timing and semantic cue events across both languages, including onset, handoff and release behavior. Natural English word order may require grouped or non-linear focus.
- Fit long translations through reflow or composition changes, not English-only shrinking or dimming. Use the track's own palette with equally strong active and inactive text treatments.
- Check both languages at native and mobile size before the full render. Earlier films with small secondary English captions remain historical references, not the future design default.

### Media and handoff

- Preserve the approved audio timing and source-media identity through the render pipeline.
- Prefer a high-quality master render followed by a controlled delivery encode with recorded metadata and checksums.
- Make changes reversible and traceable: keep source data, scripts, composition variants, audit reports, and release notes together.
- Use concise progress updates focused on decisions, completed checks, and blockers; keep private conversation out of repository history.

### TikTok cover default

- Apply the [TikTok cover workflow](tiktok-cover-workflow.md) to every TikTok publishing kit without requesting the same specifications again.
- Deliver a dedicated **portrait 1200×1600** profile cover. The established upload interface labels its tall preview “4:3”; record the actual file ratio as **3:4 width:height** to avoid repeating the landscape-cover mistake.
- Keep the complete title, artist and focal subject visible; match the track's artwork and palette. Check the cover at 150×200 pixels and under a modest centered crop before delivery.
- Name the file with `Profile-1200x1600` so orientation is unambiguous. A landscape or 9:16 cover is a separate, explicitly requested variant, not the default upload.

## Repeatable workflow

1. Lock the source audio, artwork, lyric text, and project identity before editing.
2. Read the existing project notes and inspect prior approved reference windows.
3. Audit vocal coverage across the entire recording, including gaps and the tail after the supplied text ends. Resolve omitted performed lines and document the evidence for uncovered spans. Define the timing authority for each section, keeping source lyric cues distinct from presentation-only choreography.
4. Implement changes as explicit, named, reproducible composition or data updates.
5. Render short previews first, normally 10–15 seconds around the affected section and its approved comparison section.
6. Play the preview with the source audio and review lyric highlighting, line transitions, spacing, safe areas, and motion at normal speed. Check stable, color-only word/group emphasis without karaoke decoration unless explicitly requested. Verify active/inactive readability and equal bilingual size, color, focus and timing at native and mobile size using the [style-preview acceptance gate](bilingual-lyric-workflow.md#style-preview-acceptance-gate).
7. For repeated sections, compare the candidate directly with the approved reference window; document any remaining checkpoint instead of masking it with unrelated changes.
8. Render the complete delivery only after the targeted previews are acceptable and the complete-recording vocal-coverage audit has no unresolved lyric omissions.
9. Run technical checks: typecheck, tests, composition discovery, timing/alignment checks, full decode, frame count, dimensions, frame rate, metadata, and checksums.
10. Run visual spot checks at intro, affected sections, transitions, and outro. Keep proof renders separate from the clean master.
11. Place the final local deliverable in the requested handoff location and publish source, workflow, audits, and checksums to GitHub.
12. Keep rights-sensitive media private or in draft release state until the necessary permission is confirmed.

## Per-track handoff checklist

Before calling a track complete, record:

- source media identity and duration;
- lyric and audio timing authority;
- complete-recording vocal-coverage evidence, including checked gaps, the final vocal passage, any added reprises, and the verified tail classification;
- approved comparison windows;
- aspect-ratio-specific composition decisions;
- equal bilingual emphasis checks, including typography, active/inactive contrast, semantic focus and mobile-size evidence;
- short-preview review points and their status;
- known imperfections with timestamps and a neutral description;
- commands used to render and verify;
- final file properties, checksums, and publication status;
- rights and permission status for any included media.

This checklist is intended to make the workflow portable to additional tracks while preserving the current project’s timing discipline and visual standards.

## Reference study: LOOP

For future image-dominant lyric films, consult the [LÜCY & Moyka — LOOP study](studies/loop-2026/README.md). It documents stable reading positions, recurring visual motifs and independently changing language rows. Use its prototype brief as inspiration alongside this workflow; its observations do not replace audio alignment, semantic translation or delivery verification.
