import "dotenv/config";
import { pool } from "../src/lib/db/index";

// Idempotent, non-interactive schema apply for the VPS deploy. `drizzle-kit
// push` prompts on some changes (e.g. adding a NOT NULL column) and there is no
// TTY over SSH, so it fails. This script applies known additive changes safely.
// Keep it in sync when the schema gains new tables/columns pre-launch.
async function columnExists(table: string, column: string): Promise<boolean> {
  const [rows] = await pool.query(
    "SELECT 1 FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ? LIMIT 1",
    [table, column]
  );
  return (rows as unknown[]).length > 0;
}

async function main() {
  await pool.query(
    `CREATE TABLE IF NOT EXISTS \`returns\` (
      \`id\` bigint unsigned NOT NULL AUTO_INCREMENT,
      \`order_id\` int NOT NULL,
      \`user_id\` int,
      \`status\` enum('requested','approved','rejected','item_received','inspected','replacement_sent','refunded','closed') NOT NULL DEFAULT 'requested',
      \`reason\` text NOT NULL,
      \`items_json\` json,
      \`evidence_urls\` json,
      \`return_authorization\` varchar(100),
      \`inspection_result\` text,
      \`courier\` varchar(100),
      \`tracking_number\` varchar(100),
      \`refund_amount\` decimal(10,2),
      \`refund_method\` varchar(60),
      \`refund_reference\` varchar(120),
      \`refunded_at\` timestamp NULL,
      \`handled_by_user_id\` int,
      \`staff_notes\` text,
      \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    )`
  );
  console.log("✓ returns table ensured");

  if (!(await columnExists("users", "is_active"))) {
    await pool.query("ALTER TABLE `users` ADD `is_active` boolean NOT NULL DEFAULT true");
    console.log("✓ users.is_active added");
  } else {
    console.log("• users.is_active already present");
  }

  // Feedback 28: staff MFA email-OTP codes.
  await pool.query(
    `CREATE TABLE IF NOT EXISTS \`mfa_codes\` (
      \`user_id\` int NOT NULL,
      \`code_hash\` varchar(255) NOT NULL,
      \`expires_at\` timestamp NOT NULL,
      \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (\`user_id\`)
    )`
  );
  console.log("✓ mfa_codes table ensured");

  // Feedback 24: settings key-value store.
  await pool.query(
    `CREATE TABLE IF NOT EXISTS \`site_settings\` (
      \`key\` varchar(80) NOT NULL,
      \`value\` text NOT NULL,
      \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`key\`)
    )`
  );
  console.log("✓ site_settings table ensured");

  // Feedback 12: per-product low-stock threshold.
  if (!(await columnExists("products", "low_stock_threshold"))) {
    await pool.query("ALTER TABLE `products` ADD `low_stock_threshold` int NOT NULL DEFAULT 3");
    console.log("✓ products.low_stock_threshold added");
  } else {
    console.log("• products.low_stock_threshold already present");
  }

  // Feedback 11: expand publish_status enum to include hidden + archived.
  // MODIFY is idempotent (safe to re-run with the same definition).
  await pool.query(
    "ALTER TABLE `products` MODIFY `publish_status` enum('draft','published','hidden','archived') NOT NULL DEFAULT 'draft'"
  );
  console.log("✓ products.publish_status enum ensured");

  // Final feedback A6: test-order flag (excluded from dashboard revenue/stats).
  if (!(await columnExists("orders", "is_test"))) {
    await pool.query("ALTER TABLE `orders` ADD `is_test` boolean NOT NULL DEFAULT false");
    console.log("✓ orders.is_test added");
  } else {
    console.log("• orders.is_test already present");
  }

  // Final feedback B8: stored full tracking URL (generated from courier + number).
  if (!(await columnExists("orders", "tracking_url"))) {
    await pool.query("ALTER TABLE `orders` ADD `tracking_url` varchar(500) NULL");
    console.log("✓ orders.tracking_url added");
  } else {
    console.log("• orders.tracking_url already present");
  }

  // Final feedback B7: snapshot article code on each order line.
  if (!(await columnExists("order_items", "article_code"))) {
    await pool.query("ALTER TABLE `order_items` ADD `article_code` varchar(120) NULL");
    console.log("✓ order_items.article_code added");
  } else {
    console.log("• order_items.article_code already present");
  }

  await pool.end();
  console.log("✅ apply-schema complete");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ apply-schema failed:", e.message);
  process.exit(1);
});
