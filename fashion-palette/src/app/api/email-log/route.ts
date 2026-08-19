import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailLog } from "@/lib/db/schema";
import { desc, eq, count, and, gte } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

// Feedback 31: admin-visible email delivery log (diagnose failures).
// Final feedback A6: separate *current* SMTP health (failures in the last 24h)
// from historical failures, so old pre-setup failures don't read as a live fault.
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const status = new URL(request.url).searchParams.get("status");
  const where = status && status !== "all"
    ? eq(emailLog.status, status as typeof emailLog.status.enumValues[number])
    : undefined;

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [rows, [{ total }], [failed], [recentFailed]] = await Promise.all([
    db.select().from(emailLog).where(where).orderBy(desc(emailLog.createdAt)).limit(200),
    db.select({ total: count() }).from(emailLog).where(where),
    db.select({ c: count() }).from(emailLog).where(eq(emailLog.status, "failed")),
    db.select({ c: count() }).from(emailLog).where(and(eq(emailLog.status, "failed"), gte(emailLog.createdAt, dayAgo))),
  ]);

  return NextResponse.json({
    rows,
    total,
    failedCount: failed.c, // historical total
    recentFailedCount: recentFailed.c, // last 24h — reflects current SMTP health
  });
}
