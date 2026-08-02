import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteSettings, auditLog } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin";
import { getSettings, SETTING_DEFAULTS, SettingKey } from "@/lib/settings";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  return NextResponse.json({ settings: await getSettings() });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const body = (await req.json()) as Record<string, unknown>;
  const keys = Object.keys(SETTING_DEFAULTS) as SettingKey[];
  const updates = keys.filter((k) => body[k] !== undefined);
  if (updates.length === 0) {
    return NextResponse.json({ error: "No valid settings provided" }, { status: 400 });
  }

  for (const k of updates) {
    const value = String(body[k]);
    await db
      .insert(siteSettings)
      .values({ key: k, value })
      .onDuplicateKeyUpdate({ set: { value } });
  }
  await db.insert(auditLog).values({
    actorUserId: parseInt(auth.session.user.id),
    action: "settings.update",
    entityType: "settings",
    meta: Object.fromEntries(updates.map((k) => [k, String(body[k])])),
  });

  return NextResponse.json({ ok: true, settings: await getSettings() });
}
