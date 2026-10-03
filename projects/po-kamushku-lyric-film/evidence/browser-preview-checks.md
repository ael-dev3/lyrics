# Complete-preview technical check

Revision: `po-kamushku-preview-v2-source-phonetic-review`.
Source SHA-256: `f6572759f48f725497ad42b7c84cf12825824041897c47fdd36832a40ad30dd6`.
Date: 3 October 2026. Browser: Codex in-app browser.

## Observed

- A fresh native-square load at 68 seconds displayed the actual source picture, both languages, the stone response and v2 identity. The active Russian `камушку` and both translated `pebble` tokens agreed with the semantic mapping.
- Native normal-speed playback advanced the source picture PTS and word clock: sampled source PTS 68.160 s, word time 68.203207 s, media time 68.210147 s. Cached scene paint was 0.20 ms in that sample. These sequential observations are not a global audio-device latency measurement.
- Native half-speed playback after seeking to 49.5 s reconstructed `домов` / `homes`; sampled source PTS 49.560 s, word time 49.582095 s, media time 49.587812 s, playback rate 0.5. The sampled paint was 0.20 ms.
- Portrait at 118 s displayed a 1080×1920 complete composition, the entire source ring and person, both equally sized languages, punctuation, and `мука` / `is torment`. Portrait half-speed playback advanced normally; a sample showed word time 118.093718 s and source PTS 118.040 s. Portrait normal-speed playback also reached the complete recording's end.
- At 198 s, final `земли` and `of the earth` were active. At 201.2 s, no lexical token was active, but the complete line retained full opacity. Its recorded neutral hold ends at 201.4 s and fade clears at 201.9 s. At the recording end, 208.809002 s, the source's last decoded frame remained visible with no remaining lyric cue.
- Source comparison showed the same recording at the current time, with its reference video muted and the soundtrack video unmuted. Closing comparison and restoring the preview reloaded v2 at the preserved 201.2 s in portrait; the recovered source and full line were visible again.
- Format changes, seeks and reloads showed a seeking state until the source picture was ready. Both complete compositions were visually inspected at ordinary player size. The deliberately still source is established independently in the source-motion study; advancing video timestamps alone are not claimed as subject motion.
- The browser's captured warning/error log was empty at the final check.

## Scope and limitations

These are sampled browser, composition and playback checks, not a complete human normal/slow listening review of every cue. The final owner's listening review and current-revision render authorization remain pending. The provisional repeated name in the quiet intro remains a lexical question.

The still-download control was exercised, but the in-app browser automation did not deliver a download event within its timeout. No user-facing download error was observed; successful local download is not attested by this check. The saved complete-composition diagnostics use the shared renderer and are described separately in `preview-stills.json`; they are not represented as captured browser pixels or final encoded frames.

First-load mask preparation can take longer than steady playback. Following the removal of lazy mask readback at music entrances, sampled steady playback paints were 0.20–0.40 ms; observed initial/recovery paints included 27.8 and 106.4 ms. This is a small set of local observations, not a cross-device performance guarantee. All masks are prepared before the first completed picture is revealed.
