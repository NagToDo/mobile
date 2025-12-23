import { Task, Frequency } from "@/domain/models/Task";

export interface FrequencyStats {
  count: number;
  percentage: number;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
  byFrequency: Record<Frequency, FrequencyStats>;
  streak: number;
  createdThisWeek: number;
  completedThisWeek: number;
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function calculateStreak(tasks: Task[]): number {
  const completedTasks = tasks.filter((t) => t.finished);

  if (completedTasks.length === 0) {
    return 0;
  }

  // Get unique dates when tasks were completed (using updated_at)
  const completionDates = new Set<string>();
  completedTasks.forEach((task) => {
    const date = getStartOfDay(new Date(task.updated_at));
    completionDates.add(date.toISOString());
  });

  // Sort dates in descending order
  const sortedDates = Array.from(completionDates)
    .map((d) => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  if (sortedDates.length === 0) {
    return 0;
  }

  const today = getStartOfDay(new Date());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if the most recent completion was today or yesterday
  const mostRecent = sortedDates[0];
  if (
    mostRecent.getTime() !== today.getTime() &&
    mostRecent.getTime() !== yesterday.getTime()
  ) {
    return 0;
  }

  // Count consecutive days
  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const current = sortedDates[i - 1];
    const previous = sortedDates[i];

    const diffDays = Math.round(
      (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export function calculateStats(tasks: Task[]): TaskStats {
  // Filter out deleted tasks
  const activeTasks = tasks.filter((t) => t.deleted_at === null);

  const total = activeTasks.length;
  const completed = activeTasks.filter((t) => t.finished).length;
  const pending = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Calculate frequency distribution
  const frequencies: Frequency[] = ["daily", "weekly", "monthly", "single"];
  const byFrequency: Record<Frequency, FrequencyStats> = {} as Record<
    Frequency,
    FrequencyStats
  >;

  frequencies.forEach((freq) => {
    const count = activeTasks.filter((t) => t.frecuency === freq).length;
    byFrequency[freq] = {
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });

  // Calculate streak
  const streak = calculateStreak(activeTasks);

  // Calculate tasks created this week
  const startOfWeek = getStartOfWeek(new Date());
  const createdThisWeek = activeTasks.filter((t) => {
    const createdAt = new Date(t.created_at);
    return createdAt >= startOfWeek;
  }).length;

  // Calculate tasks completed this week (using updated_at for completion date)
  const completedThisWeek = activeTasks.filter((t) => {
    if (!t.finished) return false;
    const updatedAt = new Date(t.updated_at);
    return updatedAt >= startOfWeek;
  }).length;

  return {
    total,
    completed,
    pending,
    completionRate,
    byFrequency,
    streak,
    createdThisWeek,
    completedThisWeek,
  };
}

export type InsightType = "success" | "encouragement" | "info";

export interface Insight {
  type: InsightType;
  icon: "award" | "target" | "star" | "zap" | "trending-up";
  message: string;
}

export function generateInsights(stats: TaskStats): Insight[] {
  const insights: Insight[] = [];

  if (stats.total === 0) {
    insights.push({
      type: "encouragement",
      icon: "star",
      message: "Create your first task to get started!",
    });
    return insights;
  }

  if (stats.completionRate >= 80) {
    insights.push({
      type: "success",
      icon: "award",
      message: "You're crushing it! Keep up the momentum.",
    });
  } else if (stats.completionRate < 30 && stats.total > 0) {
    insights.push({
      type: "encouragement",
      icon: "target",
      message: "Small steps lead to big wins. Try completing one task today.",
    });
  }

  if (stats.streak > 7) {
    insights.push({
      type: "success",
      icon: "zap",
      message: `Amazing ${stats.streak}-day streak! You're building great habits.`,
    });
  } else if (stats.streak > 0) {
    insights.push({
      type: "info",
      icon: "zap",
      message: `${stats.streak}-day streak! Keep it going.`,
    });
  }

  if (stats.pending === 0 && stats.total > 0) {
    insights.push({
      type: "success",
      icon: "star",
      message: "All caught up! Time to plan your next goals.",
    });
  } else if (stats.pending > 0) {
    insights.push({
      type: "info",
      icon: "target",
      message: `${stats.pending} task${stats.pending === 1 ? "" : "s"} waiting for you.`,
    });
  }

  if (stats.completed > 0) {
    insights.push({
      type: "success",
      icon: "award",
      message: `You've completed ${stats.completed} task${stats.completed === 1 ? "" : "s"}!`,
    });
  }

  // Limit insights to 3 most relevant
  return insights.slice(0, 3);
}
