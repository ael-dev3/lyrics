# Workflow evidence

The `v2.3.0` release includes a supplemental public evidence package for the generated workflow and results behind the first-act semantic-sync revision.

## Downloads

- [Workflow evidence archive](https://github.com/ael-dev3/lyrics/releases/download/v2.3.0/Tanisea-Lyric-Film-Workflow-Evidence-vNext.zip) — 1,001,895,394 bytes.
- [Standalone evidence manifest](https://github.com/ael-dev3/lyrics/releases/download/v2.3.0/tanisea-workflow-evidence-vnext.json) — 115,240 bytes, with sorted path, byte size, and SHA-256 for every payload file.
- [Supplemental checksums](https://github.com/ael-dev3/lyrics/releases/download/v2.3.0/WORKFLOW-EVIDENCE.sha256) — SHA-256 for the archive and standalone manifest.

The archive contains 593 manifested payload files totaling 1,005,578,113 bytes, plus the internal manifest and its checksum. The manifest binds release tag `v2.3.0` to commit `bb7e6368d301d4bcc1c15287e344a9ccfa7c36ed` and the source archive to revision `5b0eef186e8e2ed5da2bfa0d88a5dd6625123a93`.

| Category | Files | Payload bytes | Contents |
| --- | ---: | ---: | --- |
| Alignment | 221 | 350,489,304 | Unchanged public timing authority, preparation/evidence manifests, MFA labels and TextGrids, WhisperX observations, review scripts and decisions, hashes, and line/token review sheets |
| QA | 351 | 639,852,373 | Both canonical full-matrix runs, logs, comparison data, selected frames, and 313 generated v2.3 QA artifacts plus their manifest |
| Visual review | 5 | 14,468,677 | Final 38–52 second soundtrack-bearing review clip, semantic and cue-boundary contact sheets, and review summary |
| Repository records | 11 | 739,827 | Release checksums, public READMEs, final QA, alignment report, and implementation/design records including the v2.3 semantic-sync revision |
| Publication | 4 | 24,954 | Verified publication record, v2.3 release notes, publication-record generator, and supplemental package builder |
| Archive guide | 1 | 2,978 | Scope, contents, exclusions, privacy normalization, and verification instructions |

## Scope boundary

The tracked source archive remains the authority for implementation code, tests, fonts, locked media, and build scripts. The production master, 120 fps synchronization proof, hero, alignment data/report, and final QA report remain separately downloadable release assets. The workflow archive adds generated evidence without duplicating those release files.

Replaceable dependencies, virtual environments, runtime downloads, models, caches, decoded audio, source-separation stems, and MFA clip WAV intermediates are excluded. Superseded visual-review iterations, intentionally invalid QA runs, and downloaded release copies are also excluded.

The reproducible 2× ProRes reference render is 28,709,540,792 bytes and is not duplicated in the supplemental archive. Its SHA-256 is `6029f9485afb2c72bee9ec324c5a37be993cce82dbe67c96d0f4fe7e71df6c97`; the render command, downstream production master, strict-decode evidence, and selected frames are published.

Six test-runner log lines contained a local checkout path. The archive replaces only those path strings with `<repository-root>/projects/tanisea-lyric-film`; measurements, assertions, hashes, and outcomes are unchanged. A public-safety scan found no remaining local-user path, credential, internal-plan, or unsafe archive-entry patterns.

## Verify

After downloading the archive, manifest, and checksum file into one directory:

```sh
sha256sum -c WORKFLOW-EVIDENCE.sha256
```

The archive also contains `EVIDENCE-MANIFEST.json` and `EVIDENCE-MANIFEST.sha256`. Verify that checksum before comparing individual payload files with their manifest entries.
