import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "3306"),
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "",
    database: process.env.DATABASE_NAME || "fashion_palette",
  },
});
