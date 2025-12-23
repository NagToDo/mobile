import * as SQLite from "expo-sqlite";

export const up = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('CREATE', 'UPDATE', 'DELETE')),
      task_id TEXT NOT NULL,
      data TEXT NOT NULL,
      previous_version INTEGER,
      retry_count INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      error TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_sync_queue_created_at ON sync_queue(created_at);
    CREATE INDEX IF NOT EXISTS idx_sync_queue_task_id ON sync_queue(task_id);
  `);
};

export const down = async (db: SQLite.SQLiteDatabase): Promise<void> => {
  await db.execAsync(`
    DROP INDEX IF EXISTS idx_sync_queue_task_id;
    DROP INDEX IF EXISTS idx_sync_queue_created_at;
    DROP TABLE IF EXISTS sync_queue;
  `);
};
