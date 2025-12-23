import * as SQLite from "expo-sqlite";

export const up = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      finished INTEGER NOT NULL DEFAULT 0,
      alarm_time TEXT NOT NULL,
      frecuency TEXT NOT NULL CHECK(frecuency IN ('daily', 'weekly', 'monthly', 'single')),
      alarm_interval INTEGER NOT NULL,
      user_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      version INTEGER NOT NULL DEFAULT 1,
      sync_status TEXT NOT NULL DEFAULT 'pending' CHECK(sync_status IN ('synced', 'pending', 'conflict', 'error')),
      sync_error TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_sync_status ON tasks(sync_status);
    CREATE INDEX IF NOT EXISTS idx_tasks_deleted_at ON tasks(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_tasks_user_deleted ON tasks(user_id, deleted_at);
  `);
};

export const down = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  await db.execAsync(`
    DROP INDEX IF EXISTS idx_tasks_user_deleted;
    DROP INDEX IF EXISTS idx_tasks_deleted_at;
    DROP INDEX IF EXISTS idx_tasks_sync_status;
    DROP INDEX IF EXISTS idx_tasks_user_id;
    DROP TABLE IF EXISTS tasks;
  `);
};
