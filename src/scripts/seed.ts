import { eq } from "drizzle-orm";
import { getDb, schema } from "../lib/db";
import { plainTextToHtml } from "../lib/utils";

const SAMPLE_CHAPTERS = [
  {
    order: 1,
    title: "Başlangıç",
    content: plainTextToHtml(
      `Güneş, ufuk çizgisinin hemen üzerinde duruyordu. Sabahın ilk ışıkları pencereden süzülerek odayı dolduruyordu.\n\nElif, masasına oturdu ve boş sayfaya baktı. Bugün yeni bir hikâyeye başlayacaktı. Kalemi eline aldı ve ilk cümleyi yazdı.\n\n"Her hikâye bir soruyla başlar," diye mırıldandı. "Peki benim sorum ne olacak?"`
    ),
    wordCount: 52,
  },
  {
    order: 2,
    title: "Yolculuk",
    content: plainTextToHtml(
      `Şehirden uzaklaştıkça hava değişiyordu. Beton yerini çam ormanlarına bırakmıştı. Rüzgâr camları hafifçe titreterek bir melodi çıkarıyordu.\n\nYol boyunca düşünceleri bir film şeridi gibi akıyordu. Geçmiş, gelecek ve şimdi arasında gidip gelen bir dalga.\n\nBir köyün girişinde durdu. Tabelada "Okuma Köşesi" yazıyordu. Gülümsedi.`
    ),
    wordCount: 48,
  },
  {
    order: 3,
    title: "Dinginlik",
    content: plainTextToHtml(
      `Köyün küçük kütüphanesi sessizliğin içinde parlıyordu. Ahşap raflar, eski kitapların kokusu ve yumuşak ışık.\n\nElif bir köşeye çekildi ve okumaya başladı. Zaman durmuş gibiydi. Dışarıdaki gürültü, telefonların çalması, bildirimler — hepsi uzaklarda kalmıştı.\n\nİşte aradığı buydu: dinginlik. Sadece kelimeler ve kendisi.`
    ),
    wordCount: 45,
  },
];

async function seed() {
  const db = getDb();
  const now = new Date().toISOString();

  const existing = await db
    .select()
    .from(schema.books)
    .where(eq(schema.books.slug, "okuma-kosesi"));

  const alreadySeeded = existing.length > 0;

  if (alreadySeeded) {
    console.log("Örnek kitap zaten mevcut, atlanıyor.");
    return;
  }

  const totalWords = SAMPLE_CHAPTERS.reduce((s, c) => s + c.wordCount, 0);

  const [book] = await db
    .insert(schema.books)
    .values({
      title: "Okuma Köşesi",
      slug: "okuma-kosesi",
      author: process.env.NEXT_PUBLIC_AUTHOR_NAME || "Yazar",
      summary:
        "Dingin bir ortamda okunan, göz yormayan bir hikâye. Bu örnek kitap, okuma deneyimini test etmek için eklenmiştir.",
      coverUrl: null,
      wattpadUrl: null,
      readingMinutes: Math.max(1, Math.ceil(totalWords / 200)),
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  for (const ch of SAMPLE_CHAPTERS) {
    await db.insert(schema.chapters).values({
      bookId: book.id,
      order: ch.order,
      title: ch.title,
      content: ch.content,
      wordCount: ch.wordCount,
    });
  }

  console.log(`Örnek kitap eklendi: "${book.title}" (${SAMPLE_CHAPTERS.length} bölüm)`);
}

seed().catch(console.error);
