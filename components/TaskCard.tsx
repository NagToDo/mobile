import { updateTaskFinished } from "@/api/tasks";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import Feather from "@expo/vector-icons/Feather";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { Checkbox } from "./ui/checkbox";

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  finished: boolean;
  alarmTime: string;
  frequency: string;
  alarmInterval: number;
  onFinishedChange?: (id: string, finished: boolean) => void;
  onPress?: (id: string) => void;
}

const frequencyLabels: Record<string, string> = {
  daily: "Daily",
  single: "Once",
  weekly: "Weekly",
  monthly: "Monthly",
};

const formatTime = (isoString: string) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export default function TaskCard({
  id,
  title,
  description,
  finished,
  alarmTime,
  frequency,
  alarmInterval,
  onFinishedChange,
  onPress,
}: TaskCardProps) {
  const [checked, setChecked] = useState(finished);
  const { colorScheme } = useColorScheme();
  const boxBg = colorScheme === "dark" ? "bg-black" : "bg-white";
  const indicatorColor = colorScheme === "dark" ? "bg-white" : "bg-black";
  const iconColor = colorScheme === "dark" ? "text-black" : "text-white";
  const metaIconColor = colorScheme === "dark" ? "#9ca3af" : "#6b7280";

  const handleCheckedChange = (newChecked: boolean) => {
    const previousChecked = checked;
    setChecked(newChecked);
    onFinishedChange?.(id, newChecked);

    updateTaskFinished(id, newChecked).catch((err) => {
      setChecked(previousChecked);
      onFinishedChange?.(id, previousChecked);
      const message =
        err instanceof Error ? err.message : "Unable to update task.";
      Alert.alert("Update failed", message);
    });
  };

  return (
    <Pressable
      onPress={() => onPress?.(id)}
      className="flex-row w-full min-h-28 items-center gap-4 rounded-2xl border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-900 px-4 py-4 shadow-md shadow-black/10 dark:shadow-black/30 active:opacity-80"
    >
      <Checkbox
        className={cn(
          "w-7 h-7 rounded-full border-2 border-neutral-300",
          boxBg,
        )}
        checkedClassName={boxBg}
        indicatorClassName={cn(
          "rounded-full transition-all duration-200 ease-out",
          indicatorColor,
          checked ? "scale-90 opacity-100" : "scale-0 opacity-0",
        )}
        iconClassName={iconColor}
        checked={checked}
        onCheckedChange={handleCheckedChange}
      />
      <View className="flex-col justify-start flex-1 gap-2">
        <View>
          <Text className="text-lg font-semibold text-black dark:text-white">
            {title}
          </Text>
          <Text
            className="text-sm text-black/70 dark:text-white/70"
            numberOfLines={2}
          >
            {description}
          </Text>
        </View>
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <Feather name="clock" size={12} color={metaIconColor} />
            <Text className="text-xs text-black/50 dark:text-white/50">
              {formatTime(alarmTime)}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Feather name="repeat" size={12} color={metaIconColor} />
            <Text className="text-xs text-black/50 dark:text-white/50">
              {frequencyLabels[frequency] || frequency}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Feather name="bell" size={12} color={metaIconColor} />
            <Text className="text-xs text-black/50 dark:text-white/50">
              Every {alarmInterval} min
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
