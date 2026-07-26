import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { users, emailVerificationTokens } from "@/lib/db/schema";
import { and, eq, gt, isNull } from "drizzle-orm";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://fashionpalette.pk";

// Feedback 21: confirm the email via a single-use, expiring, hashed token.
export async function GET(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  const redirect = (status: string) => NextResponse.redirect(`${SITE}/account/login?verified=${status}`);

  if (!token) return redirect("0");

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const [row] = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.tokenHash, tokenHash),
          isNull(emailVerificationTokens.usedAt),
          gt(emailVerificationTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!row) return redirect("0");

    await db.transaction(async (tx) => {
      await tx.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.id, row.userId));
      await tx.update(emailVerificationTokens).set({ usedAt: new Date() }).where(eq(emailVerificationTokens.id, row.id));
    });

    return redirect("1");
  } catch {
    return redirect("0");
  }
}
