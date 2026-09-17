#!/bin/zsh
cd "${0:A:h}" || exit 1
if [[ ! -f review/client.js ]]; then
  npm run review:build || exit 1
fi
exec node scripts/review-server.ts
