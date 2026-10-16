# Verified GitHub recovery · немерено v4.3

The complete approved production is backed up in authenticated, unpublished draft release **`nemereno-v4.3-recovery-2026-10-16`**, release ID **414386062**. This is a recovery set, separate from public source integration and any social-platform upload. [Machine-readable remote verification](evidence/github-recovery.json).

The archive source commit is **`aa0660e870f8d24b0713f6cba982e693632dc53c`**. Preserve it in the merged branch ancestry. Later source commits add the remote verification receipt; the immutable production archives deliberately remain pinned to this completed source revision rather than recursively archiving their own receipts.

Posting-copy revision 3 keeps the factual title, AI-assisted translation/timing/visuals/caption, actual human review and source credit. It explicitly discloses the caption's AI assistance. The current caption and matching `DELIVERY.json` / `CHECKSUMS.sha256` are retained in the latest public source. The immutable upload-kit ZIP preserves the original copy revision; all revisions use identical films and covers. When recovering the current posting kit, restore the original assets and then overlay these three current files from the latest source. Private voting signatures and account transaction details are excluded.

| Asset | Bytes | Payload files | SHA-256 |
| --- | ---: | ---: | --- |
| Nemereno-v4.3-Source.zip | 10,845,084 | 192 | `6013ebfd218e4e6c29e0133ab96f5b77e597b398abb5d16146313eb68a670172` |
| Nemereno-v4.3-Media-Recovery.zip | 315,967,321 | 396 | `3a87661936b04892cbd5422fc1f704949bbe1fe28a86c8e0a05429a26c0f81d8` |
| Nemereno-v4.3-Upload-Kit.zip | 158,875,030 | 17 | `879bd99df52f14c9d9a0fbca1a30339753eb12bc76b12d56a9b9acbd2ea653d1` |

`BACKUP.json` is also uploaded: 108,738 bytes, SHA-256 `ec4d75dc8c7131d68d87e083c2f3918cad1ae29d40901b5faac00faa5e1ce4b6`. GitHub's reported digests and sizes match every local asset. All four files were downloaded into a fresh location. Archive SHA-256, ZIP CRC, every one of **605 payload hashes**, exact member sets and **506 unique project files** passed verification in a new restore directory. Two duplicate render masters were restored from identical publishing-kit movies. The recovered source also passes the strict authorization-gate test without borrowing the original workspace's dependencies.

Source contains the production project, complete public workflow context, final screenshots and evidence. Media recovery retains the exact original recording/reference, acoustic observations and untracked build materials. The upload kit contains all 17 Desktop payloads, including one combined Farcaster title/disclosure/source-credit post. `node_modules` is intentionally omitted; use the exact package lock to install dependencies. Fresh restoration verifies retained files and authorization behavior, not a second production render or new listening review.

## Recover

With repository-owner access, download the authenticated draft assets:

```sh
gh release download nemereno-v4.3-recovery-2026-10-16 \
  --repo ael-dev3/lyrics --dir /tmp/nemereno-downloaded
```

Use `scripts/archive-delivery.py` from the pinned public source or extracted Source ZIP:

```sh
python3 scripts/archive-delivery.py --verify /tmp/nemereno-downloaded \
  --restore-to /tmp/nemereno-restored
```

The restore directory must not already exist. The verifier checks expected sizes, hashes, archive membership and safe relative paths before restoring; it rejects unexpected source symlinks during creation. Original material remains credited to its creators. AI-assisted translation, timing, added visual code, covers and posting copy are disclosed separately from the original recording.

The repository-wide Actions checks found no workflows and no run history across branches, actors, statuses or rerun attempts. Expected additional Actions use is zero runs / zero runner minutes; monthly account usage remains unknown. Refresh the required read-only preflight before each subsequent push, PR action or merge.
