import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { eq, like, desc, sql } from "drizzle-orm";
import { newsletterSchema } from "@/lib/validators";
import { requireAdmin } from "@/lib/admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/email/mailer";
import { newsletterWelcomeEmail } from "@/lib/email/templates";
import { unsubscribeUrl } from "@/lib/newsletter-token";

// Final feedback B1: VIP newsletter signup. Stores consent time (subscribedAt) +
// source, sends a branded welcome email with one-click unsubscribe, prevents
// duplicate active subscriptions, and reactivates a previously-unsubscribed email.
export async function POST(request: Request) {
  if (!rateLimit(`newsletter:${clientIp(request)}`, 10, 10 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }
  try {
    const body = await request.json();
    const { email } = newsletterSchema.parse(body);
    const normalized = email.toLowerCase().trim();
    const source = typeof body.source === "string" ? body.source.slice(0, 60) : "homepage";

    const existing = await db.query.newsletterSubscribers.findFirst({
      where: eq(newsletterSubscribers.email, normalized),
    });

    if (existing?.isActive) {
      return NextResponse.json({ success: true, alreadySubscribed: true, message: "You're already on the VIP list." });
    }

    if (existing && !existing.isActive) {
      // Reactivate a previously-unsubscribed email (fresh consent).
      await db
        .update(newsletterSubscribers)
        .set({ isActive: true, unsubscribedAt: null, subscribedAt: new Date(), source })
        .where(eq(newsletterSubscribers.id, existing.id));
    } else {
      await db.insert(newsletterSubscribers).values({ email: normalized, source });
    }

    // Branded welcome email (never blocks the response).
    const mail = newsletterWelcomeEmail(unsubscribeUrl(normalized));
    await sendEmail({ to: normalized, template: "newsletter_welcome", subject: mail.subject, html: mail.html });

    return NextResponse.json({ success: true, message: "You're on the VIP list! Check your inbox to confirm." });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Admin: list / search / export subscribers.
export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const format = searchParams.get("format");
  const where = q ? like(newsletterSubscribers.email, `%${q}%`) : undefined;

  const rows = await db
    .select()
    .from(newsletterSubscribers)
    .where(where)
    .orderBy(desc(newsletterSubscribers.subscribedAt));

  if (format === "csv") {
    const cell = (v: unknown) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const header = ["Email", "Status", "Source", "Subscribed At", "Unsubscribed At"];
    const lines = rows.map((r) =>
      [r.email, r.isActive ? "active" : "unsubscribed", r.source || "", new Date(r.subscribedAt).toISOString(), r.unsubscribedAt ? new Date(r.unsubscribedAt).toISOString() : ""]
        .map(cell)
        .join(",")
    );
    return new NextResponse([header.join(","), ...lines].join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  }

  const [{ activeCount }] = await db
    .select({ activeCount: sql<number>`count(*)` })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.isActive, true));

  return NextResponse.json({ subscribers: rows, activeCount: Number(activeCount) });
}

// Admin: suppress (unsubscribe) or reactivate a subscriber.
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => ({}));
  const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
  const action = body?.action;
  if (!email || !["suppress", "reactivate"].includes(action)) {
    return NextResponse.json({ error: "email and a valid action are required" }, { status: 400 });
  }

  await db
    .update(newsletterSubscribers)
    .set(
      action === "suppress"
        ? { isActive: false, unsubscribedAt: new Date() }
        : { isActive: true, unsubscribedAt: null }
    )
    .where(eq(newsletterSubscribers.email, email));

  return NextResponse.json({ ok: true });
}
