import * as SQLite from "expo-sqlite";
import { getDatabase } from "./connection";
import { migrations, Migration } from "./migrations";

const ensureMigrationsTable = async (
  db: SQLite.SQLiteDatabase,
): Promise<void> => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    );
  `);
};

const getAppliedMigrations = async (
  db: SQLite.SQLiteDatabase,
): Promise<string[]> => {
  const result = await db.getAllAsync<{ name: string }>(
    "SELECT name FROM migrations ORDER BY id ASC",
  );
  return result.map((row) => row.name);
};

const applyMigration = async (
  db: SQLite.SQLiteDatabase,
  migration: Migration,
): Promise<void> => {
  console.log(`Applying migration: ${migration.name}`);
  await migration.up(db);
  await db.runAsync("INSERT INTO migrations (name, applied_at) VALUES (?, ?)", [
    migration.name,
    new Date().toISOString(),
  ]);
  console.log(`Migration applied: ${migration.name}`);
};

export const initializeDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  const db = await getDatabase();

  await ensureMigrationsTable(db);

  const appliedMigrations = await getAppliedMigrations(db);

  for (const migration of migrations) {
    if (!appliedMigrations.includes(migration.name)) {
      await applyMigration(db, migration);
    }
  }

  console.log("Database initialized successfully");
  return db;
};

export const resetDatabase = async (): Promise<void> => {
  const db = await getDatabase();

  const appliedMigrations = await getAppliedMigrations(db);

  // Rollback in reverse order
  for (const migrationName of appliedMigrations.reverse()) {
    const migration = migrations.find((m) => m.name === migrationName);
    if (migration) {
      console.log(`Rolling back migration: ${migration.name}`);
      await migration.down(db);
      await db.runAsync("DELETE FROM migrations WHERE name = ?", [
        migration.name,
      ]);
    }
  }

  console.log("Database reset complete");
};
