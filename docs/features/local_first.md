# Local-First Architecture Plan

## Overview

This document outlines the implementation plan for a local-first architecture using SQLite as the primary data store with Supabase as the cloud backup and sync mechanism. This approach provides offline-first capabilities, instant UI updates, and reliable cloud synchronization.

---

## Goals

1. **Instant UI Responsiveness** - All operations happen immediately in SQLite
2. **Offline Support** - Full app functionality without internet connection
3. **Cloud Sync** - Automatic bidirectional sync with Supabase
4. **Transaction Safety** - Rollback on failure (local or remote)
5. **Conflict Resolution** - Handle concurrent edits across devices
6. **Clean Abstractions** - SQLite implementation details hidden behind interfaces
7. **Extensibility** - Support future platforms (browser extension, web app)

---

## Architecture Overview

### Data Flow

```
┌─────────────┐
│  UI Layer   │
└──────┬──────┘
       │
       ↓
┌─────────────────┐
│ Task Service    │ ← Single entry point
│ (Orchestrator)  │
└────────┬────────┘
         │
    ┌────┴─────┐
    ↓          ↓
┌─────────┐ ┌──────────┐
│ SQLite  │ │ Supabase │
│  Repo   │ │   Repo   │
└─────────┘ └──────────┘
    ↓          ↓
┌─────────┐ ┌──────────┐
│ SQLite  │ │ Supabase │
│   DB    │ │   Cloud  │
└─────────┘ └──────────┘
```

### Core Principles

1. **Repository Pattern** - Abstract data access behind interfaces
2. **Single Responsibility** - Each layer has one concern
3. **Dependency Injection** - Easy to test and swap implementations
4. **Strategy Pattern** - Pluggable sync strategies
5. **Observer Pattern** - React to data changes

---

## Detailed Architecture

### 1. Domain Layer

Pure business logic with no dependencies on storage.

```typescript
// domain/models/Task.ts
export interface Task {
  id: string;
  name: string;
  description: string | null;
  finished: boolean;
  alarm_time: string;
  frecuency: "daily" | "weekly" | "monthly" | "single";
  alarm_interval: number;
  user_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null; // Soft delete for sync
  version: number; // Optimistic locking
  sync_status: SyncStatus;
}

export enum SyncStatus {
  SYNCED = "synced",
  PENDING = "pending",
  CONFLICT = "conflict",
  ERROR = "error",
}

export type TaskCreate = Omit<
  Task,
  "id" | "created_at" | "updated_at" | "version" | "sync_status"
>;
export type TaskUpdate = Partial<Omit<Task, "id" | "user_id" | "created_at">>;
```

### 2. Repository Interface

Clean abstraction over data access.

```typescript
// domain/repositories/ITaskRepository.ts
export interface ITaskRepository {
  // Read operations
  getAll(userId: string): Promise<Task[]>;
  getById(id: string): Promise<Task | null>;
  getByStatus(status: SyncStatus): Promise<Task[]>;

  // Write operations
  create(task: TaskCreate): Promise<Task>;
  update(id: string, updates: TaskUpdate): Promise<Task>;
  delete(id: string): Promise<void>;

  // Bulk operations for sync
  bulkCreate(tasks: TaskCreate[]): Promise<Task[]>;
  bulkUpdate(tasks: { id: string; updates: TaskUpdate }[]): Promise<Task[]>;
  bulkDelete(ids: string[]): Promise<void>;

  // Sync helpers
  markSynced(id: string, version: number): Promise<void>;
  markError(id: string, error: string): Promise<void>;
}
```

### 3. SQLite Repository

Local-first implementation.

```typescript
// data/repositories/SQLiteTaskRepository.ts
import * as SQLite from "expo-sqlite";

export class SQLiteTaskRepository implements ITaskRepository {
  private db: SQLite.Database;

  constructor(database: SQLite.Database) {
    this.db = database;
  }

  async getAll(userId: string): Promise<Task[]> {
    const result = await this.db.getAllAsync<Task>(
      "SELECT * FROM tasks WHERE user_id = ? AND deleted_at IS NULL ORDER BY created_at DESC",
      [userId],
    );
    return result;
  }

  async create(task: TaskCreate): Promise<Task> {
    const id = generateId();
    const now = new Date().toISOString();

    await this.db.runAsync(
      `INSERT INTO tasks (
        id, name, description, finished, alarm_time, frecuency,
        alarm_interval, user_id, created_at, updated_at, version, sync_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        task.name,
        task.description,
        task.finished ? 1 : 0,
        task.alarm_time,
        task.frecuency,
        task.alarm_interval,
        task.user_id,
        now,
        now,
        1,
        SyncStatus.PENDING,
      ],
    );

    return this.getById(id) as Promise<Task>;
  }

  // ... other implementations
}
```

### 4. Supabase Repository

Cloud sync implementation.

```typescript
// data/repositories/SupabaseTaskRepository.ts
import { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseTaskRepository implements ITaskRepository {
  constructor(private client: SupabaseClient) {}

  async getAll(userId: string): Promise<Task[]> {
    const { data, error } = await this.client
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data || [];
  }

  async create(task: TaskCreate): Promise<Task> {
    const { data, error } = await this.client
      .from("tasks")
      .insert({
        ...task,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
        sync_status: SyncStatus.SYNCED,
      })
      .select()
      .single();

    if (error) throw new Error(`Supabase error: ${error.message}`);
    return data;
  }

  // ... other implementations
}
```

### 5. Task Service (Orchestrator)

Coordinates local and remote operations with transaction safety.

```typescript
// services/TaskService.ts
export interface TaskServiceConfig {
  enableSync: boolean;
  syncOnWrite: boolean;
  retryAttempts: number;
  retryDelayMs: number;
}

export class TaskService {
  constructor(
    private localRepo: ITaskRepository,
    private remoteRepo: ITaskRepository,
    private syncQueue: ISyncQueue,
    private config: TaskServiceConfig,
  ) {}

  async createTask(taskData: TaskCreate): Promise<Task> {
    // 1. Create in SQLite first (instant)
    const localTask = await this.localRepo.create(taskData);

    // 2. Queue for sync if enabled
    if (this.config.enableSync) {
      if (this.config.syncOnWrite) {
        // Immediate sync with rollback
        try {
          await this.syncCreateToRemote(localTask);
        } catch (error) {
          // Rollback local change
          await this.localRepo.delete(localTask.id);
          throw new TransactionError("Failed to sync task creation", error);
        }
      } else {
        // Background sync
        await this.syncQueue.enqueue({
          type: "CREATE",
          taskId: localTask.id,
          data: taskData,
        });
      }
    }

    return localTask;
  }

  async updateTask(id: string, updates: TaskUpdate): Promise<Task> {
    // 1. Get current state for rollback
    const originalTask = await this.localRepo.getById(id);
    if (!originalTask) {
      throw new NotFoundError(`Task ${id} not found`);
    }

    // 2. Update SQLite first
    const updatedTask = await this.localRepo.update(id, {
      ...updates,
      version: originalTask.version + 1,
      sync_status: SyncStatus.PENDING,
    });

    // 3. Sync to remote with rollback
    if (this.config.enableSync && this.config.syncOnWrite) {
      try {
        await this.syncUpdateToRemote(updatedTask, originalTask.version);
      } catch (error) {
        // Rollback to original state
        await this.localRepo.update(id, {
          ...originalTask,
          version: originalTask.version,
        });
        throw new TransactionError("Failed to sync task update", error);
      }
    } else if (this.config.enableSync) {
      await this.syncQueue.enqueue({
        type: "UPDATE",
        taskId: id,
        data: updates,
        previousVersion: originalTask.version,
      });
    }

    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    // Soft delete for sync purposes
    await this.updateTask(id, {
      deleted_at: new Date().toISOString(),
      sync_status: SyncStatus.PENDING,
    });
  }

  private async syncCreateToRemote(task: Task): Promise<void> {
    const { id, created_at, updated_at, version, sync_status, ...taskData } =
      task;
    await this.remoteRepo.create({
      ...taskData,
      user_id: task.user_id,
    });
    await this.localRepo.markSynced(task.id, task.version);
  }

  private async syncUpdateToRemote(
    task: Task,
    previousVersion: number,
  ): Promise<void> {
    // Optimistic locking - check version hasn't changed remotely
    const remoteTask = await this.remoteRepo.getById(task.id);

    if (remoteTask && remoteTask.version !== previousVersion) {
      throw new ConflictError("Task was modified on another device");
    }

    await this.remoteRepo.update(task.id, {
      ...task,
      version: task.version,
    });

    await this.localRepo.markSynced(task.id, task.version);
  }
}
```

### 6. Sync Queue

Background sync with retry logic.

```typescript
// services/sync/SyncQueue.ts
export interface SyncOperation {
  id: string;
  type: "CREATE" | "UPDATE" | "DELETE";
  taskId: string;
  data: any;
  previousVersion?: number;
  retryCount: number;
  createdAt: Date;
  error?: string;
}

export interface ISyncQueue {
  enqueue(
    operation: Omit<SyncOperation, "id" | "retryCount" | "createdAt">,
  ): Promise<void>;
  dequeue(): Promise<SyncOperation | null>;
  retry(operationId: string): Promise<void>;
  clear(): Promise<void>;
  getAll(): Promise<SyncOperation[]>;
}

export class SQLiteSyncQueue implements ISyncQueue {
  constructor(private db: SQLite.Database) {}

  async enqueue(
    operation: Omit<SyncOperation, "id" | "retryCount" | "createdAt">,
  ): Promise<void> {
    const id = generateId();
    await this.db.runAsync(
      `INSERT INTO sync_queue (id, type, task_id, data, previous_version, retry_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        operation.type,
        operation.taskId,
        JSON.stringify(operation.data),
        operation.previousVersion ?? null,
        0,
        new Date().toISOString(),
      ],
    );
  }

  async dequeue(): Promise<SyncOperation | null> {
    const operations = await this.db.getAllAsync<any>(
      "SELECT * FROM sync_queue ORDER BY created_at ASC LIMIT 1",
    );

    if (operations.length === 0) return null;

    const op = operations[0];
    return {
      id: op.id,
      type: op.type,
      taskId: op.task_id,
      data: JSON.parse(op.data),
      previousVersion: op.previous_version,
      retryCount: op.retry_count,
      createdAt: new Date(op.created_at),
      error: op.error,
    };
  }

  // ... other implementations
}
```

### 7. Sync Service

Orchestrates background synchronization.

```typescript
// services/sync/SyncService.ts
export class SyncService {
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;

  constructor(
    private localRepo: ITaskRepository,
    private remoteRepo: ITaskRepository,
    private syncQueue: ISyncQueue,
    private config: SyncConfig,
  ) {}

  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.intervalId = setInterval(
      () => this.processQueue(),
      this.config.intervalMs,
    );

    // Also sync on network state change
    NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        this.processQueue();
      }
    });
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isRunning = false;
  }

  async processQueue(): Promise<void> {
    if (!this.isRunning) return;

    const operation = await this.syncQueue.dequeue();
    if (!operation) return;

    try {
      await this.executeOperation(operation);
      await this.syncQueue.remove(operation.id);
    } catch (error) {
      if (operation.retryCount < this.config.maxRetries) {
        await this.syncQueue.retry(operation.id);
      } else {
        // Mark local task as error
        await this.localRepo.markError(
          operation.taskId,
          error instanceof Error ? error.message : "Unknown error",
        );
      }
    }

    // Process next operation
    setTimeout(() => this.processQueue(), 100);
  }

  private async executeOperation(operation: SyncOperation): Promise<void> {
    switch (operation.type) {
      case "CREATE":
        await this.remoteRepo.create(operation.data);
        break;
      case "UPDATE":
        await this.remoteRepo.update(operation.taskId, operation.data);
        break;
      case "DELETE":
        await this.remoteRepo.delete(operation.taskId);
        break;
    }

    await this.localRepo.markSynced(operation.taskId, operation.data.version);
  }

  async fullSync(): Promise<void> {
    // 1. Pull remote changes
    const remoteTasks = await this.remoteRepo.getAll(getCurrentUserId());

    // 2. Get local tasks
    const localTasks = await this.localRepo.getAll(getCurrentUserId());

    // 3. Merge using version numbers
    await this.mergeChanges(localTasks, remoteTasks);
  }

  private async mergeChanges(local: Task[], remote: Task[]): Promise<void> {
    const localMap = new Map(local.map((t) => [t.id, t]));
    const remoteMap = new Map(remote.map((t) => [t.id, t]));

    // Remote tasks not in local
    for (const [id, remoteTask] of remoteMap) {
      if (!localMap.has(id)) {
        await this.localRepo.create(remoteTask);
      }
    }

    // Local tasks not in remote (should be synced)
    for (const [id, localTask] of localMap) {
      if (!remoteMap.has(id) && localTask.sync_status === SyncStatus.PENDING) {
        await this.syncQueue.enqueue({
          type: "CREATE",
          taskId: id,
          data: localTask,
        });
      }
    }

    // Conflicts - choose latest by updated_at
    for (const [id, localTask] of localMap) {
      const remoteTask = remoteMap.get(id);
      if (remoteTask && localTask.version !== remoteTask.version) {
        if (new Date(remoteTask.updated_at) > new Date(localTask.updated_at)) {
          // Remote is newer
          await this.localRepo.update(id, remoteTask);
        } else {
          // Local is newer - sync to remote
          await this.syncQueue.enqueue({
            type: "UPDATE",
            taskId: id,
            data: localTask,
            previousVersion: remoteTask.version,
          });
        }
      }
    }
  }
}
```

---

## Database Schema

### SQLite Schema

```sql
-- Tasks table
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

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_sync_status ON tasks(sync_status);
CREATE INDEX idx_tasks_deleted_at ON tasks(deleted_at);

-- Sync queue table
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

CREATE INDEX idx_sync_queue_created_at ON sync_queue(created_at);
```

### Supabase Schema Updates

```sql
-- Add version column for optimistic locking
ALTER TABLE tasks ADD COLUMN version INTEGER NOT NULL DEFAULT 1;

-- Add sync_status column
ALTER TABLE tasks ADD COLUMN sync_status TEXT NOT NULL DEFAULT 'synced';

-- Add deleted_at for soft deletes
ALTER TABLE tasks ADD COLUMN deleted_at TIMESTAMP;

-- Update RLS policies to filter deleted tasks
CREATE POLICY "Users can view their non-deleted tasks"
ON tasks FOR SELECT
USING (auth.uid() = user_id AND deleted_at IS NULL);
```

---

## Implementation Phases

### Phase 1: Database Setup (Days 1-2)

**Tasks:**

1. Install SQLite package (`expo-sqlite`)
2. Create SQLite database initialization
3. Create migration system
4. Implement schema creation
5. Add seed data for development

**Files to create:**

- `data/database/sqlite/init.ts`
- `data/database/sqlite/migrations/001_initial_schema.ts`
- `data/database/sqlite/migrations/002_add_sync_queue.ts`

### Phase 2: Repository Layer (Days 3-5)

**Tasks:**

1. Define repository interfaces
2. Implement SQLiteTaskRepository
3. Implement SupabaseTaskRepository
4. Implement SQLiteSyncQueue
5. Add comprehensive tests

**Files to create:**

- `domain/repositories/ITaskRepository.ts`
- `domain/repositories/ISyncQueue.ts`
- `data/repositories/SQLiteTaskRepository.ts`
- `data/repositories/SupabaseTaskRepository.ts`
- `data/repositories/SQLiteSyncQueue.ts`

### Phase 3: Service Layer (Days 6-8)

**Tasks:**

1. Implement TaskService with transaction logic
2. Implement SyncService
3. Add error handling and retry logic
4. Implement conflict resolution
5. Add service tests

**Files to create:**

- `services/TaskService.ts`
- `services/sync/SyncService.ts`
- `services/sync/ConflictResolver.ts`
- `services/errors/TransactionError.ts`

### Phase 4: Dependency Injection (Day 9)

**Tasks:**

1. Create DI container
2. Register repositories
3. Register services
4. Update app initialization

**Files to create:**

- `config/container.ts`
- `config/dependencies.ts`

### Phase 5: Migration & Testing (Days 10-12)

**Tasks:**

1. Update existing API calls to use TaskService
2. Remove direct Supabase calls from components
3. Add integration tests
4. Test offline functionality
5. Test sync scenarios

**Files to modify:**

- `api/tasks.ts` → Use TaskService
- All components using tasks

### Phase 6: Sync UI & Polish (Days 13-14)

**Tasks:**

1. Add sync status indicators
2. Add manual sync trigger
3. Add conflict resolution UI
4. Error notifications
5. Documentation

**Files to create:**

- `components/SyncStatusIndicator.tsx`
- `components/SyncErrorBanner.tsx`

---

## Code Structure

```
mobile/
├── domain/
│   ├── models/
│   │   ├── Task.ts                    # Domain model
│   │   └── SyncOperation.ts           # Sync operation model
│   └── repositories/
│       ├── ITaskRepository.ts         # Repository interface
│       └── ISyncQueue.ts              # Sync queue interface
├── data/
│   ├── database/
│   │   └── sqlite/
│   │       ├── init.ts                # Database initialization
│   │       ├── migrations/            # Schema migrations
│   │       └── connection.ts          # DB connection management
│   └── repositories/
│       ├── SQLiteTaskRepository.ts    # SQLite implementation
│       ├── SupabaseTaskRepository.ts  # Supabase implementation
│       └── SQLiteSyncQueue.ts         # Sync queue implementation
├── services/
│   ├── TaskService.ts                 # Main orchestrator
│   ├── sync/
│   │   ├── SyncService.ts             # Background sync
│   │   ├── ConflictResolver.ts        # Conflict resolution
│   │   └── SyncQueue.ts               # Queue management
│   └── errors/
│       ├── TransactionError.ts        # Transaction errors
│       ├── ConflictError.ts           # Conflict errors
│       └── NotFoundError.ts           # Not found errors
├── config/
│   ├── container.ts                   # DI container
│   ├── dependencies.ts                # Dependency setup
│   └── sync.config.ts                 # Sync configuration
└── hooks/
    ├── useTasks.ts                    # React hook for tasks
    ├── useSyncStatus.ts               # React hook for sync status
    └── useOfflineStatus.ts            # React hook for offline status
```

---

## Clean Code Compliance

### DRY Principle

- Repository interface prevents duplication between SQLite and Supabase
- Shared sync logic in SyncService
- Common error handling utilities

### Code Reusability

- Generic repository pattern works for any entity type
- Sync queue can handle any operation type
- Conflict resolver is strategy-based

### Abstractions

- ITaskRepository hides storage implementation
- TaskService hides sync complexity from UI
- SyncQueue abstracts queue management

### Extensibility

- Easy to add new sync strategies
- Can add more repositories (IndexedDB for web)
- Pluggable conflict resolution

### No Magic Numbers/Strings

```typescript
// config/sync.config.ts
export const SYNC_CONFIG = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  SYNC_INTERVAL_MS: 30000,
  BATCH_SIZE: 50,
  MAX_QUEUE_SIZE: 1000,
} as const;

export const SYNC_STATUS = {
  SYNCED: "synced",
  PENDING: "pending",
  CONFLICT: "conflict",
  ERROR: "error",
} as const;
```

---

## Error Handling

### Transaction Rollback

```typescript
class TransactionError extends Error {
  constructor(
    message: string,
    public readonly cause: Error,
    public readonly rollbackData?: any,
  ) {
    super(message);
    this.name = "TransactionError";
  }
}

// Usage
try {
  await taskService.createTask(taskData);
} catch (error) {
  if (error instanceof TransactionError) {
    // Show user-friendly message
    Alert.alert("Sync Failed", "Changes were not saved. Please try again.");
    // Log for debugging
    console.error("Transaction failed:", error.cause);
  }
}
```

### Conflict Resolution

```typescript
export enum ConflictResolution {
  USE_LOCAL = "local",
  USE_REMOTE = "remote",
  MERGE = "merge",
  MANUAL = "manual",
}

export class ConflictResolver {
  resolve(local: Task, remote: Task, strategy: ConflictResolution): Task {
    switch (strategy) {
      case ConflictResolution.USE_LOCAL:
        return local;
      case ConflictResolution.USE_REMOTE:
        return remote;
      case ConflictResolution.MERGE:
        return this.merge(local, remote);
      case ConflictResolution.MANUAL:
        throw new ManualConflictError(local, remote);
    }
  }

  private merge(local: Task, remote: Task): Task {
    // Take latest updated_at for each field
    // Or implement custom merge logic
  }
}
```

---

## React Integration

### Custom Hooks

```typescript
// hooks/useTasks.ts
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const taskService = useTaskService(); // From DI container

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getAllTasks();
      setTasks(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: TaskCreate) => {
    try {
      const newTask = await taskService.createTask(taskData);
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const updateTask = async (id: string, updates: TaskUpdate) => {
    try {
      const updated = await taskService.updateTask(id, updates);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refresh: loadTasks,
  };
}
```

### Sync Status Hook

```typescript
// hooks/useSyncStatus.ts
export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>("synced");
  const [queueSize, setQueueSize] = useState(0);
  const syncService = useSyncService();

  useEffect(() => {
    const interval = setInterval(async () => {
      const queue = await syncService.getQueueSize();
      setQueueSize(queue);
      setStatus(queue > 0 ? "pending" : "synced");
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const forceSync = async () => {
    await syncService.fullSync();
  };

  return {
    status,
    queueSize,
    forceSync,
    isSyncing: status === "pending",
  };
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/services/TaskService.test.ts
describe("TaskService", () => {
  let taskService: TaskService;
  let mockLocalRepo: jest.Mocked<ITaskRepository>;
  let mockRemoteRepo: jest.Mocked<ITaskRepository>;
  let mockSyncQueue: jest.Mocked<ISyncQueue>;

  beforeEach(() => {
    mockLocalRepo = createMockRepository();
    mockRemoteRepo = createMockRepository();
    mockSyncQueue = createMockSyncQueue();

    taskService = new TaskService(
      mockLocalRepo,
      mockRemoteRepo,
      mockSyncQueue,
      {
        enableSync: true,
        syncOnWrite: true,
        retryAttempts: 3,
        retryDelayMs: 100,
      },
    );
  });

  describe("createTask", () => {
    it("should create task in local repo first", async () => {
      const taskData = createTaskData();
      await taskService.createTask(taskData);

      expect(mockLocalRepo.create).toHaveBeenCalledWith(taskData);
    });

    it("should rollback on remote failure", async () => {
      const taskData = createTaskData();
      mockRemoteRepo.create.mockRejectedValue(new Error("Network error"));

      await expect(taskService.createTask(taskData)).rejects.toThrow(
        TransactionError,
      );
      expect(mockLocalRepo.delete).toHaveBeenCalled();
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/sync.test.ts
describe("Sync Integration", () => {
  it("should sync local changes to remote", async () => {
    // 1. Create task locally
    const task = await taskService.createTask(taskData);

    // 2. Wait for sync
    await waitForSync();

    // 3. Verify in remote
    const remoteTask = await remoteRepo.getById(task.id);
    expect(remoteTask).toEqual(
      expect.objectContaining({
        name: task.name,
        sync_status: "synced",
      }),
    );
  });

  it("should handle conflicts correctly", async () => {
    // 1. Create task
    const task = await taskService.createTask(taskData);
    await waitForSync();

    // 2. Update locally
    const localUpdate = taskService.updateTask(task.id, {
      name: "Local update",
    });

    // 3. Update remotely
    await remoteRepo.update(task.id, { name: "Remote update" });

    // 4. Sync should detect conflict
    await waitForSync();
    const conflictedTask = await localRepo.getById(task.id);
    expect(conflictedTask.sync_status).toBe("conflict");
  });
});
```

---

## Performance Considerations

### Database Optimization

```typescript
// Batch operations for better performance
async bulkCreate(tasks: TaskCreate[]): Promise<Task[]> {
  return this.db.withTransactionAsync(async () => {
    const created: Task[] = [];
    for (const task of tasks) {
      created.push(await this.create(task));
    }
    return created;
  });
}

// Use indexes
CREATE INDEX idx_tasks_user_id_deleted ON tasks(user_id, deleted_at);

// Limit query results
async getRecent(userId: string, limit: number = 50): Promise<Task[]> {
  return this.db.getAllAsync(
    'SELECT * FROM tasks WHERE user_id = ? AND deleted_at IS NULL LIMIT ?',
    [userId, limit]
  );
}
```

### Memory Management

```typescript
// Use pagination for large datasets
export interface PaginationOptions {
  page: number;
  pageSize: number;
}

async getPaginated(
  userId: string,
  { page, pageSize }: PaginationOptions
): Promise<{ tasks: Task[]; total: number }> {
  const offset = (page - 1) * pageSize;

  const tasks = await this.db.getAllAsync(
    'SELECT * FROM tasks WHERE user_id = ? LIMIT ? OFFSET ?',
    [userId, pageSize, offset]
  );

  const [{ count }] = await this.db.getAllAsync(
    'SELECT COUNT(*) as count FROM tasks WHERE user_id = ?',
    [userId]
  );

  return { tasks, total: count };
}
```

---

## Migration from Current Implementation

### Step-by-Step Migration

1. **Parallel Implementation** (Week 1)
   - Implement new architecture alongside existing code
   - Add feature flag: `USE_LOCAL_FIRST`
   - Test with subset of users

2. **Gradual Rollout** (Week 2)
   - Enable for 10% of users
   - Monitor errors and performance
   - Adjust based on feedback

3. **Data Migration** (Week 3)
   - Sync existing Supabase data to SQLite
   - Verify data integrity
   - Handle edge cases

4. **Full Migration** (Week 4)
   - Enable for all users
   - Remove old implementation
   - Clean up code

### Migration Script

```typescript
// scripts/migrate-to-local-first.ts
export async function migrateToLocalFirst(userId: string): Promise<void> {
  console.log(`Migrating user ${userId} to local-first...`);

  // 1. Fetch all tasks from Supabase
  const remoteTasks = await supabaseRepo.getAll(userId);
  console.log(`Found ${remoteTasks.length} remote tasks`);

  // 2. Clear local database
  await sqliteRepo.deleteAll(userId);

  // 3. Insert into SQLite
  await sqliteRepo.bulkCreate(remoteTasks);
  console.log(`Migrated ${remoteTasks.length} tasks to SQLite`);

  // 4. Mark all as synced
  for (const task of remoteTasks) {
    await sqliteRepo.markSynced(task.id, task.version);
  }

  console.log("Migration complete!");
}
```

---

## Success Criteria

- [ ] All task operations work offline
- [ ] UI updates instantly (< 100ms)
- [ ] Sync completes within 30 seconds of connectivity
- [ ] Zero data loss during sync failures
- [ ] Conflicts resolved correctly
- [ ] No performance regression
- [ ] Test coverage > 80%
- [ ] Documentation complete
- [ ] Browser extension compatibility maintained

---

## Future Enhancements

1. **Real-time Sync** - WebSocket for instant updates
2. **Attachment Support** - Sync files/images
3. **Collaborative Editing** - Operational transforms
4. **Compression** - Reduce sync payload size
5. **Encryption** - End-to-end encryption for SQLite
6. **Multi-user** - Shared tasks with permissions
7. **Audit Log** - Track all changes
8. **Delta Sync** - Only sync changed fields

---

## Resources

- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Offline-First Design Patterns](https://offlinefirst.org/)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
