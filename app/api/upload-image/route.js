import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Thiếu file ảnh." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Chỉ hỗ trợ file hình ảnh." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const timestamp = Date.now();
    const safeName = sanitizeFileName(file.name || "image");
    const filename = `${timestamp}-${safeName}`;
    const outputPath = path.join(uploadsDir, filename);

    await writeFile(outputPath, buffer);

    return NextResponse.json({
      message: "Upload ảnh thành công.",
      url: `/uploads/${filename}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Upload thất bại: ${error.message}` },
      { status: 500 }
    );
  }
}
