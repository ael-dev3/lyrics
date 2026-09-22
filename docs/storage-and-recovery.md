# Local storage and recovery

Large capture intermediates can exceed final delivery sizes by several orders of magnitude. Close each completed production with an explicit retention decision so new songs have sufficient working space.

## Before cleanup

1. Fetch the remote and verify the completed source revision is present on the default branch. Inspect every worktree for local edits and unpublished commits; a clean main worktree says nothing about its neighbours.
2. Inventory tracked files, source media, final deliveries, reusable assets, review evidence, generated intermediates, installed dependencies and model downloads separately. An ignored file is not automatically disposable.
3. Verify final posting-kit checksums. Preserve source-media identities, timing data, fonts, artwork, captions, covers, publishing copy, delivery receipts and the source revision used for each delivery.
4. Verify remote backup coverage for every unique file proposed for deletion. Source integration does not back up ignored media. A source URL, release title, file size or successful upload command is insufficient proof of byte identity.
5. Keep recovery copies containing unreleased media or historical local details in an explicitly authorized private destination or authenticated draft release. Never publish a recovery snapshot as a public media edition. Record the recovery location and access requirement separately from public production documentation.
6. Download the backup and verify archive checksums, internal payload hashes and manifest coverage before deleting the corresponding local files. Test restoration into a new empty directory; preserve existing deliveries and immutable archives.

## Retention classes

| Class | Local cleanup rule | Recovery basis |
| --- | --- | --- |
| Source, lyrics, timing, reviews, receipts | Keep a compact working checkout | Verified remote commits plus a backup of local edits |
| Original media and final posting kits | Keep one convenient local copy when practical | Explicitly verified media backup; Git source alone is insufficient |
| Older deliveries and unique diagnostic assets | Remove only after archival verification | Exact archived bytes and recorded checksums |
| Full-size capture segments and raster caches | Remove after final delivery verification | Approved source, media, renderer and capture manifests |
| Decoded PCM and derived analysis buffers | Remove only when the producer and inputs are preserved | Recorded analysis scripts and locked source audio |
| Installed dependencies and standard model weights | Remove when reinstallable | Lockfiles, environment records and model identity |

Do not remove tracked analysis arrays merely because their extension resembles an intermediate. Treat symbolic links explicitly and never follow a dependency or model link into an unrelated directory. Avoid blanket `git clean -fdx` and recursive deletion of complete output directories containing unarchived deliveries.

## After cleanup

Recheck tracked-file status and all retained delivery checksums. Record the removed classes, logical and allocated byte totals, remaining local footprint and remote verification results. Filesystem free-space measurements may differ from logical bytes because of compression, clones, snapshots and other activity.

Stop only obsolete preview processes belonging to the cleaned projects. Reinstall dependencies and rebuild preview clients before using a cleaned project again. Restore any required archived media before presenting a preview: a black background or missing layer is not an acceptable substitute. Restoring files or tools does not authorize another production render.

## Verified cleanup — 2026-09-22

Completed projects were reduced to compact source checkouts after the recovery assets were downloaded from an authenticated draft release and restored into an empty directory. Every restored file was independently checked against its recorded SHA-256 and permissions. The recovered Git bundle verified successfully and retained both the integrated source revision `46103314fde836650dc07f65e1d04f3cb72e38cd` and the older local branch.

| Check | Result |
| --- | --- |
| Downloaded recovery set | 23 assets, including 15 archives; 9,070,241,870 bytes |
| Recovery coverage | 4,399 unique payloads; 6,540 restored paths |
| Working-file cleanup | 10,065 files plus 11 dependency/model directory or link entries |
| Working-file logical bytes removed | 224,221,603,873 bytes |
| Pre-existing duplicate backup staging removed | 17 files; 9,630,034,564 logical bytes |
| Observed free-space increase across the cleanup | 233,941,200,896 bytes, approximately 234 GB |
| Retained workflow footprint | Approximately 1.0 GB, including source, Git history and compact verification records |

The temporary download and restore-test copies were also removed after verification; their sizes are excluded from the pre-existing removal totals. All 3,612 retained source files matched their original hashes and permissions before the documentation update. Both worktrees, local edits and shared Git metadata were preserved. Desktop posting kits were outside the cleanup scope and remained untouched. Five obsolete project preview servers were stopped before removing media and dependencies.

The recovery release remains unpublished. Private manifests, access details and exact deletion receipts are retained separately from public documentation. Future cleanup should repeat the download-and-restore check and preserve complete preview assets when reopening an archived project.
