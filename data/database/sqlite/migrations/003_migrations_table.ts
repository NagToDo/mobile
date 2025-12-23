import * as SQLite from "expo-sqlite";

export const up = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    );
  `);
};

export const down = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  await db.execAsync(`
    DROP TABLE IF EXISTS migrations;
  `);
};
