import { useMemo } from "react";
import { useTasks } from "./useTasks";
import {
  calculateStats,
  generateInsights,
  TaskStats,
  Insight,
} from "@/lib/stats/calculateStats";

interface UseStatsReturn {
  stats: TaskStats;
  insights: Insight[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useStats(): UseStatsReturn {
  const { tasks, loading, error, refresh } = useTasks();

  const stats = useMemo(() => calculateStats(tasks), [tasks]);
  const insights = useMemo(() => generateInsights(stats), [stats]);

  return {
    stats,
    insights,
    loading,
    error,
    refresh,
  };
}
