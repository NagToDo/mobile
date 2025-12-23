import { useState, useEffect, useCallback } from "react";
import { SyncStatus } from "../domain/models/Task";
import { useDatabase } from "../config/DatabaseProvider";
import supabase from "../api/client";

interface UseSyncStatusReturn {
  status: SyncStatus;
  queueSize: number;
  isSyncing: boolean;
  forceSync: () => Promise<void>;
  startSync: () => void;
  stopSync: () => void;
}

export function useSyncStatus(): UseSyncStatusReturn {
  const [status, setStatus] = useState<SyncStatus>(SyncStatus.SYNCED);
  const [queueSize, setQueueSize] = useState(0);
  const { container, isReady } = useDatabase();

  useEffect(() => {
    if (!isReady || !container) return;

    const checkStatus = async () => {
      const size = await container.syncService.getQueueSize();
      setQueueSize(size);
      setStatus(size > 0 ? SyncStatus.PENDING : SyncStatus.SYNCED);
    };

    const interval = setInterval(checkStatus, 1000);
    checkStatus();

    return () => clearInterval(interval);
  }, [container, isReady]);

  const forceSync = useCallback(async () => {
    if (!container) return;
    await container.syncService.fullSync();
  }, [container]);

  const startSync = useCallback(async () => {
    if (!container) return;

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user?.id;

    if (userId) {
      container.syncService.start(userId);
    }
  }, [container]);

  const stopSync = useCallback(() => {
    if (!container) return;
    container.syncService.stop();
  }, [container]);

  return {
    status,
    queueSize,
    isSyncing: status === SyncStatus.PENDING,
    forceSync,
    startSync,
    stopSync,
  };
}
