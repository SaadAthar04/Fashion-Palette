import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireRole } from "@/lib/admin";

// Feedback 23: admin review moderation list.
export async function GET(request: NextRequest) {
  const auth = await requireRole(["admin", "catalogue_editor"]);
  if (auth.error) return auth.error;

  const status = new URL(request.url).searchParams.get("status"); // pending | approved | all
  const where = status === "approved" ? eq(reviews.isApproved, true)
    : status === "pending" ? eq(reviews.isApproved, false)
    : undefined;

  const rows = await db.query.reviews.findMany({
    where,
    with: { user: { columns: { name: true, email: true } }, product: { columns: { name: true, slug: true } } },
    orderBy: () => [desc(reviews.createdAt)],
    limit: 200,
  });
  return NextResponse.json({ reviews: rows });
}
