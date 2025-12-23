import * as SQLite from "expo-sqlite";
import { SupabaseClient } from "@supabase/supabase-js";
import { SQLiteTaskRepository } from "../data/repositories/SQLiteTaskRepository";
import { SupabaseTaskRepository } from "../data/repositories/SupabaseTaskRepository";
import { SQLiteSyncQueue } from "../data/repositories/SQLiteSyncQueue";
import { TaskService } from "../services/TaskService";
import { SyncService } from "../services/sync/SyncService";
import { defaultTaskServiceConfig, defaultSyncConfig } from "./sync.config";

export interface Container {
  taskService: TaskService;
  syncService: SyncService;
  localRepo: SQLiteTaskRepository;
  remoteRepo: SupabaseTaskRepository;
  syncQueue: SQLiteSyncQueue;
}

export const createContainer = (
  db: SQLite.SQLiteDatabase,
  supabaseClient: SupabaseClient,
): Container => {
  const localRepo = new SQLiteTaskRepository(db);
  const remoteRepo = new SupabaseTaskRepository(supabaseClient);
  const syncQueue = new SQLiteSyncQueue(db);

  const taskService = new TaskService(
    localRepo,
    remoteRepo,
    syncQueue,
    defaultTaskServiceConfig,
  );

  const syncService = new SyncService(
    localRepo,
    remoteRepo,
    syncQueue,
    defaultSyncConfig,
  );

  return {
    taskService,
    syncService,
    localRepo,
    remoteRepo,
    syncQueue,
  };
};
