import * as SQLite from "expo-sqlite";
import * as migration001 from "./001_initial_schema";
import * as migration002 from "./002_sync_queue";

export interface Migration {
  name: string;
  up: (db: SQLite.SQLiteDatabase) => Promise<void>;
  down: (db: SQLite.SQLiteDatabase) => Promise<void>;
}

export const migrations: Migration[] = [
  { name: "001_initial_schema", ...migration001 },
  { name: "002_sync_queue", ...migration002 },
];
