import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { banners } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { bannerSchema } from "@/lib/validators";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const body = await request.json();
    const data = bannerSchema.parse(body);

    const updateData = {
      ...data,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
    };

    await db.update(banners).set(updateData).where(eq(banners.id, parseInt(id)));

    const updated = await db.query.banners.findFirst({
      where: eq(banners.id, parseInt(id)),
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid banner data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;

  await db.delete(banners).where(eq(banners.id, parseInt(id)));

  return NextResponse.json({ success: true });
}
