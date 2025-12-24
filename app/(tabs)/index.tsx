import supabase from "@/api/client";
import TaskCard from "@/components/TaskCard";
import TaskCardSkeleton from "@/components/TaskCardSkeleton";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useDatabase } from "@/config/DatabaseProvider";
import { useTasks } from "@/hooks/useTasks";
import { useSyncStatus } from "@/hooks/useSyncStatus";
import { useThemeColors } from "@/lib/colors";
import Entypo from "@expo/vector-icons/Entypo";
import Feather from "@expo/vector-icons/Feather";
import type { Session } from "@supabase/supabase-js";
import { Redirect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from "react-native";

export default function Index() {
  const router = useRouter();
  const { colorScheme, toggleColorScheme, icon, input, foreground } =
    useThemeColors();
  const [query, setQuery] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncCooldown, setSyncCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasInitialSynced = useRef(false);
  const syncAnimOpacity = useRef(new Animated.Value(0.4)).current;

  const SYNC_COOLDOWN_SECONDS = 5;

  // Sync shimmer animation
  useEffect(() => {
    if (syncing) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(syncAnimOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(syncAnimOpacity, {
            toValue: 0.4,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    }
  }, [syncing, syncAnimOpacity]);

  const { isReady: dbReady } = useDatabase();
  const {
    tasks,
    loading: tasksLoading,
    error: tasksErrorObj,
    updateTaskFinished,
    refresh: fetchTasks,
  } = useTasks();
  const { startSync, stopSync, forceSync, isSyncing } = useSyncStatus();

  const tasksError = tasksErrorObj?.message ?? null;

  const handleLogout = async () => {
    try {
      stopSync();
      await supabase.auth.signOut();
      setSession(null);
      router.replace("/auth");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to log out right now.";
      Alert.alert("Logout failed", message);
    }
  };

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

  useEffect(() => {
    if (session && dbReady) {
      startSync();
    }
    return () => {
      stopSync();
    };
  }, [session, dbReady, startSync, stopSync]);

  const startCooldown = useCallback(() => {
    setSyncCooldown(SYNC_COOLDOWN_SECONDS);
    if (cooldownRef.current) {
      clearInterval(cooldownRef.current);
    }
    cooldownRef.current = setInterval(() => {
      setSyncCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) {
            clearInterval(cooldownRef.current);
            cooldownRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Initial sync on first mount
  useEffect(() => {
    if (session && dbReady && !hasInitialSynced.current) {
      hasInitialSynced.current = true;
      setSyncing(true);
      forceSync()
        .then(() => fetchTasks())
        .finally(() => {
          setSyncing(false);
          startCooldown();
        });
    }
  }, [session, dbReady, forceSync, fetchTasks, startCooldown]);

  // Cleanup cooldown interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
      }
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await forceSync();
    await fetchTasks();
    setRefreshing(false);
  }, [fetchTasks, forceSync]);

  const handleSync = useCallback(async () => {
    if (syncing || syncCooldown > 0) return;
    setSyncing(true);
    try {
      await forceSync();
      await fetchTasks();
    } finally {
      setSyncing(false);
      startCooldown();
    }
  }, [forceSync, fetchTasks, syncing, syncCooldown, startCooldown]);

  const handleFinishedChange = useCallback(
    async (id: string, finished: boolean) => {
      await updateTaskFinished(id, finished);
    },
    [updateTaskFinished],
  );

  if (!sessionLoading && !session) {
    return <Redirect href="/auth" />;
  }

  const showLoading = !dbReady || (tasksLoading && tasks.length === 0);

  return (
    <View className="flex-1 p-6 gap-4 bg-white dark:bg-black">
      <View className="mt-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-bold dark:text-white">My Tasks</Text>
          <View className="flex-row items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border border-black/15 dark:border-white/20 bg-white dark:bg-neutral-900"
              onPress={handleSync}
              disabled={syncing || syncCooldown > 0}
            >
              {syncing ? (
                <Text
                  className="text-xs font-bold"
                  style={{ color: icon.muted }}
                >
                  ...
                </Text>
              ) : syncCooldown > 0 ? (
                <Text
                  className="text-xs font-medium"
                  style={{ color: icon.muted }}
                >
                  {syncCooldown}
                </Text>
              ) : (
                <Feather name="refresh-cw" size={16} color={icon.default} />
              )}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border border-black/15 dark:border-white/20 bg-white dark:bg-neutral-900"
              onPress={handleLogout}
            >
              <Feather name="log-out" size={16} color={icon.default} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border border-black/15 dark:border-white/20 bg-white dark:bg-neutral-900"
              onPress={toggleColorScheme}
            >
              <Feather
                name={colorScheme === "dark" ? "sun" : "moon"}
                size={16}
                color={icon.default}
              />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border border-black/15 dark:border-white/20 bg-white dark:bg-neutral-900"
              onPress={() => router.push("/user")}
            >
              <Feather name="user" size={16} color={icon.default} />
            </Button>
          </View>
        </View>

        {syncing && (
          <Animated.View
            style={{ opacity: syncAnimOpacity }}
            className="flex-row items-center justify-end gap-2 mt-2"
          >
            <Feather name="cloud" size={14} color={icon.muted} />
            <Text className="text-sm text-black/50 dark:text-white/50">
              Syncing with cloud...
            </Text>
          </Animated.View>
        )}
      </View>

      <View className="flex-row items-center gap-3">
        <View className="flex-row items-center flex-1 rounded-3xl border border-black/10 dark:border-white/20 bg-white dark:bg-neutral-900 px-4 h-12">
          <Entypo name="magnifying-glass" size={18} color={icon.default} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search tasks..."
            placeholderTextColor={input.placeholder}
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
            tintColor={foreground}
            colors={[foreground]}
          />
        }
      >
        {showLoading && (
          <>
            <TaskCardSkeleton />
            <TaskCardSkeleton />
            <TaskCardSkeleton />
          </>
        )}

        {!showLoading && tasksError && (
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

        {!showLoading && !tasksError && filteredTasks.length === 0 && (
          <View className="items-center justify-center py-12">
            <Text className="text-sm text-black/70 dark:text-white/70">
              No tasks yet.
            </Text>
          </View>
        )}

        {!showLoading &&
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
              onFinishedChange={handleFinishedChange}
              onPress={(taskId) =>
                router.push({ pathname: "/task/[id]", params: { id: taskId } })
              }
            />
          ))}
      </ScrollView>
    </View>
  );
}
