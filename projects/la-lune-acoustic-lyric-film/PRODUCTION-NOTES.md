# La Lune production record

## Approval and review scope

The current `preview-v3-celestial` is an owner-directed visual correction and replacement local delivery of the completed lunar edition. The [celestial record](CELESTIAL-NOTES.md) documents neutral black/silver color, steady Moon illumination, real catalogue stars and bounded independent twinkling. Audio, words, timing, mappings and reading geometry match the prior accepted edition exactly.

The [v2 acceptance snapshot](evidence/history/v2/accepted-preview-identity.json) remains historical. The [current authorization](evidence/render-authorization.json) records the correction-and-delivery instruction with `previewAccepted: false`; no new acceptance or granular listening telemetry is invented. The [current review](evidence/sync-review.json) retains incomplete listening fields and source-token uncertainty. The corrected live preview and both render adapters were technically checked before production.

## Final pre-render audit

The unchanged timing evidence in the [final audit](evidence/final-sync-audit.json) retains bounded MMS alignment on the original mix and independent Whisper-small alignment on isolated vocals to the four earlier candidates. All fourteen vocal spectrogram panels were inspected with the comparisons. Window-edge starts, mistaken legato handoffs and truncated held notes remain identifiable model failure modes; no global offset or automatic averaging was applied.

Every French word and all English grammatical completions were reviewed. The complete 11,854-frame event timeline contains 11,820 visible French word states and 13,366 English word states per format. All selected mappings pass. The highest-risk examples remain `ne…qu’une`, reordered adjectives, `sets off`, and the `Neptune-blue` union. Additional evidence did not establish a reliable reason to alter the approved boundaries.

The baseline production adapter uses the same persistent painter as the preview. Eight native-frame comparisons across both layouts are pixel-identical to the deterministic preview scene. A two-second encoded landscape diagnostic passes 1,920 word-state checks. A deliberately shifted expectation creates 292 detected errors, demonstrating that the decoded checker can reject a timing mismatch.

## Render contract

The final renderer caches 69 exact Chromium-rendered SVG layer states per format as lossless PNGs at twice the delivery dimensions. It composites those layers with the same frame-indexed opacity, spectrum and ripple calculations and renders the catalogue stars with matching point/glow primitives, then downsamples once with Lanczos and encodes HEVC Main 10 at CRF 17, 60 fps, BT.709 limited range. Sixteen contiguous segments bound temporary disk use. The render command also enables periodic collection of unreachable native canvas/RGBA allocations. The supervisor completes one new segment per fresh process, using one full-resolution worker at a time. Periodic collection alone did not release all native allocations in sustained runs; terminating each completed worker releases them fully. Short diagnostics had hidden this native-memory accumulation. Interrupted exports resume from checksum-verified complete segments. The original ProRes adapter remains as a slower diagnostic reference; it is not the final delivery pipeline. The source Moon's native resolution remains 1254×1254; supersampling improves vector/text edges and does not invent source-image detail.

Each segment is strictly decoded and hashed. Its uncompressed RGBA sequence is also hashed while streaming; full raw frames can be regenerated from the checked layer cache. Verified segments can resume only with the same production fingerprint, cache contract, frame range and file hash. The assembler derives segment durations from rounded global frame boundaries, avoiding accumulated container-duration rounding. The final mux copies the original AAC packets without gain changes, resampling or retiming.

Before production, build both caches with `npm run raster:cache -- landscape` and `npm run raster:cache -- portrait`, bind their local hashes with `node scripts/raster-contract.ts --bind`, and run `npm run raster:proof -- landscape` and the corresponding portrait proof. The committed adoption record documents the reviewed comparison limits.

`npm run render -- --production --format landscape` and the corresponding portrait command verify the scoped correction instruction and current preview/production inputs before capture and before every segment. Missing authorization, another song/revision, changed hashes, confirmed defects or missing final audit block production. Regression tests cover the scoped acceptance path and preserve incomplete listening fields.

The final verification stage checks every video timestamp, frame count, color metadata, strict decoding, every original AAC packet and timestamp, decoded PCM identity, and every displayed word's expected active/inactive color. These establish fidelity to the approved event map and recording; they do not convert model-assisted timings into acoustic ground truth.

## Publishing assets

Both covers are dedicated SVG poster layouts made from the approved Moon asset and bundled font. The YouTube thumbnail is 1920×1080; the TikTok profile cover is portrait 1200×1600. The complete title and artist remain visible in the 150×200 profile review and a local crop removing 5% from each edge. This is a local simulation, not a platform-upload test.

The posting kit includes platform-specific videos, covers, titles and descriptions; optional French, English and bilingual line-level captions; instructions; checksums and a delivery manifest. Video-platform uploads and public binary releases are outside this handoff.

The [historical v2 segment-continuation record](evidence/isolated-segment-continuation.json) describes the earlier export only. All v3 film segments are freshly rendered; no v2 segment is reused after the visual change.
