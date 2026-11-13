#!/bin/bash
# Mac kapalıyken bile site açılsın — Fly.io'ya publish
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

export FLYCTL_INSTALL="$HOME/.fly"
export PATH="$FLYCTL_INSTALL/bin:$ROOT/.tools:$PATH"

echo "🌙 Ay Işığı — buluta yükleme (Mac kapalıyken de çalışır)"
echo ""

if ! command -v flyctl >/dev/null 2>&1 && ! command -v fly >/dev/null 2>&1; then
  echo "Fly CLI kuruluyor..."
  curl -L https://fly.io/install.sh | sh
  export PATH="$HOME/.fly/bin:$PATH"
fi

FLY=$(command -v flyctl || command -v fly)

echo "1) Fly hesabına giriş (tarayıcı açılacak)..."
$FLY auth login

echo ""
echo "2) Uygulama + disk oluşturuluyor..."
$FLY apps list 2>/dev/null | grep -q ayisigi-kutuphanesi || $FLY apps create ayisigi-kutuphanesi --org personal || true

# Secrets
ADMIN_PASSWORD="${ADMIN_PASSWORD:-Billy31?}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 24)}"
$FLY secrets set \
  ADMIN_PASSWORD="$ADMIN_PASSWORD" \
  JWT_SECRET="$JWT_SECRET" \
  NEXT_PUBLIC_SITE_URL="https://ayisigi-kutuphanesi.fly.dev" \
  -a ayisigi-kutuphanesi

# Volume
if ! $FLY volumes list -a ayisigi-kutuphanesi 2>/dev/null | grep -q ayisigi_data; then
  $FLY volumes create ayisigi_data --region ams --size 1 -a ayisigi-kutuphanesi -y
fi

echo ""
echo "3) Site deploy ediliyor (birkaç dakika sürebilir)..."
$FLY deploy --remote-only -a ayisigi-kutuphanesi \
  --build-arg NEXT_PUBLIC_SITE_URL=https://ayisigi-kutuphanesi.fly.dev

echo ""
echo ""
echo "4) Kitap veritabanını yüklemek için (isteğe bağlı):"
echo "   fly ssh sftp shell -a ayisigi-kutuphanesi"
echo "   sonra: put data/wattpad.db /app/data/wattpad.db"
echo ""
echo "✅ Deploy tamam."
echo "   Public adres: https://ayisigi-kutuphanesi.fly.dev"
echo "   Admin:        https://ayisigi-kutuphanesi.fly.dev/admin"
echo ""
echo "Bu adresi arkadaşlarına at. Mac kapalı olsa da site açık kalır."
echo ""
read -p "Enter'a bas..."
