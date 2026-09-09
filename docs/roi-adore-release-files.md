# Roi × Adore — release asset inventory

Release: [roi-adore-rebuild-v1.0.0](https://github.com/ael-dev3/lyrics/releases/tag/roi-adore-rebuild-v1.0.0).

The release publishes the exact final movie, original downloaded MKV and metadata, ten-second review, verification report, and complete production ZIP. Binary source media have not been re-encoded. All asset hashes are in [CHECKSUMS.sha256](https://github.com/ael-dev3/lyrics/releases/download/roi-adore-rebuild-v1.0.0/CHECKSUMS.sha256).

The 1,267,871,245-byte ZIP contains 154 inventoried files plus `FILES.json`, which records every member's relative path, size and SHA-256. It includes:

- Complete final composition, cue/translation authority, TypeScript scripts and configuration.
- Locked animation, AAC and Opus soundtracks, poster, fonts and generated graphics inputs.
- Public spectrum/motion features and raw calibrated Float32 band data.
- Source and master PCM derivatives, separated vocal/instrument stems, original reference audio and analysis features.
- French/English lyrics, alignment observations, repeat reconciliation, onset audit and final QA.
- Original session package plus a distribution package, exact dependency lock and setup instructions.

The package preserves the production-relative `work/film` layout. Its npm scripts expose opening, typechecking, timing checks, rendering, encoding and final verification. `ROI_DELIVERY_DIR` controls the verifier's copy location; the default is the archive's `delivery/` directory. The lightweight Studio preview uses a poster; the encoder composites the real animation. Full rerendering requires Node.js 24, FFmpeg/FFprobe, Remotion Chromium, sufficient disk space and time.

ZIP CRC verification, packaged TypeScript checking and the 71-cue timing checks passed before upload. Binary media hashes are retained; machine paths in textual records are sanitized. Installed dependencies, downloaded model weights, regenerable frames, temporary encode experiments and duplicate historical release copies are excluded. The historical v1.0.1 master remains available in its original release.

## TikTok material

The same release now includes the full vertical MP4, both corrected cover aspect ratios, a publishing ZIP with all cover variants and caption, and separate TikTok verification/checksums. The [tracked TikTok folder](../projects/roi-adore-rebuild/tiktok/README.md) preserves the adaptation scripts and AI cover prompts. Existing landscape assets are unchanged.
