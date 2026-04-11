import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { banners } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { bannerSchema } from "@/lib/validators";

export async function GET() {
  const result = await db.query.banners.findMany({
    orderBy: (banners, { asc }) => [asc(banners.sortOrder)],
  });

  return NextResponse.json({ banners: result });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const data = bannerSchema.parse(body);

    const insertData = {
      ...data,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
    };

    const [result] = await db.insert(banners).values(insertData).$returningId();

    const banner = await db.query.banners.findFirst({
      where: eq(banners.id, result.id),
    });

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid banner data" }, { status: 400 });
    }
    console.error("Create banner error:", error);
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}
