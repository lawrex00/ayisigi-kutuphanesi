/**
 * Wattpad erişimi gelene kadar bekler, sonra tüm kitapları içe aktarır.
 * Kullanım: npm run import:wait
 */
import https from "https";
import { importAllUserStories } from "../lib/import-service";

const USERNAME = process.env.WATTPAD_USERNAME || "gozyasikullugu";
const MAX_WAIT_MS = 45 * 60 * 1000; // 45 dk
const POLL_MS = 15_000;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function wattpadReachable(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = https.get(
      `https://www.wattpad.com/api/v3/users/${USERNAME}/stories?limit=1`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          Accept: "application/json",
        },
        timeout: 12_000,
        rejectUnauthorized: false,
      },
      (res) => {
        let body = "";
        res.on("data", (c) => (body += c));
        res.on("end", () => {
          resolve(res.statusCode === 200 && body.includes('"stories"'));
        });
      }
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("  Ay Işığı Kütüphanesi — Wattpad içe aktarma");
  console.log("═══════════════════════════════════════════════");
  console.log("");
  console.log("⚠️  Wattpad şu an erişilemiyor.");
  console.log("    Lütfen telefon/bilgisayarda VPN'i AÇ ve bağlan.");
  console.log("    (VPN Super veya başka bir VPN)");
  console.log("");
  console.log("VPN bağlanınca otomatik devam edeceğim...");
  console.log("");

  const start = Date.now();

  while (Date.now() - start < MAX_WAIT_MS) {
    if (await wattpadReachable()) {
      console.log("✓ Wattpad'e bağlandı! Kitaplar çekiliyor...\n");
      const results = await importAllUserStories(USERNAME, {
        onProgress: (msg) => console.log(msg),
      });

      console.log("\n═══════════════════════════════════════════════");
      console.log("  ÖZET");
      console.log("═══════════════════════════════════════════════");
      for (const r of results) {
        if (r.error) console.log(`✗ ${r.title}: ${r.error}`);
        else console.log(`✓ ${r.title} (${r.chapterCount} bölüm, taslak)`);
      }
      const ok = results.filter((r) => !r.error).length;
      console.log(`\n${ok}/${results.length} kitap başarılı.`);
      console.log("\nAdmin: http://localhost:3000/admin (şifre: okuma2026)");
      return;
    }

    const elapsed = Math.round((Date.now() - start) / 1000);
    process.stdout.write(`\r  Bekleniyor... ${elapsed}s (VPN açık mı?)   `);
    await new Promise((r) => setTimeout(r, POLL_MS));
  }

  console.log("\n\nSüre doldu. VPN açıp tekrar çalıştır:");
  console.log("  npm run import:wait");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
