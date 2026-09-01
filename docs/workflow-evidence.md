# Workflow evidence

The `v2.1.0` release includes a supplemental public evidence package for generated workflow and results that do not belong in Git source control.

## Downloads

- [Workflow evidence archive](https://github.com/ael-dev3/lyrics/releases/download/v2.1.0/Tanisea-Lyric-Film-Workflow-Evidence-vNext.zip) — 692,252,429 bytes.
- [Standalone evidence manifest](https://github.com/ael-dev3/lyrics/releases/download/v2.1.0/tanisea-workflow-evidence-vnext.json) — 86,089 bytes, with sorted path, byte size, and SHA-256 for every payload file.
- [Supplemental checksums](https://github.com/ael-dev3/lyrics/releases/download/v2.1.0/WORKFLOW-EVIDENCE.sha256) — SHA-256 for the archive and standalone manifest.

The archive contains 441 manifested payload files totaling 695,715,216 bytes, plus the internal manifest and its checksum.

| Category | Files | Payload bytes | Contents |
| --- | ---: | ---: | --- |
| Alignment | 221 | 350,489,304 | Final timing authority, preparation/evidence manifests, MFA labels and TextGrids, WhisperX observations, review scripts and decisions, hashes, and line/token review sheets |
| QA | 193 | 322,220,079 | Both canonical full-matrix runs, logs, comparison data, selected frames, and 155 generated v2.1 QA artifacts plus their manifest |
| Visual review | 14 | 22,520,538 | First-act contact/handoff stills, later-act comparison stills, and visual-review summary |
| Repository records | 9 | 463,949 | Release checksums, public READMEs, final QA, alignment report, and v2.1/full-system implementation and design reports |
| Publication | 3 | 18,564 | Verified publication record, release notes, and the supplemental package builder |
| Archive guide | 1 | 2,782 | Scope, contents, exclusions, privacy normalization, and verification instructions |

## Scope boundary

The tracked source archive remains the authority for implementation code, tests, fonts, locked media, and build scripts. The production master, 120 fps synchronization proof, hero, alignment data/report, and final QA report remain separately downloadable release assets. The workflow archive adds generated evidence without duplicating those large release files.

Replaceable dependencies, virtual environments, runtime downloads, models, caches, decoded audio, source-separation stems, and MFA clip WAV intermediates are excluded. Superseded or intentionally invalid QA runs and downloaded release copies are also excluded.

The reproducible 2× ProRes reference render is 28,720,493,293 bytes and is not duplicated in the supplemental archive. Its SHA-256 is `56a3670a0ed5737699292893dcc15c5f07bac1a16f8fbbece6b326367adbb37b`; the render command, downstream production master, strict-decode evidence, and selected frames are published.

Six test-runner banner lines contained a local checkout path. The archive replaces only those path strings with `<repository-root>/projects/tanisea-lyric-film`; measurements, assertions, timestamps, hashes, and outcomes are unchanged. A public-safety scan found no remaining local-user path, credential, internal-plan, or unsafe archive-entry patterns.

## Verify

After downloading the archive, manifest, and checksum file into one directory:

```sh
sha256sum -c WORKFLOW-EVIDENCE.sha256
```

The archive also contains `EVIDENCE-MANIFEST.json` and `EVIDENCE-MANIFEST.sha256`. Verify that checksum before comparing individual payload files with their manifest entries.
