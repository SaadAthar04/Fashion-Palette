import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users, emailVerificationTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { registerSchema } from "@/lib/validators";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/mailer";
import { emailVerificationEmail } from "@/lib/email/templates";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://fashionpalette.pk";

// Feedback 21/27: real account creation with hashed password, verification
// email, and rate limiting.
export async function POST(req: NextRequest) {
  if (!rateLimit(`register:${clientIp(req)}`, 5, 15 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  try {
    const parsed = registerSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid data" }, { status: 400 });
    }
    const { name, email, password, phone } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, normalizedEmail)).limit(1);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [inserted] = await db
      .insert(users)
      .values({ name, email: normalizedEmail, passwordHash, phone: phone || null, role: "customer" })
      .$returningId();

    // Email verification token (24h, hashed, single-use)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    await db.insert(emailVerificationTokens).values({
      userId: inserted.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    const verifyUrl = `${SITE}/api/auth/verify-email?token=${rawToken}`;
    const mail = emailVerificationEmail(verifyUrl);
    await sendEmail({ to: normalizedEmail, template: "email_verification", subject: mail.subject, html: mail.html });

    return NextResponse.json({ ok: true, message: "Account created. Please check your email to verify your address." });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }
}
