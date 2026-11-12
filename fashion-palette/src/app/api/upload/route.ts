import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import sharp from "sharp";

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB raw upload
const MAX_EDGE = 2000; // longest side after resize (px)

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: `${file.name} is larger than 20 MB.` }, { status: 413 });
    }

    const input = Buffer.from(await file.arrayBuffer());

    // Normalise every upload to an optimised WebP: fixes phone-photo rotation
    // (EXIF), caps the size for the small VPS (images are served unoptimized),
    // and rejects anything that isn't a real, decodable image.
    let output: Buffer;
    try {
      output = await sharp(input, { failOn: "none" })
        .rotate()
        .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85 })
        .toBuffer();
    } catch {
      const isHeic = /\.(heic|heif)$/i.test(file.name) || /hei[cf]/i.test(file.type);
      return NextResponse.json(
        {
          error: isHeic
            ? `${file.name} is an iPhone HEIC photo, which browsers can't display. Please upload JPG, PNG or WebP.`
            : `${file.name} isn't a supported image. Please upload JPG, PNG or WebP.`,
        },
        { status: 415 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name);
    const base = path.basename(file.name, ext).replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 80) || "image";
    const uniqueName = `${base}-${Date.now()}.webp`;
    await writeFile(path.join(uploadsDir, uniqueName), output);

    return NextResponse.json({ success: true, url: `/uploads/${uniqueName}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
