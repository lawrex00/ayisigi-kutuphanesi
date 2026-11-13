import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth, unauthorized } from "@/lib/admin-auth";
import { getChaptersForAdmin } from "@/lib/db/queries";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(request)) return unauthorized();

  const { id } = await params;
  const bookId = parseInt(id, 10);
  if (isNaN(bookId)) {
    return NextResponse.json({ error: "Geçersiz kitap ID" }, { status: 400 });
  }

  const chapters = await getChaptersForAdmin(bookId);
  return NextResponse.json({ chapters });
}
