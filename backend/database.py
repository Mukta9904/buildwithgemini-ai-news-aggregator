import sqlite3
import os
import json

DB_PATH = os.path.join(os.path.dirname(__file__), "database.sqlite")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS digests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            content TEXT NOT NULL,
            status TEXT NOT NULL
        )
    """)
    cursor.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('target_email', '')")
    conn.commit()
    conn.close()

def get_setting(key: str) -> str:
    conn = get_db_connection()
    row = conn.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
    conn.close()
    return row['value'] if row else None

def update_setting(key: str, value: str):
    conn = get_db_connection()
    conn.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, value))
    conn.commit()
    conn.close()

def save_digest(content: str, status: str) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO digests (content, status) VALUES (?, ?)", (content, status))
    conn.commit()
    last_id = cursor.lastrowid
    conn.close()
    return last_id

def get_latest_digests(limit: int = 10):
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM digests ORDER BY created_at DESC LIMIT ?", (limit,)).fetchall()
    conn.close()
    return [dict(row) for row in rows]
