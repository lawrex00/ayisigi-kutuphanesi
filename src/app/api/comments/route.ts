import { NextRequest, NextResponse } from "next/server";
import { getAuthUserFromRequest } from "@/lib/auth-guard";
import { createComment, listComments } from "@/lib/comments-service";

export async function GET() {
  return NextResponse.json(await listComments());
}

export async function POST(request: NextRequest) {
  const user = await getAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ detail: "Giriş gerekli" }, { status: 401 });
  }

  const body = await request.json();
  try {
    await createComment(user.id, body.text || "");
    return NextResponse.json(await listComments(), { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "Hata" },
      { status: 400 }
    );
  }
}
