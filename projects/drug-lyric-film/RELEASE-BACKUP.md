# Complete GitHub backup

[Draft release `drug-v2-production`](https://github.com/ael-dev3/lyrics/releases/tag/untagged-56c41656a82fcfec96f9) stores the accepted natural-city v2 delivery and the later complete portrait alternate below 10 MB. [Fresh-download verification](evidence/release-upload-verification.json) binds each asset to its local bytes and GitHub digest.

## Contents

The 21 assets include:

- Original 1920×1080 YouTube and 1080×1920 TikTok films at 60 fps.
- Complete 720×1280, 30 fps TikTok alternate: **9,902,066 bytes**. [Compression recipe and verification limits](COMPRESSION.md).
- YouTube thumbnail, 1200×1600 portrait TikTok cover, platform title/descriptions and Russian/English/bilingual SRTs.
- Original source MP4, unchanged from the locked recording.
- Complete upload-kit ZIP retaining all 13 original Desktop files, with the later compressed copy and its recipe/receipt under `Alternates/`.
- Source ZIP containing exact tracked project files from merged production commit `b9ae75d098cf2938d9d89af2fff787094a0b0383`, relevant shared workflow/licensing guidance and the hash-matching ignored `public/source.mp4`. Root compression supplements are identified separately from the frozen production source.
- Original delivery/checksum records, compression receipt, backup inventory and release-wide SHA-256 list.

Individual copy and caption assets have platform/track prefixes because flattening the original folder structure would otherwise collide. The upload-kit ZIP preserves the original relative paths. No existing Desktop file or original delivery inventory was modified.

## Recovery

Download the upload-kit ZIP for posting files. The original movies remain the quality masters; use the compressed alternate only when the size limit is required. Unzip the source archive into a fresh directory, enter `projects/drug-lyric-film`, install the locked dependencies with `npm ci`, and follow [the preview and production commands](PRODUCTION-DELIVERY.md). Node 24+, FFmpeg/ffprobe and the recorded native Canvas dependency are required. Private model caches, generated intermediates and unrelated songs are not required or bundled.

Both ZIPs contain `ARCHIVE-MANIFEST.json` and `ARCHIVE-CHECKSUMS.sha256`. Every archive entry was independently read after writing and matched by length and SHA-256. Release-wide checksums cover every asset except the checksum file itself. The archive source commit remains an ancestor of the default branch; later backup documentation and download receipts are outside that immutable production snapshot. Codec output may differ across software versions even when source inputs match.

## Publication boundary

The media backup remains a draft. The underlying recording, lyrics and illustration retain their owners; archive inclusion and project licensing do not establish distribution clearance. Public Git holds editable source and verification documentation. No public full-media publication or YouTube/TikTok posting is represented. The original source credits and granular listening evidence limits remain unchanged.
