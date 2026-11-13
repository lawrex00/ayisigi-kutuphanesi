import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth, unauthorized } from "@/lib/admin-auth";
import { deleteBook } from "@/lib/import-service";
import { publishAllChaptersForBook, setBookPublished } from "@/lib/db/queries";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(request)) return unauthorized();

  const { id } = await params;
  const bookId = parseInt(id, 10);
  if (isNaN(bookId)) {
    return NextResponse.json({ error: "Geçersiz kitap ID" }, { status: 400 });
  }

  try {
    await deleteBook(bookId);
    return NextResponse.json({ success: true, message: "Kitap silindi" });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Silme hatası" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(request)) return unauthorized();

  const { id } = await params;
  const bookId = parseInt(id, 10);
  if (isNaN(bookId)) {
    return NextResponse.json({ error: "Geçersiz kitap ID" }, { status: 400 });
  }

  const body = await request.json();

  if (body.publishAllChapters === true) {
    await publishAllChaptersForBook(bookId);
    return NextResponse.json({ success: true });
  }

  if (typeof body.isPublished === "boolean") {
    await setBookPublished(bookId, body.isPublished);
    if (body.isPublished) {
      await publishAllChaptersForBook(bookId);
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
}
