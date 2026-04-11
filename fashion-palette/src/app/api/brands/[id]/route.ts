import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { brands } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { brandSchema } from "@/lib/validators";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const body = await request.json();
    const data = brandSchema.parse(body);

    await db.update(brands).set(data).where(eq(brands.id, parseInt(id)));

    const updated = await db.query.brands.findFirst({
      where: eq(brands.id, parseInt(id)),
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid brand data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;

  await db.delete(brands).where(eq(brands.id, parseInt(id)));

  return NextResponse.json({ success: true });
}
