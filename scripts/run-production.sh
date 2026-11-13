#!/bin/bash
# Arka planda production sunucu (terminal kapansa da çalışır)
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$ROOT/.tools/node-v22.16.0-darwin-arm64/bin:$PATH"
cd "$ROOT"

set -a
# shellcheck source=/dev/null
source "$ROOT/.env.local"
set +a

export NODE_ENV=production
export HOSTNAME=0.0.0.0
export PORT=3000
export SQLITE_PATH="$ROOT/data/wattpad.db"

cd "$ROOT/.next/standalone"
exec node server.js
