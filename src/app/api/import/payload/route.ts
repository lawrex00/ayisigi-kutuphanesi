import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth, unauthorized } from "@/lib/admin-auth";
import { importBookToDb } from "@/lib/import-service";
import { countWords, estimateReadingMinutes } from "@/lib/db/queries";
import { sanitizeContent } from "@/lib/utils";
import type { ParsedBook } from "@/lib/epub-parser";

const CORS_ORIGINS = [
  "https://www.wattpad.com",
  "https://wattpad.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function corsHeaders(origin: string | null, request?: NextRequest) {
  const allowed = origin && CORS_ORIGINS.some((o) => origin.startsWith(o.replace(/\/$/, "")));
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": allowed ? origin! : "https://www.wattpad.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-admin-password",
  };
  if (
    request?.headers.get("Access-Control-Request-Private-Network") === "true" ||
    origin?.includes("wattpad.com")
  ) {
    headers["Access-Control-Allow-Private-Network"] = "true";
  }
  return headers;
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin"), request),
  });
}

export async function POST(request: NextRequest) {
  const cors = corsHeaders(request.headers.get("origin"), request);

  if (!checkAdminAuth(request)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401, headers: cors });
  }

  try {
    const body = await request.json();
    const {
      title,
      author,
      summary,
      wattpadUrl,
      wattpadId,
      coverBase64,
      coverMime,
      chapters,
    } = body;

    if (!title || !Array.isArray(chapters) || chapters.length === 0) {
      return NextResponse.json({ error: "Geçersiz kitap verisi" }, { status: 400, headers: cors });
    }

    const parsed: ParsedBook = {
      title: String(title),
      author: String(author || "Yazar"),
      summary: summary ? String(summary) : "",
      coverBase64: coverBase64 || undefined,
      coverMime: coverMime || undefined,
      chapters: chapters.map(
        (ch: { order: number; title: string; content: string }, i: number) => {
          const content = sanitizeContent(String(ch.content || ""));
          return {
            order: Number(ch.order) || i + 1,
            title: String(ch.title || `Bölüm ${i + 1}`),
            content,
            wordCount: countWords(content),
          };
        }
      ),
    };

    const totalWords = parsed.chapters.reduce((s, c) => s + c.wordCount, 0);
    if (totalWords < 10) {
      return NextResponse.json({ error: "Bölüm içeriği boş" }, { status: 400, headers: cors });
    }

    const result = await importBookToDb(parsed, {
      wattpadUrl: wattpadUrl || undefined,
      wattpadId: wattpadId ? String(wattpadId) : undefined,
      publishBook: false,
    });

    const action = result.updated ? "senkronize edildi" : "kaydedildi";
    const changeNote =
      result.updated && result.chaptersChanged === 0
        ? " (değişiklik yok — Wattpad'te 'Değişiklikleri Yayınla' yaptın mı?)"
        : result.updated
          ? ` (${result.chaptersChanged} bölüm güncellendi)`
          : " (taslak)";

    return NextResponse.json(
      {
        success: true,
        message: `"${parsed.title}" ${action}${changeNote}`,
        readingMinutes: estimateReadingMinutes(totalWords),
        ...result,
      },
      { headers: cors }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "İçe aktarma hatası";
    return NextResponse.json({ error: message }, { status: 500, headers: cors });
  }
}
