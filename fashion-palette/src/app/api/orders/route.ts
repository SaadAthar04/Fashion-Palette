import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, orderItems, productVariants } from "@/lib/db/schema";
import { eq, and, or, like, desc, count, sql } from "drizzle-orm";
import { checkoutSchema } from "@/lib/validators";
import { generateOrderNumber } from "@/lib/utils";
import { FREE_DELIVERY_THRESHOLD, DEFAULT_DELIVERY_CHARGES } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  const role = (session.user as { role?: string }).role;
  const userId = parseInt((session.user as { id: string }).id);

  const conditions = [];

  // Non-admin users can only see their own orders
  if (role !== "admin") {
    conditions.push(eq(orders.userId, userId));
  }

  if (status && status !== "all") {
    conditions.push(eq(orders.status, status as typeof orders.status.enumValues[number]));
  }

  if (search) {
    const term = `%${search}%`;
    conditions.push(like(orders.orderNumber, term));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, [{ total }]] = await Promise.all([
    db.query.orders.findMany({
      where,
      with: { user: true, items: true },
      orderBy: () => [desc(orders.createdAt)],
      limit,
      offset,
    }),
    db.select({ total: count() }).from(orders).where(where),
  ]);

  return NextResponse.json({
    orders: items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = checkoutSchema.parse(body);

    const session = await getServerSession(authOptions);
    const userId = session?.user ? parseInt((session.user as { id: string }).id) : null;

    const cartItems = body.items;
    if (!cartItems?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of cartItems) {
      subtotal += parseFloat(item.unitPrice) * item.quantity;
    }
    const deliveryCharges = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_CHARGES;
    const total = subtotal + deliveryCharges;

    const orderNumber = generateOrderNumber();

    const [result] = await db.insert(orders).values({
      userId,
      orderNumber,
      status: "pending",
      subtotal: subtotal.toFixed(2),
      deliveryCharges: deliveryCharges.toFixed(2),
      discountAmount: "0.00",
      total: total.toFixed(2),
      paymentMethod: data.paymentMethod,
      paymentStatus: "pending",
      shippingAddressJson: data.shippingAddress,
      notes: data.notes || null,
    }).$returningId();

    const orderId = result.id;

    // Insert order items
    await db.insert(orderItems).values(
      cartItems.map((item: { productId: number; variantId?: number; productName: string; productImage: string; size?: string; color?: string; quantity: number; unitPrice: string }) => ({
        orderId,
        productId: item.productId,
        variantId: item.variantId || null,
        productName: item.productName,
        productImage: item.productImage,
        size: item.size || null,
        color: item.color || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: (parseFloat(item.unitPrice) * item.quantity).toFixed(2),
      }))
    );

    // Update stock for variants
    for (const item of cartItems) {
      if (item.variantId) {
        await db.update(productVariants)
          .set({ stockQuantity: sql`${productVariants.stockQuantity} - ${item.quantity}` })
          .where(eq(productVariants.id, item.variantId));
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId,
      message: "Order placed successfully!",
    });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
