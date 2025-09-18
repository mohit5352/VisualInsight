import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: process.env.NODE_ENV === 'development' ? "sqlite" : "postgresql",
  dbCredentials: process.env.NODE_ENV === 'development'
    ? { url: "./dev.db" }
    : { url: process.env.DATABASE_URL },
});
