# Ay Işığı — 7/24 Çalıştırma Rehberi

## Seçenek 1: Mac açıkken, terminal kapalı (kolay)

Finder'da **`7-24-Kur.command`** dosyasına çift tıkla.

Bu işlem:
- Siteyi production modda derler
- macOS arka plan servisi olarak kurar
- Mac açık kaldığı sürece terminal kapalı olsa da site çalışır
- İstersen Cloudflare tünelini de arka planda başlatır

**Yerel adres:** http://localhost:3000

**Durdurmak için:** `scripts/stop-background-service.sh` çalıştır

---

## Seçenek 2: Mac kapalıyken de 7/24 (Cloudflare + sunucu)

Mac kapalıyken çalışması için site **internet üzerinde bir sunucuda** olmalı.

### Adımlar (özet)

1. **Railway** veya **Render** hesabı aç (ücretsiz deneme var)
2. GitHub'a projeyi yükle
3. Railway'de "Deploy from GitHub" → `wattpad-okuma`
4. Ortam değişkenlerini ekle (`.env.local` içindekiler)
5. Kalıcı disk/volume: `data/` klasörü
6. **Cloudflare**'de domain al veya mevcut domaini bağla
7. Cloudflare DNS → Railway URL'sine yönlendir

### Cloudflare sadece tünel (Mac açık)

```bash
brew install cloudflared
```

`7-24-Kur.command` kurulumunda tünel sorusuna **e** de.

Public URL `data/logs/tunnel.log` dosyasında görünür.

---

## Özet tablo

| Yöntem | Terminal kapalı | Mac kapalı | Maliyet |
|--------|-----------------|------------|---------|
| `Baslat.command` | ❌ | ❌ | Ücretsiz |
| `7-24-Kur.command` | ✅ | ❌ | Ücretsiz |
| Railway + Cloudflare | ✅ | ✅ | ~$5/ay |

---

## Sorun giderme

```bash
# Site logu
tail -f data/logs/site.log

# Tünel logu
tail -f data/logs/tunnel.log

# Servisi yeniden başlat
launchctl kickstart -k gui/$(id -u)/com.ayisigi.kutuphane
```
