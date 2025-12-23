export const SYNC_CONFIG = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  SYNC_INTERVAL_MS: 30000,
  BATCH_SIZE: 50,
  MAX_QUEUE_SIZE: 1000,
} as const;

export interface TaskServiceConfig {
  enableSync: boolean;
  syncOnWrite: boolean;
  retryAttempts: number;
  retryDelayMs: number;
}

export interface SyncConfig {
  intervalMs: number;
  maxRetries: number;
  batchSize: number;
}

export const defaultTaskServiceConfig: TaskServiceConfig = {
  enableSync: true,
  syncOnWrite: false,
  retryAttempts: SYNC_CONFIG.RETRY_ATTEMPTS,
  retryDelayMs: SYNC_CONFIG.RETRY_DELAY_MS,
};

export const defaultSyncConfig: SyncConfig = {
  intervalMs: SYNC_CONFIG.SYNC_INTERVAL_MS,
  maxRetries: SYNC_CONFIG.RETRY_ATTEMPTS,
  batchSize: SYNC_CONFIG.BATCH_SIZE,
};
