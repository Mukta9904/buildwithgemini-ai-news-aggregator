import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
import path from 'path'

// Get the path to the database file in the project root
const dbPath = path.resolve(process.cwd(), 'database.sqlite')

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null

export async function getDb() {
  if (db) {
    return db
  }

  // Open the database connection
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  })

  // Initialize the schema
  await db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS digests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      content TEXT NOT NULL,
      status TEXT NOT NULL
    );

    -- Insert default settings if they don't exist
    INSERT OR IGNORE INTO settings (key, value) VALUES ('target_email', '');
  `)

  return db
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb()
  const result = await db.get('SELECT value FROM settings WHERE key = ?', key)
  return result ? result.value : null
}

export async function updateSetting(key: string, value: string): Promise<void> {
  const db = await getDb()
  await db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value])
}

export async function saveDigest(content: string, status: string): Promise<number> {
  const db = await getDb()
  const result = await db.run('INSERT INTO digests (content, status) VALUES (?, ?)', [content, status])
  return result.lastID || 0
}

export async function getLatestDigests(limit = 10) {
  const db = await getDb()
  return await db.all('SELECT * FROM digests ORDER BY created_at DESC LIMIT ?', limit)
}
