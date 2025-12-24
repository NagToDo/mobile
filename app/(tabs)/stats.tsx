import { Text } from "@/components/ui/text";
import { useColors } from "@/lib/colors";
import { useStats } from "@/hooks/useStats";
import { Frequency } from "@/domain/models/Task";
import Feather from "@expo/vector-icons/Feather";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";

type StatCardProps = {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string | number;
  color: string;
};

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <View className="flex-1 bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-black/5 dark:border-white/10">
      <View
        className="h-10 w-10 rounded-full items-center justify-center mb-3"
        style={{ backgroundColor: `${color}20` }}
      >
        <Feather name={icon} size={20} color={color} />
      </View>
      <Text className="text-2xl font-bold dark:text-white">{value}</Text>
      <Text className="text-sm text-black/60 dark:text-white/60 mt-1">
        {label}
      </Text>
    </View>
  );
}

type FrequencyBarProps = {
  label: string;
  percentage: number;
  count: number;
  color: string;
};

function FrequencyBar({ label, percentage, count, color }: FrequencyBarProps) {
  return (
    <View className="mb-4">
      <View className="flex-row justify-between mb-2">
        <Text className="text-sm font-medium dark:text-white capitalize">
          {label}
        </Text>
        <Text className="text-sm text-black/60 dark:text-white/60">
          {count} task{count !== 1 ? "s" : ""}
        </Text>
      </View>
      <View className="h-2 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
        <View
          className="h-full rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </View>
    </View>
  );
}

const FREQUENCY_CONFIG: Record<
  Frequency,
  { label: string; colorKey: keyof ReturnType<typeof useColors>["chart"] }
> = {
  daily: { label: "Daily", colorKey: "green" },
  weekly: { label: "Weekly", colorKey: "blue" },
  monthly: { label: "Monthly", colorKey: "purple" },
  single: { label: "Once", colorKey: "amber" },
};

export default function StatsScreen() {
  const colors = useColors();
  const { stats, insights, loading, refresh } = useStats();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-black items-center justify-center">
        <ActivityIndicator size="large" color={colors.chart.blue} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <ScrollView
        className="flex-1 p-6"
        contentContainerClassName="pb-24"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold dark:text-white mt-2 mb-6">
          Statistics
        </Text>

        {/* Main Stats Grid */}
        <View className="flex-row gap-3 mb-4">
          <StatCard
            icon="list"
            label="Total Tasks"
            value={stats.total}
            color={colors.chart.blue}
          />
          <StatCard
            icon="check-circle"
            label="Completed"
            value={stats.completed}
            color={colors.chart.green}
          />
        </View>

        <View className="flex-row gap-3 mb-6">
          <StatCard
            icon="clock"
            label="Pending"
            value={stats.pending}
            color={colors.chart.amber}
          />
          <StatCard
            icon="trending-up"
            label="Completion Rate"
            value={`${stats.completionRate}%`}
            color={colors.chart.purple}
          />
        </View>

        {/* Frequency Breakdown */}
        <View className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-black/5 dark:border-white/10">
          <Text className="text-lg font-semibold dark:text-white mb-4">
            Tasks by Frequency
          </Text>

          {(Object.keys(FREQUENCY_CONFIG) as Frequency[]).map((freq) => (
            <FrequencyBar
              key={freq}
              label={FREQUENCY_CONFIG[freq].label}
              percentage={stats.byFrequency[freq].percentage}
              count={stats.byFrequency[freq].count}
              color={colors.chart[FREQUENCY_CONFIG[freq].colorKey]}
            />
          ))}
        </View>

        {/* Quick Insights */}
        <View className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-black/5 dark:border-white/10 mt-4">
          <Text className="text-lg font-semibold dark:text-white mb-3">
            Quick Insights
          </Text>
          <View className="gap-2">
            {insights.map((insight, index) => {
              const iconColor =
                insight.type === "success"
                  ? colors.chart.green
                  : insight.type === "encouragement"
                    ? colors.chart.amber
                    : colors.chart.purple;

              return (
                <View key={index} className="flex-row items-center gap-2">
                  <Feather name={insight.icon} size={16} color={iconColor} />
                  <Text className="text-sm text-black/80 dark:text-white/80 flex-1">
                    {insight.message}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
