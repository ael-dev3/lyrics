# Workflow evidence

The `v2.2.0` release includes a supplemental public evidence package for generated workflow and results that do not belong in Git source control.

## Downloads

- [Workflow evidence archive](https://github.com/ael-dev3/lyrics/releases/download/v2.2.0/Tanisea-Lyric-Film-Workflow-Evidence-vNext.zip) — 712,270,877 bytes.
- [Standalone evidence manifest](https://github.com/ael-dev3/lyrics/releases/download/v2.2.0/tanisea-workflow-evidence-vnext.json) — 88,368 bytes, with sorted path, byte size, and SHA-256 for every payload file.
- [Supplemental checksums](https://github.com/ael-dev3/lyrics/releases/download/v2.2.0/WORKFLOW-EVIDENCE.sha256) — SHA-256 for the archive and standalone manifest.

The archive contains 453 manifested payload files totaling 715,734,643 bytes, plus the internal manifest and its checksum.

| Category | Files | Payload bytes | Contents |
| --- | ---: | ---: | --- |
| Alignment | 221 | 350,489,304 | Final timing authority, preparation/evidence manifests, MFA labels and TextGrids, WhisperX observations, review scripts and decisions, hashes, and line/token review sheets |
| QA | 193 | 322,503,640 | Both canonical full-matrix runs, logs, comparison data, selected frames, and 155 generated v2.2 QA artifacts plus their manifest |
| Visual review | 25 | 42,251,545 | First-act timing stills and encoded samples, soundtrack-bearing review clip, proof-authority still, spectrum iterations, second-act controls, and review summary |
| Repository records | 10 | 467,663 | Release checksums, public READMEs, final QA, alignment report, and v2.2/v2.1/full-system implementation and design reports |
| Publication | 3 | 19,726 | Verified publication record, v2.2 release notes, and the supplemental package builder |
| Archive guide | 1 | 2,765 | Scope, contents, exclusions, privacy normalization, and verification instructions |

## Scope boundary

The tracked source archive remains the authority for implementation code, tests, fonts, locked media, and build scripts. The production master, 120 fps synchronization proof, hero, alignment data/report, and final QA report remain separately downloadable release assets. The workflow archive adds generated evidence without duplicating those large release files.

Replaceable dependencies, virtual environments, runtime downloads, models, caches, decoded audio, source-separation stems, and MFA clip WAV intermediates are excluded. Superseded or intentionally invalid QA runs and downloaded release copies are also excluded.

The reproducible 2× ProRes reference render is 28,709,555,671 bytes and is not duplicated in the supplemental archive. Its SHA-256 is `2bcc0e69547622b2580d4078c2abe7af882bb75f9f2163a5a7c1797737adf4ef`; the render command, downstream production master, strict-decode evidence, and selected frames are published.

Six test-runner banner lines contained a local checkout path. The archive replaces only those path strings with `<repository-root>/projects/tanisea-lyric-film`; measurements, assertions, timestamps, hashes, and outcomes are unchanged. A public-safety scan found no remaining local-user path, credential, internal-plan, or unsafe archive-entry patterns.

## Verify

After downloading the archive, manifest, and checksum file into one directory:

```sh
sha256sum -c WORKFLOW-EVIDENCE.sha256
```

The archive also contains `EVIDENCE-MANIFEST.json` and `EVIDENCE-MANIFEST.sha256`. Verify that checksum before comparing individual payload files with their manifest entries.
