import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth, unauthorized } from "@/lib/admin-auth";
import {
  importFromWattpadDownloader,
  importFromEpubBuffer,
  importAllUserStories,
  importFromWattpadApi,
} from "@/lib/import-service";

export async function POST(request: NextRequest) {
  if (!checkAdminAuth(request)) return unauthorized();

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("epub") as File | null;
      const wattpadUrl = (formData.get("wattpadUrl") as string) || undefined;

      if (!file) {
        return NextResponse.json({ error: "EPUB dosyası gerekli" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await importFromEpubBuffer(buffer, wattpadUrl);
      return NextResponse.json({
        success: true,
        message: `"${result.slug}" taslak olarak içe aktarıldı`,
        ...result,
      });
    }

    const body = await request.json();

    if (body.importAccount) {
      const username = body.username || process.env.NEXT_PUBLIC_AUTHOR_NAME || "gozyasikullugu";
      const results = await importAllUserStories(username.toLowerCase());
      const ok = results.filter((r) => !r.error);
      const fail = results.filter((r) => r.error);
      return NextResponse.json({
        success: fail.length === 0,
        message: `${ok.length} kitap içe aktarıldı${fail.length ? `, ${fail.length} hata` : ""}`,
        results,
      });
    }

    if (body.storyId) {
      const result = await importFromWattpadApi(parseInt(body.storyId, 10), {
        localCoverPath: body.localCoverPath,
      });
      return NextResponse.json({
        success: true,
        message: `"${result.slug}" taslak olarak içe aktarıldı (${result.chapterCount} bölüm)`,
        ...result,
      });
    }

    const { wattpadUrl } = body;
    if (!wattpadUrl) {
      return NextResponse.json({ error: "Wattpad URL gerekli" }, { status: 400 });
    }

    const result = await importFromWattpadDownloader(wattpadUrl);
    return NextResponse.json({
      success: true,
      message: `"${result.slug}" taslak olarak içe aktarıldı (${result.chapterCount} bölüm)`,
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "İçe aktarma hatası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
