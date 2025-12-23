import { SyncOperation, SyncOperationCreate } from "../models/SyncOperation";

export interface ISyncQueue {
  enqueue(operation: SyncOperationCreate): Promise<void>;
  dequeue(): Promise<SyncOperation | null>;
  peek(): Promise<SyncOperation | null>;
  remove(operationId: string): Promise<void>;
  retry(operationId: string): Promise<void>;
  markError(operationId: string, error: string): Promise<void>;
  clear(): Promise<void>;
  getAll(): Promise<SyncOperation[]>;
  getSize(): Promise<number>;
}
