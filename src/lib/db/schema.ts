import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const books = sqliteTable("books", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  coverUrl: text("cover_url"),
  summary: text("summary"),
  author: text("author").notNull().default("Yazar"),
  wattpadUrl: text("wattpad_url"),
  wattpadId: text("wattpad_id"),
  isPublished: integer("is_published").notNull().default(0),
  readingMinutes: integer("reading_minutes").notNull().default(0),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const chapters = sqliteTable("chapters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bookId: integer("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  wordCount: integer("word_count").notNull().default(0),
  isPublished: integer("is_published").notNull().default(0),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  googleId: text("google_id").unique(),
  isAdmin: integer("is_admin").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  isVisible: integer("is_visible").notNull().default(1),
  createdAt: text("created_at").notNull(),
});

export const commentReplies = sqliteTable("comment_replies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  commentId: integer("comment_id")
    .notNull()
    .references(() => comments.id, { onDelete: "cascade" }),
  adminUserId: integer("admin_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: text("created_at").notNull(),
});

export const siteVisits = sqliteTable("site_visits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionKey: text("session_key").notNull(),
  path: text("path").notNull().default(""),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull(),
});

export const bookReads = sqliteTable("book_reads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  bookId: integer("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  chapterId: integer("chapter_id").references(() => chapters.id, { onDelete: "set null" }),
  createdAt: text("created_at").notNull(),
});

export type Book = typeof books.$inferSelect;
export type Chapter = typeof chapters.$inferSelect;
export type User = typeof users.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type NewBook = typeof books.$inferInsert;
export type NewChapter = typeof chapters.$inferInsert;
