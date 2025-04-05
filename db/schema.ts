import { mysqlTable, varchar, text, timestamp, int, json } from 'drizzle-orm/mysql-core';

export const sessions = mysqlTable('sessions', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const documents = mysqlTable('documents', {
  id: int('id').primaryKey().autoincrement(),
  sessionId: int('session_id').notNull().references(() => sessions.id),
  userId: varchar('user_id', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  fileUrl: varchar('file_url', { length: 1000 }),
  fileType: varchar('file_type', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const generatedContent = mysqlTable('generated_content', {
  id: int('id').primaryKey().autoincrement(),
  sessionId: int('session_id').notNull().references(() => sessions.id),
  userId: varchar('user_id', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'summary', 'flashcards', 'podcast'
  content: json('content').notNull(), // Store the generated content as JSON
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
