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
}

export function useStats(): UseStatsReturn {
  const { tasks, loading, error } = useTasks();

  const stats = useMemo(() => calculateStats(tasks), [tasks]);
  const insights = useMemo(() => generateInsights(stats), [stats]);

  return {
    stats,
    insights,
    loading,
    error,
  };
}
