import { useState, useEffect, useCallback } from "react";
import { Task, TaskCreate, TaskUpdate } from "../domain/models/Task";
import { useDatabase } from "../config/DatabaseProvider";
import supabase from "../api/client";

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  createTask: (taskData: Omit<TaskCreate, "user_id">) => Promise<Task>;
  updateTask: (id: string, updates: TaskUpdate) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  updateTaskFinished: (id: string, finished: boolean) => Promise<Task>;
  refresh: () => Promise<void>;
}

export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { container, isReady } = useDatabase();

  const loadTasks = useCallback(async () => {
    if (!isReady || !container) return;

    try {
      setLoading(true);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (!userId) {
        setTasks([]);
        return;
      }

      const data = await container.taskService.getAllTasks(userId);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load tasks"));
    } finally {
      setLoading(false);
    }
  }, [container, isReady]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const createTask = useCallback(
    async (taskData: Omit<TaskCreate, "user_id">): Promise<Task> => {
      if (!container) {
        throw new Error("Database not ready");
      }

      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      const newTask = await container.taskService.createTask({
        ...taskData,
        user_id: userId,
      });

      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    },
    [container],
  );

  const updateTask = useCallback(
    async (id: string, updates: TaskUpdate): Promise<Task> => {
      if (!container) {
        throw new Error("Database not ready");
      }

      const updated = await container.taskService.updateTask(id, updates);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    },
    [container],
  );

  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      if (!container) {
        throw new Error("Database not ready");
      }

      await container.taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    },
    [container],
  );

  const updateTaskFinished = useCallback(
    async (id: string, finished: boolean): Promise<Task> => {
      if (!container) {
        throw new Error("Database not ready");
      }

      const updated = await container.taskService.updateTaskFinished(
        id,
        finished,
      );
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    },
    [container],
  );

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    updateTaskFinished,
    refresh: loadTasks,
  };
}
