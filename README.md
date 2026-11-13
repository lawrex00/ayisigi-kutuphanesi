# Okuma Köşesi — Wattpad Kitap Okuma Sitesi

Kendi Wattpad kitaplarınızı dingin bir web okuyucuda sunun. PDF yerine bölüm bölüm HTML okuma deneyimi.

## Özellikler

- Dingin okuma arayüzü (açık / sepya / koyu tema)
- Ayarlanabilir yazı boyutu
- Bölüm navigasyonu ve okuma ilerlemesi
- Wattpad'ten otomatik içe aktarma (WattpadDownloader)
- EPUB dosyası yükleme
- PDF indirme
- SQLite (geliştirme) veya PostgreSQL (Docker)

## Hızlı Başlangıç

### 1. Bağımlılıkları yükle

```bash
npm install
```

### 2. Ortam değişkenlerini ayarla

```bash
cp .env.example .env.local
```

### 3. Örnek kitabı ekle ve başlat

```bash
npm run db:seed
npm run dev
```

Site: [http://localhost:3000](http://localhost:3000)

### 4. WattpadDownloader'ı başlat (isteğe bağlı)

```bash
docker compose up -d wattpad-downloader
```

Admin paneli: [http://localhost:3000/admin](http://localhost:3000/admin) (şifre: `okuma2026`)

## Veritabanı Seçenekleri

### SQLite (varsayılan)

Ekstra kurulum gerekmez. Veritabanı `data/wattpad.db` dosyasında saklanır.

### PostgreSQL (Docker Desktop)

```bash
docker compose --profile postgres up -d
```

`.env.local` dosyasında:

```
DATABASE_URL=postgresql://wattpad:wattpad@localhost:5432/wattpad_okuma
```

## Wattpad İçe Aktarma

1. `docker compose up -d wattpad-downloader` ile servisi başlatın
2. Admin paneline gidin (`/admin`)
3. Wattpad hikaye URL'nizi girin veya EPUB dosyası yükleyin

Alternatif: WattpadDownloader arayüzünden EPUB indirip admin panelinden yükleyin.

## Tam Docker Ortamı

```bash
docker compose --profile full up -d --build
```

## Proje Yapısı

```
src/
├── app/                  # Sayfalar ve API rotaları
├── components/           # Okuyucu bileşenleri
├── lib/
│   ├── db/               # SQLite/PostgreSQL şeması
│   ├── epub-parser.ts    # EPUB → bölümler
│   ├── import-service.ts # Wattpad/EPUB içe aktarma
│   └── pdf-generator.ts  # PDF üretimi
└── scripts/seed.ts       # Örnek kitap
```

## Lisans

Kişisel kullanım. Wattpad içerikleri yalnızca kendi hikayeleriniz için içe aktarılmalıdır.
