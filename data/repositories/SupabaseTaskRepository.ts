import { SupabaseClient } from "@supabase/supabase-js";
import { ITaskRepository } from "../../domain/repositories/ITaskRepository";
import {
  Task,
  TaskCreate,
  TaskUpdate,
  SyncStatus,
} from "../../domain/models/Task";

export class SupabaseTaskRepository implements ITaskRepository {
  constructor(private client: SupabaseClient) {}

  async getAll(userId: string): Promise<Task[]> {
    const { data, error } = await this.client
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return (data || []).map(this.mapToTask);
  }

  async getById(id: string): Promise<Task | null> {
    const { data, error } = await this.client
      .from("tasks")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Supabase error: ${error.message}`);
    }

    return data ? this.mapToTask(data) : null;
  }

  async getByName(name: string, userId: string): Promise<Task | null> {
    const normalizedName = name.trim();
    const { data, error } = await this.client
      .from("tasks")
      .select("*")
      .ilike("name", normalizedName)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(`Supabase error: ${error.message}`);
    }

    return data ? this.mapToTask(data) : null;
  }

  async getByStatus(userId: string, status: SyncStatus): Promise<Task[]> {
    const { data, error } = await this.client
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("sync_status", status)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return (data || []).map(this.mapToTask);
  }

  async getPending(userId: string): Promise<Task[]> {
    return this.getByStatus(userId, SyncStatus.PENDING);
  }

  async create(task: TaskCreate): Promise<Task> {
    const now = new Date().toISOString();

    const { data, error } = await this.client
      .from("tasks")
      .insert({
        name: task.name,
        description: task.description,
        finished: task.finished ?? false,
        alarm_time: task.alarm_time,
        frecuency: task.frecuency,
        alarm_interval: task.alarm_interval,
        user_id: task.user_id,
        created_at: now,
        updated_at: now,
        deleted_at: task.deleted_at ?? null,
        version: 1,
        sync_status: SyncStatus.SYNCED,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return this.mapToTask(data);
  }

  async update(id: string, updates: TaskUpdate): Promise<Task> {
    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = {
      updated_at: now,
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined)
      updateData.description = updates.description;
    if (updates.finished !== undefined) updateData.finished = updates.finished;
    if (updates.alarm_time !== undefined)
      updateData.alarm_time = updates.alarm_time;
    if (updates.frecuency !== undefined)
      updateData.frecuency = updates.frecuency;
    if (updates.alarm_interval !== undefined)
      updateData.alarm_interval = updates.alarm_interval;
    if (updates.deleted_at !== undefined)
      updateData.deleted_at = updates.deleted_at;
    if (updates.version !== undefined) updateData.version = updates.version;
    if (updates.sync_status !== undefined)
      updateData.sync_status = updates.sync_status;

    const { data, error } = await this.client
      .from("tasks")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return this.mapToTask(data);
  }

  async delete(id: string): Promise<void> {
    const now = new Date().toISOString();

    const { error } = await this.client
      .from("tasks")
      .update({
        deleted_at: now,
        updated_at: now,
      })
      .eq("id", id);

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }
  }

  async hardDelete(id: string): Promise<void> {
    const { error } = await this.client.from("tasks").delete().eq("id", id);

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }
  }

  async bulkCreate(tasks: TaskCreate[]): Promise<Task[]> {
    const now = new Date().toISOString();

    const insertData = tasks.map((task) => ({
      name: task.name,
      description: task.description,
      finished: task.finished ?? false,
      alarm_time: task.alarm_time,
      frecuency: task.frecuency,
      alarm_interval: task.alarm_interval,
      user_id: task.user_id,
      created_at: now,
      updated_at: now,
      deleted_at: task.deleted_at ?? null,
      version: 1,
      sync_status: SyncStatus.SYNCED,
    }));

    const { data, error } = await this.client
      .from("tasks")
      .insert(insertData)
      .select();

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }

    return (data || []).map(this.mapToTask);
  }

  async bulkUpdate(
    tasks: { id: string; updates: TaskUpdate }[],
  ): Promise<Task[]> {
    const results: Task[] = [];
    for (const { id, updates } of tasks) {
      results.push(await this.update(id, updates));
    }
    return results;
  }

  async deleteAll(userId: string): Promise<void> {
    const { error } = await this.client
      .from("tasks")
      .delete()
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }
  }

  async markSynced(id: string, version: number): Promise<void> {
    await this.update(id, {
      sync_status: SyncStatus.SYNCED,
      version,
    });
  }

  async markError(id: string, error: string): Promise<void> {
    await this.update(id, {
      sync_status: SyncStatus.ERROR,
      sync_error: error,
    });
  }

  async markConflict(id: string): Promise<void> {
    await this.update(id, {
      sync_status: SyncStatus.CONFLICT,
    });
  }

  private mapToTask(data: Record<string, unknown>): Task {
    return {
      id: data.id as string,
      name: data.name as string,
      description: data.description as string | null,
      finished: data.finished as boolean,
      alarm_time: data.alarm_time as string,
      frecuency: data.frecuency as Task["frecuency"],
      alarm_interval: data.alarm_interval as number,
      user_id: data.user_id as string,
      created_at: data.created_at as string,
      updated_at: data.updated_at as string,
      deleted_at: data.deleted_at as string | null,
      version: (data.version as number) ?? 1,
      sync_status: (data.sync_status as SyncStatus) ?? SyncStatus.SYNCED,
      sync_error: data.sync_error as string | null,
    };
  }
}
