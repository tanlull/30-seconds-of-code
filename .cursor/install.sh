#!/usr/bin/env bash
# Idempotent Cloud Agent bootstrap for 30-seconds-of-code.
#
# This is a 2018-era Node project. Its native dependency (node-sass@4.9.3) and
# test runner (jest@23) only work on old Node, so the environment pins Node 10.
set -euo pipefail

NODE_VERSION="10.24.1"

export NVM_DIR="$HOME/.nvm"
# shellcheck disable=SC1091
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Ensure the pinned Node is available (downloaded once, then cached / snapshotted).
if ! nvm which "$NODE_VERSION" >/dev/null 2>&1; then
  nvm install "$NODE_VERSION"
fi
nvm use "$NODE_VERSION" >/dev/null

N10="$NVM_DIR/versions/node/v$NODE_VERSION/bin"

# Make bare `node`/`npm`/`npx` resolve to Node 10 for every shell. The Cursor
# agent runtime injects its own Node into PATH via /exec-daemon, but
# /usr/local/cargo/bin sits ahead of it in the login PATH and is world-writable,
# so wrappers placed here win without touching the daemon's absolute-path Node.
if [ -d /usr/local/cargo/bin ]; then
  for b in node npm npx; do
    ln -sf "$N10/$b" "/usr/local/cargo/bin/$b"
  done
fi

export PATH="$N10:$PATH"

# Project dependencies (node-sass fetches a prebuilt Node 10 binary).
npm install

# Tools used by `npm run linter`, invoked as global commands by scripts/lint.js.
# Pin to versions compatible with Node 10 (latest releases require Node >= 12/14).
npm install -g "semistandard@^12.0.1" "prettier@^1.14.2"

echo "Environment ready: node $(node --version), npm $(npm --version)"
