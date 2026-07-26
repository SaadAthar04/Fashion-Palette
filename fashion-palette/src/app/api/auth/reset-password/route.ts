import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { and, eq, gt, isNull } from "drizzle-orm";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// Feedback 21: reset the password using a single-use, expiring, hashed token.
export async function POST(req: NextRequest) {
  const limit = rateLimit(`reset:${clientIp(req)}`, 10, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  try {
    const { token, password } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid or expired reset link." }, { status: 400 });
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const [row] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await db.transaction(async (tx) => {
      await tx.update(users).set({ passwordHash }).where(eq(users.id, row.userId));
      await tx.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, row.id));
    });

    return NextResponse.json({ ok: true, message: "Your password has been reset. You can now sign in." });
  } catch {
    return NextResponse.json({ error: "Could not reset password." }, { status: 500 });
  }
}
