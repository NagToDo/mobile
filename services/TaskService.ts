import { ITaskRepository } from "../domain/repositories/ITaskRepository";
import { ISyncQueue } from "../domain/repositories/ISyncQueue";
import {
  Task,
  TaskCreate,
  TaskUpdate,
  SyncStatus,
} from "../domain/models/Task";
import { TaskServiceConfig } from "../config/sync.config";
import { TransactionError } from "./errors/TransactionError";
import { NotFoundError } from "./errors/NotFoundError";
import { ConflictError } from "./errors/ConflictError";
import { DuplicateTaskError } from "./errors/DuplicateTaskError";

export class TaskService {
  constructor(
    private localRepo: ITaskRepository,
    private remoteRepo: ITaskRepository,
    private syncQueue: ISyncQueue,
    private config: TaskServiceConfig,
  ) {}

  async getAllTasks(userId: string): Promise<Task[]> {
    return this.localRepo.getAll(userId);
  }

  async getTask(id: string): Promise<Task | null> {
    return this.localRepo.getById(id);
  }

  async createTask(taskData: TaskCreate): Promise<Task> {
    const existingTask = await this.localRepo.getByName(
      taskData.name,
      taskData.user_id,
    );
    if (existingTask) {
      throw new DuplicateTaskError(
        `A task with the name "${taskData.name}" already exists`,
        taskData.name,
      );
    }

    const localTask = await this.localRepo.create(taskData);

    if (this.config.enableSync) {
      if (this.config.syncOnWrite) {
        try {
          await this.syncCreateToRemote(localTask);
        } catch (error) {
          await this.localRepo.hardDelete(localTask.id);
          throw new TransactionError(
            "Failed to sync task creation",
            error instanceof Error ? error : undefined,
          );
        }
      } else {
        await this.syncQueue.enqueue({
          type: "CREATE",
          task_id: localTask.id,
          data: JSON.stringify(taskData),
          previous_version: null,
        });
      }
    }

    return localTask;
  }

  async updateTask(id: string, updates: TaskUpdate): Promise<Task> {
    const originalTask = await this.localRepo.getById(id);
    if (!originalTask) {
      throw new NotFoundError(`Task ${id} not found`, id);
    }

    const updatedTask = await this.localRepo.update(id, {
      ...updates,
      version: originalTask.version + 1,
      sync_status: SyncStatus.PENDING,
    });

    if (this.config.enableSync) {
      if (this.config.syncOnWrite) {
        try {
          await this.syncUpdateToRemote(updatedTask, originalTask.version);
        } catch (error) {
          await this.localRepo.update(id, {
            ...originalTask,
            version: originalTask.version,
            sync_status: originalTask.sync_status,
          });

          if (error instanceof ConflictError) {
            throw error;
          }

          throw new TransactionError(
            "Failed to sync task update",
            error instanceof Error ? error : undefined,
          );
        }
      } else {
        await this.syncQueue.enqueue({
          type: "UPDATE",
          task_id: id,
          data: JSON.stringify(updates),
          previous_version: originalTask.version,
        });
      }
    }

    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    const task = await this.localRepo.getById(id);
    if (!task) {
      throw new NotFoundError(`Task ${id} not found`, id);
    }

    await this.localRepo.delete(id);

    if (this.config.enableSync) {
      if (this.config.syncOnWrite) {
        try {
          await this.remoteRepo.delete(id);
          await this.localRepo.hardDelete(id);
        } catch (error) {
          throw new TransactionError(
            "Failed to sync task deletion",
            error instanceof Error ? error : undefined,
          );
        }
      } else {
        await this.syncQueue.enqueue({
          type: "DELETE",
          task_id: id,
          data: JSON.stringify({ id }),
          previous_version: task.version,
        });
      }
    }
  }

  async updateTaskFinished(id: string, finished: boolean): Promise<Task> {
    return this.updateTask(id, { finished });
  }

  private async syncCreateToRemote(task: Task): Promise<void> {
    const taskCreate: TaskCreate = {
      name: task.name,
      description: task.description,
      finished: task.finished,
      alarm_time: task.alarm_time,
      frecuency: task.frecuency,
      alarm_interval: task.alarm_interval,
      user_id: task.user_id,
    };

    await this.remoteRepo.create(taskCreate);
    await this.localRepo.markSynced(task.id, task.version);
  }

  private async syncUpdateToRemote(
    task: Task,
    previousVersion: number,
  ): Promise<void> {
    const remoteTask = await this.remoteRepo.getById(task.id);

    if (remoteTask && remoteTask.version !== previousVersion) {
      await this.localRepo.markConflict(task.id);
      throw new ConflictError(
        "Task was modified on another device",
        task,
        remoteTask,
      );
    }

    await this.remoteRepo.update(task.id, {
      name: task.name,
      description: task.description,
      finished: task.finished,
      alarm_time: task.alarm_time,
      frecuency: task.frecuency,
      alarm_interval: task.alarm_interval,
      version: task.version,
    });

    await this.localRepo.markSynced(task.id, task.version);
  }

  async getPendingTasks(userId: string): Promise<Task[]> {
    return this.localRepo.getPending(userId);
  }

  async getConflictTasks(userId: string): Promise<Task[]> {
    return this.localRepo.getByStatus(userId, SyncStatus.CONFLICT);
  }

  async resolveConflict(
    id: string,
    resolution: "local" | "remote",
  ): Promise<Task> {
    const localTask = await this.localRepo.getById(id);
    if (!localTask) {
      throw new NotFoundError(`Task ${id} not found`, id);
    }

    if (resolution === "remote") {
      const remoteTask = await this.remoteRepo.getById(id);
      if (!remoteTask) {
        throw new NotFoundError(`Remote task ${id} not found`, id);
      }

      return this.localRepo.update(id, {
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
        previous_version: localTask.version,
      });

      return this.localRepo.update(id, {
        sync_status: SyncStatus.PENDING,
      });
    }
  }
}
