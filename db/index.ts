import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import fs from "fs"; // Import the file system module
import path from "path"; // Import the path module

// Function to get the directory of the current module
function getDirname(moduleUrl: string): string {
  const { fileURLToPath } = require("url");
  return fileURLToPath(new URL(".", moduleUrl));
}

const currentDir = getDirname(import.meta.url); // Get the current directory of this file

// Create the connection with improved connection options
const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectionLimit: 10,
  connectTimeout: 30000,
  waitForConnections: true,
  queueLimit: 0,
  // Configure SSL to trust the CA certificate
  ssl: {
    // Provide the path to your CA certificate file
    ca: fs.readFileSync(path.resolve(currentDir, "../../cert/ca.pem")), // Adjust the path '../certs/ca.crt' based on where you stored the file relative to THIS file
    rejectUnauthorized: true, // Keep this as true to ensure certificate validation
  },
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
