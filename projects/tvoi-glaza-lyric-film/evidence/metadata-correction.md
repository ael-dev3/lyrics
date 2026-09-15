# Explicit square-pixel metadata

The initial HEVC delivery encoder inherited an unspecified sample aspect ratio from the ProRes input. Final metadata validation rejected that omission. The picture dimensions and decoded pixels were already correct.

The initial files were normalized with the HEVC metadata bitstream filter, setting sample_aspect_ratio=1/1 while copying both streams. SHA-256 over every decoded native-format video byte is compared before and after the operation; any difference blocks replacement. The final integrity check separately requires SAR 1:1, fast-start MP4, complete color metadata, every video timestamp and every original AAC payload/timestamp/duration. Per-format normalization receipts record the exact byte count and hashes.

Future renders use setsar=1 before HEVC encoding. No lyric timing, translation, layout, picture content or audio processing changed in this correction.
