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

/** For API routes: returns session or 401 error response */
export async function requireAdmin(): Promise<
  { session: SessionWithRole; error?: never } | { session?: never; error: NextResponse }
> {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { session: session as unknown as SessionWithRole };
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
