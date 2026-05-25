import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync('walkitoff.db').then(async (db) => {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS step_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          source TEXT NOT NULL,
          steps INTEGER NOT NULL DEFAULT 0,
          kcal REAL NOT NULL DEFAULT 0,
          notes TEXT DEFAULT '',
          created_at TEXT NOT NULL
        );
      `);
      return db;
    });
  }
  return dbPromise;
}
