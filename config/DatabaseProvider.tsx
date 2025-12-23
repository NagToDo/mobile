import React, { createContext, useContext, useEffect, useState } from "react";
import * as SQLite from "expo-sqlite";
import { initializeDatabase } from "../data/database/sqlite/init";
import { Container, createContainer } from "./container";
import supabase from "../api/client";

interface DatabaseContextValue {
  isReady: boolean;
  container: Container | null;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  isReady: false,
  container: null,
  error: null,
});

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({
  children,
}) => {
  const [isReady, setIsReady] = useState(false);
  const [container, setContainer] = useState<Container | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const db = await initializeDatabase();
        const containerInstance = createContainer(db, supabase);
        setContainer(containerInstance);
        setIsReady(true);
      } catch (err) {
        console.error("Failed to initialize database:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      }
    };

    initialize();
  }, []);

  return (
    <DatabaseContext.Provider value={{ isReady, container, error }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = (): DatabaseContextValue => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error("useDatabase must be used within a DatabaseProvider");
  }
  return context;
};

export const useTaskService = () => {
  const { container, isReady } = useDatabase();
  if (!isReady || !container) {
    throw new Error("Database not ready");
  }
  return container.taskService;
};

export const useSyncService = () => {
  const { container, isReady } = useDatabase();
  if (!isReady || !container) {
    throw new Error("Database not ready");
  }
  return container.syncService;
};
