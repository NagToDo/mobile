import * as SQLite from "expo-sqlite";
import { ITaskRepository } from "../../domain/repositories/ITaskRepository";
import {
  Task,
  TaskCreate,
  TaskUpdate,
  SyncStatus,
} from "../../domain/models/Task";
import { generateId } from "../../lib/generateId";

interface TaskRow {
  id: string;
  name: string;
  description: string | null;
  finished: number;
  alarm_time: string;
  frecuency: string;
  alarm_interval: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  version: number;
  sync_status: string;
  sync_error: string | null;
}

const rowToTask = (row: TaskRow): Task => ({
  id: row.id,
  name: row.name,
  description: row.description,
  finished: row.finished === 1,
  alarm_time: row.alarm_time,
  frecuency: row.frecuency as Task["frecuency"],
  alarm_interval: row.alarm_interval,
  user_id: row.user_id,
  created_at: row.created_at,
  updated_at: row.updated_at,
  deleted_at: row.deleted_at,
  version: row.version,
  sync_status: row.sync_status as SyncStatus,
  sync_error: row.sync_error,
});

export class SQLiteTaskRepository implements ITaskRepository {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async getAll(userId: string): Promise<Task[]> {
    const rows = await this.db.getAllAsync<TaskRow>(
      "SELECT * FROM tasks WHERE user_id = ? AND deleted_at IS NULL ORDER BY created_at DESC",
      [userId],
    );
    return rows.map(rowToTask);
  }

  async getById(id: string): Promise<Task | null> {
    const row = await this.db.getFirstAsync<TaskRow>(
      "SELECT * FROM tasks WHERE id = ?",
      [id],
    );
    return row ? rowToTask(row) : null;
  }

  async getByName(name: string, userId: string): Promise<Task | null> {
    const normalizedName = name.toLowerCase().trim();
    const row = await this.db.getFirstAsync<TaskRow>(
      "SELECT * FROM tasks WHERE LOWER(TRIM(name)) = ? AND user_id = ? AND deleted_at IS NULL",
      [normalizedName, userId],
    );
    return row ? rowToTask(row) : null;
  }

  async getByStatus(userId: string, status: SyncStatus): Promise<Task[]> {
    const rows = await this.db.getAllAsync<TaskRow>(
      "SELECT * FROM tasks WHERE user_id = ? AND sync_status = ? AND deleted_at IS NULL ORDER BY created_at DESC",
      [userId, status],
    );
    return rows.map(rowToTask);
  }

  async getPending(userId: string): Promise<Task[]> {
    return this.getByStatus(userId, SyncStatus.PENDING);
  }

  async create(task: TaskCreate): Promise<Task> {
    const id = generateId();
    const now = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO tasks (
        id, name, description, finished, alarm_time, frecuency,
        alarm_interval, user_id, created_at, updated_at, deleted_at,
        version, sync_status, sync_error
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        task.name,
        task.description ?? null,
        task.finished ? 1 : 0,
        task.alarm_time,
        task.frecuency,
        task.alarm_interval,
        task.user_id,
        now,
        now,
        task.deleted_at ?? null,
        1,
        SyncStatus.PENDING,
        null,
      ],
    );

    const created = await this.getById(id);
    if (!created) {
      throw new Error("Failed to create task");
    }
    return created;
  }

  async update(id: string, updates: TaskUpdate): Promise<Task> {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error(`Task ${id} not found`);
    }

    const now = new Date().toISOString();
    const newVersion = updates.version ?? existing.version + 1;
    const syncStatus = updates.sync_status ?? SyncStatus.PENDING;

    const fields: string[] = [
      "updated_at = ?",
      "version = ?",
      "sync_status = ?",
    ];
    const values: (string | number | null)[] = [now, newVersion, syncStatus];

    if (updates.name !== undefined) {
      fields.push("name = ?");
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push("description = ?");
      values.push(updates.description);
    }
    if (updates.finished !== undefined) {
      fields.push("finished = ?");
      values.push(updates.finished ? 1 : 0);
    }
    if (updates.alarm_time !== undefined) {
      fields.push("alarm_time = ?");
      values.push(updates.alarm_time);
    }
    if (updates.frecuency !== undefined) {
      fields.push("frecuency = ?");
      values.push(updates.frecuency);
    }
    if (updates.alarm_interval !== undefined) {
      fields.push("alarm_interval = ?");
      values.push(updates.alarm_interval);
    }
    if (updates.deleted_at !== undefined) {
      fields.push("deleted_at = ?");
      values.push(updates.deleted_at);
    }
    if (updates.sync_error !== undefined) {
      fields.push("sync_error = ?");
      values.push(updates.sync_error);
    }

    values.push(id);

    await this.db.runAsync(
      `UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`,
      values,
    );

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`Task ${id} not found after update`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db.runAsync(
      "UPDATE tasks SET deleted_at = ?, sync_status = ?, updated_at = ? WHERE id = ?",
      [now, SyncStatus.PENDING, now, id],
    );
  }

  async hardDelete(id: string): Promise<void> {
    await this.db.runAsync("DELETE FROM tasks WHERE id = ?", [id]);
  }

  async bulkCreate(tasks: TaskCreate[]): Promise<Task[]> {
    const created: Task[] = [];
    for (const task of tasks) {
      created.push(await this.create(task));
    }
    return created;
  }

  async bulkUpdate(
    tasks: { id: string; updates: TaskUpdate }[],
  ): Promise<Task[]> {
    const updated: Task[] = [];
    for (const { id, updates } of tasks) {
      updated.push(await this.update(id, updates));
    }
    return updated;
  }

  async deleteAll(userId: string): Promise<void> {
    await this.db.runAsync("DELETE FROM tasks WHERE user_id = ?", [userId]);
  }

  async markSynced(id: string, version: number): Promise<void> {
    await this.db.runAsync(
      "UPDATE tasks SET sync_status = ?, version = ?, sync_error = NULL WHERE id = ?",
      [SyncStatus.SYNCED, version, id],
    );
  }

  async markError(id: string, error: string): Promise<void> {
    await this.db.runAsync(
      "UPDATE tasks SET sync_status = ?, sync_error = ? WHERE id = ?",
      [SyncStatus.ERROR, error, id],
    );
  }

  async markConflict(id: string): Promise<void> {
    await this.db.runAsync("UPDATE tasks SET sync_status = ? WHERE id = ?", [
      SyncStatus.CONFLICT,
      id,
    ]);
  }
}
