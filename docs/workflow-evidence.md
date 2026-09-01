# Workflow evidence

The `v2.0.0` release includes a supplemental public evidence package for the generated workflow and results that do not belong in Git source control.

## Downloads

- [Workflow evidence archive](https://github.com/ael-dev3/lyrics/releases/download/v2.0.0/Tanisea-Lyric-Film-Workflow-Evidence-vNext.zip) — 685,110,145 bytes.
- [Standalone evidence manifest](https://github.com/ael-dev3/lyrics/releases/download/v2.0.0/tanisea-workflow-evidence-vnext.json) — sorted path, byte size, and SHA-256 for every payload file.
- [Supplemental checksums](https://github.com/ael-dev3/lyrics/releases/download/v2.0.0/WORKFLOW-EVIDENCE.sha256) — SHA-256 for the archive and standalone manifest.

The archive contains 468 manifested payload files totaling 690,386,271 bytes, plus the internal manifest and its checksum.

| Category | Files | Payload bytes | Contents |
| --- | ---: | ---: | --- |
| Alignment | 221 | 350,489,304 | Final timing authority, preparation/evidence manifests, MFA labels and TextGrids, WhisperX observations, review scripts and decisions, hashes, and all line/token review sheets |
| QA | 167 | 272,921,966 | Both canonical full-matrix runs, logs, comparison data, selected frames, and 129 generated QA artifacts plus their manifest |
| Visual review | 70 | 66,553,427 | Frame, remux, colour, concurrency, and proof-state inspection artifacts retained from final review |
| Repository records | 7 | 415,056 | Release checksums, READMEs, final QA records, alignment report, and implementation report |
| Publication | 2 | 3,537 | Verified release publication record and release notes |
| Archive guide | 1 | 2,981 | Scope, directory map, exclusions, privacy normalization, and verification notes |

## Scope boundary

The tracked source archive remains the authority for implementation code, tests, fonts, locked media, and build scripts. The production master, 120 fps synchronization proof, hero, alignment data/report, and final QA report remain separately downloadable release assets. The workflow archive adds the generated evidence without duplicating those large release files.

Replaceable dependencies, virtual environments, runtime downloads, models, caches, decoded audio, source-separation stems, and MFA clip WAV intermediates are excluded. Superseded or intentionally invalid QA runs and duplicate release downloads are also excluded.

The reproducible 2× ProRes reference render is 28,721,088,575 bytes and is not duplicated in the supplemental archive. Its SHA-256 is `5f16d78bc0132c89b0b38713a629b1cfef1b080990140d69f9a34ccd453d176d`; the render command, downstream production master, and verification evidence are published.

Six test-runner banner lines contained a local checkout path. The archive replaces only those path strings with `<repository-root>/projects/tanisea-lyric-film`; measurements, assertions, timestamps, hashes, and outcomes are unchanged. A public-safety scan found no remaining local-user path or credential patterns in the packaged text records.

## Verify

After downloading the archive, manifest, and checksum file into one directory:

```sh
sha256sum -c WORKFLOW-EVIDENCE.sha256
```

The archive also contains `EVIDENCE-MANIFEST.json` and `EVIDENCE-MANIFEST.sha256`. Verify that checksum before comparing individual payload files with their manifest entries.
