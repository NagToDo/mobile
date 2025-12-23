export type SyncOperationType = "CREATE" | "UPDATE" | "DELETE";

export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  task_id: string;
  data: string; // JSON stringified
  previous_version: number | null;
  retry_count: number;
  created_at: string;
  error: string | null;
}

export type SyncOperationCreate = Omit<
  SyncOperation,
  "id" | "retry_count" | "created_at" | "error"
>;
