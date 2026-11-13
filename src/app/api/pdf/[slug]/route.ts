import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth } from "@/lib/admin-auth";
import { getAuthUserFromRequest } from "@/lib/auth-guard";
import { getBookWithChapters } from "@/lib/db/queries";
import { generateBookPdf } from "@/lib/pdf-generator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const isAdmin = checkAdminAuth(request);
  const user = await getAuthUserFromRequest(request);

  if (!isAdmin && !user) {
    return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });
  }

  const book = await getBookWithChapters(slug, !isAdmin);

  if (!book) {
    return NextResponse.json({ error: "Kitap bulunamadı" }, { status: 404 });
  }

  if (book.chapters.length === 0) {
    return NextResponse.json({ error: "Henüz bölüm yok" }, { status: 400 });
  }

  const pdfBuffer = await generateBookPdf(book);
  const filename = `${slug}.pdf`;

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": pdfBuffer.length.toString(),
    },
  });
}
