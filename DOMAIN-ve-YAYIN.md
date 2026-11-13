# Abinin dediği: Domain bak + bugün yayına al

## Ne demek istiyor?

1. **Domain bak** = Siteye kalıcı bir internet adresi al  
   Örnek: `ayisigikutuphanesi.com`  
   Böylece arkadaşların her seferinde uzun Cloudflare linki kullanmaz.

2. **Yayına al** = Siteyi Mac’ine bağlı olmadan internette açık tut  
   Mac kapalı olsa da `https://ayisigikutuphanesi.com` çalışır.

---

## Bugün yapılacaklar (senin tarafın)

### A) Alan adı al (ücretli, yılda ~10–15 USD)

Önerilen isimler:
- `ayisigikutuphanesi.com` ★
- `gozyasikullugu.com`
- `ayisigikitap.com`

**Nereden?** Cloudflare Registrar (ucuz ve abinin dediği Cloudflare ile uyumlu)

1. https://dash.cloudflare.com/sign-up adresinden ücretsiz hesap aç
2. Sol menüden **Domain Registration → Register Domains**
3. İstediğin adı yaz → **Purchase**
4. Kart ile öde (~$10–11 / yıl)

Türkiye’den kart çalışmazsa: Namecheap / GoDaddy da olur; sonra domain DNS’ini Cloudflare’e bağlarız.

### B) Siteyi buluta yükle (Mac kapalıyken de açık)

Finder’da **`Canliya-Al.command`** dosyasına çift tıkla:

1. Fly.io girişi (tarayıcı açılır — ücretsiz hesap)
2. Site otomatik yüklenir
3. Geçici adres: `https://ayisigi-kutuphanesi.fly.dev`

### C) Domain’i siteye bağla (domain aldıktan sonra)

Domain Cloudflare’deyse:

1. Cloudflare Dashboard → domain → **DNS**
2. `CNAME` kaydı ekle:
   - Name: `@` (veya `www`)
   - Target: `ayisigi-kutuphanesi.fly.dev`
3. Fly tarafında:  
   `fly certs add ayisigikutuphanesi.com`

Bunu domain aldıktan sonra birlikte bitiririz.

---

## Wattpad senkron (kod tarafı hazır)

Wattpad’de bir bölümü değiştirdikten sonra:

1. Wattpad’de **Değişiklikleri Yayınla**
2. Kitabın Wattpad sayfasında sağ alttaki  
   **Ay Işığı'na Senkronize Et** butonuna bas
3. Site aynı kitabı günceller (yeni kopya açmaz)

---

## Özet

| Adım | Kim yapar | Ne |
|------|-----------|-----|
| Domain satın al | Sen (ödeme) | Cloudflare’den alan adı |
| Canlıya al | Sen (çift tık) | `Canliya-Al.command` |
| Domain bağla | Birlikte | DNS + SSL |
| Wattpad senkron | Sen | Yayınla → Senkronize Et |
