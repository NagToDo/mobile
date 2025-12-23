import { useSyncStatus } from "@/hooks/useSyncStatus";
import { SyncStatus } from "@/domain/models/Task";
import Feather from "@expo/vector-icons/Feather";
import { Pressable, View } from "react-native";
import { Text } from "./ui/text";

interface SyncErrorBannerProps {
  onRetry?: () => void;
}

export default function SyncErrorBanner({ onRetry }: SyncErrorBannerProps) {
  const { status, forceSync, queueSize } = useSyncStatus();

  if (status !== SyncStatus.ERROR && status !== SyncStatus.CONFLICT) {
    return null;
  }

  const handleRetry = async () => {
    await forceSync();
    onRetry?.();
  };

  const isConflict = status === SyncStatus.CONFLICT;

  return (
    <View className="flex-row items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl">
      <Feather
        name={isConflict ? "alert-triangle" : "alert-circle"}
        size={20}
        color="#ef4444"
      />
      <View className="flex-1">
        <Text className="text-sm font-medium text-red-700 dark:text-red-400">
          {isConflict ? "Sync Conflict" : "Sync Error"}
        </Text>
        <Text className="text-xs text-red-600 dark:text-red-500">
          {isConflict
            ? "Some tasks have conflicting changes."
            : `${queueSize} item${queueSize !== 1 ? "s" : ""} failed to sync.`}
        </Text>
      </View>
      <Pressable
        onPress={handleRetry}
        className="px-3 py-1.5 bg-red-100 dark:bg-red-900/50 rounded-lg"
        hitSlop={8}
      >
        <Text className="text-xs font-semibold text-red-700 dark:text-red-400">
          Retry
        </Text>
      </Pressable>
    </View>
  );
}
