/**
 * Yılana Dönüşen Yalana Sarılır — metadata + bölüm içe aktarma
 * Kullanım: npm run import:ydys
 */
import { importFromWattpadApi, upsertBookMetadata } from "../lib/import-service";

const STORY_ID = 399542029;
const COVER_PATH = "data/uploads/yilana-donusen-yalana-sarilir.png";

const DESCRIPTION = `"Yokluğun bir fırtına gibiydi, güneş bile küsmüştü yaza. Sen benden gittin gideli ben de kendime uğramadım hiç." Öldükten sonra hafızasını kaybedip tekrar dirilen Gece, artık bedeninde kendi ruhuyla beraber Marceline'in ruhunu da misafir etmeye başlamıştı. Gece'nin iç çatışmalarıyla ve sürekli kendini suçlayıp durmasıyla yaşadığı felaketler, doğaüstü bir okula giderek aydınlanmaya başlar. Gece'yi yönlendiren farklı, kara bir ruh, Gece'nin yaşamak için aradığı tüm nedenleri doğaüstü bir okulda bulacağını söyler. Melez kızımız gideceği okulda beklenmedik olaylarla, çağ dışı savaşlarla ve binbir türlü ihanetle karşılaşacaktır. Bakalım Gece, kimsesizliğin tozunu nasıl atacak? Yürüdüğü yolda kaç farklı yol ayrımına rastlayacak? Kimlerle tanışacak? İçinde yaşadığı ikinci ruhu, bedenine kavuşturabilecek mi? Daha da önemlisi, Gece hiç hatırlamadığı aşkını bir gün hatırlayacak mı? "Sarhoş bir saatin pusunda mutluydum, Ama gökler şahit ki şimdi perişanım." ~>Her bölüm için, elimden geldiğince, bölüm kapakları tasarlamaya çalışıyorum. Bu işte amatör olduğum için lütfen kusura bakmayın. ~> Instagram: gozyasikullugu ~> Tiktok: gozyasikullugu . . . . . . . . . . . . . . ~>BU KİTAPTA GEÇEN ZAMANLAR, MEKÂNLAR, KİŞİLER, OLAYLAR, SAVAŞLAR, ZEHİRLER, TILSIMLAR, BÜYÜLER VE KİTAPLAR TAMAMEN KURGUDUR! HEPSİ BENİM HAYAL GÜCÜMÜN ALTINDAN ÇIKMIŞTIR!`;

async function main() {
  console.log("YDYS kitabı içe aktarılıyor...");

  try {
    const result = await importFromWattpadApi(STORY_ID, {
      localCoverPath: COVER_PATH,
      onProgress: (msg) => console.log(msg),
    });
    console.log(`Tamamlandı: ${result.slug} (${result.chapterCount} bölüm, taslak)`);
  } catch (e) {
    console.warn("Wattpad API başarısız, yalnızca metadata kaydediliyor:", e);
    const { bookId, slug } = await upsertBookMetadata(
      {
        id: STORY_ID,
        title: "Yılana Dönüşen Yalana Sarılır",
        url: "https://www.wattpad.com/story/399542029-yılana-dönüşen-yalana-sarılır",
        description: DESCRIPTION,
        coverUrl: null,
        author: "Gozyasikullugu",
        numParts: 0,
      },
      { localCoverPath: COVER_PATH, summary: DESCRIPTION }
    );
    console.log(`Metadata kaydedildi: ${slug} (id: ${bookId}). Bölümler için EPUB yükleyin veya VPN ile tekrar çalıştırın.`);
  }
}

main().catch(console.error);
