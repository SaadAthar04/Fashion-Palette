import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { users, passwordResetTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/mailer";
import { passwordResetEmail } from "@/lib/email/templates";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://fashionpalette.pk";

// Always returns a generic success so an attacker can't enumerate accounts
// (Feedback 21). Rate-limited (Feedback 27).
export async function POST(req: NextRequest) {
  const limit = rateLimit(`forgot:${clientIp(req)}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  const generic = NextResponse.json({
    ok: true,
    message: "If an account exists for that email, a reset link has been sent.",
  });

  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") return generic;

    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase().trim())).limit(1);
    if (!user) return generic;

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 60 minutes

    await db.insert(passwordResetTokens).values({ userId: user.id, tokenHash, expiresAt });

    const resetUrl = `${SITE}/account/reset-password?token=${rawToken}`;
    const mail = passwordResetEmail(resetUrl);
    await sendEmail({ to: user.email, template: "password_reset", subject: mail.subject, html: mail.html });

    return generic;
  } catch {
    return generic; // never leak internal errors on this endpoint
  }
}
