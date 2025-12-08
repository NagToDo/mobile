import { Pressable, ScrollView, TextInput, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import Entypo from "@expo/vector-icons/Entypo";
import TaskCard from "@/components/TaskCard";
import { useColorScheme } from "nativewind";
import { useMemo, useState } from "react";

export default function Index() {
  const tasks = [
    { id: "1", title: "Task 1", description: "Description 1" },
    { id: "2", title: "Task 2", description: "Description 2" },
    { id: "3", title: "Task 3", description: "Description 3" },
    { id: "4", title: "Task 4", description: "Description 4" },
    { id: "5", title: "Task 5", description: "Description 5" },
    { id: "6", title: "Task 6", description: "Description 6" },
    { id: "7", title: "Task 7", description: "Description 7" },
    { id: "8", title: "Task 8", description: "Description 8" },
    { id: "9", title: "Task 9", description: "Description 9" },
    { id: "10", title: "Task 10", description: "Description 10" },
    { id: "11", title: "Task 11", description: "Description 11" },
    { id: "12", title: "Task 12", description: "Description 12" },
    { id: "13", title: "Task 13", description: "Description 13" },
    { id: "14", title: "Task 14", description: "Description 14" },
    { id: "15", title: "Task 15", description: "Description 15" },
    { id: "16", title: "Task 16", description: "Description 16" },
    { id: "17", title: "Task 17", description: "Description 17" },
    { id: "18", title: "Task 18", description: "Description 18" },
    { id: "19", title: "Task 19", description: "Description 19" },
    { id: "20", title: "Task 20", description: "Description 20" },
    { id: "21", title: "Task 21", description: "Description 21" },
    { id: "22", title: "Task 22", description: "Description 22" },
    { id: "23", title: "Task 23", description: "Description 23" },
    { id: "24", title: "Task 24", description: "Description 24" },
    { id: "25", title: "Task 25", description: "Description 25" },
    { id: "26", title: "Task 26", description: "Description 26" },
    { id: "27", title: "Task 27", description: "Description 27" },
  ];

  const { colorScheme, setColorScheme } = useColorScheme();
  const toggleTheme = () =>
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  const [query, setQuery] = useState("");

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q),
    );
  }, [query, tasks]);

  return (
    <View className="flex-1 p-6 gap-4 bg-white dark:bg-black">
      <View className="h-8 flex-row items-center justify-between">
        <Text className="text-xl font-bold dark:text-white">My Tasks</Text>
        <View className="flex-row items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 rounded-full border border-black/15 dark:border-white/20 bg-white dark:bg-neutral-900"
            onPress={toggleTheme}
          >
            <Text className="text-xs font-semibold dark:text-white">
              {colorScheme === "dark" ? "Light" : "Dark"} mode
            </Text>
          </Button>
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <View className="flex-row items-center flex-1 rounded-3xl border border-black/10 dark:border-white/20 bg-white dark:bg-neutral-900 px-4 h-12">
          <Entypo
            name="magnifying-glass"
            size={18}
            color={colorScheme === "dark" ? "#ffffff" : "#000000"}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search tasks..."
            placeholderTextColor={
              colorScheme === "dark" ? "#9ca3af" : "#9ca3af"
            }
            className="flex-1 px-3 text-base text-black dark:text-white"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 pb-24"
        alwaysBounceVertical
        showsVerticalScrollIndicator={false}
      >
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            title={task.title}
            description={task.description}
          />
        ))}
      </ScrollView>
    </View>
  );
}
