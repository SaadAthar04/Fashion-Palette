import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { reviewSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json({ error: "productId is required" }, { status: 400 });
  }

  const result = await db.query.reviews.findMany({
    where: and(
      eq(reviews.productId, parseInt(productId)),
      eq(reviews.isApproved, true)
    ),
    with: { user: { columns: { name: true } } },
    orderBy: () => [desc(reviews.createdAt)],
  });

  return NextResponse.json({ reviews: result });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in to submit a review" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = reviewSchema.parse(body);
    const productId = body.productId;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const userId = parseInt((session.user as { id: string }).id);

    await db.insert(reviews).values({
      productId,
      userId,
      rating: data.rating,
      comment: data.comment,
      isApproved: false,
    });

    return NextResponse.json({ success: true, message: "Review submitted for approval." });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid review data" }, { status: 400 });
    }
    console.error("Review error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
