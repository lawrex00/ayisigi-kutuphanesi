import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth, unauthorized } from "@/lib/admin-auth";
import { getAdminBooks } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) return unauthorized();

  const books = await getAdminBooks();
  return NextResponse.json({ books });
}
