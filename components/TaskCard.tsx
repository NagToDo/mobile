import { Text } from "@/components/ui/text";
import { useColors } from "@/lib/colors";
import { cn } from "@/lib/utils";
import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { Checkbox } from "./ui/checkbox";

const DESCRIPTION_CHAR_LIMIT = 100;

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  finished: boolean;
  alarmTime: string;
  frequency: string;
  alarmInterval: number;
  onFinishedChange?: (id: string, finished: boolean) => Promise<void>;
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
  const [expanded, setExpanded] = useState(false);
  const colors = useColors();

  // Determine checkbox colors based on background
  const isDark = colors.background === "#000000";
  const boxBg = isDark ? "bg-black" : "bg-white";
  const indicatorColor = isDark ? "bg-white" : "bg-black";
  const iconColor = isDark ? "text-black" : "text-white";

  const isDescriptionLong = description.length > DESCRIPTION_CHAR_LIMIT;
  const displayDescription = expanded
    ? description
    : description.slice(0, DESCRIPTION_CHAR_LIMIT) +
      (isDescriptionLong ? "..." : "");

  const handleCheckedChange = async (newChecked: boolean) => {
    const previousChecked = checked;
    setChecked(newChecked);

    try {
      await onFinishedChange?.(id, newChecked);
    } catch (err) {
      setChecked(previousChecked);
      const message =
        err instanceof Error ? err.message : "Unable to update task.";
      Alert.alert("Update failed", message);
    }
  };

  const toggleExpanded = () => {
    setExpanded((prev) => !prev);
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
          <Text className="text-sm text-black/70 dark:text-white/70">
            {displayDescription}
          </Text>
          {isDescriptionLong && (
            <Pressable
              onPress={toggleExpanded}
              hitSlop={8}
              className="flex-row items-center gap-1 mt-1"
            >
              <Text className="text-xs font-semibold text-black/70 dark:text-white/70">
                {expanded ? "See Less" : "See More"}
              </Text>
              <Feather
                name={expanded ? "chevron-up" : "chevron-down"}
                size={14}
                color={colors.icon.muted}
              />
            </Pressable>
          )}
        </View>
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <Feather name="clock" size={12} color={colors.icon.muted} />
            <Text className="text-xs text-black/50 dark:text-white/50">
              {formatTime(alarmTime)}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Feather name="repeat" size={12} color={colors.icon.muted} />
            <Text className="text-xs text-black/50 dark:text-white/50">
              {frequencyLabels[frequency] || frequency}
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Feather name="bell" size={12} color={colors.icon.muted} />
            <Text className="text-xs text-black/50 dark:text-white/50">
              Every {alarmInterval} min
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
