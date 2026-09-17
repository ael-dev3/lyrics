# Production preparation

The full v3 preview was accepted for rendering on 17 September 2026. During preparation, the picture motion and visualizer response were revised. The v6 preview keeps illustration geometry fixed, adds subtle shadow static at vocal changes, and retains the exact normal, medium and strongest visualizer sections. The v6 preview was accepted and explicitly authorized for production on 17 September 2026. Full rendering is underway; final delivery checks remain pending.

The accepted v3 identity, pre-render review and its superseded authorization remain in `evidence/approved-preview-identity.json`, `evidence/pre-render-review.json`, `evidence/v3-accepted-review.json` and `evidence/v3-render-authorization.json`. The v6 identity and incomplete granular listening fields remain separate. Overall acceptance must not be rewritten as complete per-cue listening telemetry.

## Prepared renderer

The production composition uses the same persistent painter as the approved preview with the global frame index. Each unique shadow state is rasterized once into an artwork panel at the 2× capture scale. Cached panel hashes are checked before use; scene input changes invalidate the cache. Both formats match direct rendering pixel for pixel across all 120 diagnostic frames; see `evidence/artwork-cache-equivalence.json`. It captures 2× PNG-derived ProRes 4444, downsamples once with Lanczos and encodes HEVC Main 10 / CRF 17 / BT.709 limited range. Sixteen contiguous segments bound temporary disk usage. Each encoded segment is strictly decoded and hashed before its temporary reference is removed. Only capture files made by this run are removed; final files and source media are retained. Cache reuse requires the same input fingerprint, frame range and encoded-file hash.

The final mux copies the original AAC packets. Planned verification covers every video timestamp, frame count, strict full decode, audio payloads and timestamps, decoded PCM identity, all visible Russian/English glyph focus states, picture stability and segment boundaries. These checks establish agreement with the reviewed timeline, not acoustic truth.

`npm run sync:gate` checks the current preview and production inputs. `npm run render -- --production --format landscape` and the corresponding portrait command require current authorization before capture. The scoped owner-accepted-preview path preserves incomplete listening fields; it requires the exact song, revision, authorization ID, complete meaning inventory and matching hashes. Missing approval, another revision, changed inputs or confirmed defects are rejected.

Earlier v4 two-second diagnostics in both formats verified the same adapter without creating a full delivery. They passed decoding and every displayed word-color state; those are historical adapter checks, not encoded v6 verification. The remaining final-file checks and upload kit are pending full production.

## Acceptance scope

Current overall preview acceptance and explicit production authorization apply to `preview-v6-shadow-static` and its unchanged source identity. Granular actual-audio checklist fields remain incomplete; they were not converted into fabricated listening telemetry. This scoped production decision does not claim sample-accurate acoustic truth. The original audio and shared bilingual meaning map remain unchanged.
