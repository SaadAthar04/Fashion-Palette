import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { newsletterSchema } from "@/lib/validators";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = newsletterSchema.parse(body);

    // Check if already subscribed
    const existing = await db.query.newsletterSubscribers.findFirst({
      where: eq(newsletterSubscribers.email, email),
    });

    if (existing) {
      return NextResponse.json({ success: true, message: "Already subscribed!" });
    }

    await db.insert(newsletterSubscribers).values({ email });

    return NextResponse.json({ success: true, message: "Subscribed successfully!" });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    console.error("Newsletter error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const subscribers = await db.query.newsletterSubscribers.findMany({
    orderBy: (s, { desc }) => [desc(s.subscribedAt)],
  });

  return NextResponse.json({ subscribers });
}
