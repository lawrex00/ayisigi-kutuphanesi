/**
 * @gozyasikullugu hesabındaki tüm kitapları taslak olarak içe aktarır.
 * VPN gerekebilir. Kullanım: npm run import:account
 */
import { importAllUserStories } from "../lib/import-service";

const USERNAME = process.env.WATTPAD_USERNAME || "gozyasikullugu";

async function main() {
  console.log(`@${USERNAME} hesabı içe aktarılıyor...\n`);

  const results = await importAllUserStories(USERNAME, {
    onProgress: (msg) => console.log(msg),
  });

  console.log("\n--- Özet ---");
  for (const r of results) {
    if (r.error) {
      console.log(`✗ ${r.title}: ${r.error}`);
    } else {
      console.log(`✓ ${r.title} → ${r.slug} (${r.chapterCount} bölüm, taslak)`);
    }
  }

  const ok = results.filter((r) => !r.error).length;
  console.log(`\n${ok}/${results.length} kitap başarılı.`);
}

main().catch(console.error);
