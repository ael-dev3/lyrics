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

These are sampled browser, composition and playback checks, not a complete human normal/slow listening review of every cue. The final owner's listening review and current-revision render authorization remain pending. The provisional repeated name was a lexical question for this v2 check; the targeted v3 correction below supersedes it.

The still-download control was exercised, but the in-app browser automation did not deliver a download event within its timeout. No user-facing download error was observed; successful local download is not attested by this check. The saved complete-composition diagnostics use the shared renderer and are described separately in `preview-stills.json`; they are not represented as captured browser pixels or final encoded frames.

First-load mask preparation can take longer than steady playback. Following the removal of lazy mask readback at music entrances, sampled steady playback paints were 0.20–0.40 ms; observed initial/recovery paints included 27.8 and 106.4 ms. This is a small set of local observations, not a cross-device performance guarantee. All masks are prepared before the first completed picture is revealed.

## V3 targeted intro correction — 3 October 2026

The loaded browser identity was `po-kamushku-preview-v3-intro-listening-correction`. At 6.2 s the native composition had no lyric cue, opacity zero, and empty Russian/English focus lists. At 7.5 s it showed one `Яна` / `Yana` pair, active together, with the retained name beginning at sample 323165 (7.328004535 s). The same corrected cue and 1080×1920 geometry were inspected after switching to portrait. Seeking portrait back to 6.2 s reported no lyric cue. The source hash matched the unchanged recording.

Fifteen local tests, strict type checking and 2,581,180 translated focus states over 12,530 frames passed. The targeted correction excludes one unsupported event; all 163 retained onset/release sample pairs are unchanged. It does not establish a full recording listening review or production authorization. The v2 checks and still record above remain historical evidence rather than being relabelled as new captures.

## V4 targeted held-word refinement — 3 October 2026

The loaded identity was `po-kamushku-preview-v4-held-myself-tail`, with the unchanged source hash. At149.55 s, both native and portrait showed active `себя` / `myself`, using the revised exclusive end sample6601770 (149.700 s). Portrait at149.75 s showed no active source or translated word; at149.86 s it showed `из` / `from`. The next onset remains149.840 s. The complete line remained readable throughout. Fifteen tests, strict type checking and the same2,581,180 focus-state checks passed. The revised phrase is left ready to play from147.6 s. This is a single requested focus-tail refinement, not a new full-song listening attestation or render approval; the bounded carry and prior body estimate are recorded separately in `held-myself-tail-review.json`.

## V5 remaining held-word occurrences — 3 October 2026

The loaded identity was `po-kamushku-preview-v5-held-myself-occurrences`, with the unchanged source hash. Native at 58.25 s showed `себя` / `myself` active through the first newly extended tail (end sample 2574778). Portrait at 164.65 s showed the final pair active (end sample 7268562), with the complete 1080×1920 composition. The earlier 149.700 s release is unchanged. All three occurrences now use independently selected soft carries; later words retain their original onsets and do not overlap the focus. Fifteen tests, strict type checking and 2,581,180 translated-focus states passed. `held-myself-repeat-review.json` records the per-occurrence releases, preserved body estimates and evidence limits. No full-recording listening attestation or production authorization is inferred.
