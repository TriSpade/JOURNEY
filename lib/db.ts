import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomBytes, scryptSync } from "node:crypto";

const databasePath = process.env.DATABASE_PATH ?? join(process.cwd(), "data", "journey.db");
let instance: Database.Database | null = null;

function openDatabase() {
  if (instance) return instance;
  mkdirSync(dirname(databasePath), { recursive: true });
  const database = new Database(databasePath);
  database.pragma("busy_timeout = 5000");
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");

  database.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS destinations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT '',
    planned_date TEXT,
    status TEXT NOT NULL DEFAULT 'wishlist' CHECK(status IN ('wishlist', 'planned', 'visited')),
    budget INTEGER,
    notes TEXT NOT NULL DEFAULT '',
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS reactions (
    destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (destination_id, user_id, emoji)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_messages_destination ON messages(destination_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_reactions_destination ON reactions(destination_id);
  `);
  const mediaColumns = database.pragma("table_info(destination_media)") as Array<{ name: string }>;
  if (!mediaColumns.some((column) => column.name === "label")) database.exec("ALTER TABLE destination_media ADD COLUMN label TEXT");

  const destinationColumns = database.pragma("table_info(destinations)") as Array<{ name: string }>;
  if (!destinationColumns.some((column) => column.name === "plan")) database.exec("ALTER TABLE destinations ADD COLUMN plan TEXT NOT NULL DEFAULT 'A' CHECK(plan IN ('A', 'B', 'C'))");
  if (!destinationColumns.some((column) => column.name === "plan_order")) database.exec("ALTER TABLE destinations ADD COLUMN plan_order INTEGER NOT NULL DEFAULT 0");
  if (!destinationColumns.some((column) => column.name === "photo_path")) database.exec("ALTER TABLE destinations ADD COLUMN photo_path TEXT");
  if (!destinationColumns.some((column) => column.name === "video_url")) database.exec("ALTER TABLE destinations ADD COLUMN video_url TEXT");
  database.exec(`
    CREATE TABLE IF NOT EXISTS destination_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      destination_id INTEGER NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
      type TEXT NOT NULL CHECK(type IN ('photo', 'video')),
      value TEXT NOT NULL,
      created_by INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(destination_id, type, value)
    );
    CREATE INDEX IF NOT EXISTS idx_destination_media_destination ON destination_media(destination_id, created_at);
    INSERT OR IGNORE INTO destination_media (destination_id, type, value, created_by, created_at)
      SELECT id, 'photo', photo_path, created_by, created_at FROM destinations WHERE photo_path IS NOT NULL AND photo_path != '';
    INSERT OR IGNORE INTO destination_media (destination_id, type, value, created_by, created_at)
      SELECT id, 'video', video_url, created_by, created_at FROM destinations WHERE video_url IS NOT NULL AND video_url != '';
  `);

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

  const seedUser = database.prepare(`
    INSERT INTO users (username, display_name, password_hash)
    VALUES (?, ?, ?)
    ON CONFLICT(username) DO NOTHING
  `);
  const accounts = [
    ["dimas", "Dimas", process.env.DIMAS_PASSWORD],
    ["anita", "Anita", process.env.ANITA_PASSWORD],
  ] as const;
  for (const [username, displayName, password] of accounts) {
    if (password) seedUser.run(username, displayName, hashPassword(password));
  }
  instance = database;
  return database;
}

const db = new Proxy({} as Database.Database, {
  get(_target, property) {
    const database = openDatabase();
    const value = Reflect.get(database, property, database);
    return typeof value === "function" ? value.bind(database) : value;
  },
});

export default db;
