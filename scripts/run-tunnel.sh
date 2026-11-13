#!/bin/bash
# Cloudflare tüneli — public URL (Mac açıkken çalışır)
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export PATH="$ROOT/.tools:/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "$ROOT"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared yok."
  exit 1
fi

exec cloudflared tunnel --url http://127.0.0.1:3000
