# Authenticated recovery — silver v1.1

The complete approved production is backed up in an **unpublished authenticated GitHub draft**, [recovery release 416132724](https://github.com/ael-dev3/lyrics/releases/tag/untagged-3ddb7bf00102e72a66c3). It is a recovery destination for authorized maintainers, not a public media edition or platform upload. Release tag: `nichego-net-v1.1-recovery-2026-10-18`.

## Immutable source checkpoint

`4bd9ea865176e7d56b7e61958c4ba0724e40fab1` binds the editable production source, source/timeline/scene identities, neutral workflow context, final-film checks, covers, posting copy and Desktop receipt. The subsequent recovery receipt is a separate commit. Integrate with a merge commit so the archive's checkpoint remains in the default branch ancestry.

## Verified assets

| Asset | Bytes | SHA-256 |
| --- | --- | --- |
| `BACKUP.json` | 79,331 | `6c21ac728c5fb525f1207694b119ee7812f0b9a2387d2a697365393c8df9dde7` |
| `Nichego-Net-v1.1-Media-Recovery.zip` | 278,970,398 | `56ca8c12e9e6a590df77611e95bd610a64fe573cea1d931915868a1a36beaef0` |
| `Nichego-Net-v1.1-Source.zip` | 6,769,022 | `26c1c3f91bb135078704a334c7d28d039e89076715111cba4219b1bdb823d836` |
| `Nichego-Net-v1.1-Upload-Kit.zip` | 109,882,221 | `cc38da04b3dcda78ad50bd6214d1d91edd9142799dbeeb39d502a999fa64f708` |

All four assets were downloaded anew after upload. Their bytes match the original sealed files and GitHub's server digests. Each ZIP's CRC, payload inventory and every recorded payload SHA-256 passed verification. A fresh empty restoration checked **480 archived payload hashes and all 381 project paths**, including deduplicated movie aliases. The restored source reproduced the exact accepted identity; current-owner authorization and every production picture mapping passed their negative/control tests. Detailed listening fields remained unlogged in that restored state.

- **Source ZIP:** committed project plus root workflow/context documents and original licenses.
- **Media recovery ZIP:** exact original recording, retained acoustic observations/intermediates, selected diagnostic assets, render logs and receipts.
- **Upload-kit ZIP:** all 17 final files, including YouTube/TikTok/Farcaster movies, covers, posting text, subtitles and manifests.
- **BACKUP.json:** source revision, full project inventory, archive identities and final-movie aliases.

Dependencies are omitted and reinstalled from `package-lock.json`. A local dependency link was used only to execute the restore check. [The machine-readable receipt](evidence/github-recovery.json) records asset IDs, server digests, verification extent and access scope. Desktop deliveries and original working files remain preserved.

## Restore

From a compact checked-out source copy with this script:

```sh
gh release download nichego-net-v1.1-recovery-2026-10-18 --repo ael-dev3/lyrics --dir /path/to/new-downloads
python3 projects/nichego-net-lyric-film/scripts/archive-delivery.py \
  --verify /path/to/new-downloads --restore-to /path/to/new-empty-target
```

The verification command refuses an existing restoration destination. It verifies ZIP membership, safe paths, bytes, payload hashes and all project paths before calling restoration complete. Downloaded names, a successful command or file sizes alone are insufficient. Install dependencies in the restored project before rebuilding the complete preview. Restore original media before handoff; do not substitute a black picture. This archive preserves the frozen accepted edition and does not authorize changes or another song.
