import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

// Serves admin-uploaded images from public/uploads at request time.
//
// Why this exists: `next start` only serves the public/ files that existed when
// the server booted. Anything uploaded afterwards 404s until the next
// restart/deploy, so new product photos showed as broken images. next.config.ts
// rewrites /uploads/:path* here (beforeFiles), so every upload is served
// straight from disk the moment it is written. Existing URLs keep working.

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const filePath = path.resolve(UPLOADS_DIR, ...segments.map((s) => decodeURIComponent(s)));

  // Block path traversal (../) and anything outside the uploads folder.
  if (!filePath.startsWith(UPLOADS_DIR + path.sep)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const type = CONTENT_TYPES[path.extname(filePath).toLowerCase()];
  if (!type) return new NextResponse("Not found", { status: 404 });

  try {
    const info = await stat(filePath);
    if (!info.isFile()) return new NextResponse("Not found", { status: 404 });
    const body = await readFile(filePath);
    return new NextResponse(body, {
      headers: {
        "Content-Type": type,
        "Content-Length": String(body.length),
        // Filenames carry a timestamp, so a URL never changes content.
        "Cache-Control": "public, max-age=31536000, immutable",
        "Last-Modified": info.mtime.toUTCString(),
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
