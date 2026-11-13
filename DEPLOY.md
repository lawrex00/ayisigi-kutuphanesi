# Wattpad Okuma Sitesi — Deploy Rehberi

## Yerel Geliştirme (SQLite)

```bash
npm install
npm run db:seed
npm run dev
```

## Docker Desktop ile PostgreSQL

```bash
# PostgreSQL başlat
docker compose --profile postgres up -d

# Not: Şu an uygulama SQLite kullanıyor.
# PostgreSQL desteği için DATABASE_URL ile drizzle migrate çalıştırın.
```

## WattpadDownloader

```bash
docker compose up -d wattpad-downloader
```

Servis: http://localhost:5042

## Tam Stack (Docker)

```bash
docker compose --profile full up -d --build
```

Uygulama: http://localhost:3000

## Ortam Değişkenleri

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `SQLITE_PATH` | SQLite dosya yolu | `./data/wattpad.db` |
| `ADMIN_PASSWORD` | Admin panel şifresi | `okuma2026` |
| `WATTPAD_DOWNLOADER_URL` | Import servisi | `http://localhost:5042` |
| `NEXT_PUBLIC_SITE_NAME` | Site adı | `Okuma Köşesi` |
| `NEXT_PUBLIC_AUTHOR_NAME` | Yazar adı | `Yazar` |

## Vercel Deploy (Opsiyonel)

SQLite Vercel'de kalıcı değildir. Production için:

1. Docker ile self-host edin (`docker compose --profile full up`)
2. Veya bir VPS'te `npm run build && npm start` çalıştırın
3. `data/` klasörünü volume olarak mount edin
