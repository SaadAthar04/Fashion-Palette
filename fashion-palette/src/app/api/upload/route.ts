import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const ext = path.extname(file.name);
    const name = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, "-");
    const uniqueName = `${name}-${Date.now()}${ext}`;
    const filePath = path.join(uploadsDir, uniqueName);

    await writeFile(filePath, buffer);

    return NextResponse.json({ success: true, url: `/uploads/${uniqueName}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
