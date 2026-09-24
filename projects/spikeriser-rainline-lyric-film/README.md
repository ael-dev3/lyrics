# Rainline pixel lyric preview

An original cyberpunk city scene for the soundtrack in the [linked SpikeRiser post](https://x.com/SpikeRiser/status/2102888874858959029). Lyrics appear on signs, screens, and moving city surfaces. The full recording plays in a local review page with distinct 16:9 and 9:16 compositions.

**Status:** preview available; lyric text and timing remain provisional. The complete audio and both-format synchronization review and current-revision render authorization are pending. No full film has been rendered.

## Open the review preview

Use Node 24 or newer and restore the locked soundtrack to `public/soundtrack.m4a`. The soundtrack is intentionally excluded from Git. `SOURCE-LOCK.md` records its identity and preparation evidence.

```sh
npm ci
npm run typecheck
npm run review:build
npm run preview
```

Open `http://127.0.0.1:4388/`. The page starts paused at zero and offers play, restart, seeking, normal/0.75×/0.5× speed, both formats, cue navigation, saved notes, and a **Restore visuals** control that keeps the current position. `Start Preview.command` restarts the server after dependencies are installed. A different local port can be selected with `REVIEW_PORT`.

The browser and Remotion call the same `paintCity(context, frame, format)` function in `src/city.ts` on 1920×1080 and 1080×1920 canvases. Both decode the two city backgrounds, airship, train, and character atlas before drawing. Soundtrack time selects the 60 fps scene frame, including after seeks. `src/spectrum.json` is the measured source feature stream; `src/word-cues.json` contains the current performed text and word timing. The source AAC is preserved in the local soundtrack file.

The `preview-v2-city` inputs are frozen in `evidence/preview-identity.json`. Any change to the soundtrack, images, code, or cue data needs a new freeze and a fresh review of the changed preview. Freezing a preview does not authorize a full render.

For a standalone review file, run `node scripts/build-portable.ts <destination>` after `npm run review:build` and `npm run preview:freeze`. It writes `Rainline Preview.html` with the source AAC, five art images, player, and frozen identity embedded. Open the HTML file directly in a browser; it needs no local server. Notes remain in that browser, with a JSON download fallback if browser storage is unavailable.

## Production boundary

`npm run production:gate` rejects missing or changed preview inputs, incomplete actual-audio and both-format cue review, unresolved synchronization defects, or missing explicit authorization bound to this song and revision. `npm run render -- --production --format landscape|portrait` invokes the same gate before capture or encoding. The committed review and authorization records are pending. Saving notes in the preview does not alter them or authorize production.

The [repository preview-first workflow](../../docs/preview-before-render.md), [pixel-art workflow](../../docs/pixel-art-lyric-film-workflow.md), and [production preferences](../../docs/track-workflow-preferences-and-known-issues.md) govern further review and delivery.
