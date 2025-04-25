import type { Config } from "drizzle-kit";

export default {
  schema: "./db/migrations/0000_initial_schema.sql",
  out: "./db/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
