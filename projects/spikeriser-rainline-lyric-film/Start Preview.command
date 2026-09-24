#!/bin/zsh
set -e
cd -- "${0:A:h}"
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
if [[ ! -f public/soundtrack.m4a ]]; then
  print 'Restore public/soundtrack.m4a before starting the review preview.'
  exit 1
fi
if [[ ! -d node_modules ]]; then
  print 'Run npm ci in this folder once, then start this launcher again.'
  exit 1
fi
npm run preview
