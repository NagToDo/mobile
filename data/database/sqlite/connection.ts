import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "nagtodo.db";

let db: SQLite.SQLiteDatabase | null = null;

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
    await db.execAsync("PRAGMA journal_mode = WAL;");
    await db.execAsync("PRAGMA foreign_keys = ON;");
  }
  return db;
};

export const closeDatabase = async (): Promise<void> => {
  if (db) {
    await db.closeAsync();
    db = null;
  }
};

export const deleteDatabase = async (): Promise<void> => {
  await closeDatabase();
  await SQLite.deleteDatabaseAsync(DATABASE_NAME);
};
