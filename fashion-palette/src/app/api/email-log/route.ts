import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailLog } from "@/lib/db/schema";
import { desc, eq, count } from "drizzle-orm";
import { requireAdmin } from "@/lib/admin";

// Feedback 31: admin-visible email delivery log (diagnose failures).
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const status = new URL(request.url).searchParams.get("status");
  const where = status && status !== "all"
    ? eq(emailLog.status, status as typeof emailLog.status.enumValues[number])
    : undefined;

  const [rows, [{ total }], [failed]] = await Promise.all([
    db.select().from(emailLog).where(where).orderBy(desc(emailLog.createdAt)).limit(200),
    db.select({ total: count() }).from(emailLog).where(where),
    db.select({ c: count() }).from(emailLog).where(eq(emailLog.status, "failed")),
  ]);

  return NextResponse.json({ rows, total, failedCount: failed.c });
}
