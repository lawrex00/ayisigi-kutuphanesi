import JSZip from "jszip";
import { sanitizeContent, plainTextToHtml } from "./utils";

export interface ParsedChapter {
  order: number;
  title: string;
  content: string;
  wordCount: number;
}

export interface ParsedBook {
  title: string;
  author: string;
  summary: string;
  coverBase64?: string;
  coverMime?: string;
  chapters: ParsedChapter[];
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return 0;
  return text.split(" ").length;
}

async function readZipText(zip: JSZip, path: string): Promise<string | null> {
  const file = zip.file(path);
  if (!file) return null;
  return file.async("string");
}

function parseContainer(xml: string): string | null {
  const match = xml.match(/full-path="([^"]+\.opf)"/i);
  return match ? match[1] : null;
}

function parseOpf(opfXml: string): {
  title: string;
  author: string;
  summary: string;
  coverId: string | null;
  spine: string[];
  manifest: Map<string, string>;
} {
  const title = opfXml.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i)?.[1]?.trim() || "Başlıksız";
  const author = opfXml.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i)?.[1]?.trim() || "Yazar";
  const summary =
    opfXml.match(/<dc:description[^>]*>([^<]+)<\/dc:description>/i)?.[1]?.trim() || "";

  const manifest = new Map<string, string>();
  const manifestRegex = /<item[^>]+id="([^"]+)"[^>]+href="([^"]+)"[^>]*>/gi;
  let m;
  while ((m = manifestRegex.exec(opfXml)) !== null) {
    manifest.set(m[1], m[2]);
  }

  const coverMeta = opfXml.match(/name="cover"\s+content="([^"]+)"/i);
  const coverId = coverMeta ? coverMeta[1] : null;

  const spine: string[] = [];
  const spineRegex = /<itemref[^>]+idref="([^"]+)"/gi;
  while ((m = spineRegex.exec(opfXml)) !== null) {
    spine.push(m[1]);
  }

  return { title, author, summary, coverId, spine, manifest };
}

function resolveHref(opfPath: string, href: string): string {
  const base = opfPath.includes("/") ? opfPath.substring(0, opfPath.lastIndexOf("/") + 1) : "";
  return base + href;
}

function htmlFromChapter(raw: string): string {
  const bodyMatch = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const inner = bodyMatch ? bodyMatch[1] : raw;
  const hasTags = /<[a-z][\s\S]*>/i.test(inner);
  const html = hasTags ? inner : plainTextToHtml(inner);
  return sanitizeContent(html);
}

function titleFromChapter(html: string, index: number): string {
  const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]?.trim();
  if (h1) return h1;
  const h2 = html.match(/<h2[^>]*>([^<]+)<\/h2>/i)?.[1]?.trim();
  if (h2) return h2;
  return `Bölüm ${index + 1}`;
}

export async function parseEpub(buffer: Buffer): Promise<ParsedBook> {
  const zip = await JSZip.loadAsync(buffer);

  const containerXml = await readZipText(zip, "META-INF/container.xml");
  if (!containerXml) throw new Error("Geçersiz EPUB: container.xml bulunamadı");

  const opfPath = parseContainer(containerXml);
  if (!opfPath) throw new Error("Geçersiz EPUB: OPF dosyası bulunamadı");

  const opfXml = await readZipText(zip, opfPath);
  if (!opfXml) throw new Error("Geçersiz EPUB: OPF okunamadı");

  const { title, author, summary, coverId, spine, manifest } = parseOpf(opfXml);

  let coverBase64: string | undefined;
  let coverMime: string | undefined;
  if (coverId && manifest.has(coverId)) {
    const coverHref = resolveHref(opfPath, manifest.get(coverId)!);
    const coverFile = zip.file(coverHref);
    if (coverFile) {
      const coverBuf = await coverFile.async("uint8array");
      coverBase64 = Buffer.from(coverBuf).toString("base64");
      coverMime = coverHref.endsWith(".png") ? "image/png" : "image/jpeg";
    }
  }

  const chapters: ParsedChapter[] = [];
  let order = 1;

  for (const id of spine) {
    const href = manifest.get(id);
    if (!href) continue;
    const chapterPath = resolveHref(opfPath, href);
    const raw = await readZipText(zip, chapterPath);
    if (!raw) continue;

    const content = htmlFromChapter(raw);
    const wordCount = countWords(content);
    if (wordCount < 5) continue;

    chapters.push({
      order: order++,
      title: titleFromChapter(content, chapters.length),
      content,
      wordCount,
    });
  }

  if (chapters.length === 0) {
    throw new Error("EPUB dosyasında okunabilir bölüm bulunamadı");
  }

  return { title, author, summary, coverBase64, coverMime, chapters };
}
