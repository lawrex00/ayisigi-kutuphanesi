#!/bin/bash
# Siteyi arka plan servisi olarak kurar (terminal kapalı olsa da çalışır)
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PLIST_NAME="com.ayisigi.kutuphane.plist"
PLIST_PATH="$HOME/Library/LaunchAgents/$PLIST_NAME"
TUNNEL_PLIST="com.ayisigi.tunnel.plist"
TUNNEL_PATH="$HOME/Library/LaunchAgents/$TUNNEL_PLIST"
NODE_BIN="$ROOT/.tools/node-v22.16.0-darwin-arm64/bin"
LOG_DIR="$ROOT/data/logs"

mkdir -p "$LOG_DIR"
chmod +x "$ROOT/scripts/run-production.sh"
chmod +x "$ROOT/scripts/run-tunnel.sh"

echo "📦 Production build alınıyor..."
export PATH="$NODE_BIN:$PATH"
cd "$ROOT"
npm run build

cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.ayisigi.kutuphane</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$ROOT/scripts/run-production.sh</string>
  </array>
  <key>WorkingDirectory</key>
  <string>$ROOT</string>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>$LOG_DIR/site.log</string>
  <key>StandardErrorPath</key>
  <string>$LOG_DIR/site-error.log</string>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)/com.ayisigi.kutuphane" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST_PATH"
launchctl enable "gui/$(id -u)/com.ayisigi.kutuphane"
launchctl kickstart -k "gui/$(id -u)/com.ayisigi.kutuphane"

echo ""
echo "✅ Site arka plan servisi kuruldu!"
echo "   Yerel: http://localhost:3000"
echo "   Log:   $LOG_DIR/site.log"
echo ""
echo "Terminali kapatabilirsin — site çalışmaya devam eder."
echo "(Mac açık kalmalı)"
echo ""

read -r -p "Cloudflare tüneli de arka planda başlasın mı? (e/h): " TUNNEL
if [[ "$TUNNEL" =~ ^[eE] ]]; then
  if ! command -v cloudflared >/dev/null 2>&1; then
    echo "Önce kur: brew install cloudflared"
    exit 0
  fi
  cat > "$TUNNEL_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.ayisigi.tunnel</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$ROOT/scripts/run-tunnel.sh</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>StandardOutPath</key>
  <string>$LOG_DIR/tunnel.log</string>
  <key>StandardErrorPath</key>
  <string>$LOG_DIR/tunnel-error.log</string>
</dict>
</plist>
EOF
  launchctl bootout "gui/$(id -u)/com.ayisigi.tunnel" 2>/dev/null || true
  launchctl bootstrap "gui/$(id -u)" "$TUNNEL_PATH"
  launchctl enable "gui/$(id -u)/com.ayisigi.tunnel"
  launchctl kickstart -k "gui/$(id -u)/com.ayisigi.tunnel"
  echo "✅ Tünel başlatıldı. URL için: tail -f $LOG_DIR/tunnel.log"
fi
