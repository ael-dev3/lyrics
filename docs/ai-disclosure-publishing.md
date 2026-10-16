# AI disclosure in publishing kits

Place a plain-language disclosure in the visible posting text whenever AI assisted the lyric edition or its accompanying writing. For Farcaster, combine the title and disclosure in one ready-to-post `Caption.txt`; avoid making the uploader merge separate disclosure and caption files.

Name the assistance accurately: transcription or acoustic alignment, English translation, word-timing analysis, presentation and visualizer code, cover typography, and posting copy where applicable. Distinguish human direction and actual listening review from model and technical checks. Do not call AI-assisted captions entirely human-written or describe original third-party music as AI-generated merely because the added lyric edition used AI.

Retain the original performers and source link. Identify original imagery separately from added typography and animation. A source photograph with code-composed lettering is different from generated replacement artwork; record the actual method. Do not invent a photographer or composer credit when it is unverified.

## Farcaster package

The current in-app notice reviewed for the 16 October 2026 delivery prohibits undisclosed AI content and passing AI writing off as solely one's own. The supplied notice does not prescribe an exact mandatory phrase. Keep the usual song title, followed by a short **“AI-assisted…”** sentence naming the affected roles and accurate human involvement. Keep that disclosure when adapting the caption. The [official client repository](https://github.com/farcasterxyz/client) is a reference snapshot, rather than a substitute for the live client's notices.

Include the video, a matching thumbnail and one short `Caption.txt` in `Farcaster/`. The caption itself combines title, disclosure and source credit; keep detailed production methods in the project documentation. A thumbnail can label the added lyric edition as AI-assisted. Preserve the approved film; do not insert unreviewed disclosure effects into it. Keep platform upload and account actions separate from preparing files.

For the usual concise post, use factual artist/song credits, one short line identifying AI assistance and human review, and the source link. Include **caption** or **post text** whenever AI assisted the posting text, including a short title/credit/disclosure combination. This is the workflow's clear disclosure choice: the [current Network Code](https://farcaster.xyz/~/code) and [voting notice](https://farcaster.xyz/~/vote) do not state a short-caption exemption or mandatory phrase. Avoid adding promotional prose solely to justify a longer disclosure. Keep private account signatures, wallet addresses and voting transaction records outside publishing kits and the public repository.

The [немерено publishing implementation](../projects/nemereno-lyric-film/scripts/make-publishing-copy.ts) supplies one concise UTF-8 post combining title, disclosure and source credit. That byte budget is a conservative packaging choice, not a claim about every current client's maximum. Its [posting record](../projects/nemereno-lyric-film/evidence/publishing-copy.json) identifies the policy basis and scope without retaining private conversations or a pasted announcement.
