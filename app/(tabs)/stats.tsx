import { Text } from "@/components/ui/text";
import Feather from "@expo/vector-icons/Feather";
import { ScrollView, View } from "react-native";

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
          {count} tasks
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

export default function StatsScreen() {
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
            value={12}
            color="#3b82f6"
          />
          <StatCard
            icon="check-circle"
            label="Completed"
            value={8}
            color="#10b981"
          />
        </View>

        <View className="flex-row gap-3 mb-6">
          <StatCard icon="clock" label="Pending" value={4} color="#f59e0b" />
          <StatCard
            icon="trending-up"
            label="Completion Rate"
            value="67%"
            color="#8b5cf6"
          />
        </View>

        {/* Frequency Breakdown */}
        <View className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-black/5 dark:border-white/10">
          <Text className="text-lg font-semibold dark:text-white mb-4">
            Tasks by Frequency
          </Text>

          <FrequencyBar
            label="Daily"
            percentage={40}
            count={5}
            color="#10b981"
          />
          <FrequencyBar
            label="Weekly"
            percentage={25}
            count={3}
            color="#3b82f6"
          />
          <FrequencyBar
            label="Monthly"
            percentage={17}
            count={2}
            color="#8b5cf6"
          />
          <FrequencyBar
            label="Once"
            percentage={17}
            count={2}
            color="#f59e0b"
          />
        </View>

        {/* Quick Insights */}
        <View className="bg-white dark:bg-neutral-900 rounded-2xl p-5 border border-black/5 dark:border-white/10 mt-4">
          <Text className="text-lg font-semibold dark:text-white mb-3">
            Quick Insights
          </Text>
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <Feather name="award" size={16} color="#10b981" />
              <Text className="text-sm text-black/80 dark:text-white/80">
                You've completed 8 tasks!
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Feather name="target" size={16} color="#f59e0b" />
              <Text className="text-sm text-black/80 dark:text-white/80">
                4 tasks waiting for you
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Feather name="star" size={16} color="#8b5cf6" />
              <Text className="text-sm text-black/80 dark:text-white/80">
                Great progress! Over half your tasks are done
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
