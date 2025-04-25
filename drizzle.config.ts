import type { Config } from "drizzle-kit";
const path = require("path");
const fs = require("fs");

export default {
  schema: "./db/migrations/0000_initial_schema.sql",
  out: "./db/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    ssl: {
      ca: fs.readFileSync(path.resolve(__dirname, "../certs/ca.crt")), // Adjust the path based on your file structure
      rejectUnauthorized: true,
    },
  },
} satisfies Config;
