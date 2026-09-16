# Preview before production rendering

Every new song starts with a **preview-only review stage**. Deliver a playable preview before making the full lyric film. The default sequence is:

**Prepare → preview → review and correct → explicit approval → verify gates → production render → delivery verification.**

## Preview-only stage

- Lock the recording, preserve the supplied lyric reference and audit the complete performed text, including repeats, backing vocals and the outro.
- Build translations, fine-grained meaning mappings, provisional acoustic boundaries and the song's visual treatment.
- Provide a full-recording browser preview with the actual soundtrack, seeking, normal/reduced-speed playback and every requested aspect ratio. Use the same scene and timing logic planned for production. Mark timing uncertainty and pending review plainly.
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

## Enforce the boundary

Every new project must keep its preview command separate from production commands. Production entry points must refuse absent, incomplete or stale review evidence and absent or stale authorization before capture, segment rendering, encoding or final-file creation. Do not hide full capture behind a command named `preview`.

Test rejection with missing approval, a different song/revision, altered input hashes and incomplete synchronization evidence. Keep authorization closed in a preview-only handoff; never fabricate review telemetry or change the gate to obtain a passing render command.

## Preview handoff is complete without a film render

Deliver the review URL or runnable review package, both layouts, a representative screenshot, source/timing provenance, known review questions and reproduction instructions. State that full rendering is pending approval. Verify and merge completed source/workflow changes under the [GitHub handoff policy](track-workflow-preferences-and-known-issues.md#complete-the-github-handoff); this does not authorize media publication or production rendering.
