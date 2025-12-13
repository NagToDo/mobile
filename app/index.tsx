import supabase from "@/api/client";
import { getTasks, type Task } from "@/api/tasks";
import TaskCard from "@/components/TaskCard";
import TaskCardSkeleton from "@/components/TaskCardSkeleton";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import type { Session } from "@supabase/supabase-js";
import { Redirect, useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from "react-native";

export default function Index() {
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();

  const toggleTheme = () => {
    const newScheme = colorScheme === "dark" ? "light" : "dark";
    setColorScheme(newScheme);
  };
  const [query, setQuery] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [tasksError, setTasksError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setTasks([]);
      router.replace("/auth");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to log out right now.";
      Alert.alert("Logout failed", message);
    }
  };

  const fetchTasks = useCallback(async (showLoading: boolean = true) => {
    if (showLoading) {
      setTasksLoading(true);
    }
    setTasksError(null);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to load tasks.";
      setTasksError(message);
    } finally {
      if (showLoading) {
        setTasksLoading(false);
      }
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTasks(false);
    setRefreshing(false);
  }, [fetchTasks]);

  if (!sessionLoading && !session) {
    return <Redirect href="/auth" />;
  }

  return (
    <View className="flex-1 p-6 gap-4 bg-white dark:bg-black">
      <View className="flex-row items-center justify-between mt-2">
        <Text className="text-2xl font-bold dark:text-white">My Tasks</Text>
        <View className="flex-row items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 rounded-full border border-black/15 dark:border-white/20 bg-white dark:bg-neutral-900"
            onPress={handleLogout}
          >
            <Text className="text-xs font-semibold dark:text-white">
              Logout
            </Text>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full border border-black/15 dark:border-white/20 bg-white dark:bg-neutral-900"
            onPress={toggleTheme}
          >
            <Feather
              name={colorScheme === "dark" ? "sun" : "moon"}
              size={16}
              color={colorScheme === "dark" ? "#ffffff" : "#000000"}
            />
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colorScheme === "dark" ? "#ffffff" : "#000000"}
            colors={[colorScheme === "dark" ? "#ffffff" : "#000000"]}
          />
        }
      >
        {tasksLoading && (
          <>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </>
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
              onPress={() => fetchTasks()}
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
              id={task.id}
              title={task.name || "Untitled task"}
              description={task.description || "No description provided."}
              finished={task.finished}
              alarmTime={task.alarm_time}
              frequency={task.frecuency}
              alarmInterval={task.alarm_interval}
              onFinishedChange={(taskId, finished) => {
                setTasks((prev) =>
                  prev.map((t) => (t.id === taskId ? { ...t, finished } : t)),
                );
              }}
              onPress={(taskId) =>
                router.push({ pathname: "/task/[id]", params: { id: taskId } })
              }
            />
          ))}
      </ScrollView>
    </View>
  );
}
