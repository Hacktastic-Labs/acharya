import { timestamp, text, pgTable, serial, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "file" or "youtube"
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  documentId: integer("document_id").references(() => documents.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const generatedContent = pgTable("generated_content", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => sessions.id),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // "summary", "flashcards", "monologue"
  content: text("content").notNull(),
  documentId: integer("document_id").references(() => documents.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const documentsRelations = relations(documents, ({ many }) => ({
  sessions: many(sessions),
  generatedContent: many(generatedContent),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  document: one(documents, {
    fields: [sessions.documentId],
    references: [documents.id],
  }),
  generatedContent: many(generatedContent),
}));

export const generatedContentRelations = relations(
  generatedContent,
  ({ one }) => ({
    session: one(sessions, {
      fields: [generatedContent.sessionId],
      references: [sessions.id],
    }),
    document: one(documents, {
      fields: [generatedContent.documentId],
      references: [documents.id],
    }),
  })
);
