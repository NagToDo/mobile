import { ActivityIndicator, ScrollView, TextInput, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import Entypo from "@expo/vector-icons/Entypo";
import TaskCard from "@/components/TaskCard";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Redirect, useRouter } from "expo-router";
import type { Session } from "@supabase/supabase-js";
import supabase from "@/api/client";
import { getTasks, type Task } from "@/api/tasks";

export default function Index() {
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();
  const toggleTheme = () =>
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  const [query, setQuery] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    setTasksError(null);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load tasks.";
      setTasksError(message);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) return;
        setSession(data.session ?? null);
      })
      .finally(() => {
        if (!isMounted) return;
        setSessionLoading(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!isMounted) return;
        setSession(nextSession);
      },
    );

    return () => {
      isMounted = false;
      subscription?.subscription.unsubscribe();
    };
  }, []);

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (task) =>
        task.name.toLowerCase().includes(q) ||
        (task.description ?? "").toLowerCase().includes(q),
    );
  }, [query, tasks]);

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) return;
    fetchTasks();
  }, [fetchTasks, session, sessionLoading]);

  if (!sessionLoading && !session) {
    return <Redirect href="/auth" />;
  }

  return (
    <View className="flex-1 p-6 gap-4 bg-white dark:bg-black">
      <View className="h-8 flex-row items-center justify-between">
        <Text className="text-xl font-bold dark:text-white">My Tasks</Text>
        <View className="flex-row items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 rounded-full border border-black/15 dark:border-white/20 bg-white dark:bg-neutral-900"
            onPress={() => router.push("/auth")}
          >
            <Text className="text-xs font-semibold dark:text-white">Login</Text>
          </Button>
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
        {tasksLoading && (
          <View className="items-center justify-center py-12">
            <ActivityIndicator
              size="small"
              color={colorScheme === "dark" ? "#ffffff" : "#000000"}
            />
            <Text className="mt-3 text-sm text-black/70 dark:text-white/70">
              Loading tasks...
            </Text>
          </View>
        )}

        {!tasksLoading && tasksError && (
          <View className="items-center justify-center py-12">
            <Text className="text-sm text-red-500 text-center">
              {tasksError}
            </Text>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onPress={fetchTasks}
            >
              <Text className="text-xs font-semibold">Retry</Text>
            </Button>
          </View>
        )}

        {!tasksLoading && !tasksError && filteredTasks.length === 0 && (
          <View className="items-center justify-center py-12">
            <Text className="text-sm text-black/70 dark:text-white/70">
              No tasks yet.
            </Text>
          </View>
        )}

        {!tasksLoading &&
          !tasksError &&
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              title={task.name || "Untitled task"}
              description={task.description || "No description provided."}
            />
          ))}
      </ScrollView>
    </View>
  );
}
