# El Tesoro cross-language synchronization review

**Status: INCOMPLETE. Production rendering blocked.** This is the song-specific instance of the [mandatory cross-language gate](../../../docs/cross-language-sync-gate.md). The current `el-tesoro-preview-v1` browser preview is available for review; there is no claim of completed normal-speed or reduced-speed listening and no render authorization.

| Field | Current record |
| --- | --- |
| Recording | [Official El Tesoro upload](https://www.youtube.com/watch?v=vlneT-a-KkQ); locked SHA-256 in [source manifest](../source/media-manifest.json) |
| Languages | Spanish original and meaning-linked English translation |
| Delivery review formats | Original 16:9 and authored 9:16; native/mobile-size inspection pending |
| Cue and word inventory | 24 independently timed lines, 153 Spanish word events; all English tokens map to source IDs in [timeline](../src/timeline.json) and [translation map](../source/translation-mapping.json) |
| Model/acoustic evidence | [Provisional timing candidates](../analysis/provisional-word-evidence.json), [held “Ah” energy](../analysis/ah-tail-evidence.json), [CTC disagreements](../analysis/ctc-disagreement.json) |
| Browser checks | [Sampled picture, seek, switch and restore observations](browser-preview-review.md) |
| Production gate | `npm run render:production` calls [the fail-closed gate](../scripts/render-gate.ts) before any capture |

| Requirement | Status | Remaining evidence |
| --- | --- | --- |
| Every Spanish line and English meaning reviewed against the performed text | Pending | Listen to all 24 lines; resolve any wording variants, including `Ah`/`Ay` and second `el`/`del final`. |
| Each Spanish and English event gets a complete, justified meaning span | Editorial draft; listening pending | Inspect every individual and grouped focus event in both formats, especially reordered `acá / here`, verbal subjects and `Cuidarte / To … care for you`. |
| Entire recording at normal speed | Pending | Play 0:00–4:31.534 with actual audio; include intro, repeats and instrumental coda. |
| Uncertain events at reduced speed | Pending | Check candidate boundaries and held releases listed below at 0.75× or 0.5×. |
| Every cue and target span in both layouts | Pending | Inspect entry, handoff, active focus and exclusive release on the complete preview at native and intended mobile sizes. |
| No unresolved meaning, coverage, timing or picture defects | Pending | Close issues on actual-audio and picture evidence; do not infer from interval tests alone. |
| Frozen review input hashes and explicit authorization | Absent | Record only after complete review and a song/revision-specific render instruction. |

High-risk listening points: L01–L04 and L12–L15 held `Ah` tails; L02 short `qué`; L09 and L20 `un poco acá`; L16 `acá` ending near 137.50 s into L17 `Pensé` near 137.74 s; both independently performed `Hasta el final` releases; L23's pause after `Es` and both final `épica` releases. A separated-vocal tail check finds no clear lead lyric after roughly 180.8 s; this still merits full-song review. Other [CTC disagreement flags](../analysis/ctc-disagreement.json) are conservative prompts for inspection, not confirmed defects.

**Gate decision:** incomplete. Translation choices and machine-inferred time windows are available for review; actual-audio, every-cue audiovisual, full-span semantic review and production authorization are separate pending steps. Do not create `cross-language-sync-review.json` or `render-authorization.json` with completed fields until the corresponding review and authorization truly occur.
