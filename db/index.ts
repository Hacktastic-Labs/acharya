import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Create a connection using Neon's HTTP driver
const sql = neon(process.env.DATABASE_URL!);

// Create the db instance
export const db = drizzle(sql, { schema });

// Add a ping function to test connection
export async function testConnection() {
  try {
    await sql`SELECT 1`;
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}
