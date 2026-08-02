import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auditLog } from "@/lib/db/schema";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sendEmail, ADMIN_NOTIFY } from "@/lib/email/mailer";
import { adminContactEmail } from "@/lib/email/templates";

// Feedback 38: rate-limit public forms. Feedback 40: provide a working contact
// route. Messages are persisted to the audit log so nothing is silently lost;
// an admin email notification is wired once the email provider is configured.
const schema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(150),
  phone: z.string().max(30).optional().or(z.literal("")),
  subject: z.string().min(1).max(150),
  message: z.string().min(1).max(3000),
});

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (!rateLimit(`contact:${ip}`, 5, 15 * 60 * 1000).ok) {
    return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  }

  let data: z.infer<typeof schema>;
  try {
    data = schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  await db.insert(auditLog).values({
    action: "contact.message",
    entityType: "contact",
    meta: data,
    ipAddress: ip,
  });

  // Notify staff (with the sender as Reply-To flow via message body).
  const mail = adminContactEmail(data.name, data.email, data.subject, data.message);
  await sendEmail({ to: ADMIN_NOTIFY, template: "admin_contact", subject: mail.subject, html: mail.html });

  return NextResponse.json({ ok: true });
}
