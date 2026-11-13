#!/bin/bash
cd "$(dirname "$0")"
export PATH="$PWD/.tools/node-v22.16.0-darwin-arm64/bin:$PATH"

echo ""
echo "Kitaplar içe aktarılıyor..."
echo "VPN kapalıysa şimdi aç ve bağlan."
echo ""

npm run import:wait

echo ""
read -p "Bitirmek için Enter'a bas..."
