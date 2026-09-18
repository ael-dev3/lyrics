# Preview before production rendering

Every new song starts with a **preview-only review stage**. Deliver a playable preview before making the full lyric film. The default sequence is:

**Prepare → preview → review and correct → explicit approval → verify gates → production render → delivery verification.**

## Preview-only stage

- Lock the recording, preserve the supplied lyric reference and audit the complete performed text, including repeats, backing vocals and the outro.
- Build translations, fine-grained meaning mappings, provisional acoustic boundaries and the song's visual treatment.
- Provide a full-recording browser preview with the actual soundtrack, seeking, normal/reduced-speed playback and every requested aspect ratio. Use the same scene and timing logic planned for production. Mark timing uncertainty and pending review plainly.
- Hand off at the beginning with the full duration and an obvious restart control. Keep the local server alive independently of the setup command and provide restart instructions. Check media loading and seeking after startup; a cached page or screenshot does not prove playback is available. Show recoverable loading errors and preserve notes when the server disconnects.
- Provide short diagnostic clips or stills only as useful review evidence. If the request says “no render yet,” use live browser playback and stills; do not start an encoded lyric-film job. Downloading, decoding or remuxing the original source for playback is source preparation.
- Include high-risk passages, dense translations, independent repeated performances and the final vocal in the review. Saving notes or marking individual cues reviewed never authorizes a production render.

## Approval belongs to this song and revision

Wait for explicit production-render authorization after the preview is available. Approval of another song, positive feedback alone, a passing test suite, a merged source PR or elapsed time is not that authorization. An explicit preview-only instruction remains in force until the user changes it.

Record the approved preview revision and input hashes, the scope of approval, and a neutral summary of its basis. Keep private wording and ratings out of the public repository. Separate these statuses:

1. **Preview available** — playable and technically checked; review may remain pending.
2. **Synchronization review complete** — all required actual-audio, meaning, full-span and format checks passed for current inputs.
3. **Production authorized** — explicit approval applies to the current song and reviewed revision.
4. **Production verified** — final rendered bytes passed delivery checks.

Both synchronization completion and production authorization are required. The [cross-language synchronization gate](cross-language-sync-gate.md) remains mandatory. A materially changed recording, lyric, mapping, timing or presentation revision invalidates the relevant review and approval; present the corrected preview before production.

**Scoped production decision:** the [Sugar Glass English-only record](../projects/sugar-glass-lyric-film/PRODUCTION-LESSONS.md#approval-and-identity) documents overall acceptance of the current playable preview followed by an explicit render instruction, without a complete granular listening log. That edition records `owner-approved-preview` acceptance, preserves unknown checklist fields and model uncertainty, and binds production to the exact approved inputs. It does not label its detailed synchronization audit complete or change the default review requirement above. Technical delivery checks remain separate from acoustic accuracy. The [Kazhdyy v6 production record](../projects/kazhdyy-lyric-film/PRODUCTION-NOTES.md#acceptance-scope) separately binds an explicit render instruction to the current bilingual shadow-static revision after its updated preview was reviewed. Earlier-revision approval is retained as history and cannot authorize a later scene. This track-specific acceptance also preserves the incomplete granular listening fields. The [La Lune lunar production record](../projects/la-lune-acoustic-lyric-film/PRODUCTION-NOTES.md#approval-and-review-scope) likewise binds explicit production authorization to the accepted `preview-v2-lunar` inputs, keeps unknown listening fields unchanged, and records additional model, semantic, frame-color and audio-identity evidence separately.

The subsequent [La Lune celestial correction](../projects/la-lune-acoustic-lyric-film/CELESTIAL-NOTES.md) records a direct visual-revision and replacement-delivery instruction after the completed edition. Its corrected preview was technically inspected before production, and the initial authorization did not claim preview acceptance. The [subsequent explicit acceptance](../projects/la-lune-acoustic-lyric-film/evidence/owner-acceptance-v3.json) and final recheck bind the unchanged v3 preview and delivered hashes. The prior approved audio, timing, text, mappings and geometry remain hash-identical. The current visual audit and exact production inputs are bound separately. This narrowly scoped correction does not turn an earlier approval into authorization for arbitrary redesigns or new songs.

## Enforce the boundary

Every new project must keep its preview command separate from production commands. Production entry points must refuse absent, incomplete or stale review evidence and absent or stale authorization before capture, segment rendering, encoding or final-file creation. Do not hide full capture behind a command named `preview`.

Test rejection with missing approval, a different song/revision, altered input hashes and incomplete synchronization evidence. Keep authorization closed in a preview-only handoff; never fabricate review telemetry or change the gate to obtain a passing render command.

## Preview handoff is complete without a film render

Deliver the review URL or runnable review package, both layouts, a representative screenshot, source/timing provenance, known review questions and reproduction instructions. State that full rendering is pending approval. Verify and merge completed source/workflow changes under the [GitHub handoff policy](track-workflow-preferences-and-known-issues.md#complete-the-github-handoff); this does not authorize media publication or production rendering.
