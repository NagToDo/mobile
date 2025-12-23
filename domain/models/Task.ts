export enum SyncStatus {
  SYNCED = "synced",
  PENDING = "pending",
  CONFLICT = "conflict",
  ERROR = "error",
}

export type Frequency = "daily" | "weekly" | "monthly" | "single";

export interface Task {
  id: string;
  name: string;
  description: string | null;
  finished: boolean;
  alarm_time: string;
  frecuency: Frequency;
  alarm_interval: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  version: number;
  sync_status: SyncStatus;
  sync_error: string | null;
}

export type TaskCreate = {
  name: string;
  description: string | null;
  finished?: boolean;
  alarm_time: string;
  frecuency: Frequency;
  alarm_interval: number;
  user_id: string;
  deleted_at?: string | null;
};

export type TaskUpdate = Partial<Omit<Task, "id" | "user_id" | "created_at">>;
