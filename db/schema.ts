import {
  pgTable,
  varchar,
  text,
  timestamp,
  serial,
  integer,
  json,
} from "drizzle-orm/pg-core";

// Remove debug log
// console.log("Loading database schema definitions");

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  fileUrl: varchar("file_url", { length: 1000 }),
  fileType: varchar("file_type", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const generated_content = pgTable("generated_content", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id")
    .notNull()
    .references(() => sessions.id),
  userId: varchar("user_id", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'summary', 'flashcards', 'podcast'
  content: json("content").notNull(), // Store the generated content as JSON
  documentId: integer("document_id"), // Changed to camelCase to match TypeScript field naming
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const marketplace_listings = pgTable("marketplace_listings", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: varchar("price", { length: 32 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  uploader: varchar("uploader", { length: 255 }).notNull(),
  file_url: varchar("file_url", { length: 1000 }),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  address: varchar("address", { length: 255 }).unique(),
  name: varchar("name", { length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  listing_id: integer("listing_id").notNull(),
  purchased_at: timestamp("purchased_at").defaultNow(),
});
