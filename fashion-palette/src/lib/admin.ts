import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

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

/** For API routes: allow any of the given roles (Feedback 22/27 least privilege). */
export async function requireRole(allowed: string[]): Promise<RequireResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const role = (session.user as { role?: string }).role ?? "customer";
  if (!allowed.includes(role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
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

/** For server components: returns session or redirects to login */
export async function requireAdminPage(): Promise<SessionWithRole> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/account/login");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    redirect("/account/login");
  }

  return session as unknown as SessionWithRole;
}
