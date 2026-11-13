import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";
import * as schema from "./schema";

let dbInstance: ReturnType<typeof drizzle> | null = null;

function ensureDataDirs() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const uploadsDir = path.join(dataDir, "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

function columnExists(sqlite: Database.Database, table: string, column: string): boolean {
  const cols = sqlite.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return cols.some((c) => c.name === column);
}

function migrateSchema(sqlite: Database.Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      cover_url TEXT,
      summary TEXT,
      author TEXT NOT NULL DEFAULT 'Yazar',
      wattpad_url TEXT,
      reading_minutes INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chapters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      "order" INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      word_count INTEGER NOT NULL DEFAULT 0
    );
  `);

  if (!columnExists(sqlite, "books", "wattpad_id")) {
    sqlite.exec(`ALTER TABLE books ADD COLUMN wattpad_id TEXT`);
  }
  if (!columnExists(sqlite, "books", "is_published")) {
    sqlite.exec(`ALTER TABLE books ADD COLUMN is_published INTEGER NOT NULL DEFAULT 0`);
  }
  if (!columnExists(sqlite, "chapters", "is_published")) {
    sqlite.exec(`ALTER TABLE chapters ADD COLUMN is_published INTEGER NOT NULL DEFAULT 0`);
  }

  sqlite.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_books_wattpad_id ON books(wattpad_id) WHERE wattpad_id IS NOT NULL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      google_id TEXT UNIQUE,
      is_admin INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      is_visible INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS comment_replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
      admin_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS site_visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_key TEXT NOT NULL,
      path TEXT NOT NULL DEFAULT '',
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS book_reads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      chapter_id INTEGER REFERENCES chapters(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_book_reads_user_book ON book_reads(user_id, book_id);
    CREATE INDEX IF NOT EXISTS idx_site_visits_session ON site_visits(session_key);
  `);

  const adminRow = sqlite.prepare(`SELECT id FROM users WHERE username = 'admin'`).get();
  if (!adminRow) {
    const now = new Date().toISOString();
    sqlite
      .prepare(
        `INSERT INTO users (username, email, password_hash, is_admin, created_at) VALUES (?, ?, NULL, 1, ?)`
      )
      .run("admin", "admin@ayisigi.local", now);
  }
}

export function getDb() {
  if (dbInstance) return dbInstance;

  ensureDataDirs();
  const dbPath = process.env.SQLITE_PATH || path.join(process.cwd(), "data", "wattpad.db");
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  migrateSchema(sqlite);
  dbInstance = drizzle(sqlite, { schema });
  return dbInstance;
}

export { schema };
