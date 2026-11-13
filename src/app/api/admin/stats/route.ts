import { NextRequest, NextResponse } from "next/server";
import { checkAdminAuth, unauthorized } from "@/lib/admin-auth";
import { getDashboardStats } from "@/lib/analytics-service";

export async function GET(request: NextRequest) {
  if (!checkAdminAuth(request)) return unauthorized();
  return NextResponse.json(await getDashboardStats());
}
