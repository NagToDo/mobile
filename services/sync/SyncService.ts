import { ITaskRepository } from "../../domain/repositories/ITaskRepository";
import { ISyncQueue } from "../../domain/repositories/ISyncQueue";
import { Task, TaskCreate, SyncStatus } from "../../domain/models/Task";
import { SyncOperation } from "../../domain/models/SyncOperation";
import { SyncConfig } from "../../config/sync.config";

type NetworkStateListener = (
  callback: (isConnected: boolean) => void,
) => () => void;

export class SyncService {
  private isRunning = false;
  private intervalId?: ReturnType<typeof setInterval>;
  private networkUnsubscribe?: () => void;
  private currentUserId: string | null = null;

  constructor(
    private localRepo: ITaskRepository,
    private remoteRepo: ITaskRepository,
    private syncQueue: ISyncQueue,
    private config: SyncConfig,
    private networkListener?: NetworkStateListener,
  ) {}

  start(userId: string): void {
    if (this.isRunning) return;

    this.currentUserId = userId;
    this.isRunning = true;

    this.intervalId = setInterval(
      () => this.processQueue(),
      this.config.intervalMs,
    );

    if (this.networkListener) {
      this.networkUnsubscribe = this.networkListener((isConnected) => {
        if (isConnected) {
          this.processQueue();
        }
      });
    }

    this.processQueue();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    if (this.networkUnsubscribe) {
      this.networkUnsubscribe();
      this.networkUnsubscribe = undefined;
    }

    this.isRunning = false;
    this.currentUserId = null;
  }

  async processQueue(): Promise<void> {
    if (!this.isRunning) return;

    const operation = await this.syncQueue.peek();
    if (!operation) return;

    try {
      await this.executeOperation(operation);
      await this.syncQueue.remove(operation.id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      if (operation.retry_count < this.config.maxRetries) {
        await this.syncQueue.markError(operation.id, errorMessage);
      } else {
        await this.syncQueue.remove(operation.id);
        await this.localRepo.markError(operation.task_id, errorMessage);
      }
    }

    setTimeout(() => this.processQueue(), 100);
  }

  private async executeOperation(operation: SyncOperation): Promise<void> {
    const data = JSON.parse(operation.data);

    switch (operation.type) {
      case "CREATE": {
        const localTask = await this.localRepo.getById(operation.task_id);
        if (!localTask) return;

        const taskCreate: TaskCreate = {
          name: localTask.name,
          description: localTask.description,
          finished: localTask.finished,
          alarm_time: localTask.alarm_time,
          frecuency: localTask.frecuency,
          alarm_interval: localTask.alarm_interval,
          user_id: localTask.user_id,
        };

        await this.remoteRepo.create(taskCreate);
        await this.localRepo.markSynced(operation.task_id, localTask.version);
        break;
      }

      case "UPDATE": {
        const localTask = await this.localRepo.getById(operation.task_id);
        if (!localTask) return;

        if (operation.previous_version !== null) {
          const remoteTask = await this.remoteRepo.getById(operation.task_id);
          if (remoteTask && remoteTask.version !== operation.previous_version) {
            await this.localRepo.markConflict(operation.task_id);
            return;
          }
        }

        await this.remoteRepo.update(operation.task_id, {
          ...data,
          version: localTask.version,
        });

        await this.localRepo.markSynced(operation.task_id, localTask.version);
        break;
      }

      case "DELETE": {
        await this.remoteRepo.delete(operation.task_id);
        await this.localRepo.hardDelete(operation.task_id);
        break;
      }
    }
  }

  async fullSync(): Promise<void> {
    if (!this.currentUserId) return;

    await this.processQueue();

    const remoteTasks = await this.remoteRepo.getAll(this.currentUserId);
    const localTasks = await this.localRepo.getAll(this.currentUserId);

    await this.mergeChanges(localTasks, remoteTasks);
  }

  private async mergeChanges(local: Task[], remote: Task[]): Promise<void> {
    const localMap = new Map(local.map((t) => [t.id, t]));
    const remoteMap = new Map(remote.map((t) => [t.id, t]));
    const localNameSet = new Set(local.map((t) => t.name.toLowerCase().trim()));

    for (const [id, remoteTask] of remoteMap) {
      if (!localMap.has(id)) {
        const normalizedRemoteName = remoteTask.name.toLowerCase().trim();
        if (localNameSet.has(normalizedRemoteName)) {
          continue;
        }

        const taskCreate: TaskCreate = {
          name: remoteTask.name,
          description: remoteTask.description,
          finished: remoteTask.finished,
          alarm_time: remoteTask.alarm_time,
          frecuency: remoteTask.frecuency,
          alarm_interval: remoteTask.alarm_interval,
          user_id: remoteTask.user_id,
        };
        await this.localRepo.create(taskCreate);
        localNameSet.add(normalizedRemoteName);
      }
    }

    for (const [id, localTask] of localMap) {
      if (!remoteMap.has(id) && localTask.sync_status === SyncStatus.PENDING) {
        await this.syncQueue.enqueue({
          type: "CREATE",
          task_id: id,
          data: JSON.stringify({
            name: localTask.name,
            description: localTask.description,
            finished: localTask.finished,
            alarm_time: localTask.alarm_time,
            frecuency: localTask.frecuency,
            alarm_interval: localTask.alarm_interval,
            user_id: localTask.user_id,
          }),
          previous_version: null,
        });
      }
    }

    for (const [id, localTask] of localMap) {
      const remoteTask = remoteMap.get(id);
      if (remoteTask && localTask.version !== remoteTask.version) {
        const localUpdated = new Date(localTask.updated_at);
        const remoteUpdated = new Date(remoteTask.updated_at);

        if (remoteUpdated > localUpdated) {
          await this.localRepo.update(id, {
            name: remoteTask.name,
            description: remoteTask.description,
            finished: remoteTask.finished,
            alarm_time: remoteTask.alarm_time,
            frecuency: remoteTask.frecuency,
            alarm_interval: remoteTask.alarm_interval,
            version: remoteTask.version,
            sync_status: SyncStatus.SYNCED,
          });
        } else {
          await this.syncQueue.enqueue({
            type: "UPDATE",
            task_id: id,
            data: JSON.stringify({
              name: localTask.name,
              description: localTask.description,
              finished: localTask.finished,
              alarm_time: localTask.alarm_time,
              frecuency: localTask.frecuency,
              alarm_interval: localTask.alarm_interval,
            }),
            previous_version: remoteTask.version,
          });
        }
      }
    }
  }

  async getQueueSize(): Promise<number> {
    return this.syncQueue.getSize();
  }

  isActive(): boolean {
    return this.isRunning;
  }
}
