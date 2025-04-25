import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import fs from "fs";
import path from "path";

const connectionString = process.env.DATABASE_URL!;

// Function to get SSL configuration
const getSSLConfig = () => {
  // In production, try to use SSL certificate if available
  if (process.env.NODE_ENV === "production") {
    try {
      const certPath = path.resolve(process.cwd(), "cert/ca.pem");
      if (fs.existsSync(certPath)) {
        return {
          ca: fs.readFileSync(certPath).toString(),
          rejectUnauthorized: true,
        };
      }
    } catch (error) {
      console.warn(
        "SSL certificate not found, falling back to non-SSL connection"
      );
    }
  }

  // Return undefined for development or if cert not found
  return undefined;
};

const client = postgres(connectionString, {
  ssl: getSSLConfig(),
});

export const db = drizzle(client, { schema });
