# Verified v1.1 GitHub recovery

[Authenticated unpublished draft assets](https://github.com/ael-dev3/lyrics/releases/tag/untagged-6918cdffef565822c2de) · [Exact recovery receipt](evidence/github-recovery.json)

The source, original media, retained analysis, prepared Apple AAC and complete upload kit are backed up in repository `ael-dev3/lyrics`, draft release **`razuchimsya-plakat-v1.1-recovery-2026-10-16`**, release ID **415411506**. Access requires repository write authorization; these are recovery assets rather than a public media release.

The editable source archive identifies committed production checkpoint **`7ae5097f64c563d7785c013bb00c557fa4b13de7`**. Preserve that commit in merge ancestry. The final source handoff adds this remote verification record after creating the immutable archives; it does not change the approved composition or delivered movie bytes.

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| BACKUP.json | 74,069 | `e2fc9bf47cf6784a9e4f338afcdef922cca826eeb9d9602685d980cfbba01f56` |
| Razuchimsya-Plakat-v1.1-Media-Recovery.zip | 372,192,990 | `0ab4dd38774931de1d0cf20a4da570d950a92c5f5ff6e106ff940b36a409c6a3` |
| Razuchimsya-Plakat-v1.1-Source.zip | 8,252,912 | `26071bb3a30a475d92b50e851d4ff286160dfedf0e2de0a01c4a59d285dcfc9f` |
| Razuchimsya-Plakat-v1.1-Upload-Kit.zip | 247,354,734 | `96813bda1c183c6e4d04f2d083a282220f294e180d8c83e619366071cbe7200b` |

## Independent remote recovery check

All four uploaded files were downloaded into a new directory. Their byte counts and SHA-256 values matched both the local set and the available GitHub server digests. The three archives passed ZIP/CRC checks and **442 internal payload hashes**. A fresh restore reconstructed **343 unique project files**, including deduplicated movie aliases.

The restored source, timeline and scene identity matched the approved v1.1 inputs. Its production-authorization command accepted the same explicitly scoped owner review while preserving unlogged granular listening fields. Recovery verification establishes retained files and identities; it does not claim a fresh full render or new listening review.

## Recovery commands

```sh
gh release download razuchimsya-plakat-v1.1-recovery-2026-10-16 --repo ael-dev3/lyrics --dir /tmp/razuchimsya-download
python3 scripts/archive-delivery.py --verify /tmp/razuchimsya-download --restore-to /tmp/razuchimsya-restored
```

Use a new directory for each download/restore. New archives must be created outside the source project so they cannot include their own output. Exact dependencies remain in `package-lock.json`; the local `node_modules` symlink is intentionally excluded. A restoration already includes the accepted movies: verify them directly, and use a fresh working/output location for a new render. Preserve existing immutable assets when making a later edition.
