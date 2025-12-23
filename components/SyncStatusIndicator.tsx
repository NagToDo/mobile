import { useSyncStatus } from "@/hooks/useSyncStatus";
import { SyncStatus } from "@/domain/models/Task";
import { useColors } from "@/lib/colors";
import Feather from "@expo/vector-icons/Feather";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Text } from "./ui/text";

interface SyncStatusIndicatorProps {
  showLabel?: boolean;
  size?: "sm" | "md";
}

export default function SyncStatusIndicator({
  showLabel = false,
  size = "sm",
}: SyncStatusIndicatorProps) {
  const { status, queueSize, isSyncing, forceSync } = useSyncStatus();
  const colors = useColors();

  const iconSize = size === "sm" ? 14 : 18;

  const getStatusColor = () => {
    switch (status) {
      case SyncStatus.SYNCED:
        return "#22c55e";
      case SyncStatus.PENDING:
        return "#f59e0b";
      case SyncStatus.ERROR:
        return "#ef4444";
      case SyncStatus.CONFLICT:
        return "#f59e0b";
      default:
        return colors.icon.muted;
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case SyncStatus.SYNCED:
        return "check-circle";
      case SyncStatus.PENDING:
        return "refresh-cw";
      case SyncStatus.ERROR:
        return "alert-circle";
      case SyncStatus.CONFLICT:
        return "alert-triangle";
      default:
        return "cloud";
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case SyncStatus.SYNCED:
        return "Synced";
      case SyncStatus.PENDING:
        return queueSize > 0 ? `Syncing (${queueSize})` : "Syncing...";
      case SyncStatus.ERROR:
        return "Sync error";
      case SyncStatus.CONFLICT:
        return "Conflict";
      default:
        return "Unknown";
    }
  };

  const handlePress = async () => {
    if (!isSyncing) {
      await forceSync();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center gap-1.5"
      hitSlop={8}
    >
      {isSyncing ? (
        <ActivityIndicator size="small" color={getStatusColor()} />
      ) : (
        <Feather
          name={getStatusIcon() as keyof typeof Feather.glyphMap}
          size={iconSize}
          color={getStatusColor()}
        />
      )}
      {showLabel && (
        <Text className="text-xs" style={{ color: getStatusColor() }}>
          {getStatusLabel()}
        </Text>
      )}
    </Pressable>
  );
}
