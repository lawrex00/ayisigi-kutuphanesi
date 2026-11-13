/**
 * Belirli Wattpad hikayelerini taslak olarak içe aktarır.
 * Kullanım: npm run import:stories
 */
import { importFromWattpadApi, upsertBookMetadata } from "../lib/import-service";

const STORIES = [
  { id: 411415014, url: "https://www.wattpad.com/story/411415014-tabula-rasa-temizle-unut-i̇ntikam-al" },
  { id: 411915950, url: "https://www.wattpad.com/story/411915950-30-gün" },
  { id: 411948288, url: "https://www.wattpad.com/story/411948288-31-gün" },
];

async function main() {
  for (const s of STORIES) {
    console.log(`\n=== ${s.id} ===`);
    try {
      const result = await importFromWattpadApi(s.id, {
        onProgress: (msg) => console.log(msg),
      });
      console.log(`✓ ${result.slug} (${result.chapterCount} bölüm, taslak)`);
    } catch (e) {
      console.warn("API başarısız, metadata kaydediliyor:", e);
      const titles: Record<number, string> = {
        411415014: "Tabula Rasa Temizle Unut İntikam Al",
        411915950: "30 Gün",
        411948288: "31 Gün",
      };
      const { slug } = await upsertBookMetadata(
        {
          id: s.id,
          title: titles[s.id] || `Hikaye ${s.id}`,
          url: s.url,
          description: "",
          coverUrl: null,
          author: "Gozyasikullugu",
          numParts: 0,
        },
        {}
      );
      console.log(`Metadata: ${slug} (bölümler için VPN/EPUB gerekir)`);
    }
  }
}

main().catch(console.error);
