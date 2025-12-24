import { Task, TaskCreate, TaskUpdate, SyncStatus } from "../models/Task";

export interface ITaskRepository {
  // Read operations
  getAll(userId: string): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  getByName(name: string, userId: string): Promise<Task | null>;
  getByStatus(userId: string, status: SyncStatus): Promise<Task[]>;
  getPending(userId: string): Promise<Task[]>;

  // Write operations
  create(task: TaskCreate): Promise<Task>;
  update(id: string, updates: TaskUpdate): Promise<Task>;
  delete(id: string): Promise<void>;
  hardDelete(id: string): Promise<void>;

  // Bulk operations for sync
  bulkCreate(tasks: TaskCreate[]): Promise<Task[]>;
  bulkUpdate(tasks: { id: string; updates: TaskUpdate }[]): Promise<Task[]>;
  deleteAll(userId: string): Promise<void>;

  // Sync helpers
  markSynced(id: string, version: number): Promise<void>;
  markError(id: string, error: string): Promise<void>;
  markConflict(id: string): Promise<void>;
}
