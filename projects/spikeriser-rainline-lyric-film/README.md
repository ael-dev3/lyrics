# Rainline pixel lyric preview

An original cyberpunk city scene for the soundtrack in the [linked SpikeRiser post](https://x.com/SpikeRiser/status/2102888874858959029). The frozen `preview-v3-street` revision places lyrics in shop signs, building ads, and the train moving on the existing track. The full recording plays in a local review page with distinct 16:9 and 9:16 compositions.

**Status:** the v3 technical preview is frozen as `21a5fcddbb9630caf98a64e25d4e60a4d06b3cf97ef5491a871adcef99bb95ed`. Lyric text and timing remain provisional. Complete audio and both-format synchronization review and current-revision render authorization are pending. No full film has been rendered.

## Open the review preview

Use Node 24 or newer and restore the locked soundtrack to `public/soundtrack.m4a`. The soundtrack is intentionally excluded from Git. `SOURCE-LOCK.md` records its identity and preparation evidence.

```sh
npm ci
npm run typecheck
npm run timing:verify
npm run preview
```

Open `http://127.0.0.1:4388/`. The page starts paused at zero and offers play, restart, seeking, normal/0.75×/0.5× speed, both formats, cue navigation, saved notes, and a **Restore visuals** control that keeps the current position. `Start Preview.command` restarts the server after dependencies are installed. A different local port can be selected with `REVIEW_PORT`.

The browser and Remotion call the same `paintCity(context, frame, format)` function in `src/city.ts` on 1920×1080 and 1080×1920 canvases. Soundtrack time selects the 60 fps scene frame, including after seeks. `src/spectrum.json` is the measured source feature stream; `src/word-cues.json` contains the current performed text and word timing. The source AAC is preserved in the local soundtrack file.

The earlier `preview-v2-city` identity and its technical checks are preserved in `evidence/history/`. The current `preview-v3-street` identity is in `evidence/preview-identity.json`, and automated plus limited visual checks are in `evidence/technical-preview-checks.json`. Any subsequent change to soundtrack, images, code, or cue data needs another freeze and review. Freezing a preview does not authorize a full render.

For a standalone review file, run `node scripts/build-portable.ts <destination>` after building and freezing the completed revision. The script rejects missing or stale frozen identity. It writes `Rainline Preview.html` with the source AAC, scene art, player, and matching identity embedded. The v3 handoff file's six embedded media assets and identity passed static byte checks. Open the HTML file directly in a browser; it needs no local server. Standalone file playback has not yet been verified. Notes remain in that browser, with a JSON download fallback if browser storage is unavailable.

## Production boundary

`npm run production:gate` rejects missing or changed preview inputs, incomplete actual-audio and both-format cue review, unresolved synchronization defects, or missing explicit authorization bound to this song and revision. `npm run render -- --production --format landscape|portrait` invokes the same gate before capture or encoding. The committed review and authorization records are pending. Saving notes in the preview does not alter them or authorize production.

The [repository preview-first workflow](../../docs/preview-before-render.md), [pixel-art workflow](../../docs/pixel-art-lyric-film-workflow.md), and [production preferences](../../docs/track-workflow-preferences-and-known-issues.md) govern further review and delivery.
