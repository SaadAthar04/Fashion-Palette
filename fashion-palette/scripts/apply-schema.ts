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

  await pool.end();
  console.log("✅ apply-schema complete");
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ apply-schema failed:", e.message);
  process.exit(1);
});
