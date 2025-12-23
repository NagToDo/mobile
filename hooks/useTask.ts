import { useState, useEffect, useCallback } from "react";
import { Task, TaskUpdate } from "../domain/models/Task";
import { useDatabase } from "../config/DatabaseProvider";

interface UseTaskReturn {
  task: Task | null;
  loading: boolean;
  error: Error | null;
  updateTask: (updates: TaskUpdate) => Promise<Task>;
  deleteTask: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTask(taskId: string): UseTaskReturn {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { container, isReady } = useDatabase();

  const loadTask = useCallback(async () => {
    if (!isReady || !container) return;

    try {
      setLoading(true);
      setError(null);
      const data = await container.taskService.getTask(taskId);
      setTask(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load task"));
    } finally {
      setLoading(false);
    }
  }, [container, isReady, taskId]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const updateTask = useCallback(
    async (updates: TaskUpdate): Promise<Task> => {
      if (!container) {
        throw new Error("Database not ready");
      }

      const updated = await container.taskService.updateTask(taskId, updates);
      setTask(updated);
      return updated;
    },
    [container, taskId],
  );

  const deleteTask = useCallback(async (): Promise<void> => {
    if (!container) {
      throw new Error("Database not ready");
    }

    await container.taskService.deleteTask(taskId);
    setTask(null);
  }, [container, taskId]);

  return {
    task,
    loading,
    error,
    updateTask,
    deleteTask,
    refresh: loadTask,
  };
}
