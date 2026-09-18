# La Lune — acoustic lunar film

**L’Impératrice · French + English · preview-v3-celestial**

![Neutral silver Moon, catalogue stars and equal French / English focus](../../assets/la-lune-acoustic-celestial-v3-46-8.png)

*Native 1920×1080 frame at 00:46.800 decoded from the current landscape film. Music: L’Impératrice / microqlima. AI-assisted lunar artwork and original lyric presentation.*

The complete 3:17.555 acoustic recording has 14 bilingual cues: 49 French words and 56 English words. Both 1920×1080 and 1080×1920 layouts give the languages equal prominence and stable color-only emphasis. English follows the corresponding French meaning without invented vocal timestamps.

## Celestial direction

A steady silver Moon fills the upper scene against true black. Real catalogue star positions, magnitude-based brightness, soft glows and slow independent twinkling replace the earlier decorative field. The compact radial spectrum follows the recording; faint instrumental ripples respect the vocal exclusion windows. Introductory reveal, instrumental titles and the final fade remain intact. The artwork, stars, text and spectrum use neutral silver rather than blue.

The Yale Bright Star Catalogue supplies a J2000 gnomonic field, north up/east left: 393 visible stars in landscape and 264 in portrait. The oversized Moon remains an artistic composition, not an ephemeris or a dated sky observation. [Design, catalogue sources and scientific limits](CELESTIAL-NOTES.md) · [Original artwork provenance](source/moon-artwork-prompt.md).

French and English retain equal size, weight and luminance. Vertical spacing provides separation without a divider. Audio, lyrics, translation, timing and reading coordinates are hash-identical to the prior accepted edition.

## Start the preview

Use Node 24 or later and the locked dependencies. Restore the original AAC locally using [source preparation](source/PREPARATION.md); music is intentionally absent from Git.

```sh
npm ci
npm run check
npm run preview:freeze
npm run preview
```

Open `http://127.0.0.1:4320/`. `Start Preview.command` starts the server with installed dependencies. The recording starts paused at zero. Controls provide both formats, normal/0.75×/0.5× playback, seeking, cue navigation and timing inspection. Local notes do not confer production authorization.

## Verification and review scope

- The [celestial audit](evidence/celestial-audit.json) checks every frame's steady Moon illumination, projected catalogue coordinates, twinkle bounds, neutral colors and unchanged timing/text/layout hashes.
- Both films receive every-frame timestamps, original AAC packet comparison, decoded PCM identity and all visible French/English word-color checks. See [final verification](evidence/final-verification.md) and [encoded Moon stability](evidence/encoded-moon-illumination.json).
- Native preview/production-adapter checks match exactly at eight states. The [raster adoption report](evidence/raster-adoption.json) separately quantifies small supersampled antialiasing differences and encoded diagnostic results.
- Technical source-state accuracy is separate from audible-boundary certainty. All 49 French words retain `reviewRequired: true`; granular listening fields remain incomplete. The unchanged timeline's [semantic audit](evidence/final-sync-audit.json) covers 11,820 French and 13,366 English visible word states per format.

The project owner commissioned this visual correction and a new delivery after the completed v2 edition. The [production record](PRODUCTION-NOTES.md) and [authorization](evidence/render-authorization.json) use `owner-directed-visual-revision`, explicitly leaving v3 `previewAccepted: false`. Earlier acceptance is preserved as history. This does not change the preview-before-render workflow for new songs.

## Render and verify

Build and bind both complete lossless layer caches using [the render contract](PRODUCTION-NOTES.md#render-contract). Render one format at a time with the isolated-process supervisor:

```sh
npm run render -- --production --format landscape
npm run render -- --production --format portrait
node scripts/verify-production.ts output/La-Lune-Celestial-v3-landscape-1920x1080-60fps.mp4 landscape
node scripts/verify-production.ts output/La-Lune-Celestial-v3-portrait-1080x1920-60fps.mp4 portrait
node scripts/audit-decoded-focus.ts output/La-Lune-Celestial-v3-landscape-1920x1080-60fps.mp4 landscape
node scripts/audit-decoded-focus.ts output/La-Lune-Celestial-v3-portrait-1080x1920-60fps.mp4 portrait
node scripts/audit-moon-illumination.ts
npm run package
```

The gate rejects stale identities, missing authorization, changed prior timing/text/layout, missing current visual audits and unresolved defects. Output names distinguish v3 from preserved v2 films. Full media, render caches and temporary logs remain local.

## Posting delivery and source

The new 14-file folder is **L’Impératrice — La Lune — Celestial v3 — Upload Kit**. It contains both films, matching dedicated covers, platform titles/descriptions, optional captions, instructions, a manifest and checksums. The new folder uses a distinct delivery name; prior film files and delivery evidence remain preserved. [Package identity](evidence/delivery-receipt.json) · [Desktop copy receipt](evidence/desktop-delivery-receipt.json) · [Posting assets](publishing/README.md).

[Original recording](https://www.youtube.com/watch?v=p3E731cu_nE) · [Input identity](source/input-manifest.json) · [Current preview hashes](evidence/preview-identity.json) · [French source](source/lyrics-fr.json) · [English mapping](source/translation.json) · [Translation decisions](source/translation-notes.md) · [Boundary candidates](analysis/boundary-ledger.json) · [Production lessons](PRODUCTION-LESSONS.md) · [Historical v2 evidence](evidence/history/v2/README.md).

Music rights remain with the original creators. The bundled font retains its SIL Open Font License. No platform upload or public binary release is part of this handoff.
