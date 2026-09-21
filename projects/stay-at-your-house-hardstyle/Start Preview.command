#!/bin/zsh
set -e
cd "$(dirname "$0")"
if curl -fsS http://127.0.0.1:4323/ >/dev/null 2>&1; then
  open 'http://127.0.0.1:4323/'
else
  npm run preview
fi
