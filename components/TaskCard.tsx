import { updateTaskFinished } from "@/api/tasks";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { useColorScheme } from "nativewind";
import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { Checkbox } from "./ui/checkbox";

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  finished: boolean;
  onFinishedChange?: (id: string, finished: boolean) => void;
  onPress?: (id: string) => void;
}

export default function TaskCard({
  id,
  title,
  description,
  finished,
  onFinishedChange,
  onPress,
}: TaskCardProps) {
  const [checked, setChecked] = useState(finished);
  const { colorScheme } = useColorScheme();
  const boxBg = colorScheme === "dark" ? "bg-black" : "bg-white";
  const indicatorColor = colorScheme === "dark" ? "bg-white" : "bg-black";
  const iconColor = colorScheme === "dark" ? "text-black" : "text-white";

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
      className="flex-row w-full min-h-24 items-center gap-4 rounded-2xl border border-black/15 dark:border-white/15 bg-white dark:bg-neutral-900 px-4 py-4 shadow-md shadow-black/10 dark:shadow-black/30 active:opacity-80"
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
      <View className="flex-col justify-start flex-1">
        <Text className="text-lg font-semibold text-black dark:text-white">
          {title}
        </Text>
        <Text className="text-sm text-black/70 dark:text-white/70 mt-1">
          {description}
        </Text>
      </View>
      {/* <View className="rounded-full w-4 h-4 bg-red-500" /> */}
    </Pressable>
  );
}
