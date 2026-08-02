import "server-only";
import nodemailer from "nodemailer";
import { db } from "@/lib/db";
import { emailLog } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Feedback 20: transactional email via a verified domain sender.
// Provider-agnostic — configured for Hostinger SMTP but swappable in one place.
// All secrets are server-only env vars (never NEXT_PUBLIC_ — Feedback 26).
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465");
const SMTP_SECURE = (process.env.SMTP_SECURE ?? "true") === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
// Feedback 31: use verified domain addresses with a monitored Reply-To.
const EMAIL_FROM = process.env.EMAIL_FROM || "Fashion Palette <orders@fashionpalette.pk>";
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || "support@fashionpalette.pk";

// Where internal notifications (new order, return request, contact, low stock) go.
export const ADMIN_NOTIFY = process.env.ADMIN_EMAIL || process.env.EMAIL_REPLY_TO || "support@fashionpalette.pk";

let transporter: nodemailer.Transporter | null = null;
function getTransport() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

const MAX_ATTEMPTS = 2;

export interface SendArgs {
  to: string;
  subject: string;
  html: string;
  template: string;
  relatedOrderId?: number | null;
}

/**
 * Sends an email and records the attempt in email_log (queued → sent/failed/retried).
 * Never throws — callers (e.g. order placement) must not fail if email fails.
 */
export async function sendEmail({ to, subject, html, template, relatedOrderId = null }: SendArgs): Promise<boolean> {
  const [logRow] = await db
    .insert(emailLog)
    .values({ toAddress: to, template, subject, status: "queued", relatedOrderId })
    .$returningId();
  const logId = logRow.id;

  const transport = getTransport();
  if (!transport) {
    await db.update(emailLog).set({ status: "failed", attempts: 0, errorMessage: "SMTP not configured" }).where(eq(emailLog.id, logId));
    console.warn(`[email] SMTP not configured — '${template}' to ${to} not sent`);
    return false;
  }

  let lastError = "";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await transport.sendMail({ from: EMAIL_FROM, to, subject, html, replyTo: EMAIL_REPLY_TO });
      await db
        .update(emailLog)
        .set({ status: attempt > 1 ? "retried" : "sent", attempts: attempt, errorMessage: null })
        .where(eq(emailLog.id, logId));
      return true;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      // Don't log SMTP responses verbatim beyond the message (Feedback 26: no secrets in logs).
    }
  }

  await db.update(emailLog).set({ status: "failed", attempts: MAX_ATTEMPTS, errorMessage: lastError.slice(0, 500) }).where(eq(emailLog.id, logId));
  console.error(`[email] '${template}' to ${to} failed after ${MAX_ATTEMPTS} attempts`);
  return false;
}
