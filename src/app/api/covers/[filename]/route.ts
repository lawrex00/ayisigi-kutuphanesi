import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  const safeName = path.basename(filename);
  const filepath = path.join(process.cwd(), "data", "uploads", safeName);

  if (!fs.existsSync(filepath)) {
    return NextResponse.json({ error: "Kapak bulunamadı" }, { status: 404 });
  }

  const buffer = fs.readFileSync(filepath);
  const ext = path.extname(safeName).toLowerCase();
  const contentType = ext === ".png" ? "image/png" : "image/jpeg";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
