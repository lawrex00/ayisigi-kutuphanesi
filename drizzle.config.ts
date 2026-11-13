import { defineConfig } from "drizzle-kit";

const isPostgres = process.env.DATABASE_URL?.startsWith("postgres");

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: isPostgres ? "postgresql" : "sqlite",
  dbCredentials: isPostgres
    ? { url: process.env.DATABASE_URL! }
    : { url: process.env.SQLITE_PATH || "./data/wattpad.db" },
});
