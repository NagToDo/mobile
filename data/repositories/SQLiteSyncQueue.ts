import * as SQLite from "expo-sqlite";
import { ISyncQueue } from "../../domain/repositories/ISyncQueue";
import {
  SyncOperation,
  SyncOperationCreate,
} from "../../domain/models/SyncOperation";
import { generateId } from "../../lib/generateId";

interface SyncQueueRow {
  id: string;
  type: string;
  task_id: string;
  data: string;
  previous_version: number | null;
  retry_count: number;
  created_at: string;
  error: string | null;
}

const rowToSyncOperation = (row: SyncQueueRow): SyncOperation => ({
  id: row.id,
  type: row.type as SyncOperation["type"],
  task_id: row.task_id,
  data: row.data,
  previous_version: row.previous_version,
  retry_count: row.retry_count,
  created_at: row.created_at,
  error: row.error,
});

export class SQLiteSyncQueue implements ISyncQueue {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async enqueue(operation: SyncOperationCreate): Promise<void> {
    const id = generateId();
    const now = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO sync_queue (id, type, task_id, data, previous_version, retry_count, created_at, error)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        operation.type,
        operation.task_id,
        operation.data,
        operation.previous_version ?? null,
        0,
        now,
        null,
      ],
    );
  }

  async dequeue(): Promise<SyncOperation | null> {
    const operation = await this.peek();
    if (operation) {
      await this.remove(operation.id);
    }
    return operation;
  }

  async peek(): Promise<SyncOperation | null> {
    const row = await this.db.getFirstAsync<SyncQueueRow>(
      "SELECT * FROM sync_queue ORDER BY created_at ASC LIMIT 1",
    );
    return row ? rowToSyncOperation(row) : null;
  }

  async remove(operationId: string): Promise<void> {
    await this.db.runAsync("DELETE FROM sync_queue WHERE id = ?", [
      operationId,
    ]);
  }

  async retry(operationId: string): Promise<void> {
    await this.db.runAsync(
      "UPDATE sync_queue SET retry_count = retry_count + 1 WHERE id = ?",
      [operationId],
    );
  }

  async markError(operationId: string, error: string): Promise<void> {
    await this.db.runAsync(
      "UPDATE sync_queue SET error = ?, retry_count = retry_count + 1 WHERE id = ?",
      [error, operationId],
    );
  }

  async clear(): Promise<void> {
    await this.db.runAsync("DELETE FROM sync_queue");
  }

  async getAll(): Promise<SyncOperation[]> {
    const rows = await this.db.getAllAsync<SyncQueueRow>(
      "SELECT * FROM sync_queue ORDER BY created_at ASC",
    );
    return rows.map(rowToSyncOperation);
  }

  async getSize(): Promise<number> {
    const result = await this.db.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM sync_queue",
    );
    return result?.count ?? 0;
  }
}
