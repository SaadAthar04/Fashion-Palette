import { migrate } from "drizzle-orm/mysql2/migrator";
import { db, pool } from "./index";

async function runMigrations() {
  console.log("🔄 Running migrations...");
  await migrate(db, { migrationsFolder: "./drizzle/migrations" });
  console.log("✅ Migrations complete!");
  await pool.end();
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
