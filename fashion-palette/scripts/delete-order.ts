import "dotenv/config";
import { eq, sql } from "drizzle-orm";
import { db, pool } from "../src/lib/db/index";
import { orders, orderItems, orderStatusHistory, products, productVariants } from "../src/lib/db/schema";

// Usage: npm run db:del-order -- <ORDER_NUMBER>
// Deletes the order + items + status history and restores the stock it consumed.
async function main() {
  const orderNumber = process.argv[2];
  if (!orderNumber) {
    console.error("Usage: npm run db:del-order -- <ORDER_NUMBER>");
    process.exit(1);
  }
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  if (!order) {
    console.error(`Order not found: ${orderNumber}`);
    await pool.end();
    process.exit(1);
  }
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  for (const it of items) {
    if (it.variantId) {
      await db.update(productVariants).set({ stockQuantity: sql`${productVariants.stockQuantity} + ${it.quantity}` }).where(eq(productVariants.id, it.variantId));
    }
    await db.update(products).set({ stockQuantity: sql`${products.stockQuantity} + ${it.quantity}` }).where(eq(products.id, it.productId));
  }
  await db.delete(orderStatusHistory).where(eq(orderStatusHistory.orderId, order.id));
  await db.delete(orderItems).where(eq(orderItems.orderId, order.id));
  await db.delete(orders).where(eq(orders.id, order.id));
  console.log(`✅ Deleted order ${orderNumber} and restored stock for ${items.length} line(s)`);
  await pool.end();
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Failed:", e.message);
  process.exit(1);
});
