#!/bin/zsh
cd "$(dirname "$0")" || exit 1
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
export REVIEW_PORT=4324
npm run review:build || exit 1
node scripts/freeze-preview.ts || exit 1
node scripts/review-server.ts
