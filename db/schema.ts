import {
  mysqlTable,
  varchar,
  text,
  timestamp,
  int,
  json,
} from "drizzle-orm/mysql-core";

// Remove debug log
// console.log("Loading database schema definitions");

export const sessions = mysqlTable("sessions", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const documents = mysqlTable("documents", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  fileUrl: varchar("file_url", { length: 1000 }),
  fileType: varchar("file_type", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const generated_content = mysqlTable("generated_content", {
  id: int("id").primaryKey().autoincrement(),
  sessionId: int("session_id")
    .notNull()
    .references(() => sessions.id),
  userId: varchar("user_id", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'summary', 'flashcards', 'podcast'
  content: json("content").notNull(), // Store the generated content as JSON
  documentId: int("document_id"), // Changed to camelCase to match TypeScript field naming
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const marketplace_listings = mysqlTable("marketplace_listings", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: varchar("price", { length: 32 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  uploader: varchar("uploader", { length: 255 }).notNull(),
  file_url: varchar("file_url", { length: 1000 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),
});

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  address: varchar("address", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
});

export const purchases = mysqlTable("purchases", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull(),
  listing_id: int("listing_id").notNull(),
  purchased_at: timestamp("purchased_at").defaultNow(),
});
