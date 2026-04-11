import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";
import { categorySchema } from "@/lib/validators";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;

  try {
    const body = await request.json();
    const data = categorySchema.parse(body);

    await db.update(categories).set(data).where(eq(categories.id, parseInt(id)));

    const updated = await db.query.categories.findFirst({
      where: eq(categories.id, parseInt(id)),
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid category data" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { id } = await params;

  await db.delete(categories).where(eq(categories.id, parseInt(id)));

  return NextResponse.json({ success: true });
}
