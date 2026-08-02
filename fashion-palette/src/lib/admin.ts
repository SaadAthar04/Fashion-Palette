import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type SessionWithRole = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

type RequireResult =
  | { session: SessionWithRole; error?: never }
  | { session?: never; error: NextResponse };

/**
 * For API routes: allow any of the given roles (Feedback 22/27 least privilege).
 * Re-checks the DB so a role change or deactivation takes effect immediately,
 * rather than trusting the (possibly stale) JWT — enforcement is server-side.
 */
export async function requireRole(allowed: string[]): Promise<RequireResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const id = parseInt((session.user as { id?: string }).id ?? "0");
  const [dbUser] = await db
    .select({ role: users.role, isActive: users.isActive })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!dbUser || dbUser.isActive === false) {
    return { error: NextResponse.json({ error: "Account is inactive" }, { status: 403 }) };
  }
  if (!allowed.includes(dbUser.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  // Reflect the authoritative DB role back to callers.
  (session.user as { role?: string }).role = dbUser.role;
  return { session: session as unknown as SessionWithRole };
}

/** For API routes: admin-only (payments, users, settings). */
export async function requireAdmin(): Promise<RequireResult> {
  return requireRole(["admin"]);
}

/** Catalogue routes: admin + catalogue_editor may manage products/brands/etc. */
export async function requireCatalogueEditor(): Promise<RequireResult> {
  return requireRole(["admin", "catalogue_editor"]);
}

/** For server components: returns session or redirects to login. Staff roles
 *  that may open the admin area (full access is still gated per-action). */
const ADMIN_AREA_ROLES = ["admin", "order_manager", "catalogue_editor"];

export async function requireAdminPage(): Promise<SessionWithRole> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/account/login");
  }

  const id = parseInt((session!.user as { id?: string }).id ?? "0");
  const [dbUser] = await db
    .select({ role: users.role, isActive: users.isActive })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!dbUser || dbUser.isActive === false || !ADMIN_AREA_ROLES.includes(dbUser.role)) {
    redirect("/account/login");
  }
  (session!.user as { role?: string }).role = dbUser.role;
  return session as unknown as SessionWithRole;
}
