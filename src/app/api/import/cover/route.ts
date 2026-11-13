import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { checkAdminAuth, unauthorized } from "@/lib/admin-auth";
import { getDb, schema } from "@/lib/db";
import { saveCoverImage } from "@/lib/import-service";
import { createSlug } from "@/lib/utils";

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
    const { wattpadId, coverBase64, coverMime } = body;

    if (!wattpadId || !coverBase64 || !coverMime) {
      return NextResponse.json({ error: "Kapak verisi eksik" }, { status: 400, headers: cors });
    }

    const db = getDb();
    const existing = await db
      .select()
      .from(schema.books)
      .where(eq(schema.books.wattpadId, String(wattpadId)))
      .limit(1);

    if (!existing[0]) {
      return NextResponse.json({ error: "Kitap bulunamadı" }, { status: 404, headers: cors });
    }

    const book = existing[0];
    if (book.coverUrl) {
      return NextResponse.json(
        { success: true, message: "Kapak zaten var", coverUrl: book.coverUrl },
        { headers: cors }
      );
    }

    const slug = book.slug || createSlug(book.title, wattpadId);
    const coverUrl = await saveCoverImage(String(coverBase64), String(coverMime), slug);
    if (!coverUrl) {
      return NextResponse.json({ error: "Kapak kaydedilemedi" }, { status: 500, headers: cors });
    }

    await db
      .update(schema.books)
      .set({ coverUrl, updatedAt: new Date().toISOString() })
      .where(eq(schema.books.id, book.id));

    return NextResponse.json(
      { success: true, message: `"${book.title}" kapağı eklendi`, coverUrl },
      { headers: cors }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kapak hatası";
    return NextResponse.json({ error: message }, { status: 500, headers: cors });
  }
}
