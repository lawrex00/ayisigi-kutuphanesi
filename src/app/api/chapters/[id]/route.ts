import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth, unauthorized } from "@/lib/admin-auth";
import { setChapterPublished } from "@/lib/db/queries";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminAuth(request)) return unauthorized();

  const { id } = await params;
  const chapterId = parseInt(id, 10);
  if (isNaN(chapterId)) {
    return NextResponse.json({ error: "Geçersiz bölüm ID" }, { status: 400 });
  }

  const body = await request.json();
  if (typeof body.isPublished === "boolean") {
    await setChapterPublished(chapterId, body.isPublished);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
}
