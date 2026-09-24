# Source lock and provenance

| Item | Value |
| --- | --- |
| Original post | <https://x.com/SpikeRiser/status/2102888874858959029> |
| Video media ID | `2102887158373629952` |
| Local source | downloaded from that post with `yt-dlp 2026.8.19` on 2026-09-24; media excluded from Git |
| Source MP4 | 247.253333 s, 960×540 H.264 30 fps, stereo AAC 48 kHz |
| Source MP4 SHA-256 | `939d24391e68d460a4d21fee88196c738b6f491362f192cabdcf33d15153a9b0` |
| Preview audio | stream-copied source AAC to `public/soundtrack.m4a` using `ffmpeg -map 0:a:0 -c:a copy`; excluded from Git |
| Preview audio SHA-256 | `f6f1be0de55b8a7b63e761ff62962de82d87ab143bafb3680c9029b441fe5ba8` |
| Attribution | Post gives no song/artist credit; no lyric reference supplied; empty auto-generated caption track. Identify neither song title nor performer without further evidence. |

`src/spectrum.json` is produced by `scripts/build-spectrum.ts` from the locked audio. The soundtrack drives the browser preview and was stream-copied without audio re-encoding into the [scoped local exports](PRODUCTION-NOTES.md#5-scoped-final-exports-and-gate-distinction). The source video supplied visual study and soundtrack input; its frames were not incorporated into the new city. Neither the original media nor the full exports are committed or published here.
