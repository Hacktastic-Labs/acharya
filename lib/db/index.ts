import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

const connectionString = process.env.DATABASE_URL!;

// Determine the correct path to the certificate
// In Vercel, the CWD is /var/task, so certs/ca.pem should be relative to that
const caPath = path.resolve(process.cwd(), "certs", "ca.pem");

const sslConfig =
  process.env.NODE_ENV === "production"
    ? {
        ssl: {
          ca: fs.readFileSync(caPath).toString(),
          rejectUnauthorized: true,
        },
      }
    : undefined;

const client = postgres(connectionString, sslConfig);
export const db = drizzle(client, { schema });
