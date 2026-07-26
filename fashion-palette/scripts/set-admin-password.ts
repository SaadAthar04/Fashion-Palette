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

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!existing) {
    const all = await db.select({ email: users.email, role: users.role }).from(users);
    console.error(`⚠ No user with email "${email}". Existing users:`);
    all.forEach((u) => console.error(`   - ${u.email}  (${u.role})`));
    await pool.end();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.update(users).set({ passwordHash }).where(eq(users.id, existing.id));
  console.log(`✅ Password updated for ${email}`);
  await pool.end();
  process.exit(0);
}

main().catch((e) => {
  console.error("❌ Failed:", e.message);
  process.exit(1);
});
