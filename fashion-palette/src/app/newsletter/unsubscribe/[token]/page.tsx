import Link from "next/link";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyUnsubscribeToken } from "@/lib/newsletter-token";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false, follow: false } };

// Final feedback B1: one-click unsubscribe, honoured immediately.
export default async function UnsubscribePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const email = verifyUnsubscribeToken(token);

  let ok = false;
  if (email) {
    await db
      .update(newsletterSubscribers)
      .set({ isActive: false, unsubscribedAt: new Date() })
      .where(eq(newsletterSubscribers.email, email));
    ok = true;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      {ok ? (
        <>
          <h1 className="text-2xl font-semibold mb-3">You&apos;ve been unsubscribed</h1>
          <p className="text-muted text-sm mb-6">
            {email} has been removed from the Fashion Palette VIP list. You won&apos;t receive any more VIP emails.
            Changed your mind? You can rejoin anytime from our homepage.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold mb-3">Link invalid</h1>
          <p className="text-muted text-sm mb-6">
            This unsubscribe link is invalid. If you keep receiving emails, contact support@fashionpalette.pk and we&apos;ll
            remove you right away.
          </p>
        </>
      )}
      <Link href="/" className="text-accent text-sm font-medium">← Back to shop</Link>
    </div>
  );
}
