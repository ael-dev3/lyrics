# Workflow evidence

## v2.4.1 correction and release workflow

`v2.4.1` is a corrective release for the first repeated chorus. It leaves the locked soundtrack and the reviewed C1 cue table untouched, then derives a separate visible schedule for `C1-05`–`C1-08` from the proven `C2-05`–`C2-08` choreography. At 44,100 Hz, every C2 visual sample `s` is mapped into the C1 window by:

```text
round(1,631,876 + (s - 4,595,926) × 539,520 / 575,328)
```

The mapping covers word attack, release, inter-word gaps, entrance, settle, and ordinary handoffs. The `C1-08` exit remains tied to its break-card milestone. The source keeps the reviewed schedule in `cues` and records the derived visible schedule in `presentationCues`, allowing the proof and QA records to show both without conflating them.

The QA-media step is portable across FFmpeg builds. It probes `ffmpeg -filters`:
when `drawtext` is available, labels are rendered inside the primary FFmpeg
contact-sheet path; otherwise, the checked-in Python/Pillow compositor uses the
tracked Space Grotesk font and the same deterministic four-column 480 px grid.
The fallback only annotates extracted QA frames and has no rendering path into
the reference, public, or proof masters.

The reproducible release sequence is:

1. Run `npm run check` and `npm run alignment:verify` on the tagged source revision.
2. Render the 2× reference, create the 1080×1080 public master and 120 fps proof, then strictly verify all three files.
3. Run the two isolated QA matrices, create the source archive from the immutable source commit, and verify downloaded release assets against `CHECKSUMS.sha256`.
4. Record the release URL, asset hashes, and checksum result in `work/release-publication.json`; then finalize the publication QA report.
5. Build the sanitized workflow archive with `TANISEA_RELEASE_SOURCE_COMMIT=<release-commit> npm run workflow:package`, upload it with its manifest/checksum, and verify those downloads as well.

The separate `v2.4.1` tag preserves the already-published `v2.4.0` release as historical evidence rather than altering its immutable assets.

## v2.4.0 historical evidence

The `v2.4.0` release includes a supplemental public evidence package for the generated workflow and results behind the cinematic-parity and line-only visualizer revision.

## Downloads

- [Workflow evidence archive](https://github.com/ael-dev3/lyrics/releases/download/v2.4.0/Tanisea-Lyric-Film-Workflow-Evidence-vNext.zip) — 1,008,545,555 bytes.
- [Standalone evidence manifest](https://github.com/ael-dev3/lyrics/releases/download/v2.4.0/tanisea-workflow-evidence-vnext.json) — 116,092 bytes, with sorted path, byte size, and SHA-256 for every payload file.
- [Supplemental checksums](https://github.com/ael-dev3/lyrics/releases/download/v2.4.0/WORKFLOW-EVIDENCE.sha256) — SHA-256 for the archive and standalone manifest.

The archive contains 597 manifested payload files totaling 1,012,254,676 bytes, plus the internal manifest and its checksum. The manifest binds release tag `v2.4.0` to commit `d02978442d4493146b7c5642035e20d5b4d85822` and the source archive to revision `a5d3b5344eb65d2dc91579142c3bc608e53b448a`.

| Category | Files | Payload bytes | Contents |
| --- | ---: | ---: | --- |
| Alignment | 221 | 350,489,304 | Unchanged public timing authority, preparation/evidence manifests, MFA labels and TextGrids, WhisperX observations, review scripts and decisions, hashes, and line/token review sheets |
| QA | 351 | 642,580,026 | Both clean full-matrix runs, logs, drift comparison, selected frames, and the complete v2.4 QA-media package and manifest |
| Visual review | 7 | 18,403,658 | Matched first/later-passage clips, relative-time and semantic contact sheets, v2.3/v2.4 spectrum comparison, README screenshot, and review summary |
| Repository records | 13 | 753,751 | Release checksums, public READMEs, final QA, alignment report, implementation reports, and the exact first-pass workflow |
| Publication | 4 | 24,937 | Verified publication record, v2.4 release notes, publication-record generator, and supplemental package builder |
| Archive guide | 1 | 3,000 | Scope, contents, exclusions, privacy normalization, and verification instructions |

## Scope boundary

The tracked source archive remains the authority for implementation code, tests, fonts, locked media, and build scripts. The production master, 120 fps synchronization proof, hero screenshot, alignment data/report, and final QA report remain separately downloadable release assets. The workflow archive adds generated evidence without duplicating those release files.

Replaceable dependencies, virtual environments, runtime downloads, models, caches, decoded audio, source-separation stems, and MFA clip WAV intermediates are excluded. Superseded visual-review iterations, intentionally invalid QA runs, and downloaded release copies are also excluded.

The reproducible 2× ProRes reference render is 28,708,453,523 bytes and is not duplicated in the supplemental archive. Its SHA-256 is `664feb2fe9e7336c84602dd35c82de21197729949bee93e6bbe164ee87044895`; the render command, downstream production master, strict-decode evidence, and selected frames are published.

Six test-runner log lines contained a local checkout path. The archive replaces only those path strings with `<repository-root>/projects/tanisea-lyric-film`; measurements, assertions, hashes, and outcomes are unchanged. The post-download verifier matched all 597 payload hashes, rejected unsafe archive paths, and privacy-scanned 101 text files without finding a local-user path, credential, or authorization token.

## Verify

After downloading the archive, manifest, and checksum file into one directory:

```sh
sha256sum -c WORKFLOW-EVIDENCE.sha256
```

The archive also contains `EVIDENCE-MANIFEST.json` and `EVIDENCE-MANIFEST.sha256`. Verify that checksum before comparing individual payload files with their manifest entries.
