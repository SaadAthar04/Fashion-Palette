import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  pool: ReturnType<typeof mysql.createPool> | undefined;
};

const pool =
  globalForDb.pool ??
  mysql.createPool({
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "3306"),
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "fashion_palette",
    // Feedback 02: full Unicode so names like "Suiyō" / CJK don't corrupt to "?".
    charset: "utf8mb4",
    waitForConnections: true,
    connectionLimit: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema, mode: "default" });
export { pool };
