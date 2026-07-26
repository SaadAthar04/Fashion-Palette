import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, pool } from "../src/lib/db/index";
import { users } from "../src/lib/db/schema";

// Usage: npm run db:passwd -- '<newPassword>' [email]
// Defaults the account to admin@fashionpalette.pk.
async function main() {
  const password = process.argv[2];
  const email = process.argv[3] || "admin@fashionpalette.pk";
  if (!password || password.length < 6) {
    console.error("Usage: npm run db:passwd -- '<newPassword>' [email]   (min 6 chars)");
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const res = await db.update(users).set({ passwordHash }).where(eq(users.email, email));
  const affected = (res as unknown as { affectedRows?: number }).affectedRows ?? 0;
  console.log(affected ? `✅ Password updated for ${email}` : `⚠ No user found with email ${email}`);
  await pool.end();
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Failed:", e.message);
  process.exit(1);
});
