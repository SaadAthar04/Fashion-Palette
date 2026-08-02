import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { sendEmail, ADMIN_NOTIFY } from "@/lib/email/mailer";

// Feedback 31: one-click SMTP verification from the admin Email Log.
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = await req.json().catch(() => ({}));
  // Default to the monitored notification inbox (info@), NOT the logged-in
  // account's login email — which may be a non-receiving identity.
  const to = typeof body.to === "string" && body.to.includes("@") ? body.to.trim() : ADMIN_NOTIFY;

  const sent = await sendEmail({
    to,
    template: "smtp_test",
    subject: "Fashion Palette — SMTP test",
    html: `<div style="font-family:Arial,sans-serif;padding:16px;">
      <p>✅ This is a test email from Fashion Palette.</p>
      <p>If you're reading this, SMTP is configured correctly and delivery is working.</p>
    </div>`,
  });

  return NextResponse.json({ ok: true, sent, to });
}
