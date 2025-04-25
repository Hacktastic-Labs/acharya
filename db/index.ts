import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import fs from "fs"; // Import the file system module
import path from "path"; // Import the path module

// Function to get SSL configuration
const getSSLConfig = () => {
  // In production, try to use SSL certificate if available
  if (process.env.NODE_ENV === "production") {
    try {
      const certPath = path.resolve(process.cwd(), "cert/ca.pem");
      if (fs.existsSync(certPath)) {
        return {
          ca: fs.readFileSync(certPath),
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

// Create the connection with improved connection options
const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 10,
  connectTimeout: 30000,
  waitForConnections: true,
  queueLimit: 0,
  ssl: getSSLConfig(),
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

// Create the db
export const db = drizzle(poolConnection, { schema, mode: "default" });

// Add a ping function to test connection
export async function testConnection() {
  try {
    await poolConnection.query("SELECT 1");
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}
