import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth, unauthorized } from "@/lib/admin-auth";
import { getAuthUserFromRequest } from "@/lib/auth-guard";
import { replyToComment } from "@/lib/comments-service";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const commentId = parseInt(id, 10);
  if (isNaN(commentId)) {
    return NextResponse.json({ detail: "Geçersiz yorum" }, { status: 400 });
  }

  // Admin şifresi veya admin kullanıcı
  const isAdminSession = checkAdminAuth(request);
  const user = await getAuthUserFromRequest(request);
  if (!isAdminSession && !user?.is_admin) {
    return unauthorized();
  }

  const body = await request.json();
  try {
    const adminId = user?.id ?? 1;
    const reply = await replyToComment(commentId, adminId, body.text || "");
    return NextResponse.json(reply, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Hata" },
      { status: 400 }
    );
  }
}
